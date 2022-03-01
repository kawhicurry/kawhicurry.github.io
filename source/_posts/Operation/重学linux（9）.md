---
title: 重学linux（9）
tags:
  - 专栏：重学linux
  - linux
categories: Operation
abbrlink: 8aa2099f
date: 2022-02-15 10:59:43
---

# Linux账号与用户组

## UID和GID

总之就是非常重要，不要乱改/etc/passwd下的东西

## 用户账号

登陆时OS做了什么

- 在/etc/passwd中查询是否有该用户名，若有，读出UID和GID
- 在/etc/shadow中查询账号和UID，然后确认密码

*所以要保护好上述内容的权限*

### /etc/passwd的文件结构

每行一个账号，以冒号分割

`root:x:0:0:root:/root:/bin/bash`

按顺序分别为

- 账号名
- 密码（woc），早期的密码是放在这的，后来移动到/etc/shadow上了
- UID
- GID
- 用户信息说明，说明这个账号是干啥的
- 家目录
- 使用的shell

### /etc/shadow的文件结构

```bash
root:!:19032:0:99999:7:::
daemon:*:18480:0:99999:7:::
bin:*:18480:0:99999:7:::
```

同上，按顺序

- 账号名称
- 密码
- 最近修改密码的日期，单位是天，指到1970年1月1号的天数。
- 密码不可被修改的天数（与第三个字段相比较）
- 密码需要被修改的天数（与第三个字段相比较）
- 密码需要被修改的期限前的警告天数（与第五个字段比较）
- 密码过期后强制修改的天数（与第五个字段比较）
- 保留字段

关于shadow，注意要保持其权限为600。

关于shadow的加密方式，根据linux distribution版本不同而不懂，可以使用`authconfig --test | grep hashing`查看。（好像这个指令太老了？）

## 用户组

### /etc/group的文件结构

格式同/etc/passwd，按顺序：

- 组名
- 用户组密码
- GID
- 此用户组支持的账号名称

### 初始用户组与有效用户组

/etc/passwd中记录的GID为**初始用户组**，用户一登陆就拥有该用户组的所有权限。

/etc/group中记录了某用户后，该用户也**支持**该用户组。

- 使用`groups`查看当前用户支持的所用用户组，显示的第一个用户组为当前的**有效用户组**
- 使用`newgrp`切换有效用户组。注意，该指令使用一个新的shell来切换有效用户组，因此要使用`exit`来退出而不是直接切换回去。

### /etc/gshadow的文件结构

格式同上，按顺序：

- 组名
- 密码栏，`!`表示无合法密码（即无用户组管理员）
- 用户组管理员的账号
- 加入该用户组支持的所属账号

# 账号管理

## 新增和删除用户

### useradd

```bash
useradd [-u UID] [-g initial group] [-G other group] name
```

| 参数 | 含义                                           |
| ---- | ---------------------------------------------- |
| -u   | UID                                            |
| -g   | 初始用户组                                     |
| -G   | 次要用户组                                     |
| -M   | 强制不要建立用户家目录                         |
| -m   | 强制要建立用户家目录                           |
| -c   | 用户说明                                       |
| -d   | 试某个目录成为家目录，注意，务必要使用绝对路径 |
| -r   | 建立系统账号，即UID小于1000                    |
| -s   | 指定使用的shell                                |
| -e   | 设定账号失效日期                               |
| -f   | 指定密码是否会失效                             |

使用useradd时，linux会做以下内容

- 向/etc/passwd中写入一行与账号相关的信息
- 向/etc/shadow中写入此账号的密码相关信息，但还没有真的密码
- 向/etc/group中写入一个默认的组名
- 在/home下建立默认的家目录、

使用`useradd -D`查看其默认值，其内容来源于/etc/default/useradd

```bash
GROUP=100 # 默认GID
HOME=/home # 默认家目录
INACTIVE=-1 # 密码失效日期
EXPIRE= # 账号失效日期
SHELL=/bin/sh # 默认的shell
SKEL=/etc/skel # 用户家目录内容的参考数据
CREATE_MAIL_SPOOL=no # 是否主动帮用户建立邮箱
```

除此之外，UID/GID的密码参数在/etc/login.defs文件（下面这个是筛选过的）

```bash
MAIL_DIR        /var/mail # 默认邮箱目录
FAILLOG_ENAB            yes
LOG_UNKFAIL_ENAB        no
LOG_OK_LOGINS           no
SYSLOG_SU_ENAB          yes
SYSLOG_SG_ENAB          yes
FTMP_FILE       /var/log/btmp
SU_NAME         su
HUSHLOGIN_FILE  .hushlogin
ENV_SUPATH      PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV_PATH        PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
TTYGROUP        tty
TTYPERM         0600
ERASECHAR       0177
KILLCHAR        025
UMASK           02 # 用户的umask
PASS_MAX_DAYS   99999 # 多久需要修改密码
PASS_MIN_DAYS   0 # 多久不可重设密码
PASS_WARN_AGE   7 # 密码过期警告日期
UID_MIN                  1000 # 用户可以使用的最小UID
UID_MAX                 60000 # 最大UID
GID_MIN                  1000 # 用户可以使用的最小GID
GID_MAX                 60000 # 最大GID
#SYS_GID_MIN              100 # 系统账号保留的最小UID
#SYS_GID_MAX              999 # 系统账号的最大UID
LOGIN_RETRIES           5
LOGIN_TIMEOUT           60
CHFN_RESTRICT           rwh
DEFAULT_HOME    yes # 默认是否为用户创建家目录
USERGROUPS_ENAB yes # 使用userdel删除用户时，是否删除初始用户组
ENCRYPT_METHOD SHA512 # 密码的加密机制
```

### passwd

刚建好的账号是锁定的，得设置密码

```bash
passwd [] username
```

| 参数    | 含义                                               |
| ------- | -------------------------------------------------- |
| --stdin | 接收前一个pipe的数据                               |
| -l      | lock，使密码失效                                   |
| -u      | unlock                                             |
| -S      | 列出密码相关的信息，主要是展示/etc/shadows中的内容 |
| -n      | 多久不可修改密码的天数                             |
| -x      | 多久必须修改密码                                   |
| -w      | 密码过期前的警告天数                               |
| -i      | 密码失效日期                                       |

### chage

高级一点的`passwd`

```bash
chage [-option] username
```

| 参数 | 选项                                       |
| ---- | ------------------------------------------ |
| -l   | 列出详细信息                               |
| -d   | 修改shadow第三栏位，最近一次修改日期的时间 |
| -m   | 第四栏位，密码保留天数                     |
| -M   | 第五栏位，密码多久需要修改                 |
| -W   | 第六栏位，密码过期前警告                   |
| -I   | 第七栏位，密码失效日期                     |
| -E   | 第八栏位，账号失效日期                     |

### usermod

修改用户设置
