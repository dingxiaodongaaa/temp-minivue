class Vue {
  constructor (options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把 data 中的成员转换成 getter/setter 然后注入到 vue 实例中
    this._proxyData(this.$data)
    // 3. 调用 observer 对象监听数据的变化
    new Observer(this.$data)
    // 4. 调用 compiler 方法解析 vue 指令和插值表达式
    new Compiler(this)
  }
  _proxyData (data) {
    // 遍历 data 中的所有属性，把 data 的属性注入到 vue 实例中
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        // 可枚举
        enumerable: true,
        // 可配置
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          if (data[key] === newValue) return
          data[key] = newValue
        }
      })
    })
    // 如何在这里面使用  proxy 实现将数据转换成 getter 和 setter
  }
}