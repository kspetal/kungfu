import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { useGlobalStore } from './store/index'

export function createApp() {
  const app = createSSRApp(App)
  // 简单挂载全局 store，页面中通过 getApp().$store 访问
  const store = useGlobalStore()
  app.config.globalProperties.$store = store
  return {
    app
  }
}
// #endif