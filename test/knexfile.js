module.exports = {
  client: 'sqlite3',
  connection: {
    filename: ':memory:'
  },
  migrations: {
    directory: 'test/migrations'
  },
  useNullAsDefault: true,
  debug: (process.env.DEBUG === 'TRUE')
}
