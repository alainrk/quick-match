const { Stemmer, Languages } = require('multilingual-stemmer')

const AVAILABLE_LANGUAGES = {
  Arabic: Languages.Arabic,
  Danish: Languages.Danish,
  Dutch: Languages.Dutch,
  English: Languages.English,
  French: Languages.French,
  German: Languages.German,
  Greek: Languages.Greek,
  Hungarian: Languages.Hungarian,
  Italian: Languages.Italian,
  Portuguese: Languages.Portuguese,
  Romanian: Languages.Romanian,
  Russian: Languages.Russian,
  Spanish: Languages.Spanish,
  Swedish: Languages.Swedish,
  Tamil: Languages.Tamil,
  Turkish: Languages.Turkish
}

class Stemming {
  constructor (language) {
    if (!AVAILABLE_LANGUAGES[language]) throw new Error(`Language '${language}' is not available`)
    this.stemmer = new Stemmer(AVAILABLE_LANGUAGES[language])
  }

  stem (word) {
    if (typeof word !== 'string') throw new Error('String is required')
    return this.stemmer.stem(word)
  }

  stemArray (array) {
    if (!Array.isArray(array)) throw new Error('Array is required')
    return array.map(this.stem.bind(this))
  }

  stemPhrase (phrase) {
    if (typeof phrase !== 'string') throw new Error('String is required')
    return this.stemArray(phrase.split(/\s+/))
  }
}

module.exports = Stemming
