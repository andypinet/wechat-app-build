<template>
  <view b:class="{message}; {message + 1}; {message + 2}" >
    <text v-for="item in items" :key="item.id">{{item}}</text>
    <text v-for="(item,key) in items" :key="item.id">{{item}} {{key}}</text>
    <text v-if="show">if</text>
    <view>computed: {{b}}</view>
    <button bind:tap="onTaped">button</button>
  </view>
</template>


<script>
export default {
  data() {
    return {
      message: 'com',
      show: true,
      items: [1, 2]
    }
  },
  computed: {
    b() {
      return this.data.message + ' computed'
    }
  },
  methods: {
    onTaped() {
      this.setData({
        message: 'tapped'
      })
    }
  }
}
</script>

<style lang="scss">
</style>