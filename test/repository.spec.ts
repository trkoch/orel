import * as assert from 'assert'
import db from './app/db'
import { Cream, creamRepository } from './app/cream'

describe('Repository', function () {
  before(async function () {
    await db.migrate.latest()
  })

  beforeEach(async function () {
    await db('creams').delete()
  })

  describe('where()', function () {
    beforeEach(async function () {
      await db('creams').insert({name: 'Schokolade', is_vegan: true})
      await db('creams').insert({name: 'Vanille', is_vegan: true})
    })

    it('returns collection of matching entities', async function () {
      const creams = await creamRepository.where({
        name: 'Schokolade'
      })
      assert.equal(creams.length, 1)
    })

    it('allows to customize query', async function () {
      const creams = await creamRepository.where(
        {isVegan: true},
        q => q.orderBy('name', 'desc')
      )
      assert.equal(creams[0].attributes.name, 'Vanille')
    })
  })

  describe('findWhere()', function () {
    let cream

    beforeEach(async function () {
      await db('creams').insert({name: 'Schokolade'})
      await db('creams').insert({name: 'Vanille'})

      cream = await creamRepository.findWhere({
        name: 'Schokolade'
      })
    })

    it('returns first matching entity', function () {
      assert.equal(cream.attributes.name, 'Schokolade')
    })

    it('validates found entity', async function () {
      assert(cream.valid)
    })

    it('returns false if no matching entity', async function () {
      cream = await creamRepository.findWhere({
        name: 'Erdbeere'
      })
      assert(!cream)
    })
  })

  describe('find()', function () {
    let id

    beforeEach(async function () {
      [id] = await db('creams').insert({name: 'Schokolade'})
    })

    it('finds entity by id', async function () {
      const cream = await creamRepository.find(id)
      assert.equal(cream.attributes.id, id)
      assert.equal(cream.attributes.name, 'Schokolade')
    })

    it('throws if missing record', function (done) {
      creamRepository.find(0).catch(err => {
        assert.equal(err.message, 'Record not found')
        done()
      })
    })
  })

  describe('count()', function () {
    it('counts matches', async function () {
      await db('creams').insert({name: 'Himbeere'})
      assert.equal(await creamRepository.count({name: 'Himbeere'}), 1)
      assert.equal(await creamRepository.count({name: 'Schokolade'}), 0)
    })
  })

  describe('all()', function () {
    beforeEach(async function () {
      await db('creams').insert({name: 'Schokolade'})
      await db('creams').insert({name: 'Vanille'})
    })

    it('returns collection of all entities', async function () {
      const creams = await creamRepository.all()
      assert.equal(creams.length, 2)
    })

    it('allows to customize query', async function () {
      const creams = await creamRepository.all(q => q.orderBy('name', 'desc'))
      assert.equal(creams[0].attributes.name, 'Vanille')
    })
  })

  describe('create()', function () {
    let cream

    beforeEach(async function () {
      cream = await creamRepository.create(
        new Cream({name: 'Erdbeere'})
      )
    })

    it('creates entity', function () {
      assert(cream.attributes.id > 0)
      assert.equal(cream.attributes.name, 'Erdbeere')
    })

    it('does not create invalid entity', async function () {
      const invalidCream = new Cream({})
      const created = await creamRepository.create(invalidCream)
      assert(!created.valid)
    })

    it('validates created entity', function () {
      assert(cream.valid)
    })
  })

  describe('update()', function () {
    let cream

    beforeEach(async function () {
      cream = await creamRepository.create(
        new Cream({name: 'Erdbeere'})
      )
    })

    it('updates entity', async function () {
      const {id} = cream.attributes
      const updatedCream = await creamRepository.update(
        id, new Cream({name: 'Schokolade'})
      )
      if (updatedCream) {
        assert.equal(updatedCream.attributes.id, id)
        assert.equal(updatedCream.attributes.name, 'Schokolade')
      } else {
        throw new Error()
      }
    })

    it('does not update invalid entity', async function () {
      const {id} = cream.attributes
      const invalidCream = new Cream({})
      const created = await creamRepository.update(id, invalidCream)
      assert(!created.valid)
    })

    it('validates updated entity', async function () {
      const {id} = cream.attributes
      const updatedCream = await creamRepository.update(
        id, new Cream({name: 'Schokolade'})
      )
      if (updatedCream) {
        assert(updatedCream.valid)
      } else {
        throw new Error()
      }
    })
  })

  describe('delete()', function () {
    let id

    beforeEach(async function () {
      [id] = await db('creams').insert({name: 'Schokolade'})
    })

    it('deletes entity', async function () {
      await creamRepository.delete(id)
      const records = await db('creams').where({name: 'Schokolade'})
      assert.equal(records.length, 0)
    })

    it('returns number of deletions', async function () {
      const deletes = await creamRepository.delete(id)
      assert.equal(deletes, 1)
    })
  })

  context('converting attributes to columns', function () {
    beforeEach(async function () {
      await db('creams').insert({name: 'Schokolade', is_vegan: true})
    })

    it('allows to query with camel case', async function () {
      const cream = await creamRepository.findWhere({isVegan: true})
      assert(cream)
    })
  })

  context('extending', function () {
    it('supports custom finders', async function () {
      await db('creams').insert({name: 'Schokolade', is_vegan: true})
      const creams = await creamRepository.allVegan()
      assert.equal(creams.length, 1)
    })
  })
})
