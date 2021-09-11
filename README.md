<div align="center">
  <img src="https://github.com/alainrk/quick-match/raw/main/assets/logo.png" width="250" height="auto"/>
</div>

![Build Status](https://github.com/alainrk/quick-match/workflows/Test/badge.svg)
[![NPM version](https://img.shields.io/npm/v/quick-match.svg?style=flat)](https://www.npmjs.com/package/quick-match)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://github.com/emersion/stability-badges#stable)

Conversational interfaces are increasingly popular, Artificial intelligence, NLP/NLU solutions are at the forefront.\
But, there is often the need for something simple, blazingly fast, and "offline" to solve the text matching problem.\
This is a common issue with chat **Quick Replies**, multiple choice answers, and **vocal** interfaces (even less reliable).\
**Quick Match** provides a toolkit to address all these problems in the best possible way.

Do you have a good idea or want to make the matching algorithm even more efficient? [Collaborate!](https://github.com/alainrk/quick-match/pulls)
## Usage

Install

```
npm i -s quick-match
```

Simple initialization with default algorithm:

```js
const { QuickMatch } = require('quick-match')

const qm = new QuickMatch()

const userInput = 'I want a pizza'
const candidates = ['Free hot dog here', 'Pizza for sale', 'Rent your cola']

const { bestCandidateIdx } = qm.run(userInput, candidates) // 1
```

## Available algorithms

- Dice's coefficient (max score => best result)

```js
const { QuickMatch } = require('quick-match')
const qm = new QuickMatch({ algorithm: 'dice' })

const input = 'I want a pizza'
const qr = ['Free hot dog here', 'Pizza for sale', 'Rent your cola']

const { candidates, bestCandidateIdx, maxScore } = qm.run(input, qr)

// candidates
// [
//   {
//     text: 'Free hot dog here',
//     keywords: [],
//     score: 0.06896551724137931,
//     stemmed: [ 'free', 'here' ],
//     intersections: []
//   },
//   {
//     text: 'Pizza for sale',
//     keywords: [],
//     score: 0.3076923076923077,
//     stemmed: [ 'pizza', 'sale' ],
//     intersections: [ 'pizza' ]
//   },
//   {
//     text: 'Rent your cola',
//     keywords: [],
//     score: 0.15384615384615385,
//     stemmed: [ 'rent', 'your', 'cola' ],
//     intersections: []
//   }
// ]

// bestCandidateIdx: 1
// maxScore: 0.3076923076923077
```

- Levenshtein distance (min score => best result)

```js
const { QuickMatch } = require('quick-match')
const qm = new QuickMatch({ algorithm: 'levenshtein' })

const input = 'I want a pizza'
const qr = ['Free hot dog here', 'Pizza for sale', 'Rent your cola']

const { candidates, bestCandidateIdx, minScore } = qm.run(input, qr)

// candidates
// [
//   {
//     text: 'Free hot dog here',
//     keywords: [],
//     score: 15,
//     stemmed: [ 'free', 'here' ],
//     intersections: []
//   },
//   {
//     text: 'Pizza for sale',
//     keywords: [],
//     score: 12,
//     stemmed: [ 'pizza', 'sale' ],
//     intersections: [ 'pizza' ]
//   },
//   {
//     text: 'Rent your cola',
//     keywords: [],
//     score: 12,
//     stemmed: [ 'rent', 'your', 'cola' ],
//     intersections: []
//   }
// ]

// bestCandidateIdx: 1
// minScore: 12
```

## Stemming

You can also enable them stemming, applying the algorithms only on the stem (root) of the words.\
This, sometimes, is useful to reduce the noise.

```js
const { QuickMatch } = require('quick-match')
const qm = new QuickMatch({
  algorithm: 'dice',
  enableStemming: true,
  stemming: {
    language: 'English',
    // (optional) Shorter words than this number BEFORE stemming are removed
    minPreStemmingLength: 3,
    // (optional) Shorter words than this number AFTER stemming are removed
    minPostStemmingLength: 4
  }
})

const input = 'I discussed about food'
const qr = [
  { text: 'Discussing food' },
  { text: 'Eating and running' }
]

const { stemmedText, bestCandidateIdx } = qm.run('i have discussed about food', qr)

// stemmedText: [ 'have', 'discuss', 'about', 'food', 'drink' ]
// bestCandidateIdx: 0
```
### Available languages:

- Arabic
- Danish
- Dutch
- English
- French
- German
- Greek
- Hungarian
- Italian
- Portuguese
- Romanian
- Russian
- Spanish
- Swedish
- Tamil
- Turkish

## Words intersections

Another useful feature is the possibility to have the intersections among user input and possible candidates. This can be used further to better assess the fittest candidate.

```js
const { QuickMatch } = require('quick-match')
const qm = new QuickMatch({
  algorithm: 'dice',
  enableStemming: true,
  stemming: { language: 'English', minPreStemmingLength: 4, minPostStemmingLength: 4 }
})

const input = 'I have discussed about mealing and foot'
// As you can see, the candidates can be only strings or object in the format { text: string, keywords: [string] } to improve the matching with relatex keyworkds
const qr = [
  { text: 'Discussing food', keywords: ['eating', 'meal'] },
  { text: 'Eating and running', keywords: ['jogging', 'footing'] }
]

const { candidates, maxIntersections, maxIntersectionsCandidateIdx, bestCandidateIdx } = qm.run(input, qr)
// candidates
// [
//   {
//     text: 'Discussing food',
//     keywords: [ 'eating', 'meal' ],
//     score: 0.4230769230769231,
//     stemmed: [ 'discuss', 'food', 'meal' ],
//     intersections: [ 'discuss', 'meal' ]
//   },
//   {
//     text: 'Eating and running',
//     keywords: [ 'jogging', 'footing' ],
//     score: 0.2545454545454545,
//     stemmed: [ 'foot' ],
//     intersections: [ 'foot' ]
//   }
// ]

// maxIntersections: 2
// maxIntersectionsCandidateIdx: 0
// bestCandidateIdx: 0
```

## Usage of numbers

It sometimes useful, especially in chat and voice interaction to recognize digits as user's answer

### Simple digit matching

```js
const { QuickMatch } = require('quick-match')
const qm = new QuickMatch({
  numbers: {
    enableDigits: true,
    maxDigit: 5
  }
})
const qr = ['foo', 'bar', 'zoo']
const { numberMatch, numberMatchType, bestCandidateIdx } = qm.run('1', qr)

// numberMatch: true
// numberMatchType: 'digit'
// bestCandidateIdx: 0
```

### Simple cardinal matching

```js
const { QuickMatch } = require('quick-match')
const qm = new QuickMatch({
  numbers: {
    enableCardinals: true,
    cardinals: ['uno', 'due', 'tre'] // Specify your custom cardinals based on your language
  }
})
const qr = ['foo', 'bar', 'zoo']
const res = qm.run('la due', qr) // It tries to get the number even if other small "noise" words

// numberMatch: true
// numberMatchType: 'cardinal'
// bestCandidateIdx: 1
```

### Simple ordinal matching

```js
const { QuickMatch } = require('quick-match')
const qm = new QuickMatch({
  numbers: {
    enableOrdinals: true,
    ordinals: ['prima', 'seconda', 'terza'] // Specify your custom ordinals based on your language
  }
})
const qr = ['foo', 'bar', 'zoo']
const res = qm.run('seconda scelta', qr)

// numberMatch: true
// numberMatchType: 'ordinal'
// bestCandidateIdx: 1
```

## Lots of possibilities

A lot of customization with options for every detail:

```js
const { QuickMatch } = require('quick-match')

const qm = new QuickMatch({
  algorithm: 'dice',
  enableStemming: true,
  stemming: {
    language: 'English',
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
      'one', 'two', 'three', 'four', 'five',
      'six', 'seven', 'eigth', 'nine', 'ten'
    ],
    ordinals: [
      'first', 'second', 'third', 'fourth', 'fifth',
      'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
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
