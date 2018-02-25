import db from './db'
import { Entity, Validator } from '../../lib/entity'
import { Repository } from '../../lib/repository'

export class Cream extends Entity({
  validator: class extends Validator {
    async validate () {
      if (!this.attributes.name) {
        this.errors.push('Missing name')
        return this
      }

      return this
    }
  }
}) {
  get isVegeterian () {
    return this.attributes.isVegan;
  }
}

class CreamRepository extends Repository({
  entity: Cream,
  table: 'creams',
  db
}) {
  allVegan () {
    return this.where({isVegan: true})
  }
}

export const creamRepository = new CreamRepository()
