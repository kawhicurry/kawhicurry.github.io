---
title: ROS学习笔记（1）
tags:
  - tag1
  - tag2
description: ROS学习笔记（1）
categories:
  - Auto
date: 2022-01-20 09:55:13
---
# ROS的环境和基本概念
ros是一个基于linux的操作系统，它通过提供一套自己的工具，把linux变的像是另一套系统。ros也有众多发行版，我这里选择的是`melodic`。接下来会用`<distro>`来表示当前发行版

通过`printenv | grep ROS`可以查看当前的ros环境。为了启动时就进入某个ros环境，需要在启动文件`.bashrc`中加入`source /opt/ros/<distro>/setup.bash`

## Create ROS workspace

有两种工具`catkin`和`rosbuild`，怎么选？官方这样说

> These instructions are for ROS Groovy and later. For ROS Fuerte and earlier, select rosbuild.

`ROS Groovy`是啥？<http://wiki.ros.org/groovy>，总之ubuntu12以上都算。

```bash
mkdir -p ~/catkin_ws/src
cd ~/catkin_ws/
catkin_make
# 如果一开始设置成了python3，那就要这样
catkin_make -DPYTHON_EXECUTABLE=/usr/bin/python3
# 设置workspace环境
source devel/setup.bash
# 看一眼设置好没有
echo $ROS_PACKAGE_PATH
/home/youruser/catkin_ws/src:/opt/ros/kinetic/share
```

# ROS文件系统

> 接下来几章都是ros专门的教程内容，如果安装时选择了`full-installation`，那下面的不用看，如果没有，请先安装教程
>
> ```bash
> sudo apt-get install ros-<distro>-ros-tutorials
> ```

上一章提到，ros是通过一系列工具让linux看起来像另一个操作系统。这里的文件系统就是个很好的体现。

## rospack

```bash
rospack find [package_name]
rospack install [package_name]
```

相当于ros的包管理器

## roscd

```bash
roscd <package-or-stack>/[/subdir]
roscd log # 当某个ros program 跑起来的时候才有用
```

ros版本的cd，ros可能是有另一套filesystem，不过还是基于linux的fs构建的，所以也算是一个方便的工具，毕竟package可能会被安装在各种地方。package的安装位置可以通过`echo $ROS_PACKAGE_PATH`查看。

## rosls

ros版的ls，略了。

## tab补全

略了

# Create ROS Package

## 准备工作

`catkin package`的必要条件

- 一个`package.xml`文件
- 一个`CMakeLists.txt`文件
- 为每个package准备独立的文件夹

像这样

```bash
 workspace_folder/        -- WORKSPACE
    src/                   -- SOURCE SPACE
      CMakeLists.txt       -- 'Toplevel' CMake file, provided by catkin
      package_1/
       CMakeLists.txt     -- CMakeLists.txt file for package_1
       package.xml        -- Package manifest for package_1
     ...
     package_n/
       CMakeLists.txt     -- CMakeLists.txt file for package_n
       package.xml        -- Package manifest for package_n
```

## 开始建立

```bash
# cd ~/catkin_ws/src
catkin_create_pkg beginner_tutorials std_msgs rospy roscpp
cd ~/catkin_ws
catkin_make
. ~/catkin_ws/devel/setup.bash # . 相当于source
```

以下为`catkin_create_pkg`的用法

```bash
# 格式
catkin_create_pkg <package_name> [depend1] [depend2] [depend3]
```

## 查看依赖

### 查看直接依赖

1. 通过rospack查看

```bash
rospack depends1 beginner_tutorials 
	roscpp
	rospy
	std_msgs
```

2. 通过xml文件查看

```bash
roscd beginner_tutorials
cat package.xml
```

### 查看间接依赖

```bash
rospack depends1 rospy # 子依赖的直接依赖
rospack depends beginner_tutorials # 查看包括嵌套的所有子依赖项
```

## 自定义package

### 首先要修改xml文件

```xml
<!--首先是描述标签-->
<description>The beginner_tutorials package</description>
```

```xml
<!--然后是持有者信息标签-->
<!-- One maintainer tag required, multiple allowed, one person per tag --> 
<!-- Example:  -->
<!-- <maintainer email="jane.doe@example.com">Jane Doe</maintainer> -->
<maintainer email="user@todo.todo">user</maintainer>
```

```xml
<!--然后是license-->
<!-- One license tag required, multiple allowed, one license per tag -->
<!-- Commonly used license strings: -->
<!--   BSD, MIT, Boost Software License, GPLv2, GPLv3, LGPLv2.1, LGPLv3 -->
<license>TODO</license>
```

```xml
<!--然后是依赖标签-->
<!-- The *_depend tags are used to specify dependencies -->
<!-- Dependencies can be catkin packages or system dependencies -->
<!-- Examples: -->
<!-- Use build_depend for packages you need at compile time: -->
<!--   <build_depend>genmsg</build_depend> -->
<!-- Use buildtool_depend for build tool packages: -->
<!--   <buildtool_depend>catkin</buildtool_depend> -->
<!-- Use exec_depend for packages you need at runtime: -->
<!--   <exec_depend>python-yaml</exec_depend> -->
<!-- Use test_depend for packages you need only for testing: -->
<!--   <test_depend>gtest</test_depend> -->
<buildtool_depend>catkin</buildtool_depend>
<build_depend>roscpp</build_depend>
<build_depend>rospy</build_depend>
<build_depend>std_msgs</build_depend>
```

```xml
<!--对于希望在build和run的时候能用上的依赖，还要加上下面的-->
<exec_depend>roscpp</exec_depend>
<exec_depend>rospy</exec_depend>
<exec_depend>std_msgs</exec_depend>
```

最后的结果

```xml
<?xml version="1.0"?>
<package format="2">
  <name>beginner_tutorials</name>
  <version>0.1.0</version>
  <description>The beginner_tutorials package</description>

  <maintainer email="you@yourdomain.tld">Your Name</maintainer>
  <license>BSD</license>
  <url type="website">http://wiki.ros.org/beginner_tutorials</url>
  <author email="you@yourdomain.tld">Jane Doe</author>

  <buildtool_depend>catkin</buildtool_depend>

  <build_depend>roscpp</build_depend>
  <build_depend>rospy</build_depend>
  <build_depend>std_msgs</build_depend>

  <exec_depend>roscpp</exec_depend>
  <exec_depend>rospy</exec_depend>
  <exec_depend>std_msgs</exec_depend>

</package>
```

## 然后修改CMakeLists.txt

教程没说，自己看吧。

# Build Ros Package

```bash
# 常规的CMake
# In a CMake project
$ mkdir build
$ cd build
$ cmake ..
$ make
$ make install  # (optionally)
# 现在的catkin_make
# In a catkin workspace
$ catkin_make --source my_src
$ catkin_make install --source my_src  # (optionally)
```

# ROS Nodes

## 理论

- [Nodes](http://wiki.ros.org/Nodes): A node is an executable that uses ROS to communicate with other nodes.
- [Messages](http://wiki.ros.org/Messages): ROS data type used when subscribing or publishing to a topic.
- [Topics](http://wiki.ros.org/Topics): Nodes can *publish* messages to a topic as well as *subscribe* to a topic to receive messages.
- [Master](http://wiki.ros.org/Master): Name service for ROS (i.e. helps nodes find each other)
- [rosout](http://wiki.ros.org/rosout): ROS equivalent of stdout/stderr
- [roscore](http://wiki.ros.org/roscore): Master + rosout + parameter server (parameter server will be introduced later)

## Nodes

> Nodes can publish or subscribe to a Topic. Nodes can also provide or use a Service.

## rosnode

```bash
# run roscore first
roscore
# using rosnode
rosnode list
	/rosout
rosnode info /rosout
```

## rosrun

```bash
# rosrun [package_name] [node_name]
rosrun turtlesim turtlesim_node
rosrun turtlesim turtlesim_node __name:=my_turtle
# 使用rosnode list 查看
rosnode list
	/my_turtle
	/rosout
# 使用rosnode ping 检查
rosnode ping
```

# ROS Topics

## 启动小海龟

```bash
roscore &
rosrun turtlesim turtlesim_node &
torrun turtlesim turtle_teletop_key
# new terminal
rosrun rqt_graph rqt_graph
# 打开rqt_graph工具，查看nodes和topics之间的通信方式（订阅关系）
```

## rostopic

```bash
$ rostopic -h
rostopic bw     display bandwidth used by topic
rostopic echo   print messages to screen
rostopic hz     display publishing rate of topic    
rostopic list   print information about active topics
rostopic pub    publish data to topic
rostopic type   print topic type
```

### rostopic echo

```bash
# rostopic echo [topic]
# For ROS Hydro and later, this data is published on the /turtle1/cmd_vel topic.
rostopic echo /turtle1/cmd_vel
# For ROS Groovy and earlier, this data is published on the /turtle1/command_velocity topic.
# 略了
```

此时在rqt刷新一下可以看到，rostopic也在获取信息

### rostopic list

```bash
rostopic list -h
Usage: rostopic list [/topic]

Options:
  -h, --help            show this help message and exit
  -b BAGFILE, --bag=BAGFILE
                        list topics in .bag file
  -v, --verbose         list full details about each topic
  -p                    list only publishers
  -s                    list only subscribers
```

verbose option

```bash
rostopic list -v
```

### rostopic type && rosmsg初探

上面都是对node的查看，下面是对`ros message`的查看。

```bash
# rostopic type [topic]
# 首先查看topic的类型
rostopic type /turtle1/cmd_vel
# 然后使用rosmsg查看msg的内容
rosmsg show geometry_msgs/Twist
```

### rostopic pub

手动发送信息

```bash
# rostopic pub [topic] [msg_type] [args]
rostopic pub -1 /turtle1/cmd_vel geometry_msgs/Twist -- '[2.0, 0.0, 0.0]' '[0.0, 0.0, 1.8]'
# 小海龟转圈
rostopic pub /turtle1/cmd_vel geometry_msgs/Twist -r 1 -- '[2.0, 0.0, 0.0]' '[0.0, 0.0, -1.8]'
```

### rostopic hz

> `rostopic hz` reports the rate at which data is published.

```bash
# rostopic hz [topic]
rostopic hz /turtle1/pose
rostopic type /turtle1/cmd_vel | rosmsg show
```

### rqt_plot

```bash
rosrun rqt_plot rqt_plot
```

对数据绘图
