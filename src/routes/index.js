const router = require('koa-router')()

router.use(require('./users').routes())

module.exports = router