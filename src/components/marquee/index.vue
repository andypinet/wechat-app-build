<template>
  <view id="container" class="marquee_container">
    <view class="marquee_con" style="transform: translateX({{translateStyle}})">
      <view id="content" class="marquee_text">
        <slot name="content"></slot>
      </view>
      <view class="marquee_text">
        <slot name="copy"></slot>
      </view>
    </view>
  </view>
</template>

<script>
let animation = wx.createAnimation({
  duration: 1000
})

export default {
  options: {
    multipleSlots: true
  },
  attached() {
    let self = this
    setTimeout(() => {
      this.select('#container', containerWdidth => {
        this.select('#content', contentWidth => {
          if (contentWidth > containerWdidth) {
            self.setData({
              maxWidth: contentWidth,
              useAnimation: true
            })
            self.start()
          }
        })
      })
    }, 310)
  },
  data() {
    return {
      useAnimation: false,
      maxWidth: 0,
      translateX: 0,
      translateStyle: ''
    }
  },
  methods: {
    select(sel, fun) {
      let self = this
      let c = wx
        .createSelectorQuery()
        .in(this)
        .select(sel)
      c &&
        c
          .boundingClientRect(rect => {
            if (rect && rect.width) {
              fun(rect.width)
            }
          })
          .exec()
    },
    step() {
      let self = this
      let curTransx = self.data.translateX
      let max = self.data.maxWidth
      curTransx = curTransx + 1
      self.setData({
        translateX: curTransx,
        translateStyle: `-${curTransx}px`
      })
      if (curTransx < max) {
        requestAnimationFrame(self.step.bind(self))
      } else {
        self.onEnd()
      }
    },
    onEnd() {
      let self = this
      self.setData({
        translateX: 0,
        translateStyle: `0px`
      })
      self.start()
    },
    start() {
      requestAnimationFrame(this.step.bind(this))
    }
  }
}
</script>

<style lang="scss">
@keyframes around {
  from {
    margin-left: 100%;
  }
  to {
    margin-left: var(--marqueeWidth--); // var接受传入的变量
  }
}
.marquee_container {
  position: relative;
}
.marquee_con {
  display: inline-block;
  white-space: nowrap;
}
.marquee_text {
  display: inline-block;
  white-space: nowrap;
  // animation-name: around;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
</style>
