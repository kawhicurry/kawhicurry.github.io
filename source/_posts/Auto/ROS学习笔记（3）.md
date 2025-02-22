---
title: ROS学习笔记（3）
cover : https://cdn.jsdelivr.net/gh/kawhicurry/picgo/gallery/nord/DSC_0164.JPG
tags:
  - linux
  - ros
  - 专栏：ros学习笔记
description: ROS学习笔记（3）
categories:
  - Auto
abbrlink: 4cdedcde
date: 2022-01-23 10:12:25
---

# 写一个简单的publisher和subscriber

## 基本流程

1. 在package目录下建立`src`文件夹
2. 向其中写入一个`talker.cpp`和一个`listener.cpp`
3. 向`CMakeLists.txt`中写入依赖项
4. 回到workspace目录，`catkin_make`
5. 切换到workspace环境，并启动roscore
6. `rosrun begginer_tutorials talker`
7. `rosrun begginer_tutorials listener`

## 文件说明

```cpp
// talker.cpp
#include "ros/ros.h" //这是一个大的头文件，包含了所有需要的头文件，偷懒专用
#include "std_msgs/String.h" //使用msg包

#include <sstream>

/**
 * This tutorial demonstrates simple sending of messages over the ROS system.
 */
int main(int argc, char **argv)
{
  /**
   * The ros::init() function needs to see argc and argv so that it can perform
   * any ROS arguments and name remapping that were provided at the command line.
   * For programmatic remappings you can use a different version of init() which takes
   * remappings directly, but for most command-line programs, passing argc and argv is
   * the easiest way to do it.  The third argument to init() is the name of the node.
   *
   * You must call one of the versions of ros::init() before using any other
   * part of the ROS system.
   */
  ros::init(argc, argv, "talker"); //初始化ros，并将该node的名字定为“talker”

  /**
   * NodeHandle is the main access point to communications with the ROS system.
   * The first NodeHandle constructed will fully initialize this node, and the last
   * NodeHandle destructed will close down the node.
   */
  ros::NodeHandle n; //

  /**
   * The advertise() function is how you tell ROS that you want to
   * publish on a given topic name. This invokes a call to the ROS
   * master node, which keeps a registry of who is publishing and who
   * is subscribing. After this advertise() call is made, the master
   * node will notify anyone who is trying to subscribe to this topic name,
   * and they will in turn negotiate a peer-to-peer connection with this
   * node.  advertise() returns a Publisher object which allows you to
   * publish messages on that topic through a call to publish().  Once
   * all copies of the returned Publisher object are destroyed, the topic
   * will be automatically unadvertised.
   *
   * The second parameter to advertise() is the size of the message queue
   * used for publishing messages.  If messages are published more quickly
   * than we can send them, the number here specifies how many messages to
   * buffer up before throwing some away.
   */
  ros::Publisher chatter_pub = n.advertise<std_msgs::String>("chatter", 1000); // 创建msg的publisher

  ros::Rate loop_rate(10); // 设定频率，单位Hz，与sleep（）搭配使用

  /**
   * A count of how many messages we have sent. This is used to create
   * a unique string for each message.
   */
  int count = 0;
  while (ros::ok()) // 循环
  {
    /**
     * This is a message object. You stuff it with data, and then publish it.
     */
    std_msgs::String msg;

    std::stringstream ss;
    ss << "hello world " << count;
    msg.data = ss.str();

    ROS_INFO("%s", msg.data.c_str()); //这是print/cout的ros写法

    /**
     * The publish() function is how you send messages. The parameter
     * is the message object. The type of this object must agree with the type
     * given as a template parameter to the advertise<>() call, as was done
     * in the constructor above.
     */
    chatter_pub.publish(msg); // 这里发出去了

    ros::spinOnce(); //接受反馈用的，但是在这里没用

    loop_rate.sleep(); //和上面的循环搭配使用
    ++count;
  }


  return 0;
}
```

```cpp
// listener.cpp
#include "ros/ros.h"
#include "std_msgs/String.h"

/**
 * This tutorial demonstrates simple receipt of messages over the ROS system.
 */
void chatterCallback(const std_msgs::String::ConstPtr& msg)
{
  ROS_INFO("I heard: [%s]", msg->data.c_str());
}
// 一个回调函数，便于处理消息

int main(int argc, char **argv)
{
  /**
   * The ros::init() function needs to see argc and argv so that it can perform
   * any ROS arguments and name remapping that were provided at the command line.
   * For programmatic remappings you can use a different version of init() which takes
   * remappings directly, but for most command-line programs, passing argc and argv is
   * the easiest way to do it.  The third argument to init() is the name of the node.
   *
   * You must call one of the versions of ros::init() before using any other
   * part of the ROS system.
   */
  ros::init(argc, argv, "listener");

  /**
   * NodeHandle is the main access point to communications with the ROS system.
   * The first NodeHandle constructed will fully initialize this node, and the last
   * NodeHandle destructed will close down the node.
   */
  ros::NodeHandle n;

  /**
   * The subscribe() call is how you tell ROS that you want to receive messages
   * on a given topic.  This invokes a call to the ROS
   * master node, which keeps a registry of who is publishing and who
   * is subscribing.  Messages are passed to a callback function, here
   * called chatterCallback.  subscribe() returns a Subscriber object that you
   * must hold on to until you want to unsubscribe.  When all copies of the Subscriber
   * object go out of scope, this callback will automatically be unsubscribed from
   * this topic.
   *
   * The second parameter to the subscribe() function is the size of the message
   * queue.  If messages are arriving faster than they are being processed, this
   * is the number of messages that will be buffered up before beginning to throw
   * away the oldest ones.
   */
  ros::Subscriber sub = n.subscribe("chatter", 1000, chatterCallback); // 创建一个订阅“chatter”topic的subscriber，并使用函数“chatterCallback”来处理

  /**
   * ros::spin() will enter a loop, pumping callbacks.  With this version, all
   * callbacks will be called from within this thread (the main one).  ros::spin()
   * will exit when Ctrl-C is pressed, or the node is shutdown by the master.
   */
  ros::spin(); // 进入循环

  return 0;
}
```

```cmake
# CMakeLists.txt
add_executable(talker src/talker.cpp)
target_link_libraries(talker ${catkin_LIBRARIES})
add_dependencies(talker beginner_tutorials_generate_messages_cpp)

add_executable(listener src/listener.cpp)
target_link_libraries(listener ${catkin_LIBRARIES})
add_dependencies(listener beginner_tutorials_generate_messages_cpp)
```

# 写一个简单的service和client

## 基本流程

同上

## 文件说明

```cpp
// add_two_ints_server.cpp
#include "ros/ros.h"
#include "beginner_tutorials/AddTwoInts.h" //之前生成的msg头文件

// 一个相加函数
bool add(beginner_tutorials::AddTwoInts::Request  &req,
         beginner_tutorials::AddTwoInts::Response &res)
{
  res.sum = req.a + req.b;
  ROS_INFO("request: x=%ld, y=%ld", (long int)req.a, (long int)req.b);
  ROS_INFO("sending back response: [%ld]", (long int)res.sum);
  return true;
}

int main(int argc, char **argv)
{
  ros::init(argc, argv, "add_two_ints_server");
  ros::NodeHandle n;

  ros::ServiceServer service = n.advertiseService("add_two_ints", add); //创建service
  ROS_INFO("Ready to add two ints.");
  ros::spin();

  return 0;
}
```

```cpp
// add_two_ints_client.cpp
#include "ros/ros.h"
#include "beginner_tutorials/AddTwoInts.h"
#include <cstdlib>

int main(int argc, char **argv)
{
  ros::init(argc, argv, "add_two_ints_client");
  if (argc != 3)
  {
    ROS_INFO("usage: add_two_ints_client X Y");
    return 1;
  }

  ros::NodeHandle n;
  ros::ServiceClient client = n.serviceClient<beginner_tutorials::AddTwoInts>("add_two_ints"); // 创建client
  beginner_tutorials::AddTwoInts srv; //创建service
  srv.request.a = atoll(argv[1]);
  srv.request.b = atoll(argv[2]);
  if (client.call(srv)) //调用service
  {
    ROS_INFO("Sum: %ld", (long int)srv.response.sum);
  }
  else
  {
    ROS_ERROR("Failed to call service add_two_ints");
    return 1;
  }

  return 0;
}
```

```cmake
# CMakeLists.txt
add_executable(add_two_ints_server src/add_two_ints_server.cpp)
target_link_libraries(add_two_ints_server ${catkin_LIBRARIES})
add_dependencies(add_two_ints_server beginner_tutorials_gencpp)

add_executable(add_two_ints_client src/add_two_ints_client.cpp)
target_link_libraries(add_two_ints_client ${catkin_LIBRARIES})
add_dependencies(add_two_ints_client beginner_tutorials_gencpp)
```

# 记录与回放数据

## 记录流程

使用`rosbag`

```bash
mkdir ~/bagfiles
cd ~/bagfiles
rosbag record -a
```

## 查看记录信息

```bash
rosbag info <your bagfile>
```

## 回放

```bash
rosbag play <your bagfile>
```

## 记录信息中的一部分

```bash
rosbag record -O subset /turtle1/cmd_vel /turtle1/pose
```

## 回放的偏差

> In the previous section you may have noted that the turtle's path may not have exactly mapped to the original keyboard input - the rough shape should have been the same, but the turtle may not have exactly tracked the same path. The reason for this is that the path tracked by turtlesim is very sensitive to small changes in timing in the system, and rosbag is limited in its ability to exactly duplicate the behavior of a running system in terms of when messages are recorded and processed by rosbag record, and when messages are produced and processed when using rosbag play. For nodes like turtlesim, where minor timing changes in when command messages are processed can subtly alter behavior, the user should not expect perfectly mimicked behavior.

# 从bag文件中读取信息

## 法一

跑一遍，看terminal输出

## 法二

用`ros_readbagfile`脚本

# 纠错

使用`roswtf`。这个名字真的wtf。

# 结语

看了三四天吧，把官方的`begging level tutorial`看完了，然后分配任务发现以后可能用不到ROS，不过也算是有收获。ROS这种把自己建在另一个操作系统上的方式还真的有意思，它的设计让它很适合作为分布式系统，适用于解决多agent协同。以后用到了再说吧。
