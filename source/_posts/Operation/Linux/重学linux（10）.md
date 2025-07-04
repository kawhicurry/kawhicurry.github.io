---
title: 重学linux（10）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_9371.JPG
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: a4d04884
date: 2022-03-02 14:45:24
---

# 磁盘配额（Quota）

多人模式下的磁盘容量分配，感觉用不到，略了。

# RAID

`Redundant Arrays of Inexpensive Disks`

已经熟悉这个话题了，稍微记一下

- raid0
- raid1
- raid1+0，raid0+1
- raid5，raid6
- 热备份磁盘：该磁盘不包含在阵列中，当阵列中磁盘有任何损坏时，该磁盘会被拉入阵列

## 硬件阵列

贵

## 软件阵列

### mdadm

| 参数              | 含义                               |
| ----------------- | ---------------------------------- |
| --create          | 建立raid                           |
| --auto=yes        |                                    |
| --chunk=Nk        | 决定设备的chunk大小                |
| --raid-devices=N  | 使用几个磁盘分区作为磁盘阵列的设备 |
| --spare-devices=N | 使用几个磁盘作为备用设备           |
| --level=[0,1,5]   | 阵列级别                           |
| --detail          | 显示磁盘阵列设备的详细信息         |
| --manage          | 管理磁盘                           |

# LVM

好东西，已经用过一次了，复习下。

- PV: Physical Volume
- VG: Volume Group
- PE: Physical Extent（会限制lvm的最大容量，现在不重要了）
- LV: Logical Volume

### 以下为建立流程

#### Disk阶段

gdisk分个区

#### PV阶段

```bash
pvcreate
pvscan
pvdisplay
pvremove
```

#### VG阶段

```bash
vgcreate
vgscan
vgdisplay
vgextend
vgreduce
vgchange
vgremote
```

#### LV阶段

```bash
lvcreate
lvscan
lvdisplay
lvextend
lvreduce
lvremove
lvresize
```

### 以下为放大流程

- vg阶段需要剩余的容量：`pvcreate`，`vgextend`
- LV阶段产生更多可用容量：`lvresize`
- 文件系统阶段的放大：`xfs_growfs`（注意，xfs只能放大，不能缩小（但是ext4有））

### LVM thin Volume

LVM动态调整磁盘使用率，即先声明大小，然后使用时分配（当然，一定不要超过实际的容量，不然会损坏数据）

### LV snapshot

在`lvcreate`时加入`-s`选项表示这是一个快照分区，这是个很有用的功能，但鸟哥给的不够详细。用到的时候再来看看。

