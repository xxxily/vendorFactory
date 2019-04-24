/*!
 * @name         qwLogger.js
 * @description  针对企微业务需求进行专属定制的日志记录器
 * @version      0.0.1
 * @author       Blaze
 * @date         27/03/2019 10:38
 * @github       https://github.com/xxxily
 */

import { merge } from '../utils'
import parseURL from '../utils/url'
import Logger from './logger'

class QwLogger extends Logger {
  constructor (setting) {
    /* QwLogger 专有的配置项 */
    let qwConfig = {
      /* 上报触发器，用于给连接加特殊字符串触发上报，进行异常排查 */
      reportTrigger: 'debug_trigger=',
      /* 是否自动上报数据 */
      autoReport: true,
      /* 延迟自动上报数据的调用时间(ms)，减少对其它逻辑的影响 */
      reportDelay: 3500,
      /* 上报时间间隔，默认三天上报一次 */
      reportInterval: 1000 * 60 * 60 * 24 * 3,
      /* 上报阈值 */
      reportCount: 100,
      /* 一次性上报全部数据的阈值 */
      reportAllCount: 1000,
      offline: {
        /* 专用的离线数据库名称 */
        name: 'qw_logger'
      }
    }
    let config = merge(setting, qwConfig)
    super(config)

    let t = this
    t.autoReport()

    if (t.hasReportTrigger()) {
      t.reportDebugLog()
    }

    /* 将即将被过期的数据回传 */
    t.setting({
      offline: {
        onExpires: function (data) {
          t.send(t.parseLog(data))
        }
      }
    })
  }

  /* 开启自动上报选项，并且达到上报阈值则进行数据自动上报操作 */
  autoReport () {
    let t = this
    let conf = t.config
    if (conf.autoReport) {
      setTimeout(function () {
        let loggerInfo = t.getLoggerInfo()
        let lastSendTime = loggerInfo.lastSendTime || loggerInfo.initTime
        let isOutOfInterval = lastSendTime + t.config.reportInterval < new Date().getTime()
        let isOutOfCount = t.db.getLen() >= conf.reportCount
        let isOutOfMaxCount = t.db.getLen() >= conf.reportAllCount
        if (isOutOfInterval || isOutOfCount) {
          if (isOutOfMaxCount) {
            t.sendAll()
          } else {
            t.send(null, conf.reportCount)
          }
        }
      }, conf.reportDelay || 0)
    }
  }

  /* 检查是否存在上报触发器 */
  hasReportTrigger () {
    let t = this
    let curUrl = window.location.href
    return curUrl.indexOf(t.config.reportTrigger) > 0
  }

  reportDebugLog () {
    let t = this

    /* 增加一条需要收集的信息日志，待完善 */
    t.add({
      userAgent: window.navigator.userAgent
    })

    let logData = t.getLog(t.config.reportCount || 100)
    let urlInfo = parseURL(window.location.href)
    let debugId = urlInfo.params['debug_id']
    if (debugId) {
      /* 给每条数据标注一个debugId */
      logData.data.forEach(function (data) {
        data['debugId'] = debugId
      })
    }
    t.send(logData)
  }

  /* reportDebugLog的别名 */
  sendDebugLog () {
    return this.reportDebugLog()
  }
}

export default QwLogger
