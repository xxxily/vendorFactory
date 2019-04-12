# QwLogger
前端日志收集管理库

## 简介
QwLogger 是一款前端日志收集管理库，主要解决前端日志的离线存储和数据上报相关的问题，目标是做到可支撑各种日志收集、数据统计类需求，同时保持简单易用，使用QwLogger模块进行初始化配置后，上层只需关注如何收集所需数据即可，其它问题统一交给QwLogger模块解决。 
目前 QwLogger 数据的离线存储功能依托 tinydb 模块进行集中管理，并且配备完善的上报逻辑和内置部分常用的数据收集逻辑，统一数据格式，并对数据进行按类型标识。  
另外QwLogger也尽可能支持外部扩展功能，以应对更加复杂多变的产品需求。

## 使用示例
```javascript
import QwLogger from './qwLogger'
let logger = new QwLogger({
  appId: 'qw_logger',
  url: '/qwlooger/reporter'
})

logger.add({
  info:'example log info'
})
```

最简单的使用方式是配置好appId和数据上报的接口地址，剩下的你要收集什么数据就调用add方法吧日志信息丢给logger即可。

## 配置选项 new QwLogger(config)

```javascript
let config = {
  /* 应用被分配到的key，目前可选，key用于对应用户 */
  appkey: '',
  /* 应用被分配到的id，可以是自定义的任何字符串，appId可以用来区分统计每一条数据来自于哪个应用 */
  appId: 'test_app_id',
  /* 上报接口地址，这个是必配选项，否则无法正常上报数据 */
  url: '',
  /* 上报前的回调 */
  beforeSend: function () {},
  /* 上报后的回调，该方法可以对返回数据进行自定义校验，如果返回false表示验证失败 */
  afterSend: function () {},
  /* 上报成功的回调 */
  onsucceed: function () {},
  /* 上报失败的回调 */
  onerror: function () {},
  /* 重新写发送逻辑，实现自定义上报逻辑 */
  sender: null,
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
  /* 离线日志功能，所有选项跟TinyDB选项一致，下面列举的是默认配置 */
  offline: {
    /* 是否启用离线日志功能 */
    enable: true,
    name: 'qw_logger',
    /* 存储上限，不建议设置太大，太大影响应用性能，单位Kb */
    limit: 1024 * 2,
    /* 离线日志超时时间，默认五天 */
    expires: (1000 * 60 * 60 * 24) * 5,
    /* 写保护，单位时间内最多能写多少条数据进数据库里 */
    writeProtection: 10
  }
}
```

## QwLogger API
* [add(data)](#adddata)
* [sum(key, value)](#sumkey-value)
* [setting(obj)](#settingobj)
* [create(config)](#createconfig)
* [getDeviceId()](#getdeviceid)
* [parseLog(data)](#parselogdata)
* [getLog(num)](#getlognum)
* [getLogByAppId(appId, copy)](#getlogbyappidappid-copy)
* [clear()](#clear)
* [getLoggerInfo()](#getloggerinfo)
* [setLoggerInfo(data)](#setloggerinfodata)
* [send(data, count)](#senddata-count)
* [sendLogByAppId(appId)](#sendlogbyappidappid)
* [sendDebugLog()](#senddebuglog)
* [sendAll()](#sendall)


### add(data)

#### 参数说明：
* @param data {object|string} -必选 要增加的日志数据  

增加一条日志记录，可以直接传入你要记录的日志文本内容，也可以是一个对象形式的日志信息  
调用该方法后，数据会进行格式化成一个对象，并且会增加一些必要的字段对该日志进行辅助说明，补充的字段如下：
  
```javascript
let defField = {
  /* 如果传入的data不是对象，则将data保存在msg字段下，如果传入的是对象，则下面的所有默认字段都可以通过重定义进行覆盖 */
  msg: data.toString(),
  /* appId字段用于标识该日志来自哪个应用 */
  appId: this.config.appId,
  /* 日志类型字段用于区分该条记录属于什么类型的日志，具体type值可以自定义，1是默认值，表示为普通日志信息 */
  type: 1,
  /* 产生日志信息的页面 */
  pageUrl: window.location.href,
  /* 访问该页面的来源地址 */
  referrer: window.document.referrer,
  /* 设备id，一个随机生成的id号，用于表示该id下面的日志来自某个相同的客户端 */
  deviceId: this.getDeviceId()
}
```

使用示例：  
```javascript
logger.add('this is log info')
// 最终存储的信息结构如下：
// > { msg: "this is log info", appId: "xxx", type: 1, pageUrl: "http://xxx", referrer:"", deviceId: "xxx" }

logger.add({
  msg: 'something error',
  type: 2,
})
// 最终存储的信息结构如下：
// > { msg: "something error", appId: "xxx", type: 2, pageUrl: "http://xxx", referrer:"", deviceId: "xxx" }
```

### sum(key, value)
#### 参数说明：
* @param key {string} -必选 要统计的事件名称
* @param value {number} -可选 要累加的数量，默认 1

增加一条求和类型的统计日志记录  
该方法可用于统计访问次数，点击次数之类的日志信息  
跟add方法一样，该方法也会补充一些辅助说明字段：

```javascript
let defField = {
  /* appId字段用于标识该日志来自哪个应用 */
  appId: this.config.appId,
  /* 使用1000表示为求和类型的日志数据 */
  type: 1000,
  /* 设备id，一个随机生成的id号，用于表示该id下面的日志来自某个相同的客户端 */
  deviceId: this.getDeviceId(),
  /* 对应的事件名称 */
  sumId: key,
  /* 当前累加到的数值 */
  count: oldCount+ value
}
```

使用示例：  
```javascript
logger.sum('FORM_SUBMIT_BTN')
// 最终存储的信息结构如下：
// > { appId: "xxx", type: 1000, deviceId: "xxx", sumId: "FORM_SUBMIT_BTN", count:1 }
```

### setting(obj)
#### 参数说明：
* @param obj {object} -必选 要指定的[配置选项](#配置选项-new-qwloggerconfig)

修改或设置相关配置项 可设置的选项请参考上面的 config 对象，正常情况下实例化的时候传入配置项即可，如果后续你需要对配置进行动态修改即可使用该方法  
```javascript
logger.setting({
  reportCount: 50,
  offline: {
    limit: 1024 * 1,
    writeProtection: 5
  }
})
```

### create(config)
#### 参数说明：
* @param obj {config} -必选 要指定的[配置选项](#配置选项-new-qwloggerconfig)

创建一个新的日志记录实例，可用于同一个应用其它数据类型的单独管理，一般不建议同一个应用使用多个 QwLogger实例，除非你非常清楚自己要做什么。  
注意：创建新实例要定义好offline.name 属性，如果这个跟默认或者跟之前定义的name值一致，则表示是新开一个实例，同时操作一个原有的数据库，两个实例相互操作，极有可能导致数据丢失  
```javascript
let newLogger = QwLogger.create({
  appId: 'qw_logger',
  url: '/qwlooger/reporter',
  offline: {
    name: 'qw_logger_02'
  }
})
```

### getDeviceId()

获取当前设备的下的ID号，如果不存在则自动生成一个再返回  
前端并不能获取一个比较确定的设备id，只能通过一些指纹信息生成设备的id  
由于通过指纹信息生成设备id比较耗性能，也比较耗时，所以这里改成了生成随机数作为设备id，生成后存储在localStorage下，这样就可以确保每次获取到的设备id都是一直的，从而确保是同一个设备下的用户  
获取到的设备id为一个13位的时间戳和7位数的随机数，一共20位的数字   
  
```javascript
logger.getDeviceId()
// > 15550344977629860047 
```

### parseLog(data)
#### 参数说明：
* @param data {object} -必选 从TinyDB的reads或getLastData方法拿到的数据

将从TinyDB的reads或getLastData方法拿到的数据进行一定的格式转换，去除TinyDB存储时的外层辅助字段，并且加载日志的time字段（即日志入库存储时的时间戳）
     
```javascript
logger.parseLog(logger.db.getLastData(num)) 
```

### getLog(num)
#### 参数说明：
* @param num {number} -可选，获取多少条最近的日志信息 默认为 3

获取最近记录的日志信息，用于调试分析，该方法会自动调用parseLog方法进行数据格式转换后再输出  
注意，如果某1ms内存储了多条数据，则获取到的数据将大于num的指定值，具体原因参考TinyDB的存储逻辑说明    
     
```javascript
logger.getLog(1) 
```

### getLogByAppId(appId, copy)
#### 参数说明：
* @param appId {string} -可选 应用id
* @param copy {boolean} -可选 默认false，对获取到的数据进行深拷贝，防止数据库数据被污染

获取对应appid下的日志数据，默认为当前appid下的数据  
注意：该方法只能获取同一个离线存储库下（即不同的appId配置，但offline.name配置一样的多个实例）数据

```javascript
logger.getLogByAppId(null, true) 
```

### clear()

清除客户端上当前对应应用id下的所有日志信息  
该方法会先调用上面的getLogByAppId，然后再进行数据移除，从而避免误移除了其它应用记录的数据

```javascript
logger.clear() 
```

### getLoggerInfo()

获取logger自身的相关信息，例如logger实例最初的初始化时间，最近一次回传数据的时间等

```javascript
logger.getLoggerInfo()
// >  {d: {initTime: 1555012752648, lastSendTime: 1555035754624} t: 1555035754624}} 
```

### setLoggerInfo(data)

设置logger自身的相关信息，例如logger实例最初的初始化时间，最近一次回传数据的时间等  
底层记录信息使用的是另外一个 TinyDB 实例进行存储的，并且设定了最多只能存储10Kb的数据信息  
不清楚如何使用的，请不要随意设置logger自身的相关信息，该方法主要提供给logger实例自身使用   

```javascript
/* 调用send方法成后记录下最后一次回传日志的时间，如果是自定义了sender的配置，建议数据成功回传后也调用一次该方法，以确保底层记录信息不被丢失 */
logger.setLoggerInfo({
  lastSendTime: new Date().getTime()
}) 
```

### send(data, count)

#### 参数说明：
* @param data {array} -可选，要发送给服务器的数据，默认会自动读取最近存储的100条数据进行回传，需要自定义回传数据时，必须保证数据结构和getLog()获取到的数据结构一致
* @param count {number} -可选，不传自定义数据时，定义上报的条数，默认100条

发送日志给服务器，默认情况下logger实例会根据初始化配置自动决定什么时候对数据进行回传，如果某些特殊情况下，你想马上将数据回传给服务器，也可以通过手动调用该方法时间回传

```javascript
// 马上回传最近的50条数据
logger.send(null,50) 
```

### sendLogByAppId(appId)

#### 参数说明：
* @param data {array} -可选，应用的id

send方法不区分是由哪个应用产生的数据，只负责数据回传  
sendLogByAppId则会获取对应appid下的日志数据，默认为当前appid下的数据
备注：appid下对应的数据逻辑跟getLogByAppId获取到的数据逻辑是一致的

```javascript
// 马上回传当前应用产生的最近100条日志信息
logger.sendLogByAppId() 
```

### sendDebugLog()

回传一部分用于debug的日志信息  
一般无需自己调用该方法，只需设置reportTrigger，然后让用户访问带有reportTrigger字符串信息的链接即可自动调用sendDebugLog  
sendDebugLog 跟其它的回传方法的区别是：该方法会增加一条跟用户设备信息相关的日志（目前就是UA信息，后续会更加情况增加更多信息），这样调试的时候就可以马上知道当前用户的基础信息，而没必要叫用户给你提供基本信息。  
另外，如果在链接里增加一个debug_id参数，还会给每一条数据增加一个debugId字段，这样就可以快速从海量的日志库里筛选出目标数据  

```javascript
logger.sendDebugLog() 
```

### sendAll()

一次性回传当前离线存储下的所有日志信息

```javascript
logger.sendAll() 
```
