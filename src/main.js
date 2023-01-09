/**
 * 1.引入Css、根组件、状态、路由、图标、权限控制、错误日志、全局过滤器
 * 2.注册Element、全局过滤器
 * 3.挂载状态、路由
 */

import Vue from 'vue'
// CSS(按顺序引入)
import 'normalize.css/normalize.css'
import Element from 'element-ui'
// 解决ICON乱码问题
import 'element-ui/lib/theme-chalk/index.css'
import './styles/element-variables.scss'
import '@/styles/index.scss' // global css
// 根组件、状态、路由(按顺序引入)
import App from './App'
import router from './router'

// 注册Element
Vue.use(Element)

// 关闭生产提示
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
