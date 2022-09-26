import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		amapInfo: {
			hasOpen: false,
			hasClose: false,
			openTime: null,
			closeTime: null,
			lunaAmap: null, //插件对象
			myInterval: 2, //定位间隔，单位秒
			sucCount: 0, // 持续定位成功次数
			errCount: 0, // 持续定位失败次数
		}
	},
	mutations: {
		setAmapInfo(state, info) {
			state.amapInfo = info;
			uni.setStorage({ //将用户信息保存在本地
				key: 'amapInfo',
				data: info
			})
		},
	}
})

export default store
