---
title: ROS学习笔记（2）
tags:
  - linux
  - ros
  - 专栏：ros学习笔记
description: ROS学习笔记（2）
categories:
  - Auto
abbrlink: f462bbbb
date: 2022-01-21 15:15:08
---

# ROS Service

## rosservice

> Services are another way that nodes can communicate with each other. Services allow nodes to send a **request** and receive a **response**.

```bash
rosservice list         print information about active services
rosservice call         call the service with the provided args
rosservice type         print service type
rosservice find         find services by service type
rosservice uri          print service ROSRPC uri
```

## rosparam

```bash
rosparam set            set parameter
rosparam get            get parameter
rosparam load           load parameters from file
rosparam dump           dump parameters to file
rosparam delete         delete parameter
rosparam list           list parameter names
```

# 使用rqt_console和roslaunch

## rqt_console

```bash
rosrun rqt_console rqt_console # 查看日志
rosrun rqt_logger_level rqt_logger_level # 设置日志等级，来源
```

## roslaunch

自定义xml文件，使一只小海龟模仿另一只。

```bash
roslaunch [package] [filename.launch]
```

# ROS ed

### rosed

```bash
# rosed [package_name] [filename]
rosed roscpp Logger.msg
```

使用`echo $EDITOR`查看当前的编辑器（为空说明使用了默认的`vim`）

可使用`export EDITOR='nano -w'`之类的方式修改编辑器（永久修改的话最好把这行加入`.bashrc`）

# 创建ROS msg和srv文件

> - [msg](http://wiki.ros.org/msg): msg files are simple text files that describe the fields of a ROS message. They are used to generate source code for messages in different languages.
> - [srv](http://wiki.ros.org/srv): an srv file describes a service. It is composed of two parts: a request and a response.

> msgs are just simple text files with a field type and field name per line. The field types you can use are:
>
> - int8, int16, int32, int64 (plus uint*)
> - float32, float64
> - string
> - time, duration
> - other msg files
> - variable-length array[] and fixed-length array[C]

> srv files are just like msg files, except they contain two parts: a request and a response. The two parts are separated by a '---' line. Here is an example of a srv file:
>
> 
>
> ```bash
> int64 A
> int64 B
> ---
> int64 Sum
> ```

## 创建msg文件

1. 在package目录下建立`msg`文件夹，向该文件夹写入一个`.msg`文件。

2. 回到package目录下，修改`package.xml`文件

   ```xml
     <build_depend>message_generation</build_depend>
     <exec_depend>message_runtime</exec_depend>
   ```

3. 修改`CMakeLists.txt`

   1. `find_package`中添加`message_generation`
   2. `catkin_package`的`CATKIN_DEPENDS`后添加`message_runtime`
   3. 取消`add_message_files`的注释，并向其中添加之前写的`.msg`文件
   4. 取消`generate_messages`的注释

4. 查看msg文件，使用`rosmsg show`如果文件格式没问题，会显示出定义的数据

### rosmsg

```bash
  rosmsg show     Show message description
  rosmsg list     List all messages
  rosmsg md5      Display message md5sum
  rosmsg package  List messages in a package
  rosmsg packages List packages that contain messages
```

## 创建srv文件

1. 在package下建立`srv`文件夹
1. 使用`roscp`从其他地方复制个写好的`.srv`文件过来（肯定也能自己写拉）
1. 同[创建msg文件](#创建msg文件) ，要确保`package.xml`和`CMakeLists.txt`中有相应的内容
1. `CMakeLists.txt`中，取消`add_service_files`的注释，并向其中添加之前写的`.srv`文件

### roscp

```bash
$ roscp [package_name] [file_to_copy_path] [copy_path]
```

### rossrv

```bash
rossrv show <service type>
```

## 生成msg和srv文件

1. 切换到package目录的上两层（就是workspace所在的目录，这里是`~/catkin_ws`）
2. `catkin build`或者`catkin_make`
3. 文件生成好了，具体放在哪见下方参考

> Any .msg file in the msg directory will generate code for use in all supported languages. The C++ message header file will be generated in `~/catkin_ws/devel/include/beginner_tutorials/`. The Python script will be created in `~/catkin_ws/devel/lib/python2.7/dist-packages/beginner_tutorials/msg`. The lisp file appears in `~/catkin_ws/devel/share/common-lisp/ros/beginner_tutorials/msg/`.
>
> Similarly, any .srv files in the srv directory will have generated code in supported languages. For C++, this will generate header files in the same directory as the message header files. For Python and Lisp, there will be an 'srv' folder beside the 'msg' folders.
>
> The full specification for the message format is available at the [Message Description Language](http://wiki.ros.org/ROS/Message_Description_Language) page.
