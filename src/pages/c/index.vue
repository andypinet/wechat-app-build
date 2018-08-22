<template>
  <view b:class="{message}; {message + 1}; {message + 2}" >
    <text v-for="item in items" :key="item.id">{{item}}</text>
    <text v-for="(item,key) in items" :key="item.id">{{item}} {{key}}</text>
    <text v-if="show">if</text>
    <button bind:tap="onTaped">button</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      message: 'com-a',
      show: true,
      items: [1, 2]
    }
  },
  methods: {
    onTaped() {}
  }
}
</script>

<style lang="scss">
</style>
