---
title: 记录一次ssh登录的问题
tags:
  - ssh
description: 记录一次ssh登录的问题
categories:
  - Operation
date: 2022-01-12 13:22:03
---

## 问题描述

本想使用rsa公钥的ssh免密登录，发现无论如何都要我输密码。

## 问题排查

首先是常规思路查看文件权限

```bash
# ~/.ssh/authorized_keys
-rw-------. 1 root root 1307 Jan 12 12:59 authorized_keys # 600
# ~/.ssh
-rw-------. 1 root root 1307 Jan 12 12:59 authorized_keys # 600
# ~
drwx------.   6 root   root    147 Jan 12 13:29 root # 700

```

接下来查看ssh-server的配置文件`/etc/ssh/sshd_config`，主要查看以下几项
```bash
RSAAuthentication yes
PubkeyAuthentication yes

PermitRootLogin yes
```

接下来查看登录日志`/var/log/secure`，注意该文件后面会跟上日期，找最近的即可。

再然后使用本地ssh加上参数vvv尝试登录，查看输出的debug信息，找到如下信息
```bash
debug3: send packet: type 50
debug2: we sent a publickey packet, wait for reply
debug3: receive packet: type 51
```
该信息说明密钥发送成功，但不匹配。重新复制密钥后仍然无法免密。

这时候顾神上线了发现，我的`/root`目录权限是这样的：
```bash
drwx------.   6 root   1006    147 Jan 12 13:29 root
```

不知道为什么root的权限变成了1006。把1006改回root后可正常使用。

## 结论和启示
无法免密登录是由于目录权限不够导致的，但这次权限问题出在`group of the owner`上面。因此，以后看权限不能只盯着777看，也要注意`owner`和`group`。
