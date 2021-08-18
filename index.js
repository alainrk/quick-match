const { distance } = require('fastest-levenshtein')
const dice = require('fast-dice-coefficient')
const Ajv = require('ajv')

const { Result } = require('./Result')
const Stemming = require('./Stemming')
const candidatesSchema = require('./schema/candidates.json')
const optionsValidator = require('./schema/options.json')

const WORD_SPLITTER_REGEX = /[\s,.;!:'?|\-()]/

const DISTANCE_ALGORITHMS = {
  dice: dice,
  levenshtein: distance
}

/**
 * Intesection between array/set
 * @param {Set<string>|string[]} first
 * @param {Set<string>|string[]} second
*/
const intersect = (first, second) => {
  if (first instanceof Set) {
    first = Array.from(first)
  }
  if (!(second instanceof Set)) {
    second = new Set(second)
  }
  return first.filter(x => second.has(x))
}

class QuickMatch {
  constructor (options = {}) {
    const ajv = new Ajv()
    this.candidatesValidator = ajv.compile(candidatesSchema)

    this.options = this.initOptions(options)
    // console.log(JSON.stringify(this.options, ' ', 2))
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

    this.stemming = new Stemming(this.options.stemming.language)
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
      // Main candidate text
      const score = this.algorithm(text, c.text)
      result.setCandidateScore(i, score)
      // Take also the best from their keywords, if there are any
      if (this.options.enableAlgorithmOnKeywords) {
        for (let j = 0; j < c.keywords.length; j++) {
          const kw = c.keywords[j]
          const score = this.algorithm(text, kw)
          result.setCandidateScore(i, score)
        }
      }
    }
  }

  applyMatchNumber (text, candidates, result) {
    let intersection
    const words = text.split(WORD_SPLITTER_REGEX)
    if (words.length > this.options.numbers.maxWordsEnablingNumbers) return false

    if (this.options.numbers.enableDigits && this.digitsSet.has(text)) {
      const idx = parseInt(text) - 1
      if (idx >= candidates.length) return false
      result.setNumberMatch('digit', idx)
      return true
    }

    intersection = intersect(words, this.ordinalsSet)
    if (this.options.numbers.enableOrdinals && intersection.length) {
      const match = intersection[0]
      const idx = this.options.numbers.ordinals.findIndex(v => v === match)
      if (idx < 0 || idx >= candidates.length) return false
      result.setNumberMatch('ordinal', idx)
      return true
    }

    intersection = intersect(words, this.cardinalsSet)
    if (this.options.numbers.enableCardinals && intersection.length) {
      const match = intersection[0]
      const idx = this.options.numbers.cardinals.findIndex(v => v === match)
      if (idx < 0 || idx >= candidates.length) return false
      result.setNumberMatch('cardinal', idx)
      return true
    }
  }

  phraseToStemmedArray (phrase) {
    return this.stemming.stemArray(
      phrase.split(WORD_SPLITTER_REGEX)
        .filter(w => w.length >= this.options.stemming.minPreStemmingLength)
    ).filter(w => w.length >= this.options.stemming.minPostStemmingLength)
  }

  arrayToStemmedArray (arr) {
    return this.stemming.stemArray(
      arr.filter(w => w.length >= this.options.stemming.minPreStemmingLength)
    ).filter(w => w.length >= this.options.stemming.minPostStemmingLength)
  }

  applyStemming (text, candidates, result) {
    const stemmedTextArr = this.phraseToStemmedArray(text)
    result.setStemmedText(stemmedTextArr)

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i]
      const stemmedCandArr = this.phraseToStemmedArray(c.text).concat(
        this.arrayToStemmedArray(c.keywords)
      )
      const intersections = intersect(stemmedTextArr, stemmedCandArr)
      result.setStemmedCandidate(i, stemmedCandArr)
      result.setCandidateStemIntersections(i, intersections)
    }
  }

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

    if (this.options.enableStemming) {
      this.applyStemming(text, candidates, result)
    }

    return result.build()
  }
}

module.exports = { QuickMatch }
