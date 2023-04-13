module.exports = async function (ctx, next) {
  try {
    await next()
   
  } catch (error) {

    ctx.status = 500
    ctx.body = 'Internal server error'
  }
}