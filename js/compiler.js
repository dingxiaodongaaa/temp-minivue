class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile (el) {
    // 注意这里遍历的是所有的节点（childNodes），而不是元素（chlidren） // 那么元素和节点的区别是什么呢？
    let childNodes = el.childNodes
    // el.childNodes 是一个伪数组，需要先将伪数组转换成数组
    Array.from(childNodes).forEach(node => {
      // 遍历所有的节点
      // 注意这里使用的是箭头函数，箭头函数保证了这里的 this 指向当前 compiler 实例
      if (this.isTextNode(node)) {
        // 编译文本节点
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 编译元素节点
        this.compileElement(node)
      }

      // 判断 node 节点是否又子节点，如果有子节点，要递归调用 compile ，实现全部节点的遍历
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compileElement (node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        // v-text ---> text
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }

  update (node, key, attrName) {
    let updateFn = this[attrName + 'Updater']
    updateFn && updateFn(node, this.vm[key])
  }

  // 处理 v-text 指令
  textUpdater (node, val) {
    node.textContent = val
  }
  // 处理 v-model 指令
  modelUpdater (node, val) {
    node.value = val
  }

  // 编译文本节点，处理插值表达式
  compileText (node) {
    // console.dir(node)
    // {{  msg }}
    // 点是匹配任意的单个字符不包含换行
    // 加号是匹配前面修饰的内容出现一次或者多次
    // 问号是非贪婪模式，尽可能早的结束匹配
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      // 第一个匹配的内容
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])

      // 创建 watcher 对象，当数据发生变化的时候更新视图
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }
  // 判断元素属性的名字是否是一个vue指令
  isDirective (attrName) {
    // 判断属性的名字是否以 v- 开头
    return attrName.startsWith('v-')
  }
  // 判断节点是否是文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }
  // 判断节点是否是元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
}