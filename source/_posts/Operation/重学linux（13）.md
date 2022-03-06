---
title: 重学linux（13）
tags:
  - 专栏：重学linux
  - linux
categories: Operation
abbrlink: b665e76a
date: 2022-03-06 15:36:38
---

#                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                daemon与service

## init.d

早期的系统服务，就是一大堆脚本，在内核启动时第一个程序就是init，然后用init去运行所有需要的服务。

### 使用

| 用法     | command                    |
| -------- | -------------------------- |
| 启动     | /etc/init.d/daemon start   |
| 关闭     | /etc/init.d/daemon stop    |
| 重启     | /etc/init.d/daemon restart |
| 查看状态 | /etc/init.d/daemon status  |

### 分类

- stand alone: 服务独立启动，常驻于内存中，提供本机或用户的服务操作，反应速度快
- super daemon: 由xinetd或inetd两个总管程序提供socket对应的管理

### 依赖

没有任何依赖的保证

### 运行级别

init可以根据用户定义的runlevel来唤醒不同的服务，位于/etc/rc.d/rc[0-6]/S[num]daemon，0~6含义如下

0. halt system
1. 单人维护
2. multi-user
3. same as 2
4. same as 2
5. gui
6. Reboot

num为启动顺序，用于解决依赖问题。

daemon文件可以被链接至相应文件夹下。但不需要手动链接，只需使用

- 启动：chkconfig daemon on
- 不启动：chkconfig deamon off

## systemd

### systemd 相比init的优势

- systemd常驻内存，响应快，并且有systemctl作为专门的交互工具
- 可自定义服务的依赖检查
- 按照daemon的功能进行分类，先分为unit然后归到type中
- 讲多个deamons集合为一个群组
- 向下兼容init脚本

一些没有完全替换的部分

- runlevel并未完全对应
- 受systemctl语法限制
- 手动启动的服务不受systemd管控
- systemd启动过程中不接受stdin和stdout

### 目录

- /usr/lib/systemd/system/: 每个服务最主要的启动脚本设置，类似/etc/init.d/下的文件
- /run/systemd/system/: 
- /etc/systemd/system/: 

### unit分类

使用后缀名

| 拓展名            | 功能                                                         |
| ----------------- | ------------------------------------------------------------ |
| .service          | 一般的服务类型（service unit）                               |
| .socket           | 内部程序数据交换的socket服务（socket unit）                  |
| .target           | 执行环境类型（target unit），一群unit的集合，就是执行一堆service和socket |
| .mount/.automount | 文件系统挂载的相关服务                                       |
| .path             | 检测特定文件或目录类型                                       |
| .timer            | 循环执行的服务（timer unit），比aanacrontab更有弹性          |

# systemctl

## 管理单一服务

```bash
systemct [command] [unit]
```

command 主要有：

- start
- stop
- restart
- reload
- enable
- disable
- status
- is-active
- is-enable

status运行状态：

- active(running)
- active(exited)
- active(waiting)
- inactive

开机的默认状态：

- enabled
- disabled
- static
- mask

如果只是关闭某个service，若启动某个关联service时可能会重启该服务。如果要停用某个service，正确的做法是将相关的service全部关闭。当然，也可以强制注销该服务，使用`systemctl mask `来将该service链接至`/dev/null`，这样相关service试图拉起时，也拉不起来。

## 查看系统上的服务

```bash
systemctl [command] [--type==TYPE] [--all]
```

command:

- list-units：依据unit显示启动的unit，加上--all来列出没启动的
- list-unit-files：依据/usr/lib/systemd/system内的文件，将所有文件列表说明

type: 上面有，略

## 管理不同的操作环境（target unit）

```bash
# 查看所有target unit
systemctl list-units --type=target --all
```

一些target

- graphical.target
- multi-user.target
- rescue.target
- emergency.target
- shutdown.target
- getty.target

```bash
systemctl [command] [unit.target]
```

command:

- get-default
- set-default：改变默认target
- isolate：切换到后面接的target（**重点**：isolate而不是start，而且isolate超好用）

一些快捷指令

- systemctl poweroff
- reboot
- suspend
- hibernate
- rescue
- emergency

## 分析各服务的依赖关系

```bash]
systemctl list-dependencies [unit] [--reverse]
# --reverse 反向追踪谁在使用这个unit
```

## systemd的daemon相关目录介绍

| 目录                     | 用途                                                         |
| ------------------------ | ------------------------------------------------------------ |
| /usr/lib/systemd/system/ | 官方提供的软件（默认）安装后默认的启动脚本配置文件等，这里尽量不要改，要改也是改/etc/systemd/system/下 |
| /run/systemd/system/     | 系统执行过程中产生的服务脚本，这些脚本优先级比上面这个高     |
| /etc/systemd/system/     | 管理员根据需要建立的服务脚本，类似/etc/rc.d/rc5.d/Sxx，实际上是一堆从第一条链接过来的链接文件 |
| /etc/sysconfig/*         | 所有的服务都会将初始化的一些选项设置写入到这个目录           |
| /var/lib/                | 产生数据的服务会将它的数据写入到/var/lib中                   |
| /run/                    | daemon的缓存，包括lock和pid文件等                            |

# service类型的配置文件

## 相关目录

- /usr/lib/systemd/*.service
- /etc/systemd/system/*.service.d/\*.conf
- /etc/systemd/system/\*.service.wants/\*，下面放链接，意思是启动service之后建议加上的服务
- /etc/systemd/system/\*.service.required/\*，下面放链接，意思是启动service之前需要事先启动的服务

## 配置文件的设置项目

示例：

```bash
kawhicurry@ubuntu:~$ cat /etc/systemd/system/sshd.service
[Unit]
Description=OpenBSD Secure Shell server
After=network.target auditd.service
ConditionPathExists=!/etc/ssh/sshd_not_to_be_run

[Service]
EnvironmentFile=-/etc/default/ssh
ExecStartPre=/usr/sbin/sshd -t
ExecStart=/usr/sbin/sshd -D $SSHD_OPTS
ExecReload=/usr/sbin/sshd -t
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=on-failure
RestartPreventExitStatus=255
Type=notify
RuntimeDirectory=sshd
RuntimeDirectoryMode=0755

[Install]
WantedBy=multi-user.target
Alias=sshd.service
```

配置文件可以分为三个部分：

1. [Unit] : unit本身的说明和依赖的daemon的设置
2. [Service] [Socket] [Timer] [Mount] [Path] : 不同的unit类型使用不同的配置，包括启动的脚本、环境配置文件名、重启的方式等
3. [Install] : 这个项目就是将此unit安装到某个target里去的意思

一些规则：

- 项目设置可以重复，遵循后面覆盖前面的原则
- 设置参数为whether or not的项目，可以使用1\0\yes\true\……等
- 空白行，#，；开头的行均为注释

对于每个部分下的设置：

1. unit

   | 参数          | 说明                                                         |
   | ------------- | ------------------------------------------------------------ |
   | Description   | 使用`systemctl list-units`时展示的说明                       |
   | Documentation | 指定说明文件，包括网页（http://...），man page（man:sshd(8)），file（file:/etc/ssh/sshd_config） |
   | After         | 说明此unit在哪个daemon启动之后才启动的意思，仅仅是说明顺序，并没有强制。这里和requires有差异 |
   | Before        | 和After相反，其他一样                                        |
   | Requires      | 明确定义此unit在哪个daemon启动后启动                         |
   | Wants         | 和Requires相反，定义这个unit之后启动哪个服务                 |
   | Conflicts     | 代表冲突的服务                                               |

2. service

   | 参数            | 说明                                                         |
   | --------------- | ------------------------------------------------------------ |
   | Type            | 说明这个daemon的启动方式，包括simple、forking、oneshot、idle |
   | EnvironmentFile | 指定启动脚本的环境配置文件                                   |
   | ExecStart       | 实际执行daemon的命令或脚本，也可以加上ExecStartPre和ExecStartPost来细化设置，注意：不能使用bash特有的语法，如管道和重定向，若要使用，只能将TYPE设置为oneshot |
   | ExecStop        | 用于systemctl stop                                           |
   | ExecReload      | 用于systemctl reload                                         |
   | Restart         | 当为1时，daemon服务终止后会再次启动此服务                    |
   | RemainAfterExit | 当为1时，daemon所属的所有进程终止后，会尝试再次启动，和TYPE=oneshot配合使用 |
   | TimeoutSec      | 用于启动或关闭失败时的等待时间                               |
   | KillMode        | process、control-group、none中的一种                         |
   | RestartSec      | 被关闭后等待多久重启                                         |

3. install

   | 参数     | 说明                                                         |
   | -------- | ------------------------------------------------------------ |
   | WantedBy | 这个设置后面接的大部分时*.target unit。意思是这个unit本身依附于哪个target |
   | Also     | 当这个unit被enable时，哪些unit也要enable                     |
   | Alias    | 运行一个链接的别名，比如将multi-user.target设为default.target，其实就是进行了链接 |

## 多重service的重复设置方式

以getty为例，众所周知，有6个默认的tty，但只有一个`/usr/lib/systemd/system/getty@.service`

```bash
kawhicurry@ubuntu:~$ systemctl show getty.target
Id=getty.target
Names=getty.target
Wants=getty-static.service getty@tty1.service
WantedBy=multi-user.target
Conflicts=shutdown.target
Before=shutdown.target multi-user.target
After=getty@tty1.service getty@tty2.service getty-static.service
```

只有一个service文件，但这里after后面却有多个。执行完getty.target之后，实际的执行顺序应当是：

1. 先看/usr/lib/systemd/system/,/etc/systemd/system/下有没有getty@tty1.service的设置（然后找不到）
2. 然后找getty@.service，然后将原来@后面的值作为变量传入getty@.service中的`%I`或`%i`变量

这样就可以~~少写很多文件了~~实现复用了。

除此之外，可以在`/etc/systemd/logind.conf`中将默认的6个终端关掉几个。

# 针对timer的配置文件

## systemd.timer的优势

1. 所有systemd服务产生的信息都会被log，因此比cron在debug上面更清楚和方便
2. 各项timer的任务可以跟systemd的服务结合
3. 可以跟control group（cgroup）结合，限制任务的资源利用
4. 时间可以精确到毫秒

当然，也有弱点

1. 比如没有email通知功能
2. 没有anacron的一定时间内随机取样功能（不知道这是啥玩意）

## 使用timer.target的前提

- time.target要启动
- sname.service的服务存在（sname是自己指定的）
- sname.timer的服务存在

## Timer部分的参数

在`/etc/systemd/system`下建立`*.timer`文件，然后在[Timer]块中指定相关信息

| 参数              | 说明                                                         |
| ----------------- | ------------------------------------------------------------ |
| OnActiveSec       | timer.target启动多久之后才执行unit                           |
| OnBootSec         | 启动完成多久之后才执行                                       |
| OnStartupSec      | systemd第一次启动多久后执行                                  |
| OnUnitActiveSec   | 这个timer配置文件所管理的那个unit服务在最后一次启动后，隔多久再执行 |
| OnUnitInactiveSec | 这个timer配置文件所管理的那个unit服务在最后一次停止后，隔多久再执行 |
| OnCalender        | 使用实际的时间（而非循环时间）的方式来启动服务               |
| Unit              | .service和.timer名称相同就可以了，名称不同才在这里指定       |
| Persistent        | 使用OnCalender时，指定该功能是否要持续进行                   |

OnCalender的时间

```bash
# 基本语法
# week YYYY-MM-DD HH:MM:SS
Thu 2022-02-22 22:22:22

# 指定间隔
# s\sec\second
# m\min\minutes
# h\hr\hour
# d\day\days
# w\week\weeks
# month\mouths
# y\year\years
3h
10s 300m
100m 5day

# 英语口语
now
today
tomorrow
hourly
daily
weekly
monthly
+3h10m
2015-08-16
```

注：OnCalender所展示的下一次任务开始时间为UNIX标准时间，而不是当前时区的时间

# Linux默认的启动项

略了，需要再查
