---
title: 重学linux（12）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/img_1327.jpg
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: ed9800f
date: 2022-03-03 12:44:24
---

# 什么是进程

PID由UID/GID获取而来

子进程的有PPID

学OS的时候再来深入探究一下

# 任务管理（Job control）

已经很熟悉了，稍微记一下

- &
- ctrl+z
- jobs
- fg
- bg
- kill

如果是脱机任务，还可以这样

- at
- nohup

# 进程管理

## 查看进程

### ps

```bash
ps aux
ps -lA # 同上
# 只需记住两个
ps aux # 输出所有系统运行的进程
ps -l # 输出当前bash的进程

kawhicurry@ubuntu:~$ ps -l
F S   UID    PID   PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD
0 S  1000  10100  10099  0  80   0 -  7480 wait   pts/1    00:00:00 bash
0 R  1000  27188  10100  0  80   0 -  9006 -      pts/1    00:00:00 ps
```

| 参数          | 含义                                                         |
| ------------- | ------------------------------------------------------------ |
| F             | 进程标识（process flag）                                     |
| S             | Stat，有R（running），S（sleep），D（不可唤醒的sleep，如等待io），T（stop or trace），Z（zombie） |
| UID/PID/PPID  | 略了                                                         |
| C             | cpu使用率                                                    |
| PRI/NI        | Priority/Nice                                                |
| ADDR/SZ/WCHAN | 都与内存相关，ADDR指kernel function，指出进程在内存的哪个部分，SZ代表用掉了多少内存，WCHAN表示目前进程是否运行，`-`表示正在运行 |
| TTY           | 登陆者的终端                                                 |
| TIME          | 实际使用cpu的时间                                            |
| CMD           | 实际触发该进程的命令                                         |

`ps aux`的解释就免了，大概就这么多东西。

### top

```bash
top [-d number]
top [-bnp]
# -d 后面接刷新时间
# -b 以批量方式执行top
# -n 和-b配合，执行n次top输出结果
# -p 指定pid
```

top执行过程中可以使用的按键命令

| 命令 | 含义                |
| ---- | ------------------- |
| ？   | 帮助                |
| P    | 以cpu使用排序       |
| M    | 以memory排序        |
| N    | 以PID排序           |
| T    | 以TIME排序          |
| k    | 给某个pid一个signal |
| r    | 给某个pid一个nice值 |
| q    | 退出                |

### pstree

太大了，感觉用不上，不过还是很帅的

## 进程管理

使用信号，信号量可用`kill -l`查看

## 进程执行顺序

Priority由系统决定，无法改变

- priority越小越先被执行
- PRI（new）=PRI（old）+nice

Nice可由用户指定，间接影响Priority

- nice可调整的范围为-20~19
- root可随意调整
- user只能调整自己进程的nice值，且范围为0~19（这是为了防止一般用户抢占系统资源）

### nice

用于给新执行的命令一个优先级

```bash
nice [-n number] command
```

### renice

```bash
renice [number] PID
```

## 查看系统资源信息

### free

内存使用

用过不少了，记得`-h`（human）和`-s`（不断刷新）就行了

### uname

系统与内核信息

要啥有啥，直接看`--help`

### uptime

用`w`吧

### netstat

高级话题了，先几个`-tunlp`

### dmesg

分析内核产生的信息

包括**启动时一闪而过的**，以及后面生成的

### vmstat

检测系统资源变化，好东西

```bash
vmstat [-a]
```

| 参数       | 含义     |
| ---------- | -------- |
| -a         | all      |
| -fs        | 内存相关 |
| -S         | 单位     |
| -d         | 磁盘相关 |
| -p partion | 分区相关 |

- procs字段说明

  | 参数 | 含义                 |
  | ---- | -------------------- |
  | r    | 等待运行中的进程数量 |
  | b    | 不可唤醒的进程数量   |

- memory

  | 参数  | 含义     |
  | ----- | -------- |
  | swpd  | swap分区 |
  | free  | 未被使用 |
  | buff  | 缓冲区   |
  | cache | 告诉缓存 |

- swap

  | 参数 | 含义                                         |
  | ---- | -------------------------------------------- |
  | si   | 磁盘中进程取出的容量                         |
  | so   | 内存不足而将没用的进程写入到磁盘中的swap容量 |

- io

  | 参数 | 含义                 |
  | ---- | -------------------- |
  | bi   | 读入的区块数量       |
  | bo   | 写入到磁盘的区块数量 |

- system

  | 参数 | 含义                   |
  | ---- | ---------------------- |
  | in   | 每秒被中断的进程数量   |
  | cs   | 每秒执行的事件切换次数 |

- cpu

  | 参数 | 含义                    |
  | ---- | ----------------------- |
  | us   | 非内核层cpu的使用状态   |
  | sy   | 内核层cpu的使用状态     |
  | id   | 闲置的状态              |
  | wa   | 等待IO所耗费的cpu状态   |
  | st   | 被虚拟机所使用的cpu状态 |

# 特殊文件与进程

## /proc/*下的内容

| 文件        | 内容                           |
| ----------- | ------------------------------ |
| cmdline     | 加载内核时所执行相关命令与参数 |
| cpuinfo     | cpu                            |
| devices     | 主要设备的设备id               |
| filesystems | 系统已加载的文件系统           |
| interrupts  | 系统上面的IRQ分配状态          |
| ioports     | 各个io所配置的地址             |
| kcore       | 就是内存大小（不要读这个）     |
| loadavg     | w，uptime，top的负载值         |
| meminfo     | free的内存信息                 |
| modules     | 内核加载的模块，即驱动         |
| mounts      | 挂载数据                       |
| swaps       | 系统挂载的内存                 |
| partitions  | fdisk -l的记录                 |
| uptime      | 。。。                         |
| version     | 内核版本呢，uname -a的记录值   |
| bus/*       | 总线设备，USB设备              |

## 查询已使用文件或已执行进程使用的文件

### fuser

列出在使用当前文件的进程

```bash
fuser [-umv] [-k[i]] [-signal] dir/file
```

| 参数 | 含义                                      |
| ---- | ----------------------------------------- |
| -u   | 列出owner                                 |
| -v   | verbose                                   |
| -k   | 找出使用该文件/目录的PID并向其发送SIGKILL |
| -i   | 与k使用，发送前询问                       |

fuser结果中ACCESS字段的参数

| 参数 | 含义                           |
| ---- | ------------------------------ |
| c    | 此进程在当前目录下             |
| e    | 可被触发为执行状态             |
| f    | 是一个开启状态的文件           |
| r    | 表示顶层目录                   |
| F    | 该文件被使用了，不过在等待响应 |
| m    | 可能为共享的动态库             |

### lsof

列出被进程使用的文件名称

```bash
lsof [-aUu] [+d]
```

| 参数        | 含义                                |
| ----------- | ----------------------------------- |
| -a          | 多项条件同时成立时才列出            |
| -U          | 仅列出UNIK-like系统的socket文件类型 |
| -u username | 列出使用者相关进程的文件            |
| +d dir      | 找出某个目录下被使用的文件          |

### pidof

找出某个正在执行的进程的pid

```bash
pidof [-sx] program_name
# -s 仅列出一个pid，而不是所有
# -x 同时列出program name可能的PPIDn
```

