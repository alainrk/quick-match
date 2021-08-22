<div align="center">
  <img src="https://github.com/alainrk/quick-match/raw/main/assets/logo.png" width="250" height="auto"/>
</div>

![Build Status](https://github.com/alainrk/quick-match/workflows/Test/badge.svg)
[![NPM version](https://img.shields.io/npm/v/quick-match.svg?style=flat)](https://www.npmjs.com/package/quick-match)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)
[![stability-unstable](https://img.shields.io/badge/stability-unstable-yellow.svg)](https://github.com/emersion/stability-badges#unstable)

Conversational interfaces are increasingly popular, Artificial intelligence, NLP/NLU solutions are at the forefront.\
But, there is often the need for something simple, blazingly fast, and "offline" to solve the text matching problem.\
This is a common issue with chat **Quick Replies**, multiple choice answers, and **vocal** interfaces (even less reliable).\
**Quick Match** provides a toolkit to address all these problems in the best possible way.

Do you have a good idea or want to make the matching algorithm even more efficient? [Collaborate!](https://github.com/alainrk/quick-match/pulls)
## Usage

Simple initialization with default algorithm:

```js
const { QuickMatch } = require('quick-match')

const qm = new QuickMatch()

const userInput = 'I want a pizza'
const candidates = ['Free hot dog here', 'Pizza for sale', 'Rent your cola']

const { bestCandidateIdx } = qm.run(userInput, candidates) // 1
```

A lot of customization with options for every detail:

```js
const { QuickMatch } = require('quick-match')

const qm = new QuickMatch({
  algorithm: "dice",
  enableStemming: true,
  stemming: {
    language: "English",
    minPreStemmingLength: 4,
    minPostStemmingLength: 4
  },
  enableAlgorithmOnKeywords: false,
  numbers: {
    enableDigits: true,
    enableCardinals: true,
    enableOrdinals: true,
    maxDigit: 10,
    maxWordsEnablingNumbers: 2,
    cardinals: [
      "one", "two", "three", "four", "five",
      "six", "seven", "eigth", "nine", "ten"
    ],
    ordinals: [
      "first", "second", "third", "fourth", "fifth",
      "sixth", "seventh", "eighth", "ninth", "tenth"
    ]
  },
  limits: {
    minLengthCandidate: 3,
    maxCandidateWords: 5
  },
  weightIntersectionMultiplier: 1
})

// Declare your input text, candidates and run the algorithm
const userInput = 'I want a pizza'
const candidates = [
  { text: 'Free hot dog here', keywords: ['hot dog', 'free'] },
  { text: 'Pizza for sale', keywords: ['pizza', 'margherita'] },
  { text: 'Rent your cola', keywords: ['coke', 'cola'] }
]

const { bestCandidateIdx } = qm.run(userInput, candidates) // 1
```

Result:

```json
{
  "algorithm": "dice",
  "minScore": 0.06451612903225806,
  "maxScore": 0.2857142857142857,
  "maxIntersections": 1,
  "candidates": [
    {
      "text": "I want hot-dog here",
      "keywords": [
        "hot-dog",
        "free"
      ],
      "score": 0.24242424242424243,
      "stemmed": [
        "want",
        "here",
        "hot-dog",
        "free"
      ],
      "intersections": [
        "want"
      ]
    },
    {
      "text": "Pizza for sale",
      "keywords": [
        "pizza",
        "margherita"
      ],
      "score": 0.2857142857142857,
      "stemmed": [
        "pizza",
        "sale",
        "pizza",
        "margherita"
      ],
      "intersections": [
        "pizza"
      ]
    },
    {
      "text": "Renting your cola",
      "keywords": [
        "coke",
        "cola"
      ],
      "score": 0.06451612903225806,
      "stemmed": [
        "rent",
        "your",
        "cola",
        "coke",
        "cola"
      ],
      "intersections": []
    }
  ],
  "text": "I wanted a pizza",
  "stemmedText": [
    "want",
    "pizza"
  ],
  "minCandidateIdx": 2,
  "maxCandidateIdx": 1,
  "maxIntersectionsCandidateIdx": 0,
  "bestCandidateIdx": 1,
  "bestCandidate": {
    "text": "Pizza for sale",
    "keywords": [
      "pizza",
      "margherita"
    ],
    "score": 0.2857142857142857,
    "stemmed": [
      "pizza",
      "sale",
      "pizza",
      "margherita"
    ],
    "intersections": [
      "pizza"
    ]
  }
}
```
