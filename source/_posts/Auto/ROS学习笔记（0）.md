---
author: kawhicurry
title: ROS学习笔记（0）
tags:
  - linux
  - ros
  - 专栏：ros学习笔记
description: ROS学习笔记（0）
top: 0
cover: 0
categories:
  - Auto
date: 2022-01-15 14:51:00
img:
coverImg:
summary:
keywords:
---

# 开始

要开始学机器人咯，从ros开始的那种。有人说不要通过ros来学机器人，没有关系撒。先看看机器人咋样再说。

官网：<https://www.ros.org/>

文档：<http://wiki.ros.org/>

教程：<http://wiki.ros.org/ROS/Tutorials>

# 装环境

看官方教程，据李总说有很多坑，不过目前看来感觉还好（虽然确实踩了一脚）。

首先是选发行版吧，ros其实就是一堆工具包，底层还是要依赖别的Operation System的。我选择的方案是先上虚拟机，用apollo那台ubuntu18.04来配。这里李总给的建议是用`ROS Melodic Morenia`，就是melodic这个版本，它确实也说了这句

> ROS Melodic Morenia is primarily targeted at the Ubuntu 18.04 (Bionic) release, though other Linux systems as well as Mac OS X, Android, and Windows are supported to varying degrees.

整挺好，专门适配18.04，那就不客气了。上链接<http://wiki.ros.org/melodic/Installation/Ubuntu>

这玩意一上来就坑人，他让我用他的源，结果公钥匹配过不了。还好有经验，点了那个mirror发现有清华源。把整个ubuntu的源换成清华源并按照清华源官方的文档加入`source.list`之后就可以直接`apt install`了。第一次装毫无疑问是无脑`full installation`。

然后按照它说的environment setup把脚本加入`./.bashrc`里（完全不知道这步在干什么呢，晚点回来看一眼）

后面的`Dependencies for building packages`又来坑人了。他给的

```bash
sudo apt install python-rosdep python-rosinstall python-rosinstall-generator python-wstool build-essential
```

确实是能跑的，但下一步

```bash
sudo rosdep init
rosdep update
```

就出问题了，`sudo rosdep init`会说ubuntu版本不对。查了下发现另一篇文章里是这么写的

```bash
sudo apt install python3-rosdep
```

好家伙有python3为啥不用3，然后直接这么输会发现无法安装，因为`python3-rosdep`要依赖`python3-rosinstall`，也就是说我装了python2的都得换成python3，彳亍。我还得把上面的包全给删了，然后重新输

```bash
sudo apt install python3-rosdep python3-rosinstall python3-rosinstall-generator python3-wstool
```

然后就回到上面`init`那一步了，这步据说会出网络问题，随便贴个网上的解决方案吧：<https://blog.csdn.net/qq_41484927/article/details/107494715>，网上一搜一大把。我选择直接挂梯子（

这里需要注意的一点是`sudo rosdep init`，是要加`sudo`的，而`rosdep update`是万万不能加的，虽然不知道会怎么样，但毕竟官方文档说了这事：

> Do **NOT** run `rosdep update` with sudo. It is not required and will result in permission errors later on.

这玩意前面还有个大感叹号呢，注意点。

先到这里，收拾东西准备回家去了。
