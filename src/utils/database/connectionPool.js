const Pool = require('pg').Pool
const dotenv = require('dotenv')

dotenv.config()

const { DB_USERNAME, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env

const pool = new Pool({
    user: DB_USERNAME,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT
})

module.exports = pool