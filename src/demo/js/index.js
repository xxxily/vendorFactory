/*!
 * @name         index.js
 * @description
 * @version      0.0.1
 * @author       Blaze
 * @date         02/04/2019 11:52
 * @github       https://github.com/xxxily
 */

import QwLogger from '../../qwLogger'
import ajax from '../../lib/ajax/ajax'

let logger = new QwLogger({
  appId: 'unit_test_logger',
  url: '/qwlooger/reporter'
})

// window.addEventListener('error', (error) => {
//   // console.log(arguments)
//   console.log('捕获到异常：', error, error.target.nodeName)
//   return true
// }, true)

// window.onerror = function () {
//   console.log(arguments, arguments.length)
//   // console.log('捕获到异常：', error, error.target.nodeName)
//   return true
// }

setTimeout(function () {
  ajax({
    url: '/sdfsd/sd/fsd/f/sdf',
    data: { a: 1 }
  })
}, 1000 * 1)

try {
  alert(asdfasdf)
  // throw new Error('oops')
} catch (e) {
  // console.log('123123:', e.message, e.name)
}

window.addEventListener('unhandledrejection', function (e) {
  e.preventDefault()
  console.log('捕获到异常promise：', e)
  return true
})
setTimeout(function () {
  Promise.reject({ a: 1 })
}, 1000 * 1)

// logger.add({
//   info: '测试信息'
// })

window.logger = logger
console.log(logger)

// setInterval(function () {
//   logger.add({
//     info: '测试信息'
//   })
// }, 500)

// setTimeout(function () {
//   logger.send()
// }, 1000 * 1);
