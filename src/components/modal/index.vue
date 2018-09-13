<template>
  <view class='mask' wx:if='{{show}}' bindtap='clickMask'>
    <view class='modal-content' style='height:{{height}}'>
      <scroll-view scroll-y class='main-content'>
        <slot></slot>
      </scroll-view>
      <view class='modal-btn-wrapper'>
        <view class='cancel-btn' style='color:rgba(7,17,27,0.6)' bindtap='cancel'>取消</view>
        <view class='confirm-btn' style='color:#13b5f5' bindtap='confirm'>确定</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  /**
   * 组件的属性列表
   */
  properties: {
    //是否显示modal
    show: {
      type: Boolean,
      value: false
    },
    //modal的高度
    height: {
      type: String,
      value: '80%'
    }
  },
  data() {
    return {

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    clickMask() {
      // this.setData({show: false})
    },

    cancel() {
      this.setData({ show: false })
      this.triggerEvent('cancel')
    },

    confirm() {
      this.setData({ show: false })
      this.triggerEvent('confirm')
    }
  }
}
</script>

<style lang="scss">
.mask{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.4);
  z-index: 9999;
}

.modal-content{
  display: flex;
  flex-direction: column;
  width: 90%;
  /* height: 80%; */
  background-color: #fff;
  border-radius: 10rpx;
}

.modal-btn-wrapper{
  display: flex;
  flex-direction: row;
  height: 100rpx;
  line-height: 100rpx;
  border-top: 2rpx solid rgba(7,17,27,0.1);
}

.cancel-btn, .confirm-btn{
  flex: 1;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 32rpx;
}

.cancel-btn{
  border-right: 2rpx solid rgba(7,17,27,0.1);
}

.main-content{
  flex: 1;
  height: 100%;
  overflow-y: hidden;
}
</style>
