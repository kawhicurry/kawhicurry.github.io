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

#### userdel

删除用户，包括以下数据

- /etc/passwd，/etc/shadow
- /etc/group，/etc/gshadow
- /home/username，/var/spool/mail/username

```bash
userdel [-r] username
# -r 表示将家目录也删除
```

## 用户功能

### id

查询自己（或别人）的uid等基本信息

### finger

查看更多信息（默认不安装）

### chfg

change finger，感觉用不上

### chsh

change shell

```bash
chsh -l # 列出可用的shell
chsh -s # 设置shell
```

## 新增和删除用户组

### groupadd

```bash
groupadd [-g gid] [-r] groupname
# -r 建立系统用户组
```

### groupmod

```bash
groupmod [-g gid] [-n group_name] groupname
# -n 用来修改现有的用户组名
```

### groupdel

```bash
groupdel [groupname]
```

若有用户使用某个用户组作为初始用户组，则该用户组无法删除。此时可以

- 修改用户的GID
- 删除该用户

### gpasswd

建立group管理员

```bash
# root的使用
gpasswd groupname # 设置group密码
gpasswd -A user groupname # 指定group的用户管理员
gpasswd -M user groupname # 将用户加入group
# -r 使group密码失效
# -R 使group密码栏失效

# 用户组管理员的使用
gpasswd -a user # 添加用户
gpasswd -d user # 删除用户
```

# ACL的使用

authconfig和authconfig-tui可用于外部身份认证

## ACL介绍

`Access Control List`

ACL可针对的方面

- user
- group
- mask（默认属性）

## ACL的设置

### setfacl

用于设置某个文件/目录的ACL权限

```bash
setfacl [bkRd] [{-m|-x} acl argument] filename
# ACL参数格式
u:user:[rwx] # 对特定user
g:group:[rwx] # 对特定group
m:[rwx] # 对mask(有效权限)
d:[ug]:[rwx] #默认权限
```

| 参数 | 含义                                 |
| ---- | ------------------------------------ |
| -m   | 设置后续的ACL参数                    |
| -x   | 删除后续的ACL参数，删除时用`-`来占位 |
| -b   | 删除所有的ACL参数，删除时用`-`来占位 |
| -k   | 删除默认的ACL参数                    |
| -R   | 递归                                 |
| -d   | 设置默认的ACL参数（只对目录有效）    |

### getfacl

用于查看某个文件/目录的ACL权限

```bash
getfacl filename
```

# 用户身份切换

## su

```bash
su [-lm] [-c command] [username]
# - 使用login-shell方式登录
# -l 同上，但后面必须加username
# 不加-就是nologin-shell登录
# -m 和 -p表示“使用目前的环境变量设置，而不读取新使用者的配置为文件
# -c 只执行一次command
```

**注：那个`-`很重要**

## sudo

在`/etc/sudoers`内记录

```bash
sudo [-b] [-u username]
# -b background，将命令放到后台进行
# -u 后面接欲切换的用户，默认为root
```

### sudo的执行流程

- 系统查看/etc/sudoers文件中该用户是否有sudo权限
- 让用户输入自己的密码，若自己就是要切换的用户，则不必输入密码。root使用sudo也不需要输入密码
- 执行命令

### 修改/etc/sudoers

该文件具有一定规范，因此更推荐使用`visudo`去修改（怎么觉得没啥区别？）

```bash
root	ALL=(ALL)	ALL # username	login_host_name=(user_available)  command_available
%wheel	ALL=(ALL)	ALL # % represent group
%wheel	ALL=(ALL)	NOPASSWD: ALL # 免密
user1	ALL=(root)	!/usr/bin/psswd, /usr/bin/passwd [A-za-z]*, !/usr/bin/passwd root #!表示不可执行，这样就可以修改别的用户的密码，但不能修改root的
User_Alias ADMPW = pro1,pro2,pro3 # 别名建立新账号，注意该账号必须是大写
Cmnd_Alias ADMPWCOM = !/usr/bin/passwd,/usr/bin/passwd [A-Za-z]*,!/usr/bin/passwd root
ADMPW	ALL=(root)	ADMPWCOM
```

### 关于切换到root用户的方法

以前的我：`su`。这样是使用nologin shell的变量文件登录的root

那是不是应该`su -`，这样就完整的读取了root的login shell配置文件

如果我只执行一条命令的话，那就是`su - -c command`

不过这样还要输入root的密码，要是没有root密码呢？

`sudo`咯，这样也是每条指令前都要加`sudo`

鸟哥还教了一个方法，在`/etc/sudoers`中这样写

```bash
User_Alias ADMINS = user1,user2
ADMINS	ALL=(root)	/bin/su -
# 然后就可以这样登录root了
sudo su -
```

不过现在的主流方式好像是`sudo -i`

man page的说法是，这样相当于登录的root的login shell，读取了它的所有环境变量，并以一个interactive shell的形式呈现，还帮忙把用户切换到家目录里去了。

这应该是sudo提供的一个“装的很像”的切换方式，既然装的这么像，那还是用它。

# PAM模块

`Pluggable Authentication Modules`

是个linux内置的api，返回的结果要么成功要么失败。

是个很nb的功能。跳了，暂时用不上，但迟早要用上，一定要记得回来看

//todo

# linux主机上信息的传递

## 查询用户

### w

用的多，略

### who

有w了，懒得用

### last

最近的登录记录

### lastlog

各个用户的最近登录记录

## 用户交流

### write

`write username [terminal]`

就硬发，打断你也要发

### mesg

可使用`mesg n`强制闭上鼻子不听别人发（但阻止不了root）

`mesg y`再打开

### wall

发给所有人

### 用户邮箱

再次提醒：/var/spool/mail

### mail

```bash
mail -s "title" user
# 然后这里输入 . 来表示结束（我猜ctrl+d的EOF也可以）
# 也可以用stdin重定向进来
mail # 进入交互界面，查看邮件
& #<== 这是个提示符，示意你输命令
```

| 命令 | 含义                          |
| ---- | ----------------------------- |
| ?    | ?                             |
| h    | 列出邮件标头，h 40            |
| d    | 删除，d10，d20-40             |
| s    | 存储邮件内容，s 5 ~/mail.file |
| x    | 不做任何事直接退出            |
| q    | 保存后退出                    |

# 创建大量账号

高级话题，稍微看看

## pwck

用于检查/etc/passwd中的信息是否正确

## grpck

检查用户组

## pwconv

将/etc/passwd中的账号和密码移动到/etc/shadow中，如果用useradd之类的话，是没它什么事的

## pwunconv

将/etc/shadow写入/etc/passwd，然后删除/etc/shadow（危？）

## chpasswd

读入未加密的密码，加密后写入/etc/shadown中，示例：`echo "user1:abcdefg" | chpasswd`

### 一个大量创建账号的模板

用不到的样子
