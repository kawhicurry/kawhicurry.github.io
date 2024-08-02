---
title: 重学linux（14）
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 2bb2dfd3
date: 2022-03-07 11:23:20
---

# 什么是日志文件

## 作用

略

## 一般的格式

- 时间
- 主机名
- 服务名称

# rsyslog.service

负责日志文件的service

## 配置文件

`/etc/rsyslog.conf`

该文件定义了：

- 什么服务
- 什么等级的信息
- 被记录在哪里

```bash
# 格式
service_name[.=!]level	filename_or_device
mail.info	/var/log/maillog_info # mail服务产生的大于等于info等级的信息，记录到/var/log/maillog_info文件中的意思
cron,mail.info /var/log/messages # 使用逗号分割多个服务时，只需在最后一个后面指定等级即可
cron.info;mail.info /var/log/messages
```

### 服务名称

内核支持的类型如下

| 序号  | 类别          | 说明                               |
| ----- | ------------- | ---------------------------------- |
| 0     | kern          | 内核产生的信息                     |
| 1     | user          | 用户层级产生的信息，使用logger记录 |
| 2     | mail          | 与邮件收发有关的信息               |
| 3     | daemon        | 系统的服务产生的信息               |
| 4     | auth          | 认证机制相关                       |
| 5     | syslog        | 自己的信息                         |
| 6     | lpr           | 打印相关                           |
| 7     | news          | 新闻组服务器                       |
| 8     | uucp          | 早期UNIX系统之间的程序数据交换     |
| 9     | cron          | 计划任务                           |
| 10    | authpriv      | 和auth类似，但偏向于账号的私人信息 |
| 11    | ftp           | ftp相关                            |
| 16~23 | local0~local7 | 留给用户使用的日志文件信息         |

### 信息等级

| 等级数值 | 名称            | 说明                      |
| -------- | --------------- | ------------------------- |
| 7        | debug           | debug                     |
| 6        | info            | 基本的信息说明            |
| 5        | notice          | 正常信息                  |
| 4        | warning（warn） | 有问题，但不影响运行      |
| 3        | err（error）    | 重大的错误                |
| 2        | crit            | 比error还严重（critical） |
| 1        | alert           | 警告，更严重              |
| 0        | emerg（panic）  | 系统要宕机了              |

0~6为主要的等级，除此之外有debug和none两个等级。

### 连接符号

- `.`：表示比后面的等级严重的（包括该等级的）都记录下来
- `.=`：表示所需要的就是后面的等级
- `.!`：表示不等于后面的等级

### 记录的文件名或设备或主机

- 文件：文件的绝对路径
- 打印机：/dev/lp*
- 用户名称：显示给某个用户
- 远程主机：如@123.234，需要对方主机的支持
- *：表示目前在线的所有人

## 日志文件的安全设置

注：日志文件只要被编辑过，就无法继续记录，解决方法是重启`rsyslogd.service`

所以可以使用`chattr +a /var/log/sth.log`来使日志文件只能添加内容而不能被修改和删除

## 日志文件服务器的设置

配置server端和client端，比较简单，略了

# 日志文件的轮询（logrotate）

logrotate的主要功能就是将现有的日志文件重新命名以做备份，然后新建一个空文件来记录信息。

## logrotate的配置文件

- /etc/logroate.conf
- /etc/logrotate.d/

```bash
[root@centos ~]# cat /etc/logrotate.conf
# see "man logrotate" for details
# rotate log files weekly
weekly #指定了轮询的时间

# keep 4 weeks worth of backlogs
rotate 4 # 保留的日志文件个数

# create new (empty) log files after rotating old ones
create # 更名后新建一个

# use date as a suffix of the rotated file
dateext # 给轮询的文件名加上日期

# uncomment this if you want your log files compressed
#compress # 是否需要压缩

# RPM packages drop log rotation information into this directory
include /etc/logrotate.d # 子配置

# no packages own wtmp and btmp -- we'll rotate them here
/var/log/wtmp { # 针对某个文件夹内的文件的配置
    monthly
    create 0664 root utmp
        minsize 1M
    rotate 1
}

/var/log/btmp {
    missingok
    monthly
    create 0600 root utmp
    rotate 1
}

# system-specific logs may be also be configured here.
```

```bash
[root@xxbyyl-gy-ceshi2 ~]# cat /etc/logrotate.d/syslog
/var/log/cron # 文件名，说明被处理的文件
/var/log/maillog
/var/log/messages
/var/log/secure
/var/log/spooler
{ # 参数，用大括号包起来
    missingok
    sharedscripts # 调用外部命令来进行额外的命令执行
    postrotate # prerotate，在启动logrotate之前执行的命令，还有postarotate，这一步可用于去掉+a权限
        /bin/kill -HUP `cat /var/run/syslogd.pid 2> /dev/null` 2> /dev/null || true
    endscript
}
```

## 使用logrotate

```bash
logrotate [-vf] config_file
# -v : verbose
# -f : force
```

# systemd-journald.service

在`init.d`时代，系统启动时rsyslogd未启动，因此内核需要启动一个klogd来讲系统启动过程中的信息记录下来，等rsyslogd启动后再传给它处理。

限制的`systemd`会启动一个`systemd-journald`来完成上述任务。

journald使用内存文件记录方式，因此不具有持久性。

## 使用journalctl查看登录信息

```bash
jouirnalctl [-nrpf] [--since TIME] [--until TIME] _optional
# -n 指定行数
# -r reverse
# -p 显示后面信息重要性的排序
# -f 类似tail -f
# TIME "2022-02-22 22:22:22"
# _SYSTEMD_UNIT=unit.service
# _COMM=bash
# _PID=pid
# _UID=uid
# SYSLOG_FACILITY=[0-23]
```

## logger命令的应用

```bash
logger [-p service.level] "message"
```

## 保存journal的方式

只需建立一个`/var/log/journal`目录，然后重启journal服务即可。

不过没有必要，毕竟已经有了rsyslogd来做持久化的log，将journal的log存到/run/log下来提升读取速度更好

# 分析日志文件

## logwatch

鸟哥推荐了centos下的logwatch。logwatch与cron配合，每天发送一份mail给root。

## 自己写一个

需要了再说
