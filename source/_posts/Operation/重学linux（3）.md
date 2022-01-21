---
author: kawhicurry
title: 重学linux（3）.md
tags:
  - 专栏：重学linux
  - linux
description: 重学linux（3）.md
top: 0
cover: 0
categories:
  - Operation
date: 2022-01-21 09:48:31
img:
coverImg:
summary:
keywords:
---

# Linux磁盘与文件系统管理

## 磁盘与分区

命名：

- /dev/sa\[a-p\]\[1-128\]：物理磁盘的文件名
- /dev/sa\[a-d]\[1-128\]：虚拟磁盘的文件名

## 文件系统特性

### 索引式文件系统：FAT、ext2

- superblock：记录文件系统的整体信息
- inode：记录文件的属性
- data block：实际记录文件的内容

ext系列可以使用`dumpe2fs [dev]`来观测`superblock`。

xfs系统可以使用`xfs_info`

### 日志式文件系统

解决故障时存放数据与记录数据不一致的问题

查看linux支持的文件系统`cat /proc/filesystems`

## 文件系统的简单操作

### df du

### ln

硬链接不能对文件夹使用

## 磁盘的分区、格式化、检验与挂载

查看所有的磁盘`lsblk`

查看UUID（universally unique identifier）`blkid`

查看磁盘的分区信息`parted device_name print`

### 分区

**注**：MBR使用fdisk分区，GPT使用gdisk分区

#### 添加分区

```bash
gdisk the_device
p # 查看磁盘目前的状态
n # 开始新增分区
4 # partion number（第n个分区）
65026048 # first sector，某个inode的值
+1G # last sector，可以和上面一样输入某个inode，但更好的方式是输入+xG让软件自行计算，默认为用完所有容量
L # 或l，查看分区使用的文件系统
8300 # 默认的Linux 文件系统，其他值在上面可以看到
w # 确定分区
partprobe -s # 更新linux内核的分区表信息
```

#### 删除分区

```bash
fdisk the_device
d
```

#### fdisk与gdisk的区别

- fdisk通过m查看帮助，gdisk通过？
- fdisk面向小磁盘，处理MBR分区表，gdisk面向更大的磁盘，处理GPT分区表

其他注意：不要删除正在使用的分区，要先unmount

### 格式化

（今天先休息了，明天再看）
