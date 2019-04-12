/*!
 * @name         cookie.js
 * @description  简单的cookie、local
 * @version      0.0.1
 * @author       Blaze
 * @date         19/03/2019 09:45
 * @github       https://github.com/xxxily
 */

let log = function (msg) {
  if (window.console) {
    console.log(msg)
  } else {
    window.alert(msg)
  }
}

export default {
  write: function (name, value, exp, path, domain, secure) {
    if (!(/^\w*$/).test(name)) {
      log('cookie格式不正确')
    }

    if (/; /.test(value)) {
      log('cookie格式不正确')
    }

    var cookieValue = name + '=' + value

    if (exp) {
      var dt = new Date()
      dt.setTime(dt.getTime() + (exp * 1000))
      cookieValue += '; expires=' + dt.toGMTString()
    }

    if (path) {
      cookieValue += '; path=' + path
    } else {
      cookieValue += '; path=/'
    }

    if (domain) {
      cookieValue += '; domain=' + domain
    } else {
      cookieValue += '; domain=' + window.location.hostname
    }

    if (secure) {
      cookieValue += '; secure'
    }
    /* log(cookieValue); */

    document.cookie = cookieValue
  },

  read: function (name) {
    var cookieValue = ''
    var arrStr = document.cookie.split('; ')

    for (var i = 0; i < arrStr.length; i++) {
      var temp = arrStr[i].match(/^(\w+)=(.+)$/)
      if (temp && temp.length > 1 && temp[1] === name.toString()) {
        cookieValue = temp[2]
        break
      }
    }
    return cookieValue
  },

  /* 删除cookie */
  remove: function (name, path, domain) {
    var cookie = name + '='

    if (path) {
      cookie += '; path=' + path
    } else {
      cookie += '; path=/'
    }

    if (domain) {
      cookie += ';domain=' + domain
    } else {
      cookie += ';domain=' + window.location.host
    }

    cookie += '; expires=Fri, 02-Jan-1970 00:00:00 GMT'
    document.cookie = cookie
  }
}
