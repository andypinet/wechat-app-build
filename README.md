# 微信小程序打包目录

[知乎文章地址](https://zhuanlan.zhihu.com/p/32905413)

1. lazy compile 
2. babel support
3. sass support
4. postcss support
5. scoped css
6. template

### 简介

wxc -> 小程序标准组件
wxp -> 小程序标注页面 

支持使用vue的写法去编写小程序

index.wxc

```vue
<template>
    <view b:class="#{$IS}; {message + 1}; {message + 2};" >
        <text>#{$IS}</text>
        <text>{{message}}</text>
        <button>button</button>
    </view>
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
    .#{$IS} {
        color: blue;
    }
</style>
```

1. 支持b:前缀可以不使用括号
2. template里使用组件名常量 #{$IS}
3. scss里使用组件名常量 $IS

生成的js文件可以使用template/wxc.js改变


### 安装 

```
npm install
```

### 编译

```
node webpack.build.js
```

