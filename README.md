# 微信小程序打包目录

本项目曾今一度做不下去 但是小程序2.2.3发布后 提供了组件开全局样式 和 自定义过滤组件的能力 至此决定开始自研框架之旅 虽然性能不咋的 但是定制灵活

[知乎文章地址](https://zhuanlan.zhihu.com/p/32905413)

1. babel support
2. sass support
3. postcss support

### 简介

现有的小程序开发环境是不灵活的 不同的项目需要不同的依赖 所以最好的方式就是用template自定义

支持使用类似vue的写法去编写小程序

文件index.json中有component为true 就定义为component


生成的components js文件可以使用template/wxc.js改变
生成的pages js文件可以使用template/wxp.js改变

### 特色

默认的模板
1. 提供 page mixins 支持
2. 提供 async await 支持
3. 提供 es2016+ 支持
4. 提供 sass 支持
5. 提供 postcss 支持
6。提供一些 behaviors 支持 (sdk >= 2.2.3)

### 安装

```
npm install
```

关于 node-sass

```
npm set sass_binary_site https://cdn.npm.taobao.org/dist/node-sass
```

### 编译小程序vue

```
npm run watch:mina
```

### 项目级

```
webpack
```

### gulp 文件级修复

```
gulp w
```
