exports.up = function (knex, Promise) {
  return knex.schema.createTable('creams', function (t) {
    t.increments()
    t.string('name')
    t.boolean('is_vegan')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('creams')
}
