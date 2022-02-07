---
title: 重学linux（3）.md
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
date: 2022-01-21 09:48:31
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

### 分区

#### 查看分区信息

查看所有的磁盘`lsblk`

查看UUID（universally unique identifier）`blkid`

查看磁盘的分区信息`parted device_name print`

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

```bash
# mkfs
mkfs.xfs device #格式化为xfs文件系统
mkfs.ext4 device # 格式化为ext4
```

| 参数 | 内容                                    |
| ---- | --------------------------------------- |
| -b   | 区块容量，512到64k，最大限制为linux的4k |
| -L   | 文件系统标头的名称，Label name          |
| -f   | 强制格式化                              |

ext4的默认配置位于`/etc/mke2fs.conf`中 

#### 格式化中的调优

- agcount：按照cpu的线程数来确定，`grep processor | /proc/cpuinfo`
- stripe：阵列里有特殊优化
- sw：整列中盘数-1
- extsize：数据宽度（swidth）stripe\*sw

### 校验

- xfs：`xfs_repair`
- ext4：`fsck.ext4`

### 挂载

 ```bash
 # mount
 mount [-t filesystem] LABEL='' mount_point
 mount UUID='' mount_point
 mount device_name mount_point
 
 mount -o remount,rm,auto / # 重新挂载根目录
 ```

```bash
# umount
umount device_name
umount mount_point
```

#### 修改硬件类型

linux中一切皆文件，而设备使用两个数字来表示其类型

- major：主要设备代码
- minor：次要设备代码

使用`mknod`修改设备类型

```bash
mknod device [bcp] [Major] [Minor]
```

#### 添加文件系统的UUID和Label

- xfs：使用`xfs_admin`
- ext4：使用`tune2fs`

**注**：为什么要使用UUID来进行挂载而不是简单的使用设备文件名?因为你无法保证该设备在所有linux系统中都有相同的文件名。

## 设置启动挂载

 修改以下文件，参数在文件中会有注释说明的

- `/etc/fstab`：普通硬盘挂载等
- `/etc/mtab`：让镜像文件在不刻录的情况下读取，使用loop挂载

## swap分区

#### 使用物理分区

1. 先分一块区出来
2. `mkswap device`
3. `free`看一眼成了 没

#### 使用文件

1. `dd`建立一个空的大文件
2. `mkswap filename`
3. 同上

*注*：dd在后面讲

## parted分区

```bash
# parted [device] [command[arguments]]
# command
# 	mkpart [primary|logical|Extended] [ext4|vfat|xfs] start end
#	print
#	rm [partition]
# notice: start end use capacity(default MB) as unit
parted /dev/vda mkpart primary fat32 36.0GB 36.5GB
```

