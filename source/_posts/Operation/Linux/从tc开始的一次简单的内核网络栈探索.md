---
title: 从tc开始的一次简单的内核网络栈探索
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_9371.JPG
tags:
  - linux
  - tc
categories:
  - Operation
  - Linux
abbrlink: 47a3710b
date: 2023-10-29 12:30:06
---

# 引子

本来只是在过[xdp-tutorial](https://github.com/xdp-project/xdp-tutorial)的教程。
[里面](https://github.com/xdp-project/xdp-tutorial/tree/master/advanced01-xdp-tc-interact)提到了xdp并不是linux内核中唯一的ebpf network hook。另一个例子就是tc。还提到了有一种方法可以通过xdp讲metadata传递给tc。

于是顺便研究了下tc，发现这玩意是用来做流控的，而且和xdp有个很大的区别是，tc可以接管egress，这是xdp做不到的。
恰好这时候遇到了一堆机缘巧合，比如@dreamlike大力夸赞宇宙厂使用tc做透明流量劫持，比如CSIG面试官的听到xdp莫得反应，但是听到tc就兴奋地考我啥是net_cls（总之是一个我听了觉得满头问号的场景），比如偶遇了以为CSIG做网络的大佬，介绍了下业界目前前沿的网络方案。

恰好linux网络这一块一直没补上，深知自己太菜的我只能长叹一声：“彳亍，我看，我看还不行嘛”。

# 从tc开始

## 啥是tc？

先看<https://man7.org/linux/man-pages/man8/tc.8.html>

>       Tc is used to configure Traffic Control in the Linux kernel.

这句话告诉我们，内核里其实实现了traffic control的功能，而tc其实是一个userspace的命令，只是个调整内核设置的工具。那现在就有了两个最简单的问题：

1. tc命令咋用，能干啥？
2. 内核里做了什么？如何能达到traffic control的目的？

## tc能干啥？

如果只是使用，网上随便搜搜就有了，请读者自行搜索。这里列举一些目前观测到的用途：

1. 限流（老本行，发明出来就是干这个的）
2. 模拟网络波动、延迟等糟糕的网络环境（只适用于调试用户态程序，不必多说）
3. 透明代理（没错，cilium！）
4. 网卡转发（没错，bpf！）

## tc的核心概念

在进一步讨论tc的实现之前，似乎有必要停下来给完全没用过tc的同学（比如两个月前的我）介绍下tc的基本概念。

还是看[man page](https://man7.org/linux/man-pages/man8/tc.8.html)。注意这里有三个概念：
- QDISCS
- CLASSES
- FILTERS 

专业的读者可以自行阅读这些概念，没用过的菜鸡（比如两个月前的我）可以先来看看我的解释。

### 浅显的解释：尝试自己构建一个流控系统

如果我们自己写一个流控系统，我们会怎么做？

众所周知，网络数据会以frame/packet的形式进入linux的kernel。那我们要控制这些frame/packet的速度该怎么做呢？没错，排队！于是我们设计出了一个很长很长的**队列**，然后给这个队列设计了相应的**策略**让进入的流量在里面排着队，然后慢慢悠悠但有条不紊的发送出去。然后我们碰到了另一个问题：所有流量都要排队嘛？

显然不是，如果我后台下载小电影的流量影响了我在游戏里乱杀，那我会气到把小电影都删掉的（这是虚构场景哈，我是指我没有在游戏里乱杀）。所以我们需要另一个概念：**分类**，把下载小电影的流量分类到受到限制的队列中，把游戏分到更加畅通的队列中。

接下来看看另一个问题，我们已经把游戏的流量和下载的流量区分开来，那让我们继续看看这个场景：游戏里的流量也是有分类的，有对战的流量，也有语音的流量。在一些网络环境不太好的情况下，这些流量也会互相干扰（一个更明显的案例是，网不好的时候会议软件不要开视频，不然声音会卡）。那我如何进一步对这些细分的流量做限制呢？当然，你完全可以直接再加一个分类。就像这样：
- 电影
- 游戏语音
- 游戏对战

不过树形的结构很显然要更合理一点：
- 电影
- 游戏
    - 语音
    - 对战

没错，理论上你应该允许分类规则*递归*处理这些数据，而不是把所有控制写到同一层里。

我们已经设计好了自己的tc，接下来我们看看linux的tc是怎么做的。

### 详细的设计：tc的基本概念

tc把队列和策略合二为一，称为`qdisc`，即queueing discipline。接下来qdisc会被分成两类：`classful qdisc`和`classless qdisc`。前者本身不直接处理数据，而是通过`filter`讲数据转交给其他qdisc，这里的其他qdisc可以是直接处理数据的classless qdisc，也可以是又一个进行分类的classful qdisc。

关于分类，可以看看[arch wiki](https://wiki.archlinux.org/title/advanced_traffic_control#Classful_Qdiscs)

## tc命令的通信机制

虽然我计算机知识比较贫瘠，但好在C语言还是看的懂的。tc是[iproute2项目](https://github.com/iproute2/iproute2)的一部分。我强调我计算机知识贫瘠是因为这是我头回了解*内核如何与用户进程通信*这个话题，我花了点时间才意识到tc其实是通过`netlink`来进行通信的。

一开始我用 strace 来追踪 tc qdisc show 这个命令，然后发现它打开了`/proc/net/psched`这个文件，我以为它是类似cgroup那样有一个虚拟fs之类的接口。后面仔细读了代码发现应该是netlink的socket进行的通信。于是这里又有了两个问题：

1. /proc/net/psched 这个文件里有啥？
2. 如何通过netlink通信呢？接口是啥样？

### /proc/net/psched

```bash
$ cat /proc/net/psched 
000003e8 00000040 000f4240 3b9aca00
```

直接读取可以看到里面有四个数，我们看看tc是怎么读它的：

```c
static double tick_in_usec = 1;
static double clock_factor = 1;

int tc_core_init(void)
{
	FILE *fp;
	__u32 clock_res;
	__u32 t2us;
	__u32 us2t;

	fp = fopen("/proc/net/psched", "r");
	if (fp == NULL)
		return -1;

	if (fscanf(fp, "%08x%08x%08x", &t2us, &us2t, &clock_res) != 3) {
		fclose(fp);
		return -1;
	}
	fclose(fp);

	/* compatibility hack: for old iproute binaries (ignoring
	 * the kernel clock resolution) the kernel advertises a
	 * tick multiplier of 1000 in case of nano-second resolution,
	 * which really is 1. */
	if (clock_res == 1000000000)
		t2us = us2t;

	clock_factor  = (double)clock_res / TIME_UNITS_PER_SEC;
	tick_in_usec = (double)t2us / us2t * clock_factor;
	return 0;
}
```

我们可以看到tc其实只读了前三个数，赋值给了三个参数 t2us,us2t,clock_res，然后用这三个数去计算出了两个全局静态变量 clock_factor 和 tick_in_usec。这两个变量又被用在哪里呢？全局搜了下，被用在这几个函数里
```C
unsigned int tc_core_time2tick(unsigned int time)
{
	return time*tick_in_usec;
}

unsigned int tc_core_tick2time(unsigned int tick)
{
	return tick/tick_in_usec;
}

unsigned int tc_core_time2ktime(unsigned int time)
{
	return time * clock_factor;
}

unsigned int tc_core_ktime2time(unsigned int ktime)
{
    // ...
}

// ...
```

似乎是一些时间相关的函数，我们挑一个函数看看被用在哪里

```C
// 调用链如下
// tc_core_time2tick <- tc_cbq_calc_maxidl <- cbq_parse_class_opt

struct qdisc_util cbq_qdisc_util = {
	.id		= "cbq",
	.parse_qopt	= cbq_parse_opt,
	.print_qopt	= cbq_print_opt,
	.print_xstats	= cbq_print_xstats,
	.parse_copt	= cbq_parse_class_opt,
	.print_copt	= cbq_print_opt,
};
```

到了cbq这里可能大家会有些疑惑了，这是个啥？让我们回到[官方文档](https://man7.org/linux/man-pages/man8/tc.8.html)搜索CBQ。

>       CBQ    Class Based Queueing implements a rich linksharing
>              hierarchy of classes.  It contains shaping elements as
>              well as prioritizing capabilities. Shaping is performed
>              using link idle time calculations based on average packet
>              size and underlying link bandwidth. The latter may be ill-
>              defined for some interfaces.

cbq是一种classful qdisc。也就是说所谓的open /proc/net/psched只是为了取几个时间参数罢了。这几个时间参数后面会被用在创建一些类型的 qdisc 的时候，**tc并不是通过fs来和内核通信的**。

想知道这结果参数到底是啥？请自行阅读内核代码

```C
// net/sched/sch_api.c
static int psched_show(struct seq_file *seq, void *v)
{
	seq_printf(seq, "%08x %08x %08x %08x\n",
		   (u32)NSEC_PER_USEC, (u32)PSCHED_TICKS2NS(1),
		   1000000,
		   (u32)NSEC_PER_SEC / hrtimer_resolution);

	return 0;
}
```

### Netlink

先来看看[官方文档](https://docs.kernel.org/userspace-api/netlink/intro.html)是怎么说的：

> Netlink is often described as an ioctl() replacement. It aims to replace fixed-format C structures as supplied to ioctl() with a format which allows an easy way to add or extended the arguments.

好，看看[ioctl](https://man7.org/linux/man-pages/man2/ioctl.2.html)

> The ioctl() system call manipulates the underlying device
       parameters of special files.

看不懂了，总之就是和长得像文件的硬件通信？等等，netlink是socket，那不就和别的socket差不多？比如ipv4的和v6的或者unix的？

算了，看点轻松的吧。这是我当时提出来的问题，如果tc不是通过fs这种方式和内核沟通，也完全看不到相关的syscall，那还有哪些方式呢？于是我 google 了下这个问题 [What is the best way to communicate a kernel module with a user space program?](https://stackoverflow.com/questions/20975566/what-is-the-best-way-to-communicate-a-kernel-module-with-a-user-space-program)

好家伙，原来还有种通信方式叫netlink，头回知道（狗头）。于是在源码里搜索栏下`AF_NETLINK`，可以确定tc命令就是通过netlink与内核模块进行通信的了。

### tc的一些有趣的功能

本来这里是打算花长篇大论描述一下tc子系统是如何实现的，尤其是各种队列的设置。但是在中间的学习过程中突然了解到现代的linux网络早就认为“基于排队的发送”已经过时了，更高效的方案是“基于时间的发送”，即EDT。同时我还发现tc只是整个网络栈中很小的一环，我已经等不及去探索更深的地方了。

因此我决定不要在这样一个小工具上花太多时间去给其他读者重复这些可能没有太多用途的东西。但是既然决定开始写一篇这样的博客，那就还是要有头有尾。
这里记录一些tc有趣的功能，如果读者感兴趣，不妨自己去探索。

- [tc-bpf](https://man7.org/linux/man-pages/man8/tc-bpf.8.html) 没错，可以把bpf代码注入到tc提供的hook中，这是一个比xdp靠后得多的位置。我们所熟知的cilium就是在这里做了一大堆工作。
- [tc-pedit](https://man7.org/linux/man-pages/man8/tc-pedit.8.html) tc允许注入一个叫做`pedit`的action用于修改packet的内容。评价是不如ebpf，ebpf可以直接改。

### 一些关于tc的疑惑

快问快答：
#### tc工作在哪一层？

网络层，在netfilter前面，tap设备处理后面。因此，tc没有conntrack的相关功能。

#### tc拿到的数据是啥样的？
确切的说，是一个以太网的`帧`.有兴趣可以看看[这篇文章](https://davidlovezoe.club/wordpress/archives/952)，写的相当清晰。其实写一个注入到tc中的ebpf代码没啥难的，只要你能理解如何用kernel header中的struct来解析网络协议中各层的header就行。

#### tc的内核配置只能用tc命令实现嘛？
当然不是，上面已经说过tc命令也是通过netlink通信，所以直接使用netlink通信就行了，可以模仿tc命令写c，也可以调用下别人的相关库，比如这个：[go-tc](https://github.com/florianl/go-tc)

#### cilium怎么讲ebpf命令注入到tc内核模块中呢？
参考[源码](https://github.com/cilium/cilium/blob/ba6c6612645bee766e303570f346c9f7c48d1e52/pkg/datapath/loader/netlink.go#L207)，cilium直接调用了第三方的netlink库来执行注入。可以说是非常好用。

### linux RX

如我在上面所说，tc只是网络栈众多子系统中的一个，更大的世界等着我们去探索。下面这篇文章可以让我们对于整个RX有一个大概的认知，但想要了解整个linux网络栈的工作方式，要做的工作恐怕还有很多。

- http://arthurchiao.art/blog/linux-net-stack-implementation-rx-zh/#736-tc-%E5%A4%84%E7%90%86

# 参考

- https://man7.org/linux/man-pages/man8/tc.8.html
- https://wiki.archlinux.org/title/advanced_traffic_control#Classful_Qdiscs
