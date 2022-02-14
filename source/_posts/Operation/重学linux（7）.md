---
title: 重学linux（7）
tags:
  - 专栏：重学linux
  - linux
categories: Operation
abbrlink: 6a7d7eac
date: 2022-02-10 19:58:13
---

# 别名与历史

## alias

alias

unalias

## history

```bash
$ history [n]
$ history [-c]
$ history [-raw] histfiles # default is ~/.
# r : read histfiles (connect with var ${HISTFILESIZE})
# a : new command will be add to histfiles
# w : command before will be add to histfiles
```

## !!!

```bash
$ ! # 执行上一条命令
$ !! # 上上条
$ !5 # 第5条（使用history查看）
$ !al # 执行最近以al开头的命令
```

# Bash的操作环境

## PATH

查找顺序

1. 相对/绝对路径
2. alias
3. bash's builtin command
4. in ${PATH}

## bash的登录信息

### /etc/issue

登录页面。使用`man issue`和`man agetty`查看参数和书写方式。

除了`/etc/issue`还有个`/etc/issue.net`，用于telnet登录的欢迎信息

### /etc/motd

用户登录提示信息

**注**：在ubuntu这样的发行版中，motd是动态生成的，如ubuntu实际上的motd文件时`/run/motd.dynamic`，而该文件是由`/etc/update-motd.d/`下的脚本生成的，初次之外，`/etc/pam.d/login`文件设置了开启记录系统的上一次登录时间。

### 上述两个文件的区别？

`motd` represent `message of today`

用于某个用户登录时（毕竟linux设计上是多用户os），展示的提示信息。

`issue`用于登录之前，tty显示的内容。

如果是远程登录，`issue`的内容会显示在`motd`之前。

## bash的环境配置文件

**注**：`login shell`和`non-login shell`读取的文件不同

### /etc/profile（login shell only）

根据uid来读取不同的配置，主要是通过调用其他脚本来设置环境，设定的内容包括：`PATH,MAIL,USER,umask`。

### /etc/profile.d/*.sh

只要脚本文件位于该目录下且具有`r`（注意是r，不是x）的权限，就可以被`/etc/profile`调用

### /etc/locale.conf

由`/etc/profile.d/lang.sh`调用，设定了os的语系

### /usr/share/bash-completion/completion/*

由`/etc/profile.d/bash_completion.sh`调用，除了命令补齐和文件名补齐之外，还提供了命令的选项和参数补齐。

### ~/bash_profile（login shell only）

- ~/.bash_profile
- ~/.bash_login
- ~/.profile

上述三个文件只读取其中一个，优先级由上到下

**注**：ubuntu下的`~/.profile`会读取下面的`~/.bashrc`，这也是为什么`bashrc`文件中的内容也能在login shell中生效的原因。

### ~/.bashrc(non-login shell only)

来源于`/etc/skel/.bashrc`。

会去调用`/etc/bashrc`和`/etc/profile.d/*.sh`，来获取系统环境

### 其他文件

- `/etc/man_db.conf`：man page的路径
- `~/.bash_history`：历史记录
- `~/.bash_logout`：注销bash后执行的内容

### 总结

- 对于login shell
  - 读取/etc/profile
    - 读取/etc/proflie.d/*.sh
      - 调用如/etc/locale.conf之类的文件
    - 读取/etc/bashrc或/etc/bash.bashrc
      - 调用其他配置文件
  - 读取~/.bash_profile（或其他的profile）
    - 读取~/.bashrc
- 对于non-login shell
  - 读取~/.bashrc
    - 读取/etc/bashrc或/etc/bash.bashrc
    - 读取/etc/profile.d/*.sh

## 终端的环境设置

### stty

```bash
$ stty -a # 查看所有终端配置
$ stty erase ^h # 设置某个按键
```

| 参数  | 含义                 |
| ----- | -------------------- |
| intr  | interrupt signal     |
| quit  | quit signal          |
| erase | delete character     |
| kill  | delete all charcater |
| eof   | end of line          |
| start | restart              |
| stop  | pause                |
| susp  | terminal stop signal |

### set

使用`echo $-`查看set已经设置的内容

### 通配符

| 符号 | 含义                           |
| ---- | ------------------------------ |
| *    | 0到无穷多任意字符              |
| ？   | 一定有一个字符                 |
| []   | 一定有一个在括号里的字符       |
| [-]  | 减号表示在编码顺序内的一定字符 |
| [^]  | ^表示反选                      |

