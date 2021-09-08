<template>
  <view class="content">
    <view class="list">
      <view class="goods-item" v-for="(item, index) in goodsList" :key="index">
        <view>商品名：{{ item.name }}</view>
        <view>价格：{{ item.price / 100 }}元</view>
      </view>
    </view>
    <view class="order-info">
      <view>
        <view>总金额：{{ totalFee / 100 }}元</view>
        <view v-if="status">订单状态：{{ statusText[status - 1] }}</view>
      </view>
    </view>
    <!-- #ifndef H5 -->
    <button v-if="status !== 2" type="primary" @click="pay">支付</button>
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <button v-if="!codeUrl && status !== 2" type="primary" @click="pay">获取支付二维码</button>
    <template v-if="codeUrl && status !== 2">
      <canvas canvas-id="qrcode" style="width: 300px;height: 300px;" />
      <button type="primary" @click="orderQuery">我已完成支付</button>
    </template>
    <!-- #endif -->
  </view>
</template>

<script>
  import uQRCode from '@/js_sdk/Sansnn-uQRCode/uqrcode.js'
  export default {
    data() {
      return {
        userId: '123456',
        goodsList: [],
        totalFee: 0,
        status: 0,
        statusText: ['未支付', '已支付'],
        codeUrl: ''
      }
    },
    onLoad(options) {
      let outTradeNo = options.outTradeNo
      this.outTradeNo = outTradeNo
      uni.showLoading({
        title: '正在获取商品列表',
        mask: true
      })
      uniCloud.callFunction({
        name: 'get-order-detail',
        data: {
          outTradeNo
        }
      }).then((res) => {
        console.log(res);
        uni.hideLoading()
        if (res.result.goodsList && res.result.goodsList.length > 0) {
          this.goodsList.splice(0, 0, ...res.result.goodsList)
          this.totalFee = res.result.totalFee
          this.status = res.result.status
        } else {
          throw new Error('获取商品列表失败')
        }
      }).catch((err) => {
        console.log(err);
        uni.hideLoading()
        uni.showModal({
          content: err.message || '获取商品列表失败',
          showCancel: false
        })
      })
    },
    methods: {
      // #ifdef H5
      pay() {
        const providerList = ['wxpay', 'alipay']
        let selectedProvider = ''
        new Promise((resolve, reject) => {
          uni.showActionSheet({
            itemList: providerList,
            success(res) {
              resolve(providerList[res.tapIndex])
            },
            fail() {
              reject(new Error('取消支付'))
            }
          })
        }).then((provider) => {
          selectedProvider = provider
          return uniCloud.callFunction({
            name: 'pay',
            data: {
              provider,
              outTradeNo: this.outTradeNo
            }
          })
        }).then((res) => {
          console.log(res);
          this.codeUrl = res.result.orderInfo.codeUrl
          return uQRCode.make({
            canvasId: 'qrcode',
            componentInstance: this,
            text: this.codeUrl,
            size: 300,
            margin: 10,
            backgroundColor: '#ffffff',
            foregroundColor: '#000000',
            fileType: 'jpg',
            correctLevel: uQRCode.errorCorrectLevel.H
          })
        }).catch((err) => {
          uni.showModal({
            content: err.message || '获取支付二维码失败',
            showCancel: false
          })
        })
      },
      orderQuery() {
        uniCloud.callFunction({
          name: 'order-query',
          data: {
            outTradeNo: this.outTradeNo
          }
        }).then((res) => {
          if (res.result.orderPaid) {
            this.status = 2
            uni.showModal({
              content: '订单已支付',
              showCancel: false
            })
          } else {
            uni.showModal({
              content: '订单未支付',
              showCancel: false
            })
          }
        }).catch((e) => {
          uni.showModal({
            content: '查询订单状态失败，请稍后再试',
            showCancel: false
          })
        })
      },
      // #endif
      // #ifndef H5
      pay() {
        let selectedProvider = ''
        new Promise((resolve, reject) => {
          uni.getProvider({
            service: 'payment',
            success(res) {
              resolve(res.provider)
            },
            fail() {
              reject(new Error('获取支付方式失败'))
            }
          })
        }).then((providerList) => {
          return new Promise((resolve, reject) => {
            uni.showActionSheet({
              itemList: providerList,
              success(res) {
                resolve(providerList[res.tapIndex])
              },
              fail() {
                reject(new Error('取消支付'))
              }
            })
          })

        }).then((provider) => {
          selectedProvider = provider
          return uniCloud.callFunction({
            name: 'pay',
            data: {
              provider,
              outTradeNo: this.outTradeNo
            }
          })
        }).then((res) => {
          console.log(res);
          if (res.result.orderInfo) {
            return new Promise((resolve, reject) => {
              uni.requestPayment({
                // #ifdef APP-PLUS
                provider: selectedProvider,
                // #endif
                // #ifdef MP-WEIXIN
                ...res.result.orderInfo,
                // #endif
                // #ifdef APP-PLUS || MP-ALIPAY
                orderInfo: res.result.orderInfo,
                // #endif
                complete() {
                  resolve(res.result.outTradeNo)
                }
              })
            })
          } else {
            throw new Error(res.result.msg)
          }
        }).then((outTradeNo) => {
          return uniCloud.callFunction({
            name: 'order-query',
            data: {
              outTradeNo
            }
          })
        }).then((res) => {
          if (res.result.orderPaid) {
            this.status = 2
            uni.showModal({
              content: '订单已支付',
              showCancel: false
            })
          } else {
            uni.showModal({
              content: '订单未支付',
              showCancel: false
            })
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '支付失败',
            showCancel: false
          })
        })

      }

      // #endif
    }
  }
</script>

<style>
</style>
