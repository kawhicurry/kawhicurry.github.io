---
title: effective（3）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0145.JPG
tags:
  - 专栏：effective c++
  - cpp
categories:
  - Language
  - Cpp
abbrlink: a9167f5
date: 2022-03-30 15:05:13
---

# 13 以对象管理资源

- Resource Acquisition Is Initialization(RAII)
- 为了防止资源泄露，使用RAII对象，他们在构造函数中获取资源并在析构函数中释放资源
- 两个最常使用的RAII classed分别是tr1::shared_ptr和auto_ptr。前者通常是最佳选择，因为其copy行为比较直观。若选择auto_ptr，复制动作会使被复制对象指向null。

# 14 在资源管理器类中小心copying行为

- RAII对象必须一并复制它所管理的资源，所以资源的copying行为决定RAII对象的copying行为
- 普遍而常见的RAII class copying行为是：抑制copying、施行引用计数法

# 15 在资源管理类中提供对原始资源的访问

- APIs往往要求访问原始资源，所以每个RAII class应该提供一个“取得所管理的资源”的办法。
- 对原始资源的访问可能经由显示转换或隐式转换。一般而言前者比较安全，后者对客户比较方便

# 16 成对使用new和delete时要采取相同形式

- 如果在new表达式中使用\[\]，必须在相应的delete表达式中也使用\[\]。如果在new表达式中不使用\[\]，一定不要在相应的delete表达式中使用\[\]

# 17 以独立语句将newed对象置入智能指针

- 以独立语句将newed对象存储于（置入）智能指针内。如果不这样做，一旦异常被抛出，有可能导致难以察觉的资源管理。