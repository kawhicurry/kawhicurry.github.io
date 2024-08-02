---
title: effective（2）
tags:
  - 专栏：effective c++
  - cpp
categories:
  - Language
  - Cpp
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

- 在构造和析构期间不要调用virtual函数，因为这类调用从不下降至derived class。解决方法包括避免调用和将virtual函数改为non-virtual并在derived class构造时初始化。

# 10 令operator=返回一个reference to \*this

- 如题，原因是保证连续赋值的合理性

# 11 在operator=中处理“自我赋值”

- 确保当对象自我赋值时，operator=有良好的行为。其中的技术包括比较“来源对象”和“目标对象”的地址、精心周到的语句顺序、以及copy-and-swap。

# 12 复制对象时勿忘其每一个成分

- copying函数应该确保复制“对象内所有成员变量”及“所有base class成分”
- 不要尝试以某个copying函数实现另一个copying函数。应该将共同机能放进第三个函数中，并由两个copying函数共同调用
