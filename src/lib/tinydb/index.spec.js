import { isObj } from '../utils/index'
import TinyDB from './index'

/* 创建一个用于测试的数据块，单位Kb */
function createStrChunk (size) {
  var result = []

  /* 创建一个1Kb的数据，作为基准数据 */
  var baseChunk = []
  for (var i = 0; i < 1024; i++) {
    baseChunk.push('0')
  }
  baseChunk = baseChunk.join('')

  size = size || 1
  for (var j = 0; j < size; j++) {
    result.push(baseChunk)
  }
  return result.join('')
}

function parseTinyDBData (data) {
  data = data || []
  let result = []
  let timeIds = []
  for (let i = 0; i < data.length; i++) {
    let item = data[i]
    let dbData = item.d
    timeIds.push(item.t)

    if (item.m) {
      /* 将数据组解包成单条数据后push到result */
      for (let j = 0; j < dbData.length; j++) {
        let subDBData = dbData[j]
        if (isObj(subDBData) && !subDBData.time) {
          subDBData.time = item.t
        }
        result.push(subDBData)
      }
    } else {
      /* 补充日志记录的时间字段 */
      if (isObj(dbData) && !dbData.time) {
        dbData.time = item.t
      }
      result.push(dbData)
    }
  }
  return {
    data: result,
    timeIds: timeIds
  }
}

// var testStrChunk = createStrChunk(1024 * 5)
// console.log('testStrChunk size:', testStrChunk.length / 1024)

describe('TinyDB 模块测试集', function () {
  let tinydb = null
  beforeEach(function (done) {
    /* 清空旧的存储数据，防止影响测试 */
    tinydb = new TinyDB({ name: 'qw_logger' })
    tinydb.delTinyDB()

    tinydb = new TinyDB({
      name: 'qw_logger',
      limit: 1024 * 5,
      onLimit: function () {
        console.log('isLimit')
      },
      writeProtection: 30
    })
    done()
  })

  afterEach(function () {
    // tinydb.delTinyDB()
  })

  // 进行写保护测试的时候注意调整writeProtection的值，writeProtection太大将无法起到保护作用
  xit('写入保护测试（千万次写入测试）', function () {
    for (var i = 0; i < 1024 * 1024 * 10; i++) {
      tinydb.write({
        a: i
      })
    }

    expect(tinydb.getLastData(10).length <= 10).toBe(true)
    console.log('没造成程序假死，则说明写保护机制有效')
  })

  it('测试从tinydb获取到的数据进行重新解析后的结果', function () {
    for (var i = 0; i < 100; i++) {
      tinydb.write({
        a: i
      })
    }

    let data = tinydb.getLastData(3)
    let parseData = parseTinyDBData(data)
    console.log(JSON.stringify(parseData.data))

    expect(parseData.data.length >= 3 && parseData.timeIds.length === 3).toBe(true)
  })

  xit('超限写入测试', function () {
    // for (var i = 0; i < 10; i++) {
    //   tinydb.write(createStrChunk(510))
    // }
    tinydb.write(createStrChunk(1024 * 4.9))
    let size = tinydb.getSize()
    console.log(size)
  })
})
