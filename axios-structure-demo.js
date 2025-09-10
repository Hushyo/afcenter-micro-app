import axios from 'axios'

// 创建一个axios实例
const ajax = axios.create({
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json'
  },
  baseURL: 'https://api.example.com',
  timeout: 5000
})

console.log('=== Axios实例结构分析 ===')
console.log('1. ajax对象本身:', typeof ajax)
console.log('2. ajax对象的方法:', Object.getOwnPropertyNames(ajax).filter(name => typeof ajax[name] === 'function'))

console.log('\n=== defaults对象结构 ===')
console.log('3. ajax.defaults:', ajax.defaults)
console.log('4. ajax.defaults的类型:', typeof ajax.defaults)

console.log('\n=== headers结构 ===')
console.log('5. ajax.defaults.headers:', ajax.defaults.headers)
console.log('6. headers的详细结构:')
console.log('   - common:', ajax.defaults.headers.common)
console.log('   - get:', ajax.defaults.headers.get)
console.log('   - post:', ajax.defaults.headers.post)
console.log('   - put:', ajax.defaults.headers.put)
console.log('   - delete:', ajax.defaults.headers.delete)

console.log('\n=== 配置优先级演示 ===')
console.log('7. 当前Authorization:', ajax.defaults.headers.common.Authorization)

// 修改defaults
ajax.defaults.headers.common.Authorization = 'Bearer new-token456'
console.log('8. 修改后的Authorization:', ajax.defaults.headers.common.Authorization)

// 演示请求时的配置合并
console.log('\n=== 请求配置合并演示 ===')
const requestConfig = {
  headers: {
    'Custom-Header': 'custom-value'
  }
}

console.log('9. 请求时的配置:', requestConfig)
console.log('10. 最终合并的headers会包含:')
console.log('    - Authorization: Bearer new-token456 (来自defaults)')
console.log('    - Content-Type: application/json (来自defaults)')
console.log('    - Custom-Header: custom-value (来自请求配置)')

console.log('\n=== 为什么headers在defaults里 ===')
console.log('11. defaults是所有请求的默认配置容器')
console.log('12. headers是请求配置的一部分，所以放在defaults.headers里')
console.log('13. 这样可以统一管理所有请求的默认头部信息')
