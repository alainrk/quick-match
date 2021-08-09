const { distance } = require('fastest-levenshtein')
// const { Stemmer, Languages } = require('multilingual-stemmer')
const dice = require('fast-dice-coefficient')
const Ajv = require('ajv')

const { Result } = require('./result')
const candidatesSchema = require('./schema/candidates.json')
const optionsValidator = require('./schema/options.json')

// const {
// kAlgorithmDice,
// kAlgorithmLevenshtein,
// kNumberMatchDigit,
// kNumberMatchOrdinal,
// kNumberMatchCardinal
// } = require('./lib/symbols')

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

  applyAlgorithm (text, candidates, result) {
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i]
      const score = this.algorithm(text, c.text)
      result.setCandidateScore(i, score)
    }
  }

  applyMatchNumber (text, candidates, result) {
    let intersection
    const words = text.split(/\s+/)
    if (words.length > this.options.numbers.maxWordsEnablingNumbers) return false

    if (this.options.numbers.enableDigits && this.digitsSet.has(text)) {
      const idx = parseInt(text) - 1
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

  // applyStemming (text, candidates, result) {
    // let possibleMatchStems = []
    // for (const c of candidates) {
      // const 
      // if (c.keywords.length) {
        // possibleMatchStems = this.arrayStemmer(c.keywords)
      // }
    // }
  // }

  normalizeText (text) {
    return text.toLowerCase().trim()
  }

  run (text, candidates) {
    const originalText = text
    text = this.normalizeText(text)

    if (!this.candidatesValidator(candidates)) throw new Error('Candidates has not a valid format!')
    candidates = this.normalizeCandidates(candidates)
    const result = new Result(this.options.algorithm, originalText, candidates)

    // log(`\nAlgorithm: ${this.options.algorithm} - [${text}]`)
    if (this.applyMatchNumber(text, candidates, result)) {
      return result.build()
    }

    this.applyAlgorithm(text, candidates, result)

    return result.build()
  }
}

module.exports = { QuickMatch }
