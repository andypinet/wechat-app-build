<template>
  <button
    open-type="getUserInfo"
    bindgetuserinfo="onGetUserInfo"
    binderror="onError"
  >
    <slot></slot>
  </button>
</template>

<script>

  export default {
    behaviors: [
    ],
    data() {
      return {}
    },
    attached: function () {
    },
    methods: {
      onGetUserInfo(e) {
        console.d(e)
        let detail = e.detail || {}
        if (detail.errMsg && detail.errMsg.indexOf('fail') > -1) {
          this.$emit('reject', {
            e
          })
          return
        }
        this.$emit('approve', {
          detail,
          e
        })
      },
      onError(e) {
        console.error(e)
        if (e.type === 'getuserinfo') {
          //  处理getuserinfo失败code
          this.$emit('reject', {
            e
          })
        }
        this.$emit('error', {
          e
        })
      }
    },
  }
</script>

<style lang="scss">

</style>
