# 微信小程序打包目录

[知乎文章地址](https://zhuanlan.zhihu.com/p/32905413)

1. lazy compile 
2. babel support
3. sass support
4. postcss support
5. scoped css
6. template

### 演示

支持使用vue的写法

index.wxc

```vue
<template>
    <view class="test-c-a">{{message}}</view>
</template>

<script lang="js">
    export default {
        data() {
            return {
                message: "组件a"
            }
        }
    }
</script>

<style lang="scss" scoped>
    .test-c-a {
        color: blue;
    }
</style>
```

index.js可以使用template/wxc.js改变


### 安装 

```
npm install
```

### 编译

```
node webpack.build.js
```

