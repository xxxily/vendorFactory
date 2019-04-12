import Logger from '../logger'

let logger = null

describe('logger 集成测试', function () {
  beforeEach(function (done) {
    logger = new Logger({
      appId: 'unit_test_logger'
    })

    done()
  })

  it('getLoggerInfo() 测试', function () {
    let curTime = new Date().getTime()
    logger.setLoggerInfo({
      lastSendTime: curTime
    })
    logger.setLoggerInfo({
      lastSendTime2: curTime + '' + curTime
    })

    let LoggerLastSendTime = logger.getLoggerInfo().lastSendTime
    console.log(logger.getLoggerInfo())

    expect(LoggerLastSendTime === curTime).toBe(true)
  })
})
