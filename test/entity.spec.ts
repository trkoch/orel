import * as assert from 'assert'
import { Cream } from './app/cream'

describe('Entity', function () {
  it('assigns attributes', function () {
    const { attributes } = new Cream({name: 'Erdbeere'})
    assert.equal(attributes.name, 'Erdbeere')
  })

  it('converts to JSON', function () {
    const cream = new Cream({name: 'Vanille'})
    const converted = JSON.parse(JSON.stringify(cream))
    assert.equal(converted.name, 'Vanille')
  })

  context('validation', function () {
    it('has undetermined status before validation', function () {
      const cream = new Cream({})
      assert.strictEqual(cream.valid, null)
    })

    it('has determined status after validation', async function () {
      const cream = new Cream({})
      await cream.validate()
      assert.strictEqual(cream.valid, false)
    })

    it('executes validator', async function () {
      const cream = new Cream({})
      await cream.validate()
      assert.strictEqual(cream.valid, false)
      assert.equal(cream.errors[0], 'Missing name')
    })
  })

  it('creates collection from rows', function () {
    const collection = Cream.collection([{name: 'Kirsche'}])
    const {attributes} = collection[0]
    assert.equal(attributes.name, 'Kirsche')
  })

  context('converting columns to attributes', function () {
    it('creates instance from columns', function () {
      const {attributes} = Cream.fromColumns({name: 'Schokolade'})
      assert.equal(attributes.name, 'Schokolade')
    })

    it('converts snake columns to camel attributes', function () {
      const {attributes} = Cream.fromColumns({is_vegan: true})
      assert.equal(attributes.isVegan, true)
    })
  })

  context('converting attributes to columns', function () {
    it('returns columns of attributes', function () {
      const cream = new Cream({title: 'Vanille'})
      assert.equal(cream.columns.title, 'Vanille')
    })

    it('converts camel attributes to snake columns', function () {
      const cream = new Cream({isVegan: false})
      assert.equal(cream.columns.is_vegan, false)
    })
  })

  context('extending', function () {
    it('supports custom getters', function () {
      const cream = new Cream({isVegan: true})
      assert(cream.isVegeterian)
    })
  })
})
