/*!
 * @name         rollup.tree.config.js
 * @description  rollup 打包配置列表
 * @version      0.0.1
 * @author       Blaze
 * @date         24/04/2019 14:20
 * @github       https://github.com/xxxily
 */
const path = require('path')
const resolve = p => {
  return path.resolve(__dirname, '../', p)
}

let confTree = {
  'utils': {
    version: '0.0.1',
    description: '公共核心函数',
    input: resolve('src/lib/utils/utils.js'),
    output: {
      file: resolve('dist/utils.js'),
      format: 'umd',
      name: 'utils'
    }
  },
  'qwLogger': {
    version: '0.0.1',
    description: '日志记录器',
    input: resolve('src/lib/qwLogger/qwLogger.js'),
    output: {
      file: resolve('dist/qwLogger.js'),
      format: 'umd',
      name: 'qwLogger'
    }
  }
}

module.exports = confTree
