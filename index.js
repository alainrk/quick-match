const { distance, closest } = require('fastest-levenshtein')
const dice = require('fast-dice-coefficient')
const Ajv = require("ajv")

const candidatesSchema = require('./schema/candidates.json') 

//console.log(distance('fast', 'faster'))
//console.log(closest('fast', ['slow', 'faster', 'fastest']))
//console.log(dice('javascript', 'coffeescript'))

DISTANCE_ALGORITHMS = {
  dice: dice,
  levenshtein: distance
}

class QuickMatch {
  constructor (options = {}) {
    this.options = options

    if (!this.options.distanceAlgorithm) {
      this.options.distanceAlgorithm = 'dice'
    }
    if (!DISTANCE_ALGORITHMS[this.options.distanceAlgorithm]) throw new Error('Not valid distance algorithm given')
    this.algorithm = DISTANCE_ALGORITHMS[this.options.distanceAlgorithm] 

    const ajv = new Ajv()
    this.candidatesValidator = ajv.compile(candidatesSchema)
  }

  run (src, candidates) {
    if (!this.candidatesValidator(candidates)) throw new Error('Candidates has not a valid format!')
    console.log('Algorithm:', this.options.distanceAlgorithm)
    for (const c of candidates) {
      const res = this.algorithm(src, c)
      console.log(`${res}\t${src} => ${c}`)
    }
  }
}


const qmd = new QuickMatch({ distanceAlgorithm: 'dice' })
const qml = new QuickMatch({ distanceAlgorithm: 'levenshtein' })

qmd.run('pizza', ['pezza', 'pane', 'pezzo'])
qml.run('pizza', ['pezza', 'pane', 'pezzo'])
 
qmd.run('pizza', [{ text: 'pezza' }, { text: 'pane', keywords: [] }, { text: 'pezzo' }])
qml.run('pizza', ['pezza', 'pane', 'pezzo'])
 
qmd.run('test con la pizza', ['voglio la pezza', 'test per il pane', 'con un test di pezzo'])
qml.run('test con la pizza', ['voglio la pezza', 'test per il pane', 'con un test di pezzo'])
  
