---
title: 重学linux（11）
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 1c6c2fe1
date: 2022-03-02 15:33:22
---

# 计划任务

## 只执行一次的任务

### at和atd

`at`的原理

- 需要首先开启`atd`
- 在`/var/spool/at/`下写入一个定时文件
- 使用`/etc/at.allow`和`/etc/at.deny`来实现对at的使用限制

### at

```bash
at [-mldv] TIME
# -m 任务完成后发送email给使用者，没错，是email
# -l 相当于atq，列出所有该使用者的at任务
# -d 相当于atrm，取消某个at任务
# -v 列出任务的详细时间
# -c 列出任务的实际命令内容
# TIME 时间格式
# HH:MM
# HH:MM YYYY-MM-DD # 22:22 2022-02-22
# HH:MM[am|pm] [Month] [Date] # 22:22 2022-02-22
# HH::MM + number [minutes|hour|days|weeks] now + 5 minutes
```

### batch

当系统负载小于0.8时立即执行，本质上是at任务每隔一分钟的轮询。

## 循环执行的计划任务

- `/etc/cron.allow`优先级比下面这个高
- `/etc/cron.deny`系统默认保留

二者留一个，推荐下面这个。

crontab实际上是修改`/var/spool/cron/user`下的文件，但还是推荐使用`crontab -e`来修改

### cron格式

```bash
0 12 * * * command
# 分钟 小时 日期 月份 周 命令
# 周与日月不可并存（据说新版没有这个问题了，不过鸟哥没有试过）
```

| 用于时间的参数 | 含义                                |
| -------------- | ----------------------------------- |
| *              | 任何时刻都行（相当于忽略）          |
| ,              | 分割时间段，比如3,6表示3和6         |
| -              | 表示一段时间以内，比如3-6表似乎3到6 |
| /n             | 表示每隔一定时间                    |

```bash
crontab -r # 删除所有crontab
```

### 系统的例行任务

`/etc/crontab`

看一眼就知道了，注意多了个执行人的字段

`crond`服务读取的配置文件位置

- /etc/crontab
- /etc/cron.d/*
- /var/spool/cron/*

除此之外，/etc/crontab中还指定了每个小时都会由脚本`run-parts`执行一次`/etc/cron.hourly`下的内容，其中包括了`anacron`

## 可唤醒停机期间的工作任务

用于解决“时间到了，但机器未启动而无法执行任务”的问题。

crontab会调用`/etc/cron.hourly/0anacron`来执行anacron，它会执行以下文件夹中的内容

- /etc/cron.daily
- /etc/cron.weekly
- /etc/cron.monthly

anacron会对比其与0anacron的时间来判断crontab有无正常执行（所以要用文件名0anacron来确保anacron先更新时间戳）

### anacron

其配置文件位于`/etc/anacrontab`。

```bash
1	5	cron.daily	nice run-parts /etc/cron.daily
# 天数 延迟时间 工作名称的定义 实际要执行的字符串
# 天数用于anacron执行时与/var/spool/anacron/内的时间记录文件对比，大于该日期时就执行
# 延迟执行的时间
```

实际的执行流程

- crontab 调用anacron
- 读取/etc/anacrontab，读取到/etc/cron.daily
- 从/var/spool/anacron/cron.daily取出时间戳并与当前时间对比
- 若准备执行，则根据设置延迟N+START_HOURS_RANGE的时间
- 延迟结束后开始执行

## 总结

- at：定时执行一次
- crontab：定时执行
- anacron：定期执行
