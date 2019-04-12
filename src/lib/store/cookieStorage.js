/*!
 * @name         cookieStorage.js
 * @description  cookieStorage api 的封装
 * @version      0.0.1
 * @author       Blaze
 * @date         2019/3/19 23:12
 * @github       https://github.com/xxxily
 */

import { trim } from '../utils'

var doc = window.document

function read (key) {
  if (!key || !_has(key)) { return null }
  var regexpStr = '(?:^|.*;\\s*)' +
		escape(key).replace(/[\-\.\+\*]/g, '\\$&') +
		'\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*'
  return unescape(doc.cookie.replace(new RegExp(regexpStr), '$1'))
}

function each (callback) {
  var cookies = doc.cookie.split(/; ?/g)
  for (var i = cookies.length - 1; i >= 0; i--) {
    if (!trim(cookies[i])) {
      continue
    }
    var kvp = cookies[i].split('=')
    var key = unescape(kvp[0])
    var val = unescape(kvp[1])
    callback(val, key)
  }
}

function write (key, data) {
  if (!key) { return }
  doc.cookie = escape(key) + '=' + escape(data) + '; expires=Tue, 19 Jan 2058 03:14:07 GMT; path=/'
}

function remove (key) {
  if (!key || !_has(key)) {
    return
  }
  doc.cookie = escape(key) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

function clearAll () {
  each(function (_, key) {
    remove(key)
  })
}

function _has (key) {
  return (new RegExp('(?:^|;\\s*)' + escape(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(doc.cookie)
}

export default {
  name: 'cookieStorage',
  read,
  write,
  each,
  remove,
  clearAll
}
