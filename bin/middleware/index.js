/*!
 * @name         index.js
 * @description  中间件
 * @version      0.0.1
 * @author       Blaze
 * @date         02/04/2019 13:53
 * @github       https://github.com/xxxily
 */
const middleware = {
  init: function (app) {
    app.all('/qwlooger/reporter', async function (req, res) {
      res.json({
        msg: '日志保持成功'
      })
    })
  }
}
module.exports = middleware
