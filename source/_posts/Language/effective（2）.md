---
title: effective（2）
tags:
  - 专栏：effective c++
  - cpp
categories: Language
abbrlink: b22d0090
date: 2022-03-10 20:05:58
---

# 05 了解c++默认编写并调用哪些函数

- 编译器可以暗自为class创建default构造函数、copy构造函数、copy assignment操作符以及析构函数，当然，前提是能合理地生成出来。

# 06 若不想使用编译器自动生成的函数，就该明确拒绝

- 将会被编译器自动合成的函数设为private可以阻止其被合成出来，但这样的话使用时的报错会在链接时出现
- 设置一个uncopiable的基类，然后继承它可以将报错提前到编译器

# 07 为多态基类声明virtual析构函数

- polymorphical的base classes应该声明一个virtual析构函数（从而避免部分删除的情况），如果clss带有任何virtual函数，它就应该有一个virtual析构函数
- 相反的，如果class的设计目的如果不是作为base classes使用，或不是为了polymorphically，就不该声明virtual析构函数

# 08 别让异常逃离析构和函数

- 析构函数绝对不要吐出异常，如果一个被析构函数调用的函数可能抛出异常，析构函数应该捕捉任何异常，然后吞下它们（不传播）或直接结束程序（调用std::abort())

- 如果客户需要对某个操作函数运行期间抛出的异常做出反应，那么class应该提供一个普通函数（而非在析构函数中）执行该操作。

# 09 绝不在构造和析构过程中调用virtual函数