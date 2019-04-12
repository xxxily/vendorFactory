/*!
 * @name         localStorage.js
 * @description  localStorage api 的封装
 * @version      0.0.1
 * @author       Blaze
 * @date         2019/3/19 23:13
 * @github       https://github.com/xxxily
 */

function localStorage () {
  return window.localStorage
}

function read (key) {
  return localStorage().getItem(key)
}

function write (key, data, onError) {
  try {
    localStorage().setItem(key, data)
  } catch (oException) {
    if (onError instanceof Function) {
      onError(oException)
      return true
    } else if (oException.name === 'QuotaExceededError') {
      /* 超限清空所有数据，可能导致相关数据丢失 */
      console.error('localStorage QuotaExceededError')
      clearAll()
      localStorage().setItem(key, data)
    }
  }
}

function each (fn) {
  for (var i = localStorage().length - 1; i >= 0; i--) {
    var key = localStorage().key(i)
    fn(read(key), key)
  }
}

function remove (key) {
  return localStorage().removeItem(key)
}

function clearAll () {
  return localStorage().clear()
}

export default {
  name: 'localStorage',
  read,
  write,
  each,
  remove,
  clearAll
}
