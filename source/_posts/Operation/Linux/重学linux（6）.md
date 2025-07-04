---
title: 重学linux（6）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0015.JPG
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: d2c119c9
date: 2022-01-26 10:42:04
---

# Shell变量

## 查看shells

`/etc/shells`

## 查看命令是否为bash内置

### type

```bash
type [option] name
```

| 参数 | 选项                             |
| ---- | -------------------------------- |
| -t   | 显示其类型                       |
| -p   | 当name为外部命令时显示完整文件名 |
| -a   | 显示PATH中全部name               |

## 命令的执行小技巧

| 组合键        | 功能                                 |
| ------------- | ------------------------------------ |
| ctrl+u/ctrl+k | 从光标处向前或向后删除命令串         |
| ctrl+a/ctrl+e | 让光标移动到整个命令行最前面或最后面 |

## 变量

```bash
# 查看变量
echo $var
echo ${var}
# 设置变量
name=kawhicurry # 变量只能以字母开头，只能包含数字和字母
# 不能随意空格，加空格方式如下
name="kawhi curry"
name=kawhi\ curry
# 单引号和双引号的区别
name=‘$USER’ # 单引号内仅为普通字符
name="$USER" # 双引号内变量保持原本含义
# 取得其他指令所提供的信息
version=$(uname -r)
version=`uname -r`
# 扩增变量内容
PATH="$PATH":/home/bin
PATH=${PATH}:/home/bin
# 变量需要在其他子程序执行
export PATH # 注意不需要加$
# 取消变量
unset version # 也不需要加$
```

## 环境变量

### env

查看环境变量

```bash
$ env
XDG_SESSION_ID=5747
HOSTNAME=Shuihua
TERM=xterm # 终端环境
SHELL=/bin/bash # shell环境
HISTSIZE=1000 # history记录的条数
SSH_TTY=/dev/pts/1
USER=root # 当前用户名称
MAIL=/var/spool/mail/root # 邮箱
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
PWD=/root
LANG=en_US.UTF-8 # 语系
HISTCONTROL=ignoredups
SHLVL=1
HOME=/root
LOGNAME=root #登陆人
SSH_CONNECTION=175.5.235.93 43351 172.29.89.99 22
LESSOPEN=||/usr/bin/lesspipe.sh %s
XDG_RUNTIME_DIR=/run/user/0
_=/usr/bin/env # 上一次使用的命令的最后一个参数（或是命令本身）

# 其他
RANDOM # 位于/dev/random的随机数生成器，生成0~32768的随机数
```

### set

查看所有变量

```bash
$ set # 节选
HOSTNAME=Shuihua
HOSTTYPE=x86_64 # cpu架构
ID=0
MACHTYPE=x86_64-redhat-linux-gnu # 机器硬件等级
MAIL=/var/spool/mail/root
MAILCHECK=60
OPTERR=1
OPTIND=1
OSTYPE=linux-gnu # 操作系统等级
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
PIPESTATUS=([0]="0")
PPID=26032
PROMPT_COMMAND='printf "\033]0;%s@%s:%s\007" "${USER}" "${HOSTNAME%%.*}" "${PWD/#$HOME/~}"'
PS1='[\u@\h \W]\$ ' # cmd-line 的 prompt
PS2='> '
PS4='+ '
PWD=/root
SHELL=/bin/bash
SHELLOPTS=braceexpand:emacs:hashall:histexpand:history:interactive-comments:monitor
SHLVL=1
SSH_TTY=/dev/pts/1
TERM=xterm
UID=0
USER=root
XDG_RUNTIME_DIR=/run/user/0
XDG_SESSION_ID=5747
_=set
colors=/root/.dircolors
```

## 语系变量

### locale

```bash
locale -a # 查看所有支持的语系
locale # 查看当前使用的语系
LANG=en_US.UTF-8
LC_CTYPE="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=
# 系统的整体语系
cat /etc/locale.conf
# 修改语系
export locale_var=language 
```

## 变量的赋值，声明

### read

```bash
# read [-pt] var
# -p 后面跟提示信息
# -t 实践限制，单位秒
```

### declare,typeset

| 参数 | 含义                   |
| ---- | ---------------------- |
| -a   | 将后面的变量设置为数组 |
| -i   | 将后面的变量设置为整数 |
| -x   | export                 |
| -r   | readonly               |
| -p   | 查看变量类型           |

```bash
# declare [-aixr] var
declare -x sum # sum 变为环境变量
declare +x sum # 取消sum的环境变量属性
```

## 文件系统和程序的限制

### ulimit

```bash
# ulimit [-option] [配额]
ulimit -a # 查看当前所有的限制额度
# 具体选项通过上面这条看看就知道了
```

## 变量中的内容的删除、取代和替换

### 删除

使用`#`和`%`

- `#`删除**从前往后**符合替换条件的**最短**的那个
- `##`删除**从前往后**符合替换条件的**最长**的那个
- `%`删除**从后往前**符合替换条件的**最短**的那个
- `%`删除**从后往前**符合替换条件的**最长**的那个
- 使用通配符`*`

### 替换

使用`/`和`//`

- `/`会将**第一个**符合条件的内容替换
- `//`会将**所有**符合条件的内容替换

```bash
echo path=${PATH}
echo ${path#/*local/bin:} # 删除path变量中从前往后最短的符合该条件的内容
echo ${path/sbin/SBIN} # 将path变量中第一个符合sbin的字符串替换为后面的SBIN
```

### 默认变量和变量检测

使用`-`，`+`，`?`和`:`

**这个功能超好，但是没法写笔记**
