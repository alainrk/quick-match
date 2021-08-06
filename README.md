# Quick Match

Conversational interfaces are increasingly popular.
Artificial intelligence, NLP/NLU solutions are at the forefront. 
But, there is often the need for something simple, blazingly fast, and "offline" to solve the text matching problem. 
This is a common issue with chat **Quick Replies**, multiple choice answers, and **vocal** interfaces (even less reliable).
**Quick Match** provides a toolkit to address all these problems in the best possible way.

Do you have a good idea or want to make the matching algorithm even more efficient? *Collaborate with us!*

## Usage

Simple initialization with default algorithm (Dice's coefficient)

```js
const qm = new QuickMatch()
qm.run('I want a pizza', ['Free hot dog here', 'Pizza for sale', 'Rent your cola'])
```

Result

```json
[
  {
    "text": "Free hot dog here",
    "keywords": [],
    "originalScore": 0.06896551724137931
  },
  {
    "text": "Pizza for sale",
    "keywords": [],
    "originalScore": 0.3076923076923077
  },
  {
    "text": "Rent your cola",
    "keywords": [],
    "originalScore": 0.15384615384615385
  }
]
```

A lot of customization with options for every detail

```js
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
```

Result

```json
[
  {
    "text": "Free hot dog here",
    "keywords": [
      "hot dog",
      "free"
    ],
    "originalScore": 15
  },
  {
    "text": "Pizza for sale",
    "keywords": [
      "pizza",
      "margherita"
    ],
    "originalScore": 13
  },
  {
    "text": "Rent your cola",
    "keywords": [
      "coke",
      "cola"
    ],
    "originalScore": 12
  }
]
```
