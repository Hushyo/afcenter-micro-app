import Vue from '@/vue.js'
import App from './index.vue'
import Router from './router/index'
import store from './store/index'

new Vue({
  render: h => h(App),
  router: Router,
  store: store
}).$mount('#app')
