---
author: kawhicurry
title: 记录一次docker迁移
tags:
  - docker
  - mirror
description: 记录一次docker迁移
top: 0
cover: 0
categories:
  - Operation
date: 2022-01-13 13:55:28
img:
coverImg:
summary:
keywords:
---

最近碰上一次小小的迁移任务，需要在新机器上起docker，并让原来的docker容器在新机器上跑起来。

这里就涉及到，要查看已经跑起来的容器在启动时输入了哪些参数。实际操作起来有以下几个方法：

## docker ps -a --no-trunc

一个简单的方法，但只能看到部分信息

## docker inspect "container"

可以看到许多详细的信息，但过于详细了，不容易提取出关键信息

## runlike

```bash
pip install runlike
```
一个小工具，只需`runlike "container id"`即可获取其启动时的参数

唯一需要注意的是，runlike不会复原是否会以交互或后台方式启动的参数，所以应该按需要加入`-itd`选项