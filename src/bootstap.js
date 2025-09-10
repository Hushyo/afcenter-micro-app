import Vue from '@/vue.js'
import App from './index.vue'
import Router from './router/index'
import store from './store/index'
import { copy } from './libs/mixins'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.mixin(copy)

new Vue({
  render: h => h(App),
  router: Router,
  store: store
}).$mount('#app')
