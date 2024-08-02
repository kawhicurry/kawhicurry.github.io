---
title: 重学linux（4）
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 78c8d142
date: 2022-01-23 13:30:52
---

# 文件与文件系统的压缩

## 命名规范

| 后缀     | 含义                          |
| -------- | ----------------------------- |
| .Z       | compress压缩程序压缩的文件    |
| .zip     | zip                           |
| .gz      | gzip                          |
| .bz2     | bzip2                         |
| .xz      | xz                            |
| .tar     | tar程序打包的文件，没有压缩过 |
| .tar.gz  | tar打包，gzip压缩             |
| .tar.bz2 | tar打包，bzip2压缩            |
| .tar.xz  | tar打包，xz压缩               |

## 压缩与解压缩

### gzip

向下兼容compress软件

```bash
# gzip [-cdtv#] filename
gzip -v -9 filename # 以最高压缩比压缩并显示信息，压缩比1~9，直接压缩会替换掉源文件
gzip -d *.gz # 解压缩，直接解压缩会替换掉原压缩文件

# zcat/zmore/zless *.gz
zcat *.gz # 都可以尝试读取

# 其他的一些指令
zcmp # 解压文件并且 byte by byte 比较两个文件
zdiff # 解压文件并且 line by line 比较两个文件
zgrep # 解压文件并且根据正则搜索文件内容
ztest # Tests integrity of compressed files.
zupdate # Recompresses files to lzip format.
```

### bzip2

比gzip压缩比更好，用法和gzip完全一致，除了文件名末尾变为bz2。

### xz

比bzip2压缩比更好，用法和gzip完全一致，除了文件名末尾变为bz2。

## 打包

### tar

| 参数 | 含义                          |
| ---- | ----------------------------- |
| -c   | 打包文件                      |
| -t   | 查看打包文件的文件名          |
| -x   | 解压缩                        |
| -z   | 通过gzip解压，适用于*.tar.gz  |
| -j   | 通过bzip解压，适用于*.tar.bz2 |
| -J   | 通过xz解压，适用于*.tar.xz    |
| -f   | 指定文件名                    |
| -p   | 保留权限与属性等信息          |
| -P   | 保留绝对路径                  |

**注**：-c，-t，-x不可同时出现

```bash
# 常用
tar -jcv -f filename.tar.bz2 # 压缩
tar -jtv -f filename.tar.bz2 # 查看
tar -jxvf filename.tar.bz2 # 解压缩

# 关于-p -P选项
tar -jpcvf /root/etc.tar.bz2 /etc # 先打包整个/etc目录
tar -jtf /root/etc.tar.bz2
-rw-r--r-- root/root 131 2022-01-24 10:30 etc/locale.conf # 里面的文件都被移除了根目录，这样解压时就不会被放回原来的目录，如果将p选项改为P，则会保留根目录

## 只解压解压包中某个文件的做法
tar -jtvf *.tar.bz2 filename
```

## xfs文件系统备份

- 完整备份
- 增量备份

### xfsdump

一些限制条件

- xfsdump不支持没有挂载的文件系统备份
- 需要root权限
- 只能备份完整的xfs
- 备份后的数据只能让`xfsrestore`
- 文件UUID不能相同

```bash
# xfsdump [-L S_label] [-M M_label] [-l #] [-f 备份文件] data
xfsdump -I # 查看已有的备份信息
xfsdump -l 1 ... # 使用level来完成增量备份
```

### xfsrestore

```bash
# xfsrestore [-L S_label] [-f 备份文件] directory
xfsrestore -I
```

## 光盘写入工具

### mkisofs

```bash
# mkisofs [-o isoname] filename/directory_name
```

| 选项         | 含义                            |
| ------------ | ------------------------------- |
| -o           | 镜像名                          |
| -r           | 记录更多信息，包括UID/GID和权限 |
| -V           | 建立卷标                        |
| -J           | 产生兼容windows的文件名结构     |
| -graft-point | 好东西，分类镜像必备            |

怀疑书上的刻录过程可能过于古老了，遇到这样的任务再说。

## 其他常见的压缩备份工具

### dd

（几乎）直接读取磁盘扇区，并备份。

### cpio

可以备份任何东西，但必须配合find来备份
