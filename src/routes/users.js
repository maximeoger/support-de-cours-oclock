const router = require('koa-router')()
const controller = require('../controllers/user')

router.get('/users', controller.getUsers)
router.post('/user', controller.createUser)

module.exports = router