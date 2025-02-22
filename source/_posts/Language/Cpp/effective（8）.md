---
title: effective（8）
cover : https://cdn.jsdelivr.net/gh/kawhicurry/picgo/gallery/nord/DSC_0088.JPG
tags:
  - 专栏：effective c++
  - cpp
categories:
  - Language
  - Cpp
abbrlink: dd90e0f4
date: 2022-04-06 12:27:03
---

# 49 了解new-handler的行为

- set_new_handler允许客户指定一个函数，在内存分配无法获得满足时被调用
- Nothrow new是一个颇为局限的工具，因为它只适用于内存分配，后继的构造函数调用还是可能抛出异常

# 50 了解new和delete的合理替换时机

- 为了检测运用错误
- 为了收集动态分配内存之使用统计信息
- 为了增加分配和归还的速度
- 为了降低缺省内存管理器带来的空间额外开销
- 为了弥补缺省分配器中的非最佳齐位
- 为了将相关对象成簇集中
- 为了获得非传统行为

# 51 编写new和delete时需固收常规

- 看不懂了，再学学计算机体系再来

# 52 略