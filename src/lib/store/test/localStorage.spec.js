import localStore from '../localStorage'

describe('localStorage 模块测试集', function () {
  // localStore.write('aaa', 123)
  it('获取具体类型 getType()', function () {
    expect(localStore.read('aaa')).toEqual('123')
  })
})
