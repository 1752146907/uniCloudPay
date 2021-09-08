<template>
	<view class="content">
		<view class="input">
			<input type="text" v-model="username" placeholder="用户名/邮箱/手机号" />
		</view>
		<view class="input">
			<input type="text" v-model="password" password="true" placeholder="密码" />
		</view>
		<button type="default" @tap="register">注册</button>
		<button type="default" @tap="login">登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				username: '',
				password: ''
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
			register() {
				uni.showLoading({
					title: '登录中...',
					mask: true
				})
				uniCloud.callFunction({
					name: 'user-center',
					data: {
						action: 'register',
						params: {
							username: this.username,
							password: this.password
						}
					},
					success(e) {
						uni.hideLoading()
						uni.showModal({
							showCancel: false,
							content: JSON.stringify(e.result)
						})
						if (e.result.code === 0) {
							// 如果使用2.7.15及以上版本建议存为uni_id_token
							uni.setStorageSync('uniIdToken', e.result.token)
							uni.setStorageSync('uni_id_token_expired', e.result.tokenExpired)
							uni.navigateTo({
								url: '/pages/goods/goods'
							})
						}
					},
					fail(e) {
						uni.hideLoading()
						console.error(e)
						uni.showModal({
							showCancel: false,
							content: '注册失败，请稍后再试'
						})
					}
				})
			},
			login() {
				uniCloud.callFunction({
					name: 'user-center',
					data: {
						action: 'login',
						params: {
							username: this.username,
							password: this.password
						}
					},
					success(e) {
						uni.showModal({
							showCancel: false,
							content: JSON.stringify(e.result)
						})
						if (e.result.code === 0) {
							uni.setStorageSync('uniIdToken', e.result.token)
							uni.setStorageSync('uni_id_token_expired', e.result.tokenExpired)
							uni.navigateTo({
								url: '/pages/goods/goods'
							})
						}
					},
					fail(e) {
						console.error(e)
						uni.showModal({
							showCancel: false,
							content: '登录失败，请稍后再试'
						})
					}
				})
			},
		}
	}
</script>

<style>
	
</style>
