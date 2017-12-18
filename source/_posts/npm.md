---
title: npm包安装目录设置的坑
comments: true
date: 2016-06-24 22:00:43
updated: 2016-06-24 22:00:43
categories:
tags:
---
# npm初认识
学习的一段时间内, 发现了许多项目上提供本地安装都是直接输入命令`npm install (what)`来本地安装. 这种只需要敲敲命令就能安装实在吸引我. 后来我知道了`npm`是一个`Node.js`中的包管理工具. 但是我对`Node.js`和这种管理工具还不是很熟悉. 于是找了几本书, 查阅了几个文档, 看了一下知乎大神的回答. 整理了一下关于`Node.js`和`npm`的认识和思路.

# 前置概念

- Node.js

> 简单的说 `Node.js` 就是运行在服务端的 `JavaScript`。
`Node.js` 是一个基于`Chrome JavaScript` 运行时建立的一个平台。
`Node.js`是一个**事件驱动I/O服务端JavaScript环境**，基于`Google`的`V8`引擎，`V8`引擎执行`Javascript`的速度非常快，性能非常好。

- npm

> `npm`是随同`Node.js`一起安装的包管理工具

# Interesting

1. 在`Node.js`的环境中, `require({path})`函数相当于`C++`中的`#include`, 而一个文件中的`exports`对象, 相当于一个暴露在外面的接口(模块接口对象).

2. `Node.js`若`require({path})`中`{path}`只写文件名,不写路径,则`Node.js`将该文件视为`node_modules`目录下的一个文件. 有意思的是, 这个`node_modules`目录会逐渐冒泡到根目录下:

![require逐级查找](/images/require_search1.jpg)
![require逐级查找](/images/require_search2.jpg)

3. `npm install {package} -g`这个命令中`-g`代表全局安装, `Node.js`在查找模块时最终会寻找全局目录`NODE_PATH`, 这个目录可以在环境变量中设置, 可以输入命令`npm root -g`查看全局目录, 执行目录和全局目录是不同的:

![全局目录](/images/root.jpg)

注意到, 冒泡的目录没有包含到全局目录, 说明直接`node ***.js`没有开启`REPL`环境

