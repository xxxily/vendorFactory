/*!
 * @name         rollup.config.js
 * @description  rollup 打包配置文件
 * @version      0.0.1
 * @author       Blaze
 * @date         15/03/2019 11:54
 * @github       https://github.com/xxxily
 */
import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import pkg from '../package.json'
const alias = require('rollup-plugin-alias')
const path = require('path')
const utils = require('../bin/utils')

const resolve = p => {
  return path.resolve(__dirname, '../', p)
}

const merge = function (objA, objB) {
  let source = utils.clone(objA)
  let target = utils.clone(objB)
  return utils.mergeObj(source, target, true)
}

/* rollup 打包的公共配置 */
const baseConf = {
  input: resolve('src/qwLogger.js'),
  output: {
    file: resolve('dist/qwLogger.js'),
    format: 'umd',
    name: pkg.name
  },
  plugins: [
    json(),
    alias({
      lib: resolve('src/lib')
    }),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ]
}

const builds = {
  dev: baseConf,
  prod: merge(baseConf, {
    plugins: [
      babel({
        externalHelpers: false,
        runtimeHelpers: true,
        exclude: 'node_modules/**'
      })
    ]
  })
}

function getRollupConfig () {
  const npmArgv = utils.getNpmConfigArgv()
  let code = utils.getArgvCode('--pack-', npmArgv)
  return builds[code] || builds['dev']
}

export default getRollupConfig()
