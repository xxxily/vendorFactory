/*!
 * @name         index.js
 * @description  基于localStorage的微型数据库
 * @version      0.0.1
 * @author       Blaze
 * @date         21/03/2019 14:50
 * @github       https://github.com/xxxily
 */

import store from '../store/localStorage'
import { getType, isObj, sizeof, clone, mergeObj, quickSort, locker } from '../utils/index'

class TinyDB {
  /**
   * 构造函数
   * @param conf {object} -必选 配置对象
   * @param conf.name {string} -要创建或读取的数据库名称
   * @param conf.enable {boolean} -是否使用离线存储功能，默认true，如果为false则表示使用TinyDB的所有功能，但不将数据离线存储起来
   * @param conf.limit {number} -可选 要申请的存储容量，单位Kb，超出容量则将旧数据进行清空，默认写满localStorage的存储容量为止
   * 为了防止其它开发人员无脑存储，造成应用性能下降，可以设定一个合理的值，降低对离线存储的依赖
   * @param conf.onLimit {function} -可选，触发上限值时的处理方法，默认会将旧数据删除，然后再写入
   * @param conf.recycle {boolean} -可选，插入数据触发上限值时是否自动回收空间，默认true
   * @param conf.writeProtection {number} -可选，写保护阈值，默认30，该值用于控制1ms内写入多条的数据次数
   * @param conf.expires {number} -可选，存储数据的自动过期时间，单位ms，默认永不过期
   * @param conf.onExpires {function} -可选，移除过期数据前的回调操作
   * @returns {boolean}
   */
  constructor (conf) {
    if (!isObj(conf) || !conf.name) {
      console.error('不提供数据库名称，无法为你创建或连接数据库')
      return false
    }
    let t = this
    t.conf = conf
    t.name = 'TINY_DB_' + conf.name
    t.enable = conf.enable !== false
    t.limit = conf.limit ? conf.limit * 1024 : 1024 * 1024 * 5
    t.recycle = conf.recycle !== false
    t.writeProtection = conf.writeProtection || 30
    t.expires = conf.expires || 0
    t.onExpires = conf.onExpires || null
    t.db = null
    t.open()
  }

  open () {
    let t = this
    let dbStr = t.enable ? store.read(t.name) : ''
    let isReady = false
    if (dbStr) {
      try {
        t.dbInit(dbStr)
        isReady = true
      } catch (e) {
        console.error('数据库里的数据结构不正确，需重置')
      }
    }

    if (!isReady) {
      t.dbInit()
    }

    if (t.expires) {
      t.removeExpiresData(new Date().getTime() - t.expires, true)
    }
  }

  dbInit (dbStr) {
    let t = this
    let dbDataList = dbStr ? JSON.parse(dbStr) : []
    t.db = {
      data: dbDataList,
      timeIndex: {},
      keyIndex: {}
    }

    /* dbData必须按以下数据结构示例进行存储 */
    // let dbData = {
    //   't': '写入或更新时的时间戳',
    //   'd': '对应的具体数据',
    //   'k': '可选标识，可以不存在',
    //   'm': '可选标识，multiterm，用于表示同1ms里创建了多条数据',
    //   'oldt': '可选标识，带key的数据更新key对应的内容时，oldt记录最初创建该数据的时间'
    // }

    /* 进行时间索引和key索引 */
    for (let i = 0; i < dbDataList.length; i++) {
      let dbData = dbDataList[i]
      let time = dbData.t
      let key = dbData.k
      t.db.timeIndex[time] = dbData
      if (key) {
        t.db.keyIndex[key] = dbData
      }
    }
    if (!dbStr) {
      t._write(t.db.data)
    }
  }

  /* 关闭tinydb以释放内存 */
  cloes () {
    let t = this
    if (!t.isReady()) {
      return true
    }
    t._write(t.db.data, true)
    t.db = null
  }

  isReady () {
    return isObj(this.db) && this.db.data
  }

  islimit () {
    let t = this
    let limitCount = t.getSize() - t.limit
    if (limitCount > 0) {
      t._limitCountCache_ = limitCount
    }
    return limitCount > 0
  }

  _onLimit () {
    let t = this
    if (t.conf.onLimit instanceof Function) {
      t.conf.onLimit()
    }

    if (t.recycle) {
      t.recycleSpace()
    }
  }

  /**
   * 为了减少JSON.stringify的次数，提升性能，getSize的时候对当前数据的字符串信息进行缓存
   */
  getSize () {
    let t = this
    t._dbStrCache_ = JSON.stringify(t.db.data)
    return t.isReady() ? sizeof(t._dbStrCache_) : 0
  }

  /* 获取当前存储了多少条数据，多项数据作为一项计算 */
  getLen () {
    return this.db.data.length
  }

  /* 获取当前存储了多少条数据，多项数据按具体存储了多少条计算 */
  getLens () {
    let lens = 0
    this.each(function (itme) {
      if (itme.m) {
        lens += itme.d.length
      } else {
        lens += 1
      }
    })
    return lens
  }

  /* 统一写入处理 */
  _write (data, sync) {
    let t = this
    if (!t.enable) return true

    if (data) {
      data = typeof data === 'string' ? data : JSON.stringify(data)
    }
    let dbStr = data || JSON.stringify(t.db.data)
    store.write(t.name, dbStr, t._onLimit)
  }

  /**
   * 写入操作包含了新增和更新两种操作，注意此处的key 是可选的，没传key的程序自动为其创建时间戳作为随机key
   * 因为：对于日志记录应用通常只关注把数据存起来，而没必要为每一条数据想一个key名称
   * 注意：同1ms内写入多条数据将合并在一个数组里，作为一组数据处理
   * @param data {any} -必选 写入的数据
   * @param key {string} -可选 写入的键值
   */
  write (data, key) {
    let t = this

    if (locker('writeProtection', t.writeProtection || 100, 80, 100)) {
      // console.log('持续写入次数过多，已触发写保护机制')
      // console.log('建议优化您的数据写入机制，或者检查您的逻辑是否触发了死循环')
      return false
    }

    if (!t.isReady() || typeof data === 'undefined') return false

    let writeTime = new Date().getTime()
    let isNewData = false
    let dbData = {
      d: data,
      t: writeTime
    }

    if (!key) {
      /* 无指定键值的数据，同1ms内写入多条数据，作为一组数据处理 */
      if (t.db.timeIndex[writeTime]) {
        let multData = t.db.timeIndex[writeTime]
        if (!multData.m) {
          multData.d = [multData.d]
          multData.m = true
        }

        multData.d.push(data)
      } else {
        isNewData = true
      }
    } else {
      dbData.k = key
      if (t.hasKey(key)) {
        let oldDBData = t.db.keyIndex[key]
        if (!oldDBData.oldt) {
          oldDBData.oldt = oldDBData.t
        }
        mergeObj(oldDBData, dbData)
      } else {
        isNewData = true
        t.db.keyIndex[key] = dbData
      }
    }

    if (isNewData) {
      t.db.data.push(dbData)
      t.db.timeIndex[writeTime] = dbData
    }

    if (t.islimit()) {
      t._onLimit()
    } else {
      /* 检查是否超限时会产生 t._dbStrCache_ ，检查通过即可直接进行存储，不再JSON.stringify */
      t._write(t._dbStrCache_ || t.db.data)
      t._dbStrCache_ = null
    }
  }

  /**
   * 读取数据，支持一次读取多条数据，不指定键名的情况下会返回整个数据库的副本数据
   * 为保证返回数据结构的统一性，统一返回数组结果
   * @param keys {string|number|array} -可选 读取指定键名或时间戳下的数据
   * @returns {array}
   */
  reads (keys) {
    let t = this
    if (!t.isReady()) return []

    if (keys) {
      let result = []
      let keyList = getType(keys) === 'array' ? keys : [keys]
      for (let i = 0; i < keyList.length; i++) {
        let key = keyList[i]
        result.push(t.db.keyIndex[key] || t.db.timeIndex[key])
      }

      return clone(result)
    } else {
      return clone(t.db.data)
    }
  }

  /* 读取单条数据 */
  read (key) {
    return this.reads(key)[0]
  }

  /* 判断是否包含某个键值 */
  hasKey (key) {
    return !!this.db.keyIndex[key]
  }

  /**
   * 对数据库的数据进行遍历操作
   * @param fn {function} -必选 每条数据的回调方法
   * @param copy {boolean} -可选 默认true 对数据进行拷贝后再传给回调函数，防止误操作引用数据，导致数据库变脏，设置为false可提高性能
   */
  each (fn, copy) {
    fn = fn || function () {}
    let t = this
    let data = t.db.data
    for (let i = 0; i < data.length; i++) {
      let item = data[i]
      if (copy !== false) {
        fn(clone(item))
      } else {
        fn(item)
      }
    }
  }

  /* 建立数据所在位置的索引，用于提升批量删除时的性能 */
  _buildIndex () {
    let t = this
    let result = {}
    for (let i = 0; i < t.db.data.length; i++) {
      let data = t.db.data[i]
      result[data.t] = i
      if (data.k) {
        result[data.k] = i
      }
    }
    return result
  }

  /**
   * 删除数据，支持批量删除
   * @param keys {string|array} -必选 一个或多个键名
   * 支持使用时间戳作为key名进行删除
   */
  remove (keys) {
    let t = this
    if (typeof keys === 'undefined' || !t.isReady()) return false

    let delKeys = getType(keys) === 'array' ? keys : [keys]
    let indexMap = t._buildIndex()

    /**
     * 对需要删除的数据进行标记，实现一次遍历删除多条数据
     */
    let needRemove = false
    for (let i = 0; i < delKeys.length; i++) {
      let index = indexMap[delKeys[i]]
      if (typeof index !== 'undefined') {
        needRemove = true
        t.db.data[index]['del'] = true
      }
    }

    /* 进行批量删除操作 */
    if (needRemove) {
      let newData = []
      for (let i = 0; i < t.db.data.length; i++) {
        let dbData = t.db.data[i]
        if (dbData.del) {
          delete t.db.keyIndex[dbData.k]
          delete t.db.timeIndex[dbData.t]
          if (dbData.oldt) {
            delete t.db.timeIndex[dbData.oldt]
          }
        } else {
          newData.push(dbData)
        }
      }
      t.db.data = newData
      t._write(t.db.data)
    }
  }

  /**
   * 移除超时的数据
   * @param expires {number} -必选 以当前时间计算，移除多少ms前的数据
   * @param isTimestamp {number} -可选，将expires作为时间戳处理，移除超过指的时间戳的数据
   * @param beforeRemove {number} -可选，移除过期数据前的回调操作，默认使用onExpires配置项的函数
   */
  removeExpiresData (expires, isTimestamp, beforeRemove) {
    let t = this
    let timeOut = isTimestamp ? expires : new Date().getTime() - expires

    /* 查找需要删除的数据项 */
    let keys = []
    for (let i = 0; i < t.db.data.length; i++) {
      let writeTime = t.db.data[i]['t']
      if (writeTime <= timeOut) {
        keys.push(writeTime)
      }
    }

    beforeRemove = beforeRemove || t.onExpires
    if (beforeRemove instanceof Function) {
      beforeRemove(t.reads(keys))
    }

    t.remove(keys)
  }

  /* 获取每条数据的时间戳值，并按小到大进行排序 */
  getTimestampListAndSort () {
    let t = this
    let list = []
    for (let key in t.db.timeIndex) {
      if (Object.hasOwnProperty.call(t.db.timeIndex, key)) {
        list.push(Number(key))
      }
    }
    return quickSort(list)
  }

  /**
   * 获取最近写入的数据
   * @param num {number} -可选，获取多少条最近写入的数据，默认 5
   */
  getLastData (num) {
    let t = this
    let timeList = t.getTimestampListAndSort().reverse()
    let count = num || 5
    count = count > timeList.length ? timeList.length : count

    let keys = []
    for (let i = 0; i < count; i++) {
      keys.push(timeList[i])
    }
    return t.reads(keys)
  }

  /**
   * 清除旧数据为新数据腾出空间
   * @param size {number} -可选，要腾出的空间大小，单位Kb
   * 如果不指定，则自动腾出limit值三分一左右的空间
   */
  recycleSpace (size) {
    let t = this
    let recycleSize = t._limitCountCache_ ? t.limit / 3 + t._limitCountCache_ : t.limit / 3
    recycleSize = size ? size * 1024 : recycleSize

    if (recycleSize >= t.limit) {
      return t.clearAll()
    }

    let timeList = t.getTimestampListAndSort()
    let romoveKeys = []
    let tmpSize = 0
    for (let i = 0; i < timeList.length; i++) {
      let dbData = t.db.timeIndex[timeList[i]]
      romoveKeys.push(dbData.t)
      tmpSize += sizeof(JSON.stringify(dbData.d))
      if (tmpSize >= recycleSize) {
        break
      }
    }

    t.remove(romoveKeys)
    t._limitCountCache_ = null
    t._dbStrCache_ = null
  }

  /* 清空整个数据库 */
  clearAll () {
    this.dbInit()
  }

  /* 删除数据库，且完全从localStorage里移除 */
  delTinyDB () {
    this.db = null
    this.enable && store.remove(this.name)
  }
}

export default TinyDB
