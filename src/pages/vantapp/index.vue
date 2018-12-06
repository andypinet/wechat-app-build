<template>
  <div>
    <van-button>button</van-button>
    <van-button custom-class="a-btn-default">button</van-button>
  </div>
</template>

<script>
  export default {
    data() {
    }
  }
</script>

<style lang="scss">
  .van-button {
    &.a-btn-default {
      color: #428bca;
    }
  }
</style>
