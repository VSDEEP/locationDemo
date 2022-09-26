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
						<view class="gz" @click="goRule">
							<text>管理员</text>
						</view>
					</view>
				</view>
				<view class="sign-title-r">
					<view class="date">
						<uni-datetime-picker type="date" :disabled="true" :clearIcon="false" :border="false"
							v-model="date" @maskClick="maskClick" />
					</view>
				</view>
			</view>
		</view>
		<view style="display: flex;">
			<uni-card>
				<view style="display: flex;flex-direction: column;">
					<text class="uni-body">开启持续定位</text>
					<view v-if="amapInfo.hasOpen" style="display: flex;flex-direction: column;">
						<label class="radio" style="margin-right: 30rpx;">
							<radio value="r1" checked="true" style="transform:scale(0.7)" />
							已开启
						</label>
						<label style="font-size: 12px;">{{amapInfo.openTime}}</label>
					</view>
					<label v-else class="radio" style="margin-right: 30rpx;">未开启</label>
				</view>
			</uni-card>
			<uni-card style="margin: 15px 15px 15px 0;">
				<view style="display: flex;flex-direction: column;">
					<text class="uni-body">关闭持续定位</text>
					<view v-if="amapInfo.hasClose" style="display: flex;flex-direction: column;">
						<label class="radio" style="margin-right: 30rpx;">
							<radio value="r1" checked="true" style="transform:scale(0.7)" />
							已关闭
						</label>
						<label style="font-size: 12px;">{{amapInfo.closeTime}}</label>
					</view>
					<label v-else class="radio" style="margin-right: 30rpx;">
						未关闭
					</label>
				</view>
			</uni-card>
		</view>
		<view v-if="!amapInfo.hasOpen" class="btn">
			<button type="primary" @click="start"
				style="width: 150px;height: 150px;border-radius: 50%;display: flex;justify-content: center;align-items: center;box-shadow:0px 5px 10px rgba(0, 0, 255, 0.4)">
				<view style="display: flex;flex-direction: column;">
					<text style="font-size: 18px;">开启定位</text>
					<text style="color: #B3D8FF;">{{time}}</text>
				</view>
			</button>
		</view>
		<view v-else class="btn">
			<button type="primary" @click="stop"
				style="width: 150px;height: 150px;border-radius: 50%;display: flex;justify-content: center;align-items: center;box-shadow:0px 5px 10px rgba(0, 0, 255, 0.4)">
				<view style="display: flex;flex-direction: column;">
					<text style="font-size: 18px;">关闭定位</text>
					<text style="color: #B3D8FF;">{{time}}</text>
				</view>
			</button>
		</view>
		<view class="notice">
			<view style="color: red;">*(上次/当前)持续定位:</view>
			<view>定位间隔：{{amapInfo.myInterval}} 秒</view>
			<view>定位成功：{{amapInfo.sucCount}} 次</view>
			<view>定位失败：{{amapInfo.errCount}} 次</view>
			<view>成 功 率：{{sucPercent}}</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				time: this.$utils.formateDate(new Date(), 'h:min:s'), //当前时分秒
				date: this.$utils.formateDate(new Date(), 'Y-M-D'), //当前日期
				isClick: false,
				sucPercent: 100 + '%',
			};
		},
		onLoad() {
			this.getTime();
		},
		watch: {
			'amapInfo.sucCount'(newVal, oldVal) {
				return this.amapInfo.sucCount;
			},
			'amapInfo.errCount'(newVal, oldVal) {
				returnthis.amapInfo.errCount;
			},
			percent(newVal, oldVal) {
				this.sucPercent = newVal;
			},
		},
		computed: {
			percent() {
				return (this.sucCount / (this.sucCount + this.errCount)) * 100 + "%";
			},
			...mapState(['amapInfo'])
		},
		methods: {
			//开启持续定位
			start() {
				console.log('启动')
				let that = this;
				if (that.isClick) {
					return
				}
				that.isClick = true;
				that.amapInfo.lunaAmap = uni.requireNativePlugin("Luna-Amap");
				console.log(that.amapInfo.lunaAmap);
				// 插件内置方法使用
				let getStart = true;
				that.amapInfo.lunaAmap.checkPermission({
					checkGPS: true, //检测GPS是否开启
					checkLocation: true, //检测基础定位服务是否开启
					checkBackLocation: true, //检测后台定位是否开启
					checkWakeLock: true, //检测后台唤醒应用是否开启
					checkBattery: true, //检测是否加入电池优化白名单
					checkWIFI: true,
				}, res => {
					console.log(res)
					if (!res.IgnoreBatteryOptimizationsEnabled) { //电池优化未优化
						getStart = false;
						//设置忽略电池优化
						that.amapInfo.lunaAmap.setBatteryOptimizations(msg => {
							console.log(msg)
						})
					}

					if (!res.wifiEnabled) { //WIFI模块未开启
						// getStart = false;
						//打开WIFI模块
						that.amapInfo.lunaAmap.openWIFI(msg => {
							console.log(msg)
						})
					}

					if (!res.wakeLockEnabled) { //后台唤醒应用未启动，注：应用销毁时，wakeLock锁立即释放
						//开启后台唤醒应用
						that.amapInfo.lunaAmap.openWakeLock(msg => {
							console.log(msg)
						})
					}
					if (!res.gpsEnabled || !res.locationEnabled || !res.backLocationEnabled) { //定位三件套有一个未开启时
						getStart = false;
						//开启定位权限组
						that.amapInfo.lunaAmap.openLocationPermissionGroup(msg => {
							console.log(msg);
						})
					}

					if (!getStart) {
						that.isClick = false;
						return;
					} else {
						that.startLocation();
					}

				})
			},
			startLocation() {
				console.log('开启定位');
				let that = this;
				let startMode = 'onOpen';
				uni.showLoading({
					title: '开启中……'
				});
				that.amapInfo.sucCount = 0;
				that.amapInfo.errCount = 0;
				// 持续定位
				that.amapInfo.lunaAmap.startLocation({ // 
					setInterval: that.amapInfo.myInterval, // 定位间隔，单位 s，不是必须的，默认 2s
					cacheEnable: false, // 是否允许缓存，默认为true，既当位置不变时返回最后一次定位的地址，不是必须的
					sensorEnable: true, //当设置为true时会通过手机传感器获取速度
					needAddress: false, // 是否返回位置信息，默认为true
				}, result => {
					console.log(result);
					if (result.code == 0) {
						that.amapInfo.sucCount++;
						//定位成功						
						if (!that.amapInfo.hasOpen) {
							that.openR();
							uni.hideLoading();
							that.isClick = false;
						}
						//do something

					} else {
						//定位失败
						that.amapInfo.errCount++;

					}
				})
			},
			//关闭持续定位
			stop() {
				let that = this
				if (that.isClick) {
					return
				}
				that.isClick = true;
				uni.showLoading({
					title: '关闭中……'
				});
				// 关闭持续定位
				if (that.amapInfo.lunaAmap != null) {
					console.log('关闭持续定位');
					// 停止定位 如需要回调结果则为
					that.amapInfo.lunaAmap.stopLocation(res => {
						console.log(res);
					})
					// 销毁定位
					that.amapInfo.lunaAmap.destroyLocation();
					// 销毁定位和停止定位的区别是销毁定位会销毁插件内置的定位客户端对象，而停止定位只是停止定位而已。
					that.amapInfo.lunaAmap = null;
					that.closeR();
				}
				uni.hideLoading();
				that.isClick = false;
			},
			openR() {
				let info = {
					lunaAmap: this.amapInfo.lunaAmap,
					myInterval: this.amapInfo.myInterval,
					hasOpen: true,
					hasClose: false,
					openTime: this.$utils.formateDate(new Date(), 'Y-M-D h:min:s'),
					closeTime: '',
					sucCount: this.amapInfo.sucCount,
					errCount: this.amapInfo.errCount,
				}
				this.setAmapInfo(info);
			},
			closeR() {
				let info = {
					lunaAmap: null,
					myInterval: this.amapInfo.myInterval,
					hasOpen: false,
					hasClose: true,
					openTime: '',
					closeTime: this.$utils.formateDate(new Date(), 'Y-M-D h:min:s'),
					sucCount: this.amapInfo.sucCount,
					errCount: this.amapInfo.errCount,
				}
				this.setAmapInfo(info);
			},
			// 实时时间
			getTime() {
				var that = this;
				setInterval(function() {
					that.time = that.$utils.formateDate(new Date(), 'h:min:s')
				}, 1000)
			},
			maskClick(e) {
				console.log('----maskClick事件:', e);
			},
			goRule() {

			},
			...mapMutations(['setAmapInfo'])
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
		margin-top: 52px;
		padding: 20px;
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
		padding: 30px 24upx 0 24upx;

		.path {
			color: #007aff;
			display: inline-block;
			text-align: center;
		}
	}
</style>
