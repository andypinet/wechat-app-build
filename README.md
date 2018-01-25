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
        <text @:for="items">{{item}}</text>
        <text @:for="item in items">{{item}}</text>
        <text @:for="(item,key) in items">{{item}}</text>
        <text @:if="show">if</text>
        <button>button</button>
    </view>
</template>

<script lang="js">
    export default {
        data() {
            return {
                message: "组件a",
                show: true,
                items: [
                    1,
                    2
                ]
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

compiled

index.wxml

```html
<view class="file__test-c-a---196Pr {{message + 1}} {{message + 2}} ">
  <text>test-c-a</text>
  <text wx:for="{{items}}">{{item}}</text>
  <text wx:for="{{items}}" wx:for-item="{{item}}">{{item}}</text>
  <text wx:for="{{items}}" wx:for-item="{{item}}" wx:for-index="{{key}}">{{item}}</text>
  <text wx:if="{{show}}">if</text>

  <button>button</button>
</view>
```

index.wxss

```css
.file__test-c-a---196Pr {
  color: blue; }
```

index.js

```javascript
let js = {};
(function (exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    data: function data() {
        return {
            message: "组件a",
            show: true,
            items: [1, 2]
        };
    }
};

})(js);
let component = js.default;
component.data = js.default.data();
Component(component)
```

1. 支持微信属性简写
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

