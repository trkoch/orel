import { mapKeys, camelCase, snakeCase, Dictionary } from 'lodash'

export interface Attributes {
  id: number
  [attribute: string]: any
}

export interface Entity {
  attributes: Attributes
  columns: Attributes
  errors: any[]
  valid: boolean|null
  validate(): Promise<boolean>
  toJSON(): Object
}

export const Adaptor = {
  attributes (columns) {
    return mapKeys(columns, (_, key) => camelCase(key + '')) as Attributes
  },

  columns (attributes) {
    return mapKeys(attributes, (_, key) => snakeCase(key + '')) as Attributes
  }
}

export class Validator {
  attributes: Attributes
  errors: any[]

  constructor (attributes) {
    this.attributes = attributes
    this.errors = []
  }

  static exec (attributes) {
    return new this(attributes).validate()
  }

  get valid () {
    return (this.errors.length === 0)
  }

  async validate () {
    return this
  }
}

export function Entity ({
  validator = Validator,
  adaptor = Adaptor
} = {}) {
  return class implements Entity {
    constructor (
      public attributes: any,
      public valid: boolean|null = null,
      public errors: any[] = []
    ) {}

    static get adaptor () {
      return adaptor
    }

    static fromColumns (columns: Object): Entity {
      return new this(adaptor.attributes(columns))
    }

    static collection (rows: any[]): Entity[] {
      return rows.map(columns => {
        return this.fromColumns(columns)
      })
    }

    async validate (): Promise<boolean> {
      const {valid, errors} = await validator.exec(this.attributes)
      this.valid = valid
      this.errors = errors
      return valid
    }

    get columns () {
      return Object.assign({}, adaptor.columns(this.attributes))
    }

    toJSON () {
      return this.attributes
    }
  }
}
