import { Entity } from './entity'

export function Repository ({entity: Entity, table, db}) {
  return class Repository {
    static toColumns (attributes) {
      return Entity.adaptor.columns(attributes)
    }

    async where (attributes: Object, fn?: Function): Promise<Entity[]> {
      let rows = await this._where(attributes, fn)
      return Entity.collection(rows)
    }

    async findWhere (attributes: Object): Promise<Entity|false> {
      const rows = await this._where(attributes, query => query.limit(1))
      if (rows[0]) {
        const entity = Entity.fromColumns(rows[0])
        entity.validate()
        return entity
      } else {
        return false
      }
    }

    async find (id: number): Promise<Entity> {
      const entity = await this.findWhere({id})
      if (!entity) throw new Error('Record not found')
      return entity
    }

    async count (attributes: Object): Promise<number> {
      return await this._where(attributes, db => db.count())
        .then(r => r[0]['count(*)'])
    }

    async all (fn?: Function) {
      let query = db(table).select()
      if (typeof fn === 'function') query = fn(query)
      const rows = await query
      return Entity.collection(rows)
    }

    async _where (attributes, fn?: Function) {
      let columns = Repository.toColumns(attributes)
      let query = db(table).where(columns)
      if (typeof fn === 'function') query = fn(query)
      return query
    }

    async create (entity: Entity): Promise<Entity> {
      let query = db(table).insert(entity.columns)
      if (await entity.validate()) {
        const [id] = await query
        return await this.find(id)
      } else {
        return entity
      }
    }

    async update (id: number, entity: Entity): Promise<Entity> {
      if (await entity.validate()) {
        let query = db(table).update(entity.columns).where({id})
        await query
        return await this.find(id)
      } else {
        return entity
      }
    }

    async delete (id: number): Promise<number> {
      let query = db(table).delete().where({id})
      return await query
    }
  }
}
