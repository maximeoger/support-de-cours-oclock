const Koa = require('koa')
const userRouter = require('./routes/users')
const errorMiddleware = require('./utils/errorMiddleware')
const { koaBody } = require('koa-body')

const app = new Koa()

app.use(errorMiddleware)
app.use(koaBody())
app.use(userRouter.routes())

app.listen(3000)