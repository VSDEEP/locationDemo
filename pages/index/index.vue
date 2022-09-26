<template>
	<view class="container">
		<view>
			<view class="sign-title">
				<view class="sign-title-l">
					<view class="portrait">
						三
					</view>
					<view class="text">
						<view class="name">
							张三
						</view>
						<view class="gz">
							<text>管理员</text>
						</view>
					</view>
				</view>
				<view class="sign-title-r">
					<view class="date">
						<uni-datetime-picker type="date" :disabled="true" :clearIcon="false" :border="false"
							v-model="date" />
					</view>
				</view>
			</view>
		</view>
		<view style="display: flex;">
			<uni-card>
				<view style="display: flex;flex-direction: column;">
					<text class="uni-body">开启持续定位</text>
					<view v-if="hasOpen" style="display: flex;flex-direction: column;">
						<label class="radio" style="margin-right: 30rpx;">
							<radio value="r1" checked="true" style="transform:scale(0.7)" />
							已开启
						</label>
						<label style="font-size: 12px;">{{openTime}}</label>
					</view>
					<label v-else class="radio" style="margin-right: 30rpx;">未开启</label>
				</view>
			</uni-card>
			<uni-card style="margin: 15px 15px 15px 0;">
				<view style="display: flex;flex-direction: column;">
					<text class="uni-body">关闭持续定位</text>
					<view v-if="!hasOpen" style="display: flex;flex-direction: column;">
						<label class="radio" style="margin-right: 30rpx;">
							<radio value="r1" checked="true" style="transform:scale(0.7)" />
							已关闭
						</label>
						<label style="font-size: 12px;">{{closeTime}}</label>
					</view>
					<label v-else class="radio" style="margin-right: 30rpx;">
						未关闭
					</label>
				</view>
			</uni-card>
		</view>
		<view v-if="!hasOpen" class="btn">
			<button type="primary" @click="start"
				style="width: 60px;height: 60px;border-radius: 50%;display: flex;justify-content: center;align-items: center;box-shadow:0px 5px 10px rgba(0, 0, 255, 0.4)">
				<view style="display: flex;flex-direction: column;">
					<text style="font-size: 14px;">开启定位</text>
					<!-- <text style="font-size: 12px;color: #B3D8FF;">{{time}}</text> -->
				</view>
			</button>
		</view>
		<view v-else class="btn">
			<button type="warn" @click="stop"
				style="width: 60px;height: 60px;border-radius: 50%;display: flex;justify-content: center;align-items: center;box-shadow:0px 5px 10px rgba(255, 123, 125, 0.4)">
				<view style="display: flex;flex-direction: column;">
					<text style="font-size: 14px;">关闭定位</text>
					<!-- <text style="color: #ffdbdc;">{{time}}</text> -->
				</view>
			</button>
		</view>

		<view class="notice">
			<uni-row class="demo-uni-row">
				<uni-col :span="10" :offset="2">
					<view v-for="(info,index) in list">
						<view>经度：{{info.longitude }}</view>
						<view>纬度：{{info.latitude }}</view>
						<view style="color:red">距离：{{info.m }}</view>
						<!-- <view>时间：{{info.time }}</view> -->
						<!-- <view>卫星数量：{{info.satllite }}</view> -->
						----------------------------------
					</view>
				</uni-col>
				<uni-col :span="10" :offset="2">
					<view v-for="(info,index) in location">
						<view>经度：{{info.longitude }}</view>
						<view>纬度：{{info.latitude }}</view>
						<view style="color:red">距离：{{info.m }}</view>
						<!-- <view>时间：{{info.time }}</view> -->
						<!-- <view>卫星数量：{{info.satllite }}</view> -->
						----------------------------------
					</view>
				</uni-col>
			</uni-row>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import {
		formateDate
	} from "../../utils/index.js"
	var testModule = uni.requireNativePlugin("da-comgps")
	export default {
		data() {
			return {
				time: formateDate(new Date(), 'h:min:s'), //当前时分秒
				date: formateDate(new Date(), 'Y-M-D'), //当前日期
				closeTime: "",
				openTime: "",
				isClick: false,
				hasOpen: false,
				list: [],
				location: [],
				lastList: null,
				lastLocation: null,
			};
		},
		onLoad() {
			// this.getTime();
		},
		methods: {
			getTime() {
				var that = this;
				setInterval(function() {
					that.time = formateDate(new Date(), 'h:min:s')
				}, 1000)
			},
			async start() {
				var that = this
				this.hasOpen = true
				this.openTime = formateDate(new Date(), 'h:min:s')
				var gpsInfo = await testModule.startLocate(function(gpsInfo) {
					console.log(gpsInfo)
					var m = 0
					if (that.lastList !== null) {
						m = that.getDistance(that.lastList.longitude, that.lastList.latitude, gpsInfo
							.longitude,
							gpsInfo.latitude)
					}
					gpsInfo.m = m == 0 ? 0 : parseFloat(m).toFixed(4)
					that.lastList = gpsInfo
					that.list.push(gpsInfo)
					uni.getLocation({
						success(res) {
							that.location.push(res)
							console.log(res)
							var m = 0
							if (that.lastLocation !== null) {
								m = that.getDistance(that.lastLocation.longitude, that.lastLocation
									.latitude, res
									.longitude,
									res.latitude)
							}
							res.m = m == 0 ? 0 : parseFloat(m).toFixed(4)
							that.lastLocation = res
						}
					})

				}, 3000);
			},
			async stop() {
				var gpsInfo = await testModule.stopLocate();
				// testModule.destroyLocation()
				this.hasOpen = false
				this.closeTime = formateDate(new Date(), 'h:min:s')
			},
			
			// 坐标转化距离
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
	};
</script>

<style lang="scss" scoped>
	page {
		background-color: #f4f5f6;
		height: 100%;
		font-size: 28upx;
		line-height: 1.8;
	}

	view {
		font-size: 28upx;
		line-height: 1.8;
	}

	.container {
		overflow: hidden;
		background-color: #FFFFFF;
		height: 100%;
	}

	.uni-body {
		color: #000000;
		font-size: 15px;
	}

	.radio {
		font-size: 14px;
	}

	.btn {
		// margin-top: 10px;
		padding: 10px;
		position: fixed;
		bottom: 50upx;
		left: calc(50% - 100upx);
	}

	.sign-title {
		display: flex;
		justify-content: space-between;
		padding: 30upx 24upx;
		border-bottom: 1upx solid #EBEEF5;
		align-items: center;
	}

	.sign-title .portrait {
		width: 100upx;
		height: 100upx;
		line-height: 100upx;
		border-radius: 50%;
		background-color: #007AFF;
		color: #fff;
		font-size: 28upx;
		text-align: center;
	}

	.sign-title .sign-title-l {
		display: flex;
	}

	.sign-title .sign-title-l .text {
		margin-left: 20upx;
	}

	.sign-title .sign-title-l .text .name {
		font-size: 32upx;
	}

	.sign-title .sign-title-l .text .gz {
		color: darkblue;
		display: inline-flex;
	}

	.sign-title .sign-title-l .text .gz text {
		display: inline-block;
	}

	.sign-title .sign-title-l .text .gz .t1 {
		overflow: hidden;
		/*超出部分隐藏*/
		text-overflow: ellipsis;
		/* 超出部分显示省略号 */
		white-space: nowrap;
		/*规定段落中的文本不进行换行 */
		width: 166upx;
		/*需要配合宽度来使用*/
	}

	/deep/.uni-date-x {
		padding: 0;
	}

	/deep/.uni-date__x-input {
		padding: 0;
	}

	/deep/.uni-input-input {
		width: 80px;
		color: #000000;
	}

	/deep/ input [disabled] {
		-webkit-text-fill-color: black;
		opacity: 1;
	}

	.notice {
		border-top: 1px solid #007AFF;
		height: 400px;
		overflow: auto;
	}
</style>
