const { QuickMatch } = require('./index.js')

const qm = new QuickMatch({
  algorithm: 'dice',
  enableStemming: true,
  threshold: 0.3,
  detailedReturn: true,
  stemming: { language: 'English', minPreStemmingLength: 4, minPostStemmingLength: 4 }
})

const fallbackMessages = [{text: "Não entendi o que você quis dizer"}, {text: "Não entendi, pode repetir?"}]

const result = qm.run('I wanted a pizza',
  [
    { text: 'I want hot-dog here', keywords: ['hot-dog', 'free'], label: 'comida' },
    { text: 'I wanna coffe piz', keywords: ['pizza', 'margherita'], label: 'comida'  },
    { text: 'Renting your cola', keywords: ['coke', 'cola'], label: 'bebida'  },
    { text: 'Quero coca', keywords: ['coke', 'cola'], label: 'bebida'  }
  ],
  fallbackMessages
)

console.log(JSON.stringify(result, ' ', 2))
