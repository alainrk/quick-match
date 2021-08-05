const { distance, closest } = require('fastest-levenshtein')
const dice = require('fast-dice-coefficient')

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
  }

  run (src, candidates) {
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
 
qmd.run('test con la pizza', ['voglio la pezza', 'test per il pane', 'con un test di pezzo'])
qml.run('test con la pizza', ['voglio la pezza', 'test per il pane', 'con un test di pezzo'])
  
