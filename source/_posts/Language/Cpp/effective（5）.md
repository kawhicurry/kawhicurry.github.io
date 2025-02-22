---
title: effective（5）
cover : https://cdn.jsdelivr.net/gh/kawhicurry/picgo/gallery/nord/DSC_9765.JPG
tags:
  - 专栏：effective c++
  - cpp
categories:
  - Language
  - Cpp
abbrlink: 2ffa3829
date: 2022-04-01 14:54:56
---

# 26 尽可能延后变量定义式的出现时间

- 如题

# 27 尽量少做转型动作

- 如果可以，尽量避免转型，特别是在注重效率的代码中避免dynamic_casts。如果有个设计需要转型动作，试着发展无需转型的替代设计
- 如果转型是必要的，试着将它隐藏于某个函数背后，客户随后可以调用该函数，而不需要将转型放进他们自己的代码内
- 宁可使用C++sytle转型，不要使用就是转型。前者很容易辨识出来，而且也比较有着分门别类的职掌

# 28 避免返回handles指向对象内部成分

- 避免返回handles（包括references、pointer、iterator）指向对象内部。最受这个条款可增加封装性，帮助const成员函数的行为像个const，并将发生“dangling handles”的可能性降至最低

# 29 为异常安全而努力是值得的

- 异常安全函数（Exception-safe functions）即使发生异常也不会泄露资源或允许任何数据结构败坏。这样的函数区分为三种可能的保证：基本型、强烈型、不抛异常型
- “强烈保证”往往能以copy-and-swap实现出来，但“强烈保证”并非对所有函数都可实现或具备现实意义
- 函数提供的“异常安全保证”通常最高值等于其所调用之各个函数的“异常安全保证”中的最弱者。

# 30 透彻了解inlining的里里外外

- 将大多数inlining限制在小型、被频繁调用的函数身上。这可使日后的调试过程和二进制升级更容易，也可使潜在的代码膨胀问题最小化，使程序的速度提升机会最大化
- 不要只因为function templates出现在头文件，就将它们声明为inline

# 31 将文件间的编译依存关系降至最低

- 支持“编译依存性最小化”的一般思想是：相依于声明式，不要相依于定义式。给予次构想的两个手段是Handle classes和Interface classes
- 程序库头文件应该以“完全且仅有声明式”（full and declaration-only forms）的形式存在。这种做法不论是否涉及templates都适用