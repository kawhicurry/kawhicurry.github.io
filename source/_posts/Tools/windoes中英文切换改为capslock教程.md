---
title: windoes中英文切换改为capslock教程
cover: 'https://cdn.jsdelivr.net/gh/kawhicurry/picgo/gallery/nord/DSC_0147.JPG'
categories:
  - Tools
abbrlink: 45bb8011
date: 2025-02-15 14:08:14
tags:
---

Mac输入法有一点非常讨喜，就是把平时不会用到的CapsLock按键，改为了中英文输入法切换。

于是研究了下win下是否也能支持类似的功能，发现还真行。刚好blog很久没更新了，顺便来更新下

## 前置知识

我的环境是win11，原理很简单：

1. 取消原来capslock的大小写切换功能
2. 取消原来的shift切换输入法功能（这一步可选，但是建议和mac的体验保持一致）
3. 把capslock的大小写切换功能绑定为输入法切换

可以看到最有难度的地方其实是第3步，所以要先介绍下这里的工具：微软官方提供的[powertoys](https://learn.microsoft.com/en-us/windows/powertoys/)。
这个工具直接支持了任意键位的修改，包括capslock。

## 步骤

### 关系capslock大小写

打开windows设置 *时间和语言 > 输入 > 高级键盘设置 > 输入语言热键*，随后会弹出一个控制面板的菜单（没错，还是windoes祖传的控制面板菜单），把要关闭Caps Lock 的选项由默认的 *按CAPS LOCK键* 修改为 *按SHIFT键*。

这时候的键盘行为应该是，按下Caps Lock后，输入法会切换到大写。再次按下Caps Lock后，输入法无反应，此时按下shift，输入法会切换回小写。

### 取消shift切换输入法功能

这一步在windows设置的 *时间和语言 > 语言和区域 > 微软拼音输入法 > 按键* 里面。比较有意思的是这个设置虽然在设置里，直接从win11的设置按钮中并不能直接打开，得从windows菜单栏右下角状态栏输入法的右键菜单 *设置 > 按键* 打开。

打开后取消 模式切换中的额 `shift`，但是注意要保留 `Ctrl + 空格键`，在下一步，我们会把`CapsLock`绑定到`Ctrl + 空格键`。

### 3. 下载PowerToys，绑定CapsLock为输入法切换

先再贴一遍链接：https://learn.microsoft.com/en-us/windows/powertoys/

下载完成后建议先重启下，笔者第一次安装后立刻使用，似乎碰到了一些未定义的行为，重启后就好了。

重启后选择左侧 *仪表盘 > 输入/输出 > 键盘管理器*，点开 *按键 > 重新映射键*，左侧点击 选择，然后键入 CapsLock，右侧点击 选择，然后键入 Ctrl + 空格键，点击 *添加*，然后点击 *应用*。这时候再按下CapsLock，输入法应该会切换了。

## 题外话

又看了下刚刚装的这个Powertoys功能，比如[让鼠标在多台win之间流转](https://learn.microsoft.com/zh-cn/windows/powertoys/mouse-without-borders)，或是对标bashrc的[环境变量管理](https://learn.microsoft.com/zh-cn/windows/powertoys/environment-variables)

这些留到以后再探索，今天先记录到这里，主要是很久没写blog了，浅更新下~
