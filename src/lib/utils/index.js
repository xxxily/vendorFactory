/*!
 * @name         utils.js
 * @description  使用到核心方法集合
 * @version      0.0.1
 * @author       Blaze
 * @date         19/03/2019 09:59
 * @github       https://github.com/xxxily
 */

import { getType, isObj } from './typeof'
import { trim, sizeof } from './string'
import { clone, forIn, getObjKeys, mergeObj, merge } from './object'
import { random, quickSort } from './number'
import { locker } from './locker'

export {
  getType,
  isObj,
  trim,
  sizeof,
  clone,
  forIn,
  getObjKeys,
  mergeObj,
  merge,
  random,
  quickSort,
  locker
}
