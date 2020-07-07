// 在 Observer 中需要特别注意的两个问题
// 1. 当 data 中的其中一个属性是对象的时候，需要将这个对象中的属性也转换成响应式的数据
// 2. 当给 data 中的属性新赋值的时候，如果这个新赋值的数据是一个对象，需要将这个新赋值的对象属性中的属性转换成响应式数据。

class Observer {
  constructor (data) {
    this.walk(data)
  }
  walk (data) {
    // 1. 判断 data 是否是对象
    if (!data || typeof data != 'object') return
    // 2. 遍历 data 中的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  // 疑问？问什么传入了对象以及对象的键，还需要传入对象的键值，而不能直接通过 obj[key] 获取。
  // 这里是因为，当我们通过 this.msg 获取数据的时候会触发 Vue 对应属性的 getter 去获取 data[key] 这样就会触发 data 中的 getter ，如果在这个 getter 中使用 data[key] 获取数据，那么就又会触发 data 中该属性的 getter 方法，造成死递归，这个时候就会出现栈溢出的错误。
  defineReactive (obj, key, val) {
    let that = this
    // 收集依赖，并发送通知
    let dep = new Dep()
    // 如果该属性是一个对象，将这个对象中的属性转换成响应式数据
    this.walk(val)
    Object.defineProperty(obj, key, {
      // 可枚举
      enumerable: true,
      // 可配置
      configurable: true,
      // 当前方法的参数 obj 实际上就是 vue.$data这个属性，$data中引用了这个 get 方法，也就是说，这个 get 方法在外部是存在引用的，而 get 中又会引用 val 这个值，所以这里就会发生闭包，使得这里的 val 不会被释放掉。
      // 这里使用闭包扩展了 val 这个变量的作用域
      get () {
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set (newValue) {
        if (val === newValue) return
        val = newValue
        // 如果新赋值的数据是一个对象，需要将这个新的对象属性中的属性转换成想响应式的数据
        // 在这个函数执行的时候，该函数会产生一个执行上下文，这个执行上下文中的 this 指向 obj，所以这里想要调用 walk 方法，需要提前获取外层作用域中的 this
        that.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}