<template>
  <import src="../../static/test.wxml" />
  <template name="test-template">
    template 内容
  </template>
  <div>
    <view>测试文</view>
    <div>
      <template is="test-template"></template>
      <template is="outer-test"></template>
    </div>
    <div>
      <navigator url="/pages/scroll/index">IntersectionObserver</navigator>
      <navigator url="/pages/custom-navigation-bar/index">custom-navigation-bar</navigator>
    </div>

    <ui-marquee>
      <text slot="content">hello worldcontentWidthcontentWidthcontentWidthcontentWidthcontentWidthcontentWidth</text>
      <text slot="copy">hello worldcontentWidthcontentWidthcontentWidthcontentWidthcontentWidthcontentWidth</text>
    </ui-marquee>

    <view class="auc-image custom-style {{state}}">
        <view class="mask"></view>
        <image class="image"
                bind:load="onBindLoad"
                src="{{src}}" mode="widthFix"></image>
    </view>
    <view>computed: {{c}}</view>
    <test-c></test-c>

    <div bindtap="onClickModal">open Modal</div>
    <ui-modal show="{{showModal}}" height='60%' bindcancel="onModalCancel" bindconfirm='onModalConfirm'>
      <view class='modal-content'>你自己的布局</view>
    </ui-modal>
  </div>
</template>

<script>
let cdnserver = 'http://img.auntec.cn/gsxxcx/images/'

function assets(path, base = cdnserver) {
  return base + path + '?v=' + Date.now()
}

export default {
  mixins: [globalMixins.get('hello')],
  data() {
    return {
      state: 'unload',
      src: assets('banner1.png'),
      showModal: false
    }
  },
  computed: {
    c() {
      return `src: ${this.data.src}`;
    }
  },
  watch: {
    ['state'](val, oldVal) {
      console.log('new: %s, old: %s', val, oldVal);
    }
  },
  onLoad() {
    this.sayHello()
  },
  onBindLoad() {
    this.setData({
      state: 'loaded'
    })
  },
  // 操作modal
  onClickModal() {
    this.setData({
      showModal: true
    })
  },
  onModalCancel() {

  },
  onModalConfirm() {

  }
  // end 操作modal
}
</script>

<style lang="scss">
$base64image: 'data:image/png;base64,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';

.auc-image {
  position: relative;
}

.auc-image .image {
  width: 100%;
}
.auc-image .mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url(#{$base64image});
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgb(242, 242, 242);
  z-index: 1;
  opacity: 1;
  transition: opacity 2s ease, z-index 0.1s ease 2s;
}

.auc-image.loaded .mask {
  opacity: 0;
  z-index: -1;
}
</style>
