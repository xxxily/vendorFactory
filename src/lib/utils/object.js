/*!
 * @name         object.js
 * @description  对象操作的相关方法
 * @version      0.0.1
 * @author       Blaze
 * @date         21/03/2019 23:10
 * @github       https://github.com/xxxily
 */

/**
 * 对一个对象进行深度拷贝
 * @source -必选（Object|Array）需拷贝的对象或数组
 */
function clone (source) {
  var result = {}

  if (typeof source !== 'object') {
    return source
  }
  if (Object.prototype.toString.call(source) === '[object Array]') {
    result = []
  }
  if (Object.prototype.toString.call(source) === '[object Null]') {
    result = null
  }
  for (var key in source) {
    result[key] = (typeof source[key] === 'object') ? clone(source[key]) : source[key]
  }
  return result
}

/* 遍历对象，但不包含其原型链上的属性 */
function forIn (obj, fn) {
  fn = fn || function () {}
  for (var key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      fn(key, obj[key])
    }
  }
}

/* 获取对象的key值，ES6+应用可使用Object.keys()代替 */
function getObjKeys (obj) {
  let keys = []
  forIn(obj, function (key) {
    keys.push(key)
  })
  return keys
}

/**
 * 深度合并两个可枚举的对象
 * @param objA {object} -必选 对象A
 * @param objB {object} -必选 对象B
 * @param concatArr {boolean} -可选 合并数组，默认遇到数组的时候，直接以另外一个数组替换当前数组，将此设置true则，遇到数组的时候一律合并，而不是直接替换
 * @returns {*|void}
 */
function mergeObj (objA, objB, concatArr) {
  function isObj (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  }
  function isArr (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  }
  if (!isObj(objA) || !isObj(objB)) return objA
  function deepMerge (objA, objB) {
    forIn(objB, function (key) {
      let subItemA = objA[key]
      let subItemB = objB[key]
      if (typeof subItemA === 'undefined') {
        objA[key] = subItemB
      } else {
        if (isObj(subItemA) && isObj(subItemB)) {
          /* 进行深层合并 */
          objA[key] = deepMerge(subItemA, subItemB)
        } else {
          if (concatArr && isArr(subItemA) && isArr(subItemB)) {
            objA[key] = subItemA.concat(subItemB)
          } else {
            objA[key] = subItemB
          }
        }
      }
    })
    return objA
  }
  return deepMerge(objA, objB)
}

/**
 * 多对象深度合并，合并规则基于mergeObj，但不存在concatArr选项
 * @returns {*}
 */
function merge () {
  let result = arguments[0]
  for (var i = 0; i < arguments.length; i++) {
    if (i) {
      result = mergeObj(result, arguments[i])
    }
  }
  return result
}

export { clone, forIn, getObjKeys, mergeObj, merge }
