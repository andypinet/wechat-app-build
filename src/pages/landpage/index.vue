<template>
  <div>
    <mt-userinfo-btn
      bindapprove="onApprove"
      bindreject="onReject"
    >验证登录
    </mt-userinfo-btn>
  </div>
</template>

<script>
  // wxp.getSetting().then(res => {
  //   let hasUserInfoScope = res.authSetting[globalVariable.AuthSetting.userInfo]
  //   console.log(hasUserInfoScope)
  // })

  wxe.checkSetting('userInfo')

  export default {
    data() {
      return {}
    },
    attached: function () {
    },
    methods: {
      onApprove(e) {
        console.log('谢谢同意', e)
      },
      onReject(e) {
      },
    },
  }
</script>

<style lang="scss">

</style>
