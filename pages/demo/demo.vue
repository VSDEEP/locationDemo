<template>
	<view>
		<button type="default" @click="getInfo">单次定位</button>
		<button type="default" @click="start">连续定位</button>
		<button type="default" @click="stop">停止定位</button>
		<view v-for="(info,index) in list">
			<view>经度：{{info.longitude }} | {{location.longitude }}</view>
			<view>纬度：{{info.latitude }} | {{location.latitude }}</view>
			<view>海拔：{{info.altitude }}</view>
			<view>速度：{{info.speed }}</view>
			<view>方位：{{info.bearing }}</view>
			<view>时间：{{info.time }}</view>
			<view>卫星数量：{{info.satllite }}</view>
			----------------------------------
		</view>
		<view class="">
			{{text}}
		</view>
	</view>
</template>

<script>
	var testModule = uni.requireNativePlugin("da-comgps")
	export default {
		data() {
			return {
				list: [],
				text: "未调用",
				location: {}
			}
		},
		onLoad() {
			let result = getDistance('120.731591','31.256189','120.731839','31.256189',)
			console.log("------------")
			console.log(result)
		},
		methods: {
			async getInfo() {
				var gpsInfo = await testModule.getLocateInfo();
				console.log("-------------")
				console.log(gpsInfo)
				this.list.push(gpsInfo)
				this.text = "单次调用成功"
			},
			async start() {
				console.log("*****************")
				var that = this
				var gpsInfo = await testModule.startLocate(function(gpsInfo) {
					console.log(gpsInfo)
					console.log("*****************")
					that.list.push(gpsInfo)
					that.text = "连续调用成功"
					uni.getLocation({
						success(res) {
							console.log("////////////////////")
							console.log(res)
							that.location = res
						}
					})
				}, 3000);
			},
			async stop() {
				var gpsInfo = await testModule.stopLocate();
				this.text = "停止调用成功"
			},
			getDistance(e1, n1, e2, n2) {
				const R = 6371
				const {
					sin,
					cos,
					asin,
					PI,
					hypot
				} = Math

				/** 根据经纬度获取点的坐标 */
				let getPoint = (e, n) => {
					e *= PI / 180
					n *= PI / 180
					//这里 R* 被去掉, 相当于先求单位圆上两点的距, 最后会再将这个距离放大 R 倍
					return {
						x: cos(n) * cos(e),
						y: cos(n) * sin(e),
						z: sin(n)
					}
				}
				let a = getPoint(e1, n1)
				let b = getPoint(e2, n2)
				let c = hypot(a.x - b.x, a.y - b.y, a.z - b.z)
				let r = asin(c / 2) * 2 * R
				return r
			}
		}
	}
</script>

<style>

</style>
