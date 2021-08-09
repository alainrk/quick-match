class Result {
  constructor (algorithm, text, candidates) {
    this.algorithm = algorithm
    this.minScore = Infinity
    this.maxScore = -Infinity
    this.candidates = candidates
    this.text = text
    this.minCandidateIdx = null
    this.maxCandidateIdx = null
    this.bestCandidateIdx = null
    this.bestCandidate = null
    this.numberMatch = undefined
    this.numberMatchType = undefined
  }

  setCandidateScore (candidateIdx, score) {
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

  setNumberMatch (type, idx) {
    if (!['digit', 'cardinal', 'ordinal'].includes(type)) throw new Error(`Type ${type} is not a valid number match result`)
    this.numberMatch = true
    this.numberMatchType = type
    this.bestCandidateIdx = idx
    return this
  }

  build () {
    if (!this.candidates || this.candidates.length === 0) throw new Error('Cannot build solution, no candidates in result')
    if (!this.numberMatch) {
      if (this.algorithm === 'dice') {
        this.bestCandidateIdx = this.maxCandidateIdx
      } else if (this.algorithm === 'levenshtein') {
        this.bestCandidateIdx = this.minCandidateIdx
      } else {
        throw new Error('Not supported algorithm')
      }
    }
    if (!this.bestCandidateIdx && this.bestCandidateIdx !== 0) throw new Error('Cannot build solution, no best candidate in result')
    this.bestCandidate = this.candidates[this.bestCandidateIdx]
    return this
  }
}

module.exports = { Result }
