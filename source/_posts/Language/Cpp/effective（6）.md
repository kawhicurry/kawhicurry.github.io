---
title: effective（6）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/img_1206.jpg
tags:
  - 专栏：effective c++
  - cpp
categories:
  - Language
  - Cpp
abbrlink: 3d4f97c7
date: 2022-04-02 15:48:46
---

# 32 确定你的public继承塑膜出is-a关系

- public继承意味着`is-a`。适用于base classes身上的每一件事情一定也适用于derived classed身上，因为每一个derived classes对象也都是（is-a）一个base class对象

# 33 避免遮掩继承而来的名称

- derived classes内的名称会遮掩base classed内的名称。在public继承下从来没有人希望如此
- 为了让被遮掩的名称再见天日，可使用using声明式或转交函数（forwarding functions）

# 34 区分接口继承和实现继承

- 接口继承和实现继承不同。在public继承之下，derived classes总是继承base class的接口
- pure virtual函数只具体指定接口继承
- 简朴的（非纯）impure virtual函数具体指定接口继承及缺省实现继承
- non-virtual函数具体指定接口以及强制性实现继承

# 35 考虑virtual函数以外的其他选择

几个方案
- 使用non-virtual interface（NVI）手法，那是Template Method设计模式的一种特殊形式。它以public non-virtual成员函数包裹较低访问性（private或protected）的virtual函数
- 将virtual函数替换为“函数指针成员变量”，这是strategy设计模式的一种分解表现形式
- 以tr1:function成员变量替换virtual函数，因而允许使用任何可调用物（callable entity）搭配一个兼容于需求的签名式。这也是Strategy设计模式的某种形式
- 将继承体系内的virtual函数替换为另一个继承体系内的virtual函数，这是Stragegy设计模式的传统实现手法

- virtual函数的替代方案包括NVI手法及Strategy设计模式的多种形式。NVI手法自身是一个特殊形式的Template Method设计模式
- 将机能从成员函数转移到class外部函数，带来的一个缺点是，非成员函数无法访问class的non-public成员
- tr1::function对象的行为就像一般函数指正。这样的对象可接纳“与给定之目标签名式（target signature）兼容”的所有可调用物（callable entities）

# 36 绝不重新定义继承而来的non-virtual函数

- 绝对不要重新定义继承而来的nono-virtual函数

# 37 绝不重新定义继承而来的缺省参数值

- 绝对不要重新定义一个继承而来的缺省参数值，因为缺省参数值都是静态绑定，而virtual函数--你唯一应该覆写的东西，却是动态绑定

# 38 通过符合塑膜出has-a或根据某物实现出

- 符合（composition）的意义和public继承完全不同
- 在应用域（application domain），符合意味着has-a（有一个）。在具体域（implementation domain），复合意味着is-implemented-in-terms-of（根据某物实现出）

# 39 明智而审慎地使用private继承

- private继承意味着is-implemented-in-terms-of。它通常比复合的程度低。但是当derived class需要访问protected base class的成员，或需要重新定义继承而来的virtual函数时，这么设计是合理的
- 和复合不同，private继承可以造成empty base最优化。这对致力于“对象尺寸最小化”的程序库开发者而要，可能很重要

# 40 明智而审慎地使用多重继承

- 多重继承比单一继承复杂。它可能导致新的歧义性，以及对virtual继承的需要
- virtual继承会增加大小、速度、初始化（及赋值）复杂度等等成本。如果virtual base clased不带任何数据，将是最具实用价值的情况
- 多重继承的确有正当用途。其中一个情节设计“public继承某个interface class”和“private继承某个协助实现的class”的两相组合
