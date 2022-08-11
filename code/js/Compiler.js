class Compiler {
    constructor(vm) {
        // 挂载Vue实例
        this.vm = vm
        // 挂载根节点
        this.el = vm.$el
        // 编译模板
        this.compile(this.el)
    }
    // 编译模板
    compile(node) {
        const childNodes = node.childNodes
        Array.from(childNodes).forEach(childNode => {
            if (this.isTextNode(childNode)) {
                // 判断是否为文本节点
                this.compileTextNode(childNode)
            } else if (this.isElementNode(childNode)) {
                // 判断是否为元素节点
                this.compileElementNode(childNode)
            }
            // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
            if (childNode.childNodes && childNode.childNodes.length) {
                this.compile(childNode)
            }
        })
    }
    // 编译文本节点
    compileTextNode(node) {
        let value = node.textContent
        let reg = /\{\{(.+?)\}\}/
        if (reg.test(value)) {
            // 获取{{}}中的文本
            const key = RegExp.$1.trim()
            // 替换{{}}中的文本
            node.textContent = value.replace(reg, this.vm[key])
            new Watcher(this.vm, key, newValue => {
                node.textContent = newValue
            })
        }
    }
    // 编译元素节点
    compileElementNode(node) {
        Array.from(node.attributes).forEach(attr => {
            // 获取属性的名称
            let attrName = attr.name
            // 判断是否为指令
            if (this.isDirective(attrName)) {
                // 如"v-text"截取"text"
                attrName = attrName.substring(2)
                const key = attr.value
                this.update(node, key, attrName)
            }
        })
    }
    // 编译指令
    update(node, key, attrName) {
        const updateFn = this[attrName + "Updater"]
        // 将this指向Compiler实例
        updateFn && updateFn.call(this, node, this.vm[key], key)
    }
    // 编译v-text
    textUpdater(node, value, key) {
        node.textContent = value
        new Watcher(this.vm, key, newValue => {
            node.textContent = newValue
        })
    }
    // 编译v-model
    modelUpdater(node, value, key) {
        node.value = value
        node.addEventListener("input", () => {
            this.vm[key] = node.value
        })
        new Watcher(this.vm, key, newValue => {
            node.value = newValue
        })
    }
    // 判断是否为文本节点
    isTextNode(node) {
        return node.nodeType === 3
    }
    // 判断是否为元素节点
    isElementNode(node) {
        return node.nodeType === 1
    }
    // 判断是否为指令
    isDirective(attrName) {
        return attrName.startsWith("v-")
    }
}