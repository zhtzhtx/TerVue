class Observer {
    constructor(data) {
        // 我们希望构造类之后，立即将传入的data中的属性转换成getter/setter，所以在构造函数中调用walk()
        this.walk(data)
    }
    walk(data) {
        // 判断传入值是否为对象，对象才能转化为响应式
        if (!data || typeof data !== "object") return
        Object.keys(data).forEach(key => {
            // 对各个属性进行数据拦截
            this.defineReactive(data, key, data[key])
        })
    }
    defineReactive(obj, key, value) {
        const _this = this
        // 负责收集依赖，并发送通知
        const dep = new Dep()
        // 如果val是对象，把val内部的属性转换成响应式数据
        this.walk(value)
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 这里不能直接使用data[key],因为会调用get方法，陷入死循环
                const watcher = Dep.target
                watcher && dep.addSubs(watcher)
                return value
            },
            set(newValue) {
                if (newValue === value) return
                // 这里形成一个闭包，一直储存value值
                value = newValue
                // 判断传入的值是不是对象，如果是，转化为响应式对象
                // 这里的this指向obj，而不是Observer实例，所以设置_this
                _this.walk(newValue)
                // 通知依赖更新
                dep.notify()
            }
        })
    }
}