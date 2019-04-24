/*!
 * @name         index.js
 * @description  qwLogger 入口文件
 * @version      0.0.1
 * @author       Blaze
 * @date         15/03/2019 15:31
 * @github       https://github.com/xxxily
 */

import { version } from '../../../package.json'
import TinyDB from '../tinydb/index'
import { isObj, random, merge } from '../utils'
import ajax from '../ajax/ajax'

class Logger {
  constructor (setting) {
    let t = this
    t.config = {
      /* 应用被分配到的key，目前可选，key用于对应用户 */
      appkey: '',
      /* 应用被分配到的id，id用于对应key，每个key会限制只能使用多少个id */
      appId: 'test_app_id',
      /* 上报接口地址 */
      url: '',
      /* 上报前的回调 */
      beforeSend: function () {},
      /* 上报后的回调，该方法可以对返回数据进行自定义校验，如果返回false表示验证失败 */
      afterSend: function () {},
      /* 上报成功的回调 */
      onsucceed: function () {},
      /* 上报失败的回调 */
      onerror: function () {},
      /* 重新写发送逻辑，实现自定义上报控制 */
      sender: null,
      /* 离线日志功能，所有选项跟TinyDB选项一致 */
      offline: {
        /* 是否启用离线日志功能 */
        enable: true,
        name: 'logger',
        /* 存储上限，不建议设置太大，太大影响应用性能，单位Kb */
        limit: 1024 * 2,
        /* 离线日志超时时间，默认五天 */
        expires: (1000 * 60 * 60 * 24) * 5,
        /* 写保护，单位时间内最多能写多少条数据进数据库里 */
        writeProtection: 10
      }
    }
    t.version = version
    t.setting(setting)
    t.db = new TinyDB(t.config.offline)
    t.dbInfoInit()

    /* 重写发送逻辑 */
    if (t.config.sender instanceof Function) {
      t.send = t.config.sender
    }
  }

  /* 创建一个新的日志记录实例 */
  create (setting) {
    return new Logger(setting)
  }

  /* logger 辅助信息库，用于记录一些额外信息 */
  dbInfoInit () {
    let t = this
    t._dbInfo = new TinyDB({
      name: 'logger_assist',
      writeProtection: 10,
      limit: 10
    })
    t._dbInfoKey = t.config.appId + '_logger_info'

    if (!t.getLoggerInfo()) {
      t.setLoggerInfo({
        initTime: new Date().getTime()
      })
    }
  }

  /**
   * 修改或设置相关配置项 可设置的选项请参考上面的 config 对象
   * @param obj
   */
  setting (obj) {
    merge(this.config, obj)
  }

  /**
   * 增加一条日志记录
   * @param data {object|string} -必选 要增加的日志数据
   */
  add (data) {
    if (typeof data === 'undefined') return false
    let t = this

    if (!isObj(data)) {
      data = {
        msg: data.toString()
      }
    }

    /* 确保每条数据都有该有的基本字段，以便后续进行区分统计 */
    let defField = {
      appId: t.config.appId,
      type: 1,
      pageUrl: window.location.href,
      referrer: window.document.referrer,
      deviceId: t.getDeviceId()
    }
    for (let key in defField) {
      if (typeof data[key] === 'undefined' && defField.hasOwnProperty(key)) {
        data[key] = defField[key]
      }
    }

    return t.db.write(data)
  }

  /**
   * 增加一条求和统计日志
   * @param key {string} -必选 要统计的事件名称
   * @param value {number} -可选 要累加的数量，默认 1
   */
  sum (key, value) {
    let t = this
    let field = {
      appId: t.config.appId,
      type: 1000,
      deviceId: t.getDeviceId(),
      sumId: key,
      count: value || 1
    }

    let sumKey = t.config.appId + '_sum'
    let sumData = t.db.read(sumKey)
    if (sumData) {
      sumData = sumData.d
      field.count += sumData[key].count || 0
    } else {
      sumData = {}
    }
    sumData[key] = field
    t.db.write(sumData, sumKey)
  }

  getDeviceId () {
    let id = window.localStorage.getItem('__DEVICE_UUID__')
    if (!id) {
      id = new Date().getTime() + '' + random(1000000, 9999999)
      window.localStorage.setItem('__DEVICE_UUID__', id)
    }
    return id
  }

  /* 将从tinydb拿到的数据，解释成要发送到后台的数据 */
  parseLog (data) {
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

  /**
   * 获取最近记录的日志信息，用于调试分析
   * @param num {number} -可选，获取多少条最近的日志信息 默认为 3
   * 注意，如果某1ms内存储了多条数据，则获取到的数据将大于3条
   */
  getLog (num) {
    let t = this
    return t.parseLog(t.db.getLastData(num))
  }

  /**
   * 获取对应appid下的日志数据，默认为当前appid下的数据
   * @param appId {string} -可选
   * @param copy {boolean} -可选 默认false，对获取到的数据进行深拷贝，防止数据库数据被污染
   */
  getLogByAppId (appId, copy) {
    let t = this
    let result = {
      data: [],
      timeIds: []
    }
    appId = appId || t.config.appId
    t.db.each(function (data) {
      let logData = data.d
      if (data.m) {
        logData = data.d[0]
      }
      if (logData.appId === appId) {
        result.data.push(data)
        result.timeIds.push(data.t)
      }
    }, copy || false)
  }

  /* 清除客户端上当前对应应用id下的所有日志信息 */
  clear () {
    let t = this
    t.db.remove(t.getLogByAppId().timeIds)
  }

  /* 获取logger的相关信息 */
  getLoggerInfo () {
    let t = this
    let info = t._dbInfo.read(t._dbInfoKey) || { d: undefined }
    return info.d
  }

  /* 设置logger的相关信息 */
  setLoggerInfo (data) {
    return this._dbInfo.write(data, this._dbInfoKey)
  }

  /**
   * 发送日志给服务器
   * @param data {array} -可选，要发送给服务器的数据，默认会自动读取最近存储的100条数据进行回传，需要自定义回传数据时，必须保证数据结构和getLog()获取到的数据结构一致
   * @param count {number} -可选，不传自定义数据时，定义上报的条数，默认100条
   * @returns {boolean}
   */
  send (data, count) {
    let t = this
    let conf = t.config
    let logData = data || t.getLog(count || 100)

    if (!logData.data.length) {
      return false
    }

    conf.beforeSend && conf.beforeSend(logData)

    ajax({
      url: t.config.url,
      method: 'post',
      data: {
        data: logData.data
      },
      success: function (res, xhr) {
        if (conf.afterSend instanceof Function) {
          let result = conf.afterSend(res, xhr, logData)
          if (result === false) {
            conf.onerror && conf.onerror(res, xhr, logData)
            return false
          }
        }

        /* 记录下最后一次回传日志的时间 */
        t.setLoggerInfo({
          lastSendTime: new Date().getTime()
        })

        conf.onsucceed && conf.onsucceed(res, xhr, logData)

        /* 移除已上报数据 */
        t.db.remove(logData.timeIds)
      },
      error: function (res, xhr) {
        conf.afterSend && conf.afterSend(res, xhr, logData)
        conf.onerror && conf.onerror(res, xhr, logData)
      }
    })
  }

  /**
   * 获取对应appid下的日志数据，默认为当前appid下的数据
   * @param appId {string} -可选
   */
  sendLogByAppId (appId) {
    let t = this
    t.send(t.getLogByAppId().data)
  }

  /* 将当前所有的离线数据回传给服务器，包括其它应用id产生的数据 */
  sendAll () {
    let t = this
    t.send(t.parseLog(t.db.db.data))
  }
}

export default Logger
