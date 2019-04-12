/*!
 * @name         locker.js
 * @description  上锁函数
 * @version      0.0.1
 * @author       Blaze
 * @date         24/03/2019 19:14
 * @github       https://github.com/xxxily
 */

let lockerMap = {}
/**
 * 调用锁
 * @param name {string} -必选 提供说名称，以区分要给哪个调用函数进行加锁限定
 * @param limit {number} -必选 上锁条件一： 达到多少次的调用次数就进行锁定
 * @param duration {number} -必选 上锁条件二：多少时间内达到limit值才上锁
 * @param delayed {number} -可选 自动解锁时间，默认 0
 */
function locker (name, limit, duration, delayed) {
  let needLock = false
  let curTime = new Date().getTime()

  function initLocker () {
    lockerMap[name] = {
      count: 1,
      expirationTime: curTime + duration,
      unlockTime: 0
    }
    // console.log('expirationTime', lockerMap[name].expirationTime)
  }

  if (lockerMap[name]) {
    let lock = lockerMap[name]
    let isLock = lock.unlockTime && curTime < lock.unlockTime
    if (isLock) {
      needLock = true
    } else {
      lock.count += 1
      let isLimit = lock.count > limit
      if (isLimit) {
        let outOfDuration = curTime > lock.expirationTime
        if (outOfDuration) {
          /* 超过上锁条件限定的持续时间，需进行重新计算 */
          initLocker()
        } else {
          /* 设定解锁时间标识 */
          lock.unlockTime = curTime + delayed || 0
          // console.log('unlockTime', lock.unlockTime)
        }
      }
    }
  } else {
    initLocker()
  }
  return needLock
}

export { locker }
