<template>
	<view class="content">
		<button type="primary" @click="login">登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			}
		},
		onLoad() {
			if (uni.getStorageSync('uni_id_token_expired') > Date.now()) {
				uni.navigateTo({
					url: '/pages/goods/goods'
				})
			}
		},
		methods: {
			login() {
				uni.showLoading({
					title: '登录中...',
					mask: true
				})
				new Promise((resolve, reject) => {
					uni.getProvider({
						service: 'oauth',
						success(res) {
							resolve(res.provider)
						},
						fail(err) {
							reject(new Error(err.errMsg))
						}
					})
				}).then((provider) => {
					return new Promise((resolve, reject) => {
						uni.login({
							provider,
							success: (res) => {
								resolve({
									code: res.code,
									provider
								})
							},
							fail: (err) => {
								reject(new Error(err.errMsg))
							}
						})
					})
				}).then(({
					code,
					provider
				}) => {
					return uniCloud.callFunction({
						name: 'user-center',
						data: {
							action: provider.indexOf('weixin') > -1  ? 'loginByWeixin' : 'loginByAlipay',
							params: {
								code
							}
						}
					})
				}).then((res) => {
					console.log(res);
					if (res.result.code === 0) {
						uni.hideLoading()
						// 如果使用2.7.15及以上版本建议存为uni_id_token
						uni.setStorageSync('uniIdToken', res.result.token)
						uni.setStorageSync('uni_id_token_expired', res.result.tokenExpired)
						uni.navigateTo({
							url: '/pages/goods/goods'
						})
					} else {
						throw new Error(res.result.msg)
					}
				}).catch((err) => {
					uni.hideLoading()
					uni.showModal({
						content: err.message || '登录失败',
						showCancel: false
					})
				})

			}
		}
	}
</script>

<style>
</style>
