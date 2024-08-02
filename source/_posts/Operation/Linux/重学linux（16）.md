---
title: 重学linux（16）
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 81bb1758
date: 2022-03-10 13:43:53
---

# 系统的基本设置

## 网络设置

重点设置内容

- IP
- netmask
- gateway
- DNS

网卡命名：

- eno1：主板BIOS内置网卡
- ens1：BIOS内置PCI-E链接的网卡
- enp2s0：代表PCI-E接口的独立网卡
- eth0：如果不符合上述条件，使用默认编号

工具：`nmcli`

```bash
nmcli connection show [网卡名称]
nmcli connection modify [网卡名称] [参数]
# 参数
connection.autoconnect [yes|no]
ipv4.method [auto|manual]
ipv4.dns [dns_server_ip]
ipv4.addressed [ip/netmask]
```

## 日期与时间设置

### timedatectl

```bash
timedateclt [command]
timedatectl list-timezones | grep -i new
timedatectl set-time "2022002-22 22:22"
```

### ntpdate

```bash
ntpdate [ntp服务器]
hwclock -w # 将正确的时间写入BIOS中
```

## 语系设置

### localectl

```bash
localectl [command] # 系统语系
locale # 当前软件语系
localectl set-locale LANG=en_US.utf8
```

## 防火墙简易设置

略

# 服务器硬件数据的收集

## 查看硬件设备

### dmidecode

```bash
dmidecode -t type
# type
# 1:整个系统的信息
# 4:cpu
# 9:插槽
# 17:内存
```

## 硬件资源的收集与分析

有一系列工具，这里只做记录

- gdisk
- demsg
- vmstat
- lspci
- lsusb
- iostat

## 了解磁盘的健康状态

介绍了`smartctl`

略

# 备份要点

## 备份考虑

- 硬件问题
- 软件与人的问题
- 主机角色不同，备份任务不同
- 备份因素考虑
  - 备份哪些文件
  - 备份媒介
  - 备份方式
  - 备份频率
  - 备份工具

## 备份文件

- OS本身的重点文件
  - /etc/
  - /home/
  - /var/spool/mail/
  - /var/spool/{at|cron}/
  - /boot/
  - /root/
  - 装有其他软件的/usr/local/和/opt/
- 数据库
  - /etc/
  - /usr/local/
  - /var/www/
  - /var/lib/*sql
- 推荐备份的目录
  - /etc/
  - /home/
  - /root/
  - /var/spool/{mail|cron|at}/
  - /var/lib/
- 不需要备份的目录
  - /dev
  - /proc
  - /sys
  - /run
  - /mnt
  - /media
  - /tmp

## 备份媒介

钱的问题（狗头

## 备份的种类、频率与工具

### 完整备份之累积备份（增量备份,incremental backup）

即只备份有差异的文件

完整备份的工具

- dd
- find+cpio

增量备份

- xfsdump
- tar

### 完整备份之差异备份（Differential backup）

- xfsdump
- tar
- rsync

### 关键数据备份

略

# 备份策略

略，按照前面的考虑来自行设定
