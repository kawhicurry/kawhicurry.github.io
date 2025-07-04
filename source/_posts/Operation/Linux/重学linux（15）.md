---
title: 重学linux（15）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0132.JPG
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 930eb8b6
date: 2022-03-08 19:44:15
---

# Linux的启动流程

## 启动流程一览

- 加载`bios`的硬件信息和自检，根据设置取得第一个可启动的设备
- 读取并执行第一个启动设备内的`MRB`的启动引导程序（`grub2`，`spfdisk`等）
- 根据启动引导程序的设置加载`kernel`，`kernel`开始检测硬件和加载驱动程序
- 硬件驱动成功后，`kernel`主动调用`systemd`程序，以`default.target`准备操作系统
  - `systemd`执行`sysinit.target`初始化系统及`basic.target`准备操作系统
  - `systemd`执行`multi-user.target`下的本机与服务器服务
  - `systemd`执行`multi-user.target`下的`/etc/rc.d/rc.local`文件
  - `systemd`执行`multi-user.target`下的`getty.target`文件
  - `systemd`执行`graphical`所需的服务

## BIOS、boot loader与kernel加载

### BIOS

指定第一个读取的MBR分区，MBR分区中有boot loader

### boot loader

boot loader的三个功能

- 提供选项（多重引导的重要性）
- 加载内核文件（主要任务）
- 转交给其他loader

loader在操作系统内部，linux可选择是否安装到MBR分区，而windows会自动安装到MBR分区。（所以如果要装双系统，一定要先装windows）

### kernel加载

linux kernel将内核解压缩至内存中，并使用内核功能检测和驱动周边设备，*而不一定会使用BIOS的信息*。

一个矛盾：kernel为了检测硬件需要读取`/lib/modules`下的驱动程序，但是又没有硬盘的驱动程序，因此无法读取。

解决办法：boot loader除了启动kernel，还启动了一个`initramfs`（虚拟文件系统）。这个文件解压缩后在内存中模拟成一个根目录，且提供一个可执行的程序，该程序允许用来加载启动过程中所需要的模块，通常是USB、RAID、LVM等文件系统和硬盘接口的驱动程序 。

之后，就可以开始执行第一个程序了

## systemd和default.target

### target与runlevel

System V的runlevel已经被启用了，但还是可以用诸如`init n`之类命令，只不过相当于（文件被链接过去了）是执行了`systemctl isolate *.target`。

### systemd的处理流程

后面一大段都略了，都是介绍具体启动了啥

# 内核与内核模块

一些内核相关文件位置

- 内核：/kernel/vmlinuz{-version}
- 内核解压缩所需RAM DISK：/boot/initramfs{-version}
- 内核模块：/lib/modules/version/kernel
- 内核源码：/usr/src/linux或/usr/src/kernels（需外部安装）
- 内核版本：/proc/version
- 系统内核功能：/proc/sys/kernel/

## 内核模块与依赖性

在`/lib/modules/$(uame -r)/kernel`下，有如下目录

- arch：硬件相关，如cpu等级
- crypto：内核所支持的加密技术，如md5
- drivers：硬件驱动
- fs：文件系统
- lib：函数库
- net：网络协议相关
- sound：声音相关

如何检查其依赖性？查看`/lib/modules/$(uname -r)/modules.dep`文件，该文件通过`depmod`来建立

###  查看内核模块

`lsmod`

`modinfo`

### 内核模块的加载与删除

`insmod`

`rmmod`

`modprobe`

### 内核模块的参数

略

# Boot Loader：Grub2

## boot loader的两个stage

- stage1：执行boot loader主程序
- stage2：主程序加载配置文件

## grub2的配置文件

`/boot/grub2/grub.cfg`

这个文件不建议直接改，而是通过修改其他几个文件，然后使用`grub2-mkconfig`来重新生成该文件。

### grub2配置文件的维护

`/etc/default/grub`和`/etc/grub.d`

- 直接指定某个内核启动
- 通过chainloader移交loader控制权

### initramfs的重要性与建立新initramfs文件

`dracut`

`mkinitrd`

### 测试与安装grub2

`grub2-install`

### 启动前的额外功能更改

指在grub2启动界面下按`e`

### 启动画面与终端画面的图形显示方式

`/etc/default/grub`下设置终端的分辨率等

### 为个别选项设置密码

grub2有模拟linux的账号管理方案

# 启动过程中的问题解决

## 忘记root密码

1. 在grub2界面使用edit功能，在内核启动项后加入`rb.break`参数，然后`ctrl+x`重启，这样相当于进入了RAM disk环境
2. 使用`mount`检查`/sysroot`是否已经挂载（这是真正的linux系统）
3. `chroot /sysroot`切换根目录（暂时的）
4. `passwd`修改密码
5. 建立`/.autorelabel`文件（用于自动修复`SELinux`的安全上下文）

## 直接以root启动bash

内核参数后面跟一个`init=/bin/bash`即可，当然，这样还要remount根目录。这样也是进入rescue模式

## 文件系统错误而无法启动

略
