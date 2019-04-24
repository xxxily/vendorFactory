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
const alias = require('rollup-plugin-alias')
const path = require('path')
const utils = require('../bin/utils')
const confTree = require('./rollup.tree.config')
const npmArgv = utils.getNpmConfigArgv()
/* 运行模式，只有开发(dev)或发布(prod)两种模式 */
const runMode = utils.getArgvCode('--mode-', npmArgv) || 'dev'
const projectName = utils.getArgvCode('--proj-', npmArgv) || 'utils'
const projectConf = confTree[projectName]

if (projectConf) {
  // 补充部分默认输出项
  projectConf.output.format = projectConf.output.format || 'umd'
  projectConf.output.name = projectConf.output.name || projectName
} else {
  console.error('无法正常运行脚本，不存在对应的项目配置')
}

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

let rollupConfig = merge(baseConf, projectConf)
if (runMode === 'prod') {
  // 发布模式下，会对脚本进行babel转换
  rollupConfig = merge(rollupConfig, {
    plugins: [
      babel({
        externalHelpers: false,
        runtimeHelpers: true,
        exclude: 'node_modules/**'
      })
    ]
  })
}

export default rollupConfig
