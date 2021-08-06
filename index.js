const { distance } = require('fastest-levenshtein')
const dice = require('fast-dice-coefficient')
const Ajv = require("ajv")

const candidatesSchema = require('./schema/candidates.json') 
const optionsValidator = require('./schema/options.json') 

//console.log(distance('fast', 'faster'))
//console.log(closest('fast', ['slow', 'faster', 'fastest']))
//console.log(dice('javascript', 'coffeescript'))

DISTANCE_ALGORITHMS = {
  dice: dice,
  levenshtein: distance
}

class QuickMatch {
  constructor (options = {}) {
    const ajv = new Ajv()
    this.candidatesValidator = ajv.compile(candidatesSchema)

    console.log(options)
    this.options = this.initOptions(options)
    console.log(this.options)
    this.algorithm = DISTANCE_ALGORITHMS[this.options.distanceAlgorithm] 
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

    console.log(`\nAlgorithm: ${this.options.distanceAlgorithm} - [${src}]`)

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
      //console.log(`${res}\t ${c.text}`)
    }

    console.log(JSON.stringify(candidates, ' ', 2))
    console.log(min, max, minCandidateIdx, maxCandidateIdx)
  }
}


const qmd = new QuickMatch({ distanceAlgorithm: 'dice' })
const qml = new QuickMatch({ distanceAlgorithm: 'levenshtein' })

qmd.run('pizza', ['cane', 'pane', 'pezzo'])
qml.run('pizza', ['pezza', 'pane', 'pezzo'])
 
//qmd.run('pizza', [{ text: 'pezza' }, { text: 'pane', keywords: [] }, { text: 'pezzo' }])
//qml.run('pizza', ['pezza', 'pane', 'pezzo'])
 
//qmd.run('test con la pizza', ['voglio la pezza', 'test per il pane', 'con un test di pezzo'])
//qml.run('test con la pizza', ['voglio la pezza', 'test per il pane', 'con un test di pezzo'])
  
module.exports = { QuickMatch }
