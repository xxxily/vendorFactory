const middleware = require('../bin/middleware/index')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const resolve = p => {
  return path.resolve(__dirname, '../', p)
}

module.exports = function (options) {
  let config = {
    mode: 'development',
    entry: {
      'demo': resolve('src/demo/js/index.js')
    },
    output: {
      path: resolve('dist/output/'),
      filename: 'index.js'
    },
    devtool: 'cheap-module-eval-source-map',
    resolve: {
      alias: {
        lib: resolve('src/lib')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [
            /node_modules/
          ],
          include: [
            resolve('src'),
            resolve('test')
          ],
          loader: 'babel-loader?cacheDirectory=true'
        }
      ]
    },
    devServer: {
      clientLogLevel: 'warning',
      hot: false,
      host: 'localhost',
      port: '8086',
      open: false,
      publicPath: '/',
      /* 打开页面 */
      openPage: 'index.html',
      before: function (app) {
        middleware.init(app)
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: resolve('src/demo/index.html'),
        inject: 'head',
        chunksSortMode: 'dependency',
        hash: true
      })
    ]
  }
  return config
}
