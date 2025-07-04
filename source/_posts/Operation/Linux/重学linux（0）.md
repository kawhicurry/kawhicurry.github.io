---
title: 重学linux（0）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0143.JPG
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: f7aa4615
date: 2022-01-18 10:12:01
---

# 把linux的操作再学一遍！

感受到了之前运维工作中的力不从心，于是乎决定再学一遍

路线是从鸟哥私房菜的第四章开始，跳过基础知识和安装的章节。

# 首次登录与在线求助

## 图形界面

这个略了，不是很想用。

只要记得有个`startx`用来启动`X Window`就行了。

## 初识命令行

### 登录提示

文件位于`/etc/issue`。使用`man issue`查看帮助，可知文件中反斜杠（escape）内容来自`agetty`，使用`man agetty`查询语义后可自定义该文件，示例：

```bash
Ubuntu 18.04.6 LTS \n \l

```

### prompt

小知识：

root的提示符为`#`

普通用户为`$`

### 查看语言支持

```bash
echo $LANG # 现在在用的语言
locale # 语言相关的设定
```

### 几个小工具，复习一下：

1. date：看时间
2. cal：看日历
3. bc：计算器

### 几个快捷键

1. tab：补全
2. ctrl+c：中断
3. ctrl+d：EOF（也相当于exit）
4. shift+page up/down：命令行中翻页

## 查看帮助

1. --help
2. man page（使用vim的操作模式）
3. info page（linux独有，使用节点的操作模式）
4. 查看`/usr/share/doc`

### 关于info page

1. 使用tab和上下移动
2. enter进入菜单，u键返回
3. n和p在子菜单之间移动
4. b和e跳到子菜单的第一个node和最后的node

## 最简单的文本编辑器

nano，反正我是不会用的

## 关机

### sync

手动同步到硬盘

### shutdown

冷知识：`/sbin/shutdown`

常用参数：

```bash
-k # 不是真关机，只是通知其他用户
-r # 重启
-h # 立即关机
-c # 取消关机
[time] # 设定时间，默认一分钟，举例：+10或10（10分钟），20:25（定时），now（现在）
```

### reboot/halt/poweroff

都是关机或重启

冷知识：`init 0`关机，`init 6`重启

区别

```bash
reboot # 重启
halt # 系统停止，但屏幕上会有系统停止的输出
poweroff # 系统关机，没电自然屏幕为空
```





