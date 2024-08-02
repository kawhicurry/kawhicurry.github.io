---
title: 重学linux（17）
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 3907703d
date: 2022-03-10 14:28:26
---

# 开放源码的软件安装和升级

## 简介

略

## gcc编译过程

略

## make编译过程

略

## tarball管理与建议

使用流程

- 获取原始文件，解压缩
- 获取步骤流程，查看`INSTALL`和`README`等相关文件内容
- 依赖检查或安装
- 建立`makeflie`，比如使用configure和config
- 编译，make
- 安装，根据makefile提示使用make install

### 一些建议

- 在/usr/local/src里解压缩
- 安装位置设为/usr/local下
- 考虑未来可能的卸载过程
- 为安装到单独目录的软件的man page加入到man path中（`/etc/mand_db.conf`）

### 更新

使用patch

```bash
pathc -pN < patch_file
pathc -R < patch_file
```

## 函数库管理

区分一下动态库和静态库

`ldconfig`和其配置文件`/etc/ld.so.conf`和`/etc/ld.so.cache`

```bash
ldconfig [-f conf] [-C cache] # 指定配置文件
ldconfig -p # 列出所有数据库内容
ldconfig # 重新读取配置文件
```

## 校验软件正确性

### 工具

- md5sum
- sha1sum
- sha256sum

```bash
md5sum/sha1sum/sha256sum -bct filename
md5sum/sha1sum/sha256sum [--status|--warn] --check filename
# -b 二进制读取
# -c 检查文件校验值
# -t 文本方式读取
```

### 推荐建立校验值数据库

- /etc/passwd
- /etc/shadow
- /etc/group
- /usr/bin/passwd
- /sbin/rpcbind
- /bin/login
- /bin/ls
- /bin/ps
- /bin/top

这样如果有人乱改就看得到

# 软件管理器

## 两大主流：RPM和DPKG

略

## RPM的管理程序

### rpm

```bash
rpm -i *.rpm # 安装rpm包
rpm -ivh *.rmp # 显示进度
```

后面都是rpm的参数，略

### SRPM

带源码的rpm包，会有点不一样，认识下先。

# X Window System

图形界面

实质上是Xserver和Xclient的通信。

大部分略了，这章记录了怎么装显卡驱动，可能要回来看看。

# 内核编译

- 下载源码，解压缩
- 编译前的预处理
  - `make mrproper`保证源码干净（清除此前的配置文件）
  - `make XXconfig`修改内核配置文件
    - `menuconfig`：TUI
    - `oldconfig`：使用已经存在的./config文件
    - `xconfig`：Qt接口，用于KDE
    - `gconfig`：Gtk接口，用于GNOME
    - `config`：单方向选择，选错完蛋
    - 选项说明：
      - 为空表示不便宜
      - *表示编译进内核
      - M表示编译为模块
  - 功能的进一步查看，略了
- 编译
  - `make VmLinux`：未经压缩的内核（这步不用执行）
  - `make clean`：先清理缓存
  - `make bzImage`：压缩过的内核（默认）
  - `make modules`：仅内核模块
  - `make all`：上述三个操作
- 安装模块
  - `make modules_install`：安装模块
- 安装内核或开启多内核选项
  - `cp *.bzImage /boot/vmlinuz-version`
  - `cp .config /boot/config-version`：配置文件一起复制过去
  - `chmod a+x /boot/vmlinuz-version`
  - `cp System.map /boot/System.map-versoin`
  - `gzip -c Modules.symvers > /boot/symvers-version.gz`
  - `restorecon -Rv /boot`
- 建立`initrd`
- 编译`grub`

## 单一模块编译

略

## 内核模块管理

### modprobe

`/etc/modprobe.conf`
