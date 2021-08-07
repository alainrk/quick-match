const { distance } = require('fastest-levenshtein')
const dice = require('fast-dice-coefficient')
const Ajv = require('ajv')

const candidatesSchema = require('./schema/candidates.json')
const optionsValidator = require('./schema/options.json')

const DISTANCE_ALGORITHMS = {
  dice: dice,
  levenshtein: distance
}

class QuickMatch {
  constructor (options = {}) {
    const ajv = new Ajv()
    this.candidatesValidator = ajv.compile(candidatesSchema)

    this.options = this.initOptions(options)
    console.log(this.options)
    this.algorithm = DISTANCE_ALGORITHMS[this.options.algorithm]
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

  run (src, candidates) {
    if (!this.candidatesValidator(candidates)) throw new Error('Candidates has not a valid format!')
    candidates = this.normalizeCandidates(candidates)

    console.log(`\nAlgorithm: ${this.options.algorithm} - [${src}]`)

    let max = -Infinity
    let min = Infinity
    let minCandidateIdx, maxCandidateIdx

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i]
      const res = this.algorithm(src, c.text)

      c.originalScore = res

      if (res < min) {
        min = res
        minCandidateIdx = i
      }
      if (res > max) {
        max = res
        maxCandidateIdx = i
      }
    }

    console.log(JSON.stringify(candidates, ' ', 2))
    console.log(min, max, minCandidateIdx, maxCandidateIdx)
  }
}

// const qmd = new QuickMatch({ algorithm: 'dice' })
// qmd.run('I want a pizza', ['Free hot dog here', 'Pizza for sale', 'Rent your cola'])

const qm = new QuickMatch({
  algorithm: 'levenshtein',
  enableStemming: true,
  stemming: { language: 'en', minPreStemmingLength: 4, minPostStemmingLength: 4 },
  limits: { minLengthCandidate: 3, maxCandidateWords: 5 },
  weightIntersectionMultiplier: 1
})

qm.run('I want a pizza',
  [
    { text: 'Free hot dog here', keywords: ['hot dog', 'free'] },
    { text: 'Pizza for sale', keywords: ['pizza', 'margherita'] },
    { text: 'Rent your cola', keywords: ['coke', 'cola'] }
  ]
)

module.exports = { QuickMatch }
