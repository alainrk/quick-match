'use strict'

class Result {
  constructor(options, text, candidates, fallback) {
    this.options = options
    this.fallback = fallback
    this.algorithm = options.algorithm
    this.minScore = Infinity
    this.maxScore = -Infinity
    this.maxIntersections = -Infinity
    this.candidates = candidates
    this.text = text
    this.stemmedText = []
    this.minCandidateIdx = null
    this.maxCandidateIdx = null
    this.maxIntersectionsCandidateIdx = null
    this.bestCandidateIdx = null
    this.bestCandidate = null
    this.numberMatch = undefined
    this.numberMatchType = undefined
  }

  setCandidateScore(candidateIdx, score) {
    this.candidates[candidateIdx].score = score
    if (score < this.minScore) {
      this.minScore = score
      this.minCandidateIdx = candidateIdx
    }
    if (score > this.maxScore) {
      this.maxScore = score
      this.maxCandidateIdx = candidateIdx
    }
    return this
  }

  setCandidateStemIntersections(candidateIdx, intersections) {
    this.candidates[candidateIdx].intersections = intersections
    if (intersections.length > this.maxIntersections) {
      this.maxIntersections = intersections.length
      this.maxIntersectionsCandidateIdx = candidateIdx
    }
    return this
  }

  setStemmedText(arr) {
    this.stemmedText = arr
    return this
  }

  setStemmedCandidate(candidateIdx, arr) {
    this.candidates[candidateIdx].stemmed = arr
    return this
  }

  setNumberMatch(type, idx) {
    if (!['digit', 'cardinal', 'ordinal'].includes(type))
      throw new Error(`Type ${type} is not a valid number match result`)
    this.numberMatch = true
    this.numberMatchType = type
    this.bestCandidateIdx = idx
    return this
  }

  randomFallbackMessage(fallbackObj) {
    const fallback = fallbackObj.map((obj) => obj.text)
    const randomIdx = Math.floor(Math.random() * fallback.length)
    return fallback[randomIdx]
  }

  build() {
    if (!this.candidates || this.candidates.length === 0)
      throw new Error('Cannot build solution, no candidates in result')
    if (!this.numberMatch) {
      if (this.algorithm === 'dice') {
        this.bestCandidateIdx = this.maxCandidateIdx
      } else if (this.algorithm === 'levenshtein') {
        this.bestCandidateIdx = this.minCandidateIdx
      } else {
        throw new Error('Not supported algorithm')
      }
    }
    if (!this.bestCandidateIdx && this.bestCandidateIdx !== 0)
      throw new Error('Cannot build solution, no best candidate in result')

    if (
      this.options.threshold &&
      this.options.threshold > this.candidates[this.bestCandidateIdx].score
    ) {
      const fallbackReturn = {
        text:
          this.randomFallbackMessage(this.fallback) ||
          'I cannot find a match for your request :(',
        keywords: [],
        label: 'fallback',
        score: null,
        stemmed: [],
        intersections: []
      }
      this.bestCandidate = fallbackReturn
    } else {
      this.bestCandidate = this.candidates[this.bestCandidateIdx]
    }
    if(this.options.detailedReturn) return this
    return this.bestCandidate
  }
}

module.exports = { Result }
