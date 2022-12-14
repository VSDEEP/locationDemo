import Vue from 'vue'
import App from './App'
import store from './store'
import utils from './utils'

Vue.prototype.$store = store
Vue.prototype.$utils = utils
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()