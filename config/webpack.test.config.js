const path = require('path')
const resolve = p => {
  return path.resolve(__dirname, '../', p)
}

/**
 * 参考：
 * https://github.com/webpack-contrib/karma-webpack
 * https://stackoverflow.com/questions/39131809/karma-webpack-sourcemaps-not-working
 * https://github.com/webpack-contrib/karma-webpack/issues/109
 */

module.exports = function (options) {
  let config = {
    devtool: 'inline-source-map',
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
    }
  }
  return config
}
