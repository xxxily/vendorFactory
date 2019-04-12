import { locker } from '../locker'

describe('locker 模块测试集', function () {
  let tapLockTime = 0
  beforeEach(function (done) {
    for (var i = 0; i < 100; i++) {
      if (locker('lockTest', 50, 1, 100)) {
        tapLockTime += 1
        // console.log('lockTest is lock', i, new Date().getTime())
      }
    }
    console.log('触发锁的次数：', tapLockTime)
    done()
  })

  it('1ms内被标了锁的次数', function () {
    expect(tapLockTime >= 49).toBe(true)
  })
})
