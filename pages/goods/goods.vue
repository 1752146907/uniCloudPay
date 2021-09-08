<template>
	<view class="content">
		<view class="list">
			<view class="goods-item" v-for="(item, index) in goodsList" :key="index">
				<view>商品名：{{ item.name }}</view>
				<view>价格：{{ item.price / 100 }}元</view>
			</view>
		</view>
		<button type="primary" @click="order">下单</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userId: '123456',
				goodsList: []
			}
		},
		onLoad() {
			uni.showLoading({
				title: '正在获取商品列表',
				mask: true
			})
			uniCloud.callFunction({
				name: 'list-goods'
			}).then((res) => {
				uni.hideLoading()
				if (res.result.goodsList && res.result.goodsList.length > 0) {
					this.goodsList.splice(0, 0, ...res.result.goodsList)
				} else {
					throw new Error('获取商品列表失败')
				}
			}).catch((err) => {
				uni.hideLoading()
				uni.showModal({
					content: err.message || '获取商品列表失败',
					showCancel: false
				})
			})
		},
		methods: {
			order() {
				uniCloud.callFunction({
					name: 'order',
					data: {
						goodsInOrder: this.goodsList.map((item) => {
							return {
								id: item._id,
								// 本示例为每种商品购买一件，方便演示
								amount: 1
							}
						})
					}
				}).then((res) => {
					if (res.result.outTradeNo) {
						uni.navigateTo({
							url: '/pages/order/order?outTradeNo=' + res.result.outTradeNo
						})
					} else {
						throw new Error(res.result.msg)
					}
				}).catch((err) => {
					uni.showModal({
						content: err.message || '下单失败',
						showCancel: false
					})
				})
			}
		},
	}
</script>

<style>
</style>
