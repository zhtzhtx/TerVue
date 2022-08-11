class Watcher {
    constructor(vm, key, callback) {
        // 挂载Vue实例
        this.vm = vm
        // data中的属性名称
        this.key = key
        // 回调函数负责更新视图
        this.cb = callback
        // 把watcher对象记录到Dep类的静态属性target
        Dep.target = this
        // 触发get方法，在get方法中会调用addSubs
        this.oldValue = vm[key]
        Dep.target = null
    }
    // 当数据发生变化的时候更新视图
    update() {
        let newValue = this.vm[this.key]
        if(this.oldValue === newValue) return
        // 调用回调函数
        this.cb(newValue)
    }
}