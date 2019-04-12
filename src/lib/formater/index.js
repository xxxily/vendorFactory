/*!
 * @name         index.js
 * @description
 * @version      0.0.1
 * @author       Blaze
 * @date         02/04/2019 16:56
 * @github       https://github.com/xxxily
 */

const LOG_TYPE = {
  UNKNOWN: -1,
  MSG_INFO: 1,
  MSG_CONSOLE: 2,
  ERROR_RUNTIME: 11,
  ERROR_SCRIPT: 12,
  ERROR_LINK: 13,
  ERROR_STYLE: 13,
  ERROR_IMG: 14,
  ERROR_AUDIO: 15,
  ERROR_VIDEO: 16,
  ERROR_TRY_CATCH: 17,
  ERROR_CONSOLE: 18,
  ERROR_AJAX: 19,
  ERROR_INTERFACE: 20,
  ERROR_PROMISE: 21,
  ERROR_VUE: 22,
  ERROR_REACT: 23
}

/* 数据格式器 */
let formater = {
  /**
   * 运行时的错误数据格式转换器，主要用于window.onerror
   */
  runtimeError: function (message, source, lineno, colno, error) {
    let result = {
      type: LOG_TYPE.ERROR_RUNTIME,
      msg: message,
      url: source,
      line: lineno,
      colno: colno
    }
    return result
  },
  /**
   * window全局错误数据格式转换器，用于window.addEventListener('error',fn,true),也适用于 window.onerror
   * @param event
   */
  windowError: function (event) {
    let t = formater || this
    let target = event.target
    if (target && target !== window && target.nodeName) {
      let logType = LOG_TYPE[target.nodeName.toUpperCase()] || LOG_TYPE.UNKNOWN
      return {
        type: logType,
        msg: 'failed to load resource',
        url: target.src || target.href
      }
    } else {
      if (arguments.length > 3) {
        return t.runtimeError.apply(null, arguments)
      } else {
        t.runtimeError(target.message, target.filename, target.lineno, target.colno, target.error)
      }
    }
  },
  /**
   * tryCatch错误数据格式转换器，用于 try{}catch(ex){}
   * @param ex
   */
  tryCatchError: function (ex) {
    // 参考：http://javascript.ruanyifeng.com/grammar/error.html
    return {
      type: LOG_TYPE.ERROR_TRY_CATCH,
      msg: ex.message || 'exception caught',
      errorName: ex.name || 'unknown'
    }
  },
  /**
   * vue错误数据格式转换器，用于 Vue.config.errorHandler
   */
  vueError: function (err, vm, info) {
    return {
      type: LOG_TYPE.ERROR_VUE,
      msg: (info && info.toString()) || '',
      error: (err && err.toString()) || ''
    }
  },
  /**
   * promise错误数据格式转换器，用于window.addEventListener('unhandledrejection',fn)
   * @param event
   */
  promiseError: function (event) {
    return {
      type: LOG_TYPE.ERROR_PROMISE,
      msg: (event.reason && event.reason.toString()) || '',
      errorName: event.type || 'unknown'
    }
  },
  /**
   * axios拦截器捕获到的错误数据格式转换器，用于axios.interceptors.response
   * @param event
   */
  axiosError: function (res) {
    //
  }
}

export default formater
