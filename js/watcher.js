class Watcher {
  constructor (vm, key, cb) {
    this.vm = vm
    // data 中的属性名称
    this.key = key
    // 回调函数，负责更新视图
    this.cb = cb
    // 当创建 watcher 对象的时候，将当前创建的 watcher 对象添加到 dep 的 subs 数组中
    // 把 Watcher 对象记录到 dep 类的属性 target 中
    Dep.target = this
    // 触发 get 方法，在 get 方法中调用 addsub
    this.oldValue = vm[key]
    // 添加完成之后将 target 设置为空，防止重复添加
    Dep.target = null
  }
  // 当数据发生变化的时候，更新视图
  update () {
    let newValue = this.vm[this.key]
    if (newValue === this.oldValue) return
    this.cb(newValue)
  }
}