<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	.content {
		padding: 15px;
	}

	.goods-item,
	.order-info {
		padding: 10px 0px;
		line-height: 30px;
		font-size: 16px;
	}

	.content input {
		height: 40px;
		line-height: 40px;
		padding: 0px 15px;
		border: solid 1px #999999;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.content input,
	.content button {
		margin-bottom: 15px;
	}
</style>
