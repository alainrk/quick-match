const { distance } = require('fastest-levenshtein')
const dice = require('fast-dice-coefficient')
const Ajv = require('ajv')

const candidatesSchema = require('./schema/candidates.json')
const optionsValidator = require('./schema/options.json')

const DISTANCE_ALGORITHMS = {
  dice: dice,
  levenshtein: distance
}

const log = (...argv) => {
  if (process.env.NODE_ENV === 'test') return
  console.log(argv)
}

class Result {
  constructor (algorithm, text, candidates) {
    this.algorithm = algorithm
    this.minScore = Infinity
    this.maxScore = -Infinity
    this.candidates = candidates
    this.text = text
    this.minCandidateIdx = null
    this.maxCandidateIdx = null
    this.bestCandidateIdx = null
    this.bestCandidate = null
    this.numberMatch = undefined
    this.numberMatchType = undefined
  }

  setCandidateScore (candidateIdx, score) {
    this.candidates[candidateIdx].score = score
    if (score < this.minScore) {
      this.minScore = score
      this.minCandidateIdx = candidateIdx
    }
    if (score > this.maxScore) {
      this.maxScore = score
      this.maxCandidateIdx = candidateIdx
    }
    return this
  }

  setNumberMatch (type, idx) {
    // TODO: Refactor using symbols
    if (!['digit', 'cardinal', 'ordinal'].includes(type)) throw new Error(`Type ${type} is not a valid number match result`)
    this.numberMatch = true
    this.numberMatchType = type
    this.bestCandidateIdx = idx
    return this
  }

  build () {
    if (!this.candidates || this.candidates.length === 0) throw new Error('Cannot build solution, no candidates in result')
    if (!this.numberMatch) {
      if (this.algorithm === 'dice') {
        this.bestCandidateIdx = this.maxCandidateIdx
      } else if (this.algorithm === 'levenshtein') {
        this.bestCandidateIdx = this.minCandidateIdx
      } else {
        throw new Error('Not supported algorithm')
      }
    }
    if (!this.bestCandidateIdx && this.bestCandidateIdx !== 0) throw new Error('Cannot build solution, no best candidate in result')
    this.bestCandidate = this.candidates[this.bestCandidateIdx]
    return this
  }
}

class QuickMatch {
  constructor (options = {}) {
    const ajv = new Ajv()
    this.candidatesValidator = ajv.compile(candidatesSchema)

    this.options = this.initOptions(options)
    this.algorithm = DISTANCE_ALGORITHMS[this.options.algorithm]

    this.digits = (
      (maxn) => {
        const res = new Array(maxn)
        for (let i = 1; i < maxn + 1; i++) res[i - 1] = i
        return res
      }
    )(this.options.numbers.maxDigit)
    this.digitsSet = new Set(this.digits) // Search purpose

    log(this.options)
  }

  initOptions (options) {
    const ajv = new Ajv({ useDefaults: true }) // Apply defaults in schema
    ajv.addSchema(optionsValidator)
    this.optionsValidator = ajv.compile(optionsValidator)
    if (!this.optionsValidator(options)) throw new Error('Options is not in a valid format.')
    return options
  }

  normalizeCandidates (candidates) {
    return candidates.reduce((acc, c) => {
      const item = {}
      if (typeof c === 'string') {
        item.text = c
        item.keywords = []
      } else {
        item.text = c.text
        item.keywords = c.keywords || []
      }
      acc.push(item)
      return acc
    }, [])
  }

  applyAlgorithm (src, candidates, result) {
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i]
      const score = this.algorithm(src, c.text)
      result.setCandidateScore(i, score)
    }
  }

  applyMatchNumber (text, result) {
    const words = text.split(/\s+/)
    if (words.length > this.options.numbers.maxWordsEnablingNumbers) {
      return false
    }
    if (this.options.numbers.enableDigits) {
      if (this.digitsSet.has(text)) {
        const idx = parseInt(text) - 1
        result.setNumberMatch('digit', idx)
        return true
      }
    }
  }

  normalizeSrc (src) {
    return src.trim()
  }

  run (src, candidates) {
    const originalSrc = src
    src = this.normalizeSrc(src)

    if (!this.candidatesValidator(candidates)) throw new Error('Candidates has not a valid format!')
    candidates = this.normalizeCandidates(candidates)
    log(candidates)
    const result = new Result(this.options.algorithm, originalSrc, candidates)

    // log(`\nAlgorithm: ${this.options.algorithm} - [${src}]`)
    if (this.applyMatchNumber(src, result)) {
      return result.build()
    }

    this.applyAlgorithm(src, candidates, result)

    return result.build()
  }
}

// const qmd = new QuickMatch({ algorithm: 'dice' })
// qmd.run('I want a pizza', ['Free hot dog here', 'Pizza for sale', 'Rent your cola'])

const qm = new QuickMatch({
  algorithm: 'dice',
  // algorithm: 'levenshtein',
  enableStemming: true,
  stemming: { language: 'en', minPreStemmingLength: 4, minPostStemmingLength: 4 },
  limits: { minLengthCandidate: 3, maxCandidateWords: 5 },
  weightIntersectionMultiplier: 1
})

const result = qm.run('I want a pizza',
  [
    { text: 'Free hot dog here', keywords: ['hot dog', 'free'] },
    { text: 'Pizza for sale', keywords: ['pizza', 'margherita'] },
    { text: 'Rent your cola', keywords: ['coke', 'cola'] }
  ]
)

log(result)

module.exports = { QuickMatch }
