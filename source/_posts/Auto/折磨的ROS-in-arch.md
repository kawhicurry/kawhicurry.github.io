---
title: 折磨的ROS-in-arch（manjaro）
categories:
  - Auto
abbrlink: b84eee2e
date: 2022-04-19 18:29:18
---

# 前言

太痛了！

ROS官方推荐的是拿Ubuntu装ros，但是用过arch系的应该都回不去了吧（笑），刚好arch官方也有ROS的文档，ROS也有arch的推荐位，所以，拿我的manjaro装好啦。

[官方文档](https://wiki.archlinux.org/title/ROS)

上面说有aur源，那只要一键安装就好了。
```bash
yay -Sy ros-melodic-desktop-full
```
然后选一选就完了，好了，这篇文章水完了。

真要这么简单我就不至于写一篇文章来说这个了。记录下安装过程中的各种问题。

首先是ROS的发行版选择，说实话，我个人目前看不出来各个发行版有什么不同，至少不会有ubuntu和centos那样很明显的不同，而Arch提供了两个发行版`noetic`和`melodic`，对于ROS2，则只有一个`galactic`。这里讨论的是ROS1的安装，所以2就忽略了。我上面写的是melodic是因为当初在Ubuntu虚拟机上学ROS的时候就用的它，而且melodic其实也是个蛮好听的单词（狗头）。**然后就出事了**。

# 坑

## 第一个坑，记不清了

```bash
-- found pythoninterp: /usr/bin/python3 (found suitable version "3.10.4", minimum required is "2")
```

后面还有两句，说是找不到python3.9的库，年代久远，找不到记录了。

这时候我尝试了更换python为3.9的版本，但是完全没有用，我也记不得咋解决的，就挺糟糕的。

写到这里的时候我想到要去把终端的输出存成日志，然后就发现了`script`这个命令，可以把终端的所有输出都存进文件。看样子记不起来的东西也能教会我什么，哈哈哈。

贴上`script`自动存储输出的代码片段，贴到zsh最下面就能跑了

```bash
if [ ! -d ~/.local/log ];then
        mkdir -p ~/.local/log
fi
# make sure run in login-shell
if test -t 0 ;then
        if [ $(ps $PPID | grep -c script ) -eq 0 ];then
                local name=~/.local/log/$(date +%Y-%M-%d-%H-%M-%S$(tty | sed 's/\//-/g'))
                script -q -t 2>$name.time -a $name.command
                exit
        fi
fi
```

## log4cxx的奇怪问题

```bash
/usr/include/log4cxx/boost-std-configuration.h:10:18: error: ‘shared_mutex’ in namespace ‘std’ does not name a type
```

说是log4cxx的问题，官方bug，没有修好，解决方案在aur源评论区里：<https://bugs.archlinux.org/task/71847>

```cpp
// change:

#define STD_SHARED_MUTEX_FOUND 1
#define Boost_SHARED_MUTEX_FOUND 0

// to:

#define STD_SHARED_MUTEX_FOUND 0
#define Boost_SHARED_MUTEX_FOUND 1
```
然后编译就过了，具体讨论看上面网址。

## siq的语法错误

应该是python sip的版本问题

```bash
sip: /usr/lib/python3.10/site-packages/pyqt5/bindings/qtcore/qtcoremod.sip:23: syntax error
```

aur源中对pyqt5的依赖为`python-pyqt5-sip4`，而不是直接的`python-pyqt5`。也就是之前`pip`安装过的`pyqt5`是用不了的。得用pip卸了先，然后让yay去处理依赖。

我在这里搜了一大堆教程，告诉我以后装python包不要用pip，要用yay之类的工具，这对于我这种pip习惯用户来说一开始有点不习惯。不过翻阅了arch的python文档之后，发现官方的要求是，所有pip安装的包都要加上`--usre`来确保不会与系统安装的包冲突。论看官方wiki的重要性。

## 无效的python3_add_library

```bash
cmake error at /usr/lib64/cmake/pybind11/pybind11newtools.cmake:207 (python3_add_library):
unknown cmake command "python3_add_library".
```

上面写的好像是`building pybinding interfaces`啥的。这里有个描述上来说非常完美相符的东西，但是没有给解决方案:<https://github.com/OpenChemistry/avogadrolibs/issues/612>

然后我在这里卡了很久，因为`unknown command`的原因是之前需要定义一个什么python::python还是module，不过最后还是定位到正确的cmake文件应该在`/usr/lib/python3.10/site-packages/PyQt5/Qt5/lib`里面，斯，那为什么找到了`/usr/lib64`里面的`.cmake`文件。然后发现是之前手动装过`pybind11`这个包，这个包导致寻找文件的时候优先到`/usr/lib64`里去寻找了，所以把这个包删了，先让它去另一个位置里找链接库，然后后面再自动装回来就行了。

## gazebo对ffmpeg4的依赖

<https://github.com/osrf/gazebo/issues/3180>和这个描述一致，原因是系统默认使用了ffmpeg5而ROS要用ffmpeg4.4，这个issue下面有人提出了如何短暂使用ffmpeg4.4来保证编译顺利进行，其核心思想是跳过依赖检查，从而使得依赖能被顺利安装

```bash
sudo pacman -Rd --nodeps ffmpeg # (and any other ffmpeg you have installed, like the git version)
sudo pacman -S ffmpeg4.4
yay -S gazebo
sudo pacman -S ffmpeg
```

## opencv3-opt对ffmpeg4的依赖

编译melodic的过程中，发现它对一个叫`opencv3-opt`的老版本库有依赖，而这个库写的依赖是`ffmpeg`，但实际上需要的却是`ffmpege4.4`，当时我还没有碰到上面gazebo的那个问题，也没有意识到可以跳过依赖检查，当时索性就删掉了melodic已安装的包，换成了noetic。感觉上来说noetic有些包的依赖似乎却是比melodic处理地更好一些。这个问题的解决方法其实和上面那个是一样的。

## 编译资源占用过多

```bash
cc: fatal error: killed signal terminated program cc1
```
如果你用的中文互联网搜索这个问题，那答案都是告诉你如何建立swap分区加内存。我也加了，但是编译还是通过不了。这个报错的核心是资源占用过多，导致编译所需资源过多时操作系统内核会把编译进场杀掉。一开始我也去看了ulimit之类的资源限制，但是其实已经给的很高了，我这好歹是16线程16G内存的电脑，不至于内存不够用吧。使用`free`和`top`监控资源后发现，大部分时间内存占用量根本不到2G。我想起来`makepkg`会默认使用所有的cpu core去编译文件，查了下`/etc/makepkg.conf`，发现还真是。我手动给它设置成了8核编译，虽然慢一点，但好歹能确保编译通过了。

```bash
#MAKEFLAGS="-j$(($(nproc)+1))"
MAKEFLAGS="-j8"
```

## python找不到链接符号

历经千辛万苦加一次完全卸载（使用`yay -R $(yay -Qmq | grep ros)`+`yay -c`一次性删除所有ROS相关的包），最后一次安装堪称完美，一次
```bash
yay -S ros-noetic-desktop-full
```
直接成功，跑`gazebo`好像也没问题

然后一跑`rosrun rqt_console rqt_console`就发现它报
```
python: symbol lookup error: /usr/lib/python3.10/site-packages/pyqt5/qt5/plugins/platforms/../../lib/libqt5waylandclient.so.5: undefined symbol: _zdlpvm, version qt_5
```

这个问题当时在melodic也出现过，各种答案告诉我，你丫pyqt5没装对，不能用pip装。但是这回是真的用了yay了。又是一段漫长的折磨后，我突然想到，这玩意是运行时动态链接的，那是不是说明它没有被加载到动态链接库里去。于是我先是尝试写了个`/etc/ld.conf.d/qt.conf`的文件，然后刷新动态库，情况有一点点变化了，但是这个报错还在（意思就是在这个报错之上又多了点报错）。于是我又上网查，找到了一个添加`LD_LIBRARY_PATH`的方法，不过我找不到这个想法的来源了，有点难受。最后的解决方法我写在了这里<https://stackoverflow.com/questions/62384480/symbol-lookup-error-after-updating-qt-package/71925946#71925946>

核心思想就是把那个地址加入到动态库里
```bash
export LD_LIBRARY_PAH=/usr/lib/python3.10/site-packages/PyQt5/Qt/lib:$LD_LIBRARY_PATH
```
然后我把这行写进了进入ros环境的脚本里（`/opt/ros/noetic/setup.sh`，注意，不是zsh，虽然zsh对于zsh用户来说也能用），就保证每次都能正常启动了。

## 一点小小的优化

进入ros的指令是写死的
```bash
source /opt/ros/noetic/setup.zsh
```
为了进一步简化，我在`.zshrc`里加了一行
```bash
alias 'rosnow'='source /opt/ros/noetic/setup.zsh'
```
这样就方便多啦。

# 总结

如果仔细想想，其实很多官方包的各种冲突还真不是官方的问题，这里面一部分要甩锅给manjaro，一部分是给自己。在配这份环境之前，我一直没有体会到manjaro和原生arch的区别，这下我是体会到了manjaro“为用户做选择”所带来的一些问题，我在这个过程中也一度想把manjaro删掉了换成arch（还好忍住了）。另一部分就是自己没有好好看arch wiki，导致有些冲突问题。除此之外，这次配环境也是在催促我要赶紧把备份系统搞上来，我居然还不敢来一场系统说换就换的旅行（）

反过来，也是学到了点东西，比如动态库的小知识，比如script这个好东西，还有献出了在`stackoverflow`上的首答。也许所有arch的用户都是这样吧，一边折磨自己，一边享受这份该死的自由。（这句话是不是要写个manjaro用户除外？，但我现在仍然是是manjaro用户，哈哈）
