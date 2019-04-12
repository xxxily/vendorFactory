# tinydb
前端微型离线数据管理库

## 简介
tinydb 是一款基于localStorage的前端微型离线数据管理库，可用于页面异常、埋点数据，app运行状态等日志数据的离线存储管理。具备以下相关特点：
* 具备数据容量统计功能
* 具备指定存储大小能力
* 触发容量上限时自动回收存储空间
* 具备自动移除过期数据功能
* 尽可能优化数据读写入性能
* 提供[写保护](#写保护)，降低数据读写过程中可能对应用造成的性能影响
* 数据存储逻辑和管理逻辑分离，可改造离线数据的存储类型  

## 使用示例

```javascript
import TinyDB from './lib/tinydb/index'
let db = new TinyDB({
  enable: true,
  name: 'my_db',
  limit: 1024 * 2,
  onLimit: function(){},
  expires: (1000 * 60 * 60 * 24) * 5,
  onExpires: function(){},
  writeProtection: 30
})
db.write('TinyDB use example', 'example_key')
console.log(db.read('example_key'));
```
## 配置选项 new TinyDB(config)
创建使用实例的时候传入配置选项进行实例定制，传入的选项必须是一个对象，具体可传的值如下：

```javascript
let config = {
  /* 是否启用离线存储功能，默认true，false表示只使用数据管理功能，不进行离线存储 */
  enable: true,
  /* 要创建或读取的数据库的名称，没有则创建，有则从离线数据中读取数据建立可用的数据库 */
  name: 'my_db',
  /* 指定存储容量上限，单位Kb，默认5Mb */
  limit: 1024 * 2,
  /* 写入操作触发容量上限值时的回调操作 */
  onLimit: function(){},
  /* 存储数据的超期时间，默认0 表示永不过期 */
  expires: (1000 * 60 * 60 * 24) * 5,
  /* 检测到有超期数据时的回调操作 */
  onExpires: function(){},
  /* 写保护，单位时间里(80ms)写入次数达到某个峰值（默认30次），则不再执行后面的数据写入，防止死循环带来的应用卡顿或卡死 */
  writeProtection: 30
}
```

## TinyDB API
* [open()](#open)
* [close()](#close)
* [isReady()](#isready)
* [write(data, key)](#writedata-key)
* [read(key)](#readkey)
* [reads(keys)](#readskeys)
* [each(fn, copy)](#eachfn-copy)
* [remove(keys)](#removekeys)
* [getTimestampListAndSort()](#gettimestamplistandsort)
* [getLastData(num)](#getlastdatanum)
* [removeExpiresData(expires, isTimestamp, beforeRemove)](#removeexpiresdataexpires-istimestamp-beforeremove)
* [recycleSpace(size)](#recyclespacesize)
* [hasKey(key)](#haskeykey)
* [islimit()](#islimit)
* [getSize()](#getsize)
* [getLen()](#getlen)
* [getLens()](#getlens)
* [clearAll()](#clearall)
* [delTinyDB()](#deltinydb)

### open()

打开数据库，默认实例化后自动调用，如果手动调用了 close方法，然后想再次打开数据库则可使用该方法  

```javascript
db.cloes()
setTimeout(function () {
  // 重新打开数据库
  if(!db.isReady()){
    db.open() 
  }
}, 1000*10 );
```

### close()

关闭数据库以销毁数据对象，减少对内存的占用，除非已确定后续不会或非常少机会用到数据库，否则不建议频繁进行数据库的关闭和打开操作  

```javascript
db.cloes()
```

### isReady()

判断当前数据库是否已经初始化就绪，也可用于数据库是否已被关闭的判断  

```javascript
if(db.isReady()){
  console.log('TinyDB 实例已就绪') 
}
```

### write(data, key)
#### 参数说明：
* @param data {any} -必选 要写入的数据  
* @param key {string} -可选 将数据写入到指定键值  

将数据写入数据库进行存储，写入操作包含了新增和更新两种操作，注意此处的key 是可选的，没传key的程序自动为其创建时间戳作为随机key    
对于日志记录应用通常只关注把数据存起来，因而没必要为每一条数据想一个key名称，其次日志数据都需要记录日志时间，且数据过期也需要依赖时间进行计算，所以这里直接自动创建时间戳作为时间记录值，在写入日志信息时就没必要自己再添加时间戳字段了    
` 注意：同1ms内写入多条数据将合并在一个数组里，作为一组数据处理，并且共用同一个时间戳 `    

```javascript
// 不指定键值的写入
db.write('write test')
// 指定键值的写入 
db.write({a: 1},'test_key')
// 指定键值的写入，和旧有键值相同表示要更新数据 
db.write({a: 'a'},'test_key')
// 指定键值的写入如果写入的数据是对象，则会进行数据的深度合并，其它类型的数据则直接替换原数据
db.write({b: 2},'test_key')
console.log(db.read('test_key'))
// > {t:1554889555586, d: {a: 'a', b: 2}, k: "test_key", oldt:1554889555586}
db.write('test','test_key')
console.log(db.read('test_key'))
// > {t:1554889585624 ,d: "test", k: "test_key", oldt:1554889555586}
```

### read(key)
#### 参数说明：
* @param key {string|number} -必选 要读取指定键名或时间戳下的数据  

读取单条数据，需指定键名或时间戳  
返回结果数据结构请参考：[数据存储结构说明](#数据存储结构说明)   

```javascript
db.write({test: 'test data'},'read_test')
console.log(db.read('read_test'))
```

### reads(keys)
#### 参数说明：
* @param keys {string|number|array} -可选 读取指定键名或时间戳下的数据  

读取多条数据，需指定键名或时间戳，通过数组传入key或时间戳可用返回多条对应的数据  
注意：该方法始终返回数组结果  
返回结果数据结构请参考：[数据存储结构说明](#数据存储结构说明)  

```javascript
// getLastData 内部就是使用 reads 进行读取的
console.log(db.getLastData(5))
```

### each(fn, copy)
#### 参数说明：
* @param fn {function} -必选 每条数据的回调方法
* @param copy {boolean} -可选 默认true 对数据进行拷贝后再传给回调函数，防止误操作引用数据，导致数据库变脏，设置为false可提高性能  

对数据库的数据进行遍历操作，可用于数据查找等操作    

```javascript
db.each(function (itme) {
  if (itme.m) {
    console.log('这是一条多项数据')
  } else {
    console.log('数据内容：', itme.d)
    console.log('写入或更新时间：', itme.t)
  }
})
```

### remove(keys)
#### 参数说明：
* @param keys {string|number|array} -必选 一个或多个键名或时间戳

删除数据，支持批量删除

```javascript
console.log('当前TinyDB实例库共存储了：' + db.getLens() + '条数据' )
let timestampKeys = db.getTimestampListAndSort()
// 移除所有数据
db.remove(timestampKeys)
console.log('执行移除操作后，当前TinyDB实例库共存储了：' + db.getLens() + '条数据' )
```

### getTimestampListAndSort()

获取每条数据的时间戳值，并按小到大进行排序

```javascript
let timestampKeys = db.getTimestampListAndSort()
console.log('当前所有数据的时间戳：', timestampKeys)
```

### getLastData(num)
#### 参数说明：
* @param num {number} -可选，获取多少条最近写入的数据，默认 5

获取最近写入的数据，不管多少条，返回的都是数组

```javascript
console.log('最近写入的三条数据如下：' + db.getLastData(3))
```

### removeExpiresData(expires, isTimestamp, beforeRemove)
#### 参数说明：
* @param expires {number} -必选 以当前时间计算，移除多少ms前的数据
* @param isTimestamp {number} -可选，将expires作为时间戳处理，移除超过指的时间戳的数据
* @param beforeRemove {number} -可选，移除过期数据前的回调操作，默认使用onExpires配置项的函数

移除超时的数据，默认程序会自动进行超时数据的移除工作，如果你需要手动移除也可以通过执行该方法进行移除操作

```javascript
console.log('移除2天前的数据：')
db.removeExpiresData(1000*60*60*24*2)
```

### recycleSpace(size)
#### 参数说明：
* @param size {number} -可选，要腾出的空间大小，单位Kb 如果不指定，则自动腾出limit值三分一左右的空间

清除旧数据为新数据腾出空间，默认会自动调用该方法进行空间回收，如果你需要进行手动回收也可以手动调用该方法，注意指定的size值只能是个大概值，最终要回收的空间肯定回比size稍大，因为是对旧数据进行计算删除，不会破坏数据库的存储结构

```javascript
console.log('TinyDB实例当前存储的数据大小：', db.getSize())
db.recycleSpace(1024)
console.log('执行回收操作后的数据大小：', db.getSize())
```

### hasKey(key)
#### 参数说明：
* @param key {string|number} -必选 要判断的键名或时间戳

判断是否存在某个键名的数据

```javascript
if(db.hasKey('custom_key_name')){
  console.log('custom_key_name 的数据已存在') 
}else {
  console.log('未存在 custom_key_name 的数据')
}
```

### islimit()

判断当前存储的数据是否已经超出指定的容量限制，一般不用不上，因为程序会自动检测容量，超出后会自动进行空间回收  

```javascript
if(db.islimit()){
  console.log('TinyDB 存储的数据容量已超出上限值') 
}else {
  console.log('TinyDB 存储容量正常')
}
```

### getSize()

获取当前数据库已使用的空间大小，本质是对数据库文本内容的字节计算，返回的是数据库的字节(bit)大小，如果数据库未就绪会始终返回0  

```javascript
let dbMemory = db.getSize()
console.log('当前TinyDB实例库占用：' + dbMemory/1024 + 'Kb' )
```

### getLen()

获取当前数据库存储的数据条数，注意该方法会把 [多项数据](#多项数据) 当作一条数据计算    

```javascript
console.log('当前TinyDB实例库共存储了：' + db.getLen() + '条数据' )
```

### getLens()

获取当前数据库存储的数据条数，注意该方法会把 [多项数据](#多项数据) 按具体存储了多少条计算，即将多项数据进行展开计算，从而得到更准确的条数    

```javascript
console.log('当前TinyDB实例库共存储了：' + db.getLens() + '条数据' )
```

### clearAll()

清空整个数据库的数据，如果你要对数据库容量进行一次性回收，该操作比执行recycleSpace方法更高效    

```javascript
db.clearAll()
```

### delTinyDB()

删除数据库，且完全从localStorage里移除    

```javascript
db.delTinyDB()
```

## 数据存储结构说明

存储起来的数据是一个数组结构，每一条数据的基本结构（字段）如下：
```javascript
let db = [
  {
    't': '写入或更新时的时间戳',
    'd': '对应的具体数据',
    'k': '可选标识，对应的key值',
    'm': '可选标识，用于表示同1ms里创建了多条数据',
    'oldt': '可选标识，带key的数据更新key对应的内容时，oldt记录最初创建该数据的时间'
  }
]
```

使用read()进行数据读取的时候得到的也是上面的数据结构，为了尽可能节省辅助字段对存储空间的占用，所以使用了简写键名进行表示，上面键名对应的具体意思如下：
* t => timestamp
* d => data
* k => keyName
* m => multiterm
* oldt => oldTimestamp


## 名词解释

### 写保护
由于进行数据内容离线存储时，需对对象数据转换成字符串数据（即调用JSON.stringify()方法）并且要动态计算写入数据的字节大小，因此写入操作是一个非常耗性能的操作，如果频繁写入将会导致程序进入卡死状态。  
正常的日志记录写入操作不会太过频繁，但如果不小心写了死循环或则某些初级开发人员无性能概念，无节制地同一时间执行写入操作，则很容易触发性能瓶颈，导致整个程序性能下降。为了避免这些意外的性能瓶颈给应用带来的不良体验，所以增加写入保护机制。  
所以写保护就是：单位时间内写入的次数过多，则自动丢掉后面的写入操作要写入的数据，以达到程序自我保护的目的。  
目前定义的是80ms内写入了超过了指定次数（默认30次）则停止写入操作，100ms后自动恢复正常逻辑，建议将默认次数修改比30小的值，以尽可能降低日志程序对应用的影响。  
当然也可以通过自动缓存，等某一段时间后再一次性执行离线写入操作，但这容易生产数据丢失问题，所以这里不使用延时写入方案来提升写入性能，建议上层应用有频繁写入需求的，先将数据缓存起来，适当时候再一次性写入。  

### 多项数据
所谓多项数据指的是：不提供键名写入数据时，同1ms内写入多条数据将合并在一个数组里，作为一组数据处理，使用read读取的时候，会带有一个 m 标志 
例如：
```javascript
for (var i=0; i < 5; i++) {
  db.write('multData test')
}
console.log(db.getLastData(1))
```
