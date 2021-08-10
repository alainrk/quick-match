const { test } = require('tap')
const Stemming = require('../Stemming')

test('rasing error for not available language', (t) => {
  t.plan(1)
  try {
    const s = new Stemming('NotAvailableLanguage')
    t.fail('Should not be here, not available language', s)
  } catch (err) {
    t.ok('Not available language ok')
  }
})

test('stemming word', (t) => {
  t.plan(2)
  const s = new Stemming('Italian')
  t.same(s.stem('mangiare'), 'mang')
  t.same(s.stem('mangio'), 'mang')
})

test('stemming phrase', (t) => {
  t.plan(1)
  const s = new Stemming('Italian')
  t.same(s.stemPhrase('mangiare la pizza insieme al pizzaiolo guardando il mare'), [
    'mang', 'la',
    'pizz', 'insiem',
    'al', 'pizzaiol',
    'guard', 'il',
    'mar'
  ])
})

test('stemming array', (t) => {
  t.plan(1)
  const s = new Stemming('Italian')
  t.same(s.stemArray(['mangiare', 'la', 'pizza', 'insieme', 'al', 'pizzaiolo', 'guardando', 'il', 'mare']), [
    'mang', 'la',
    'pizz', 'insiem',
    'al', 'pizzaiol',
    'guard', 'il',
    'mar'
  ])
})
