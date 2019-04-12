/*!
 * @name         number.js
 * @description  数字相关的方法
 * @version      0.0.1
 * @author       Blaze
 * @date         22/03/2019 22:22
 * @github       https://github.com/xxxily
 */

/* 生成指定范围的随机整数 */
function random (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

/**
 * 快速排序，更多排序算法参考：
 * 《十大经典排序算法总结（JavaScript描述）》
 * https://juejin.im/post/57dcd394a22b9d00610c5ec8
 */
var quickSort = function (arr) {
  if (arr.length <= 1) { return arr }
  var pivotIndex = Math.floor(arr.length / 2)
  var pivot = arr.splice(pivotIndex, 1)[0]
  var left = []
  var right = []
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quickSort(left).concat([pivot], quickSort(right))
}

/*
var testData = []
for (var i = 1; i <= 100000; i++) {
  testData.push(random(0, 1024 * 1024 * 5))
}
console.time('10w随机数下，快速排序耗时')
quickSort(testData)
console.timeEnd('10w随机数下，快速排序耗时')
*/

export { random, quickSort }
