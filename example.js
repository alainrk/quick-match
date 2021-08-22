const { QuickMatch } = require('quick-match')

const qm = new QuickMatch({
  algorithm: 'dice',
  enableStemming: true,
  stemming: { language: 'English', minPreStemmingLength: 4, minPostStemmingLength: 4 }
})

const result = qm.run('I wanted a pizza',
  [
    { text: 'I want hot-dog here', keywords: ['hot-dog', 'free'] },
    { text: 'Pizza for sale', keywords: ['pizza', 'margherita'] },
    { text: 'Renting your cola', keywords: ['coke', 'cola'] }
  ]
)

console.log(JSON.stringify(result, ' ', 2))
