---
title: effective（4）
tags:
  - 专栏：effective c++
  - cpp
categories: Language
abbrlink: 97465f4c
date: 2022-03-31 16:52:50
---

# 18 让接口容易被正确使用，不容易被误用
- 好的接口很容易被正确使用，不容易被误用。你应该在你的所有接口中努力达成这些性质
- 促使正确使用的办法包括接口的*一致性*，以及与内置类型的行为兼容
- 阻止误用的办法包括建立新类型、限制类型上的操作，舒服对象值，以及消除客户的资源管理责任
- tr1::shared_ptr支持定制型删除器（custom deleter）。这可防范dll问题，可被用来自动解除互斥锁。

# 19 设计class犹如设计type

需要考虑的内容包括
- 新type的对象应该如何被创建和销毁
- 对象的初始化和赋值应该有什么样的差别
- 新type的对象如果被pass by value，意味着什么
- 什么是新type的合法值
- 你和新type需要配合某个继承图系吗
- 你的新type需要什么样的转换
- 什么样的操作符和函数对此新type而言是合理的
- 什么样的标准函数应该驳回
- 谁该取用type的成员
- 什么是新type的未声明接口
- 新type有多么一般化
- 真的需要一个新type吗

# 20 宁以pass by reference to const 替换pass by value

- 尽量以pass-by-reference-to-const替换pass-by-value。前者通常比较搞笑，并可避免切割问题（slicing problem）
- 以上规则并不适用于内置类型，以及STL的迭代器和函数对象。对它们而言，pass-by-value往往比较适当

# 21 必须返回对象时，别妄想返回reference

- 绝对不要返回pointer或reference只想一个local stack对象，或返回reference指向一个heap-allocated对象，或返回pointer或reference指向一个local static对象而有可能同时需要多个这样的对象。

# 22 将成员变量声明为private

- 切记将成员变量声明为private。这可赋予客户访问数据的一致性、可细微划分访问控制、允诺约束条件获得保证、并提供class坐着以充分的实现弹性
- protected并不比public更具封装性

# 23 宁以non-member、non-friend替换member函数

- 宁可那non-member non-friend函数替换member函数。这样做可以增加封装性、包裹弹性和机能扩充性（可以同namespace而不同class）

# 24 若所有参数皆需要类型转换，请为此采用non-member函数

- 如果需要为某个函数的所有参数（包括被this所指的那个隐喻参数）进行类型转换，那么这个函数必须是个non-member

# 25 考虑写出一个不抛异常的swap函数

- 当std::swap效率不高时，提供一个swap成员函数，并确定这个函数不抛出异常
- 如果你提供一个member swap，也应该提供一个non-member swap用来调用前者。对于classes（而非template），也请特化std::swap
- 调用swap时应针对std::swap使用using声名式，然后调用swap并且不带任何“命名空间修饰符”
- 为用户定义类型进行std template全特化是好的，但千万不要尝试在std内加入某些对std全新的东西
