const dbConnection = require('../../utils/database/connectionPool')

async function getUsers(ctx) {
  let results = await dbConnection.query('SELECT * FROM users ORDER BY id ASC')
  
  ctx.status = 200
  ctx.body = JSON.stringify({
    count: results.rowCount,
    data: results.rows
  })
}

async function createUser (ctx) {
  const { name, email } = ctx.request.body

  await dbConnection.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email])

  ctx.status = 201
  ctx.body = `Created new user with email ${email}`
}

module.exports = {
  getUsers,
  createUser
}