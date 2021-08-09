const { distance } = require('fastest-levenshtein')
const dice = require('fast-dice-coefficient')
const Ajv = require('ajv')

// const {
// kAlgorithmDice,
// kAlgorithmLevenshtein,
// kNumberMatchDigit,
// kNumberMatchOrdinal,
// kNumberMatchCardinal
// } = require('./lib/symbols')

const candidatesSchema = require('./schema/candidates.json')
const optionsValidator = require('./schema/options.json')

const DISTANCE_ALGORITHMS = {
  dice: dice,
  levenshtein: distance
}

const intersectWithSet = (arr, set) => {
  return arr.filter(x => set.has(x))
}

// eslint-disable-next-line
function log (...argv) {
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
        for (let i = 1; i < maxn + 1; i++) res[i - 1] = i.toString()
        return res
      }
    )(this.options.numbers.maxDigit)
    this.digitsSet = new Set(this.digits)
    this.cardinalsSet = new Set(this.options.numbers.cardinals)
    this.ordinalsSet = new Set(this.options.numbers.ordinals)

    // log(this.options)
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

  applyMatchNumber (src, candidates, result) {
    let intersection
    const words = src.split(/\s+/)
    if (words.length > this.options.numbers.maxWordsEnablingNumbers) return false

    if (this.options.numbers.enableDigits && this.digitsSet.has(src)) {
      const idx = parseInt(src) - 1
      if (idx >= candidates.length) return false
      result.setNumberMatch('digit', idx)
      return true
    }

    intersection = intersectWithSet(words, this.ordinalsSet)
    if (this.options.numbers.enableOrdinals && intersection.length) {
      const match = intersection[0]
      const idx = this.options.numbers.ordinals.findIndex(v => v === match)
      if (idx < 0 || idx >= candidates.length) return false
      result.setNumberMatch('ordinal', idx)
      return true
    }

    intersection = intersectWithSet(words, this.cardinalsSet)
    if (this.options.numbers.enableCardinals && intersection.length) {
      const match = intersection[0]
      const idx = this.options.numbers.cardinals.findIndex(v => v === match)
      if (idx < 0 || idx >= candidates.length) return false
      result.setNumberMatch('cardinal', idx)
      return true
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
    const result = new Result(this.options.algorithm, originalSrc, candidates)

    // log(`\nAlgorithm: ${this.options.algorithm} - [${src}]`)
    if (this.applyMatchNumber(src, candidates, result)) {
      return result.build()
    }

    this.applyAlgorithm(src, candidates, result)

    return result.build()
  }
}

module.exports = { QuickMatch }
