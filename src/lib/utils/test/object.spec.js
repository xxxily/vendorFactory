import { clone, forIn, getObjKeys, merge } from '../object'

describe('object 模块测试集', function () {
  let objA = {
    a: 1,
    b: { c: 3 },
    d: [1, 2, 4]
  }

  let objB = {
    i: null,
    j: undefined,
    k: function () {
      console.log(objA)
    },
    l: NaN,
    m: 1
  }

  let objC = {
    x: 'aa',
    y: false,
    z: {
      t: new Date().getTime()
    }
  }

  it('深拷贝测试 clone()', function () {
    expect(clone(objA)).toEqual(objA)
    expect(clone(objA)).not.toBe(objA)
    expect(clone(objB)).toEqual(objB)
    expect(clone(objB)).not.toBe(objB)
  })

  it('多对象深度合并测试 merge()', function () {
    let result = merge(objA, objB, objC)
    expect(objA.m).toEqual(1)
    expect(objA.l).toBeNaN()
    expect(result.z).toEqual(objA.z)
    expect(result).toEqual(objA)
    expect(result).not.toEqual(objB)
    expect(result).not.toEqual(objC)
  })
})
