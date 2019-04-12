import { isObj, getType } from '../'

describe('utils 模块测试集', function () {
  it('获取具体类型 getType()', function () {
    expect(getType({})).toBe('object')
    expect(getType([])).toBe('array')
    expect(getType(1)).toBe('number')
    expect(getType('')).toBe('string')
    expect(getType(/test/)).toBe('regexp')
    expect(getType(undefined)).toBe('undefined')
    expect(getType(null)).toBe('null')
    expect(getType(NaN)).toBe('number')
  })

  it('判断是否为对象 isObj()', function () {
    expect(isObj({})).toBe(true)
    expect(isObj([])).toBe(false)
    expect(isObj(null)).toBe(false)
    expect(isObj(undefined)).toBe(false)
    expect(isObj(1)).toBe(false)
    expect(isObj('')).toBe(false)
    expect(isObj('{}')).toBe(false)
    expect(isObj(/obj/)).toBe(false)
    expect(isObj(function () {})).toBe(false)
  })
})
