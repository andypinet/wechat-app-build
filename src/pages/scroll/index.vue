<template>
  <view class="container">
    <view class="page-body">
      <view class="page-section message">
        <text wx:if="{{appear}}">
          小球出现
        </text>
        <text wx:else>
          小球消失
        </text>
      </view>
      <view class="page-section">
        <scroll-view class="scroll-view" scroll-y>
          <view class="scroll-area" style="{{appear ? 'background: #ccc' : ''}}">
            <text class="notice">向下滚动让小球出现</text>
            <view class="filling"></view>
            <view class="ball"></view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        appear: false,
      }
    },
    onLoad() {
      this._observer = wx.createIntersectionObserver(this)
      this._observer.relativeTo('.scroll-view').observe('.ball', res => {
        console.log(res)
        this.setData({
          appear: res.intersectionRatio > 0,
        })
      })
    },
    onUnload() {
      if (this._observer) this._observer.disconnect()
    },
  }
</script>

<style lang="scss">
  .scroll-view {
    height: 400rpx;
    background: #fff;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }

  .scroll-area {
    height: 1300rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: 0.5s;
  }

  .notice {
    margin-top: 150rpx;
  }

  .ball {
    width: 200rpx;
    height: 200rpx;
    background: #1aad19;
    border-radius: 50%;
  }

  .filling {
    height: 400rpx;
  }

  .message {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .message text {
    font-size: 40rpx;
    font-family: -apple-system-font, Helvetica Neue, Helvetica, sans-serif;
  }
</style>
