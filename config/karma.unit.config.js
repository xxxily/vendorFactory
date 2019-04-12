let webpackConfig = require('./webpack.test.config')({ env: 'test' })

module.exports = function (config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    files: [
      // 'src/**/*spec.js',
      // 'src/**/tinydb/**/*spec.js',
      // 'src/**/*locker.spec.js',
      // 'src/**/*object.spec.js',
      'src/**/*logger.spec.js',
      'test/**/*spec.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'src/**/*.js': ['webpack'],
      'test/**/*.js': ['webpack']
    },
    webpack: webpackConfig,
    // webpackMiddleware: {
    //   noInfo: true
    // },
    reporters: ['progress'],
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-webpack'
    ],
    port: 9878,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [
      // 'Firefox',
      'Chrome'
    ],
    /* 注意：允许singleRun则autoWatch无效 */
    singleRun: false,
    concurrency: Infinity
  })
}
