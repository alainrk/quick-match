const { QuickMatch } = require('.')

// const qmd = new QuickMatch({ algorithm: 'dice' })
// qmd.run('I want a pizza', ['Free hot dog here', 'Pizza for sale', 'Rent your cola'])

const qm = new QuickMatch({
  algorithm: 'dice',
  enableStemming: true,
  stemming: { language: 'English', minPreStemmingLength: 4, minPostStemmingLength: 4 }
})

const result = qm.run('I wanted a pizza',
  [
    { text: 'Free hot-dog wanting here', keywords: ['hot-dog', 'free'] },
    { text: 'Pizza for sale', keywords: ['pizza', 'margherita'] },
    { text: 'Renting your cola', keywords: ['coke', 'cola'] }
  ]
)

console.log(JSON.stringify(result, ' ', 2))
