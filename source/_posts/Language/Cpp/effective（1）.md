---
title: effective（1）
tags:
  - 专栏：effective c++
  - cpp
categories:
  - Language
  - Cpp
abbrlink: a098af7e
date: 2022-03-07 15:56:54
---

# 01 视c++为一个语言联邦

c++的多范式

- procedural
- object-oriented
- functional
- generic
- metaprogramming

c++的sublanguage

- C
- object-oriented C++(C with classes)
- Template C++
- STL

# 02 尽量以const，enum，inline替换#define

即“以编译器替换预处理器更好”。

因为预处理器不便于debug，且作用域不受控（全局）

## const

所以可以用const来替换关于变量的这一部分

```cpp
#define Pi 3.141
const double Pi=3.141;
```

## enum hack

```cpp
class GamePlayer{
    private:
    enum{NumTurns=5};
}
```

使用enum hack使得一个它的behavior更像#define而不是const，比如enum无法取地址，也无法使用pointer或reference来取这个值。

enum hack也事实上时metaprogramming的基础技术

## inline

#define可以写出宏，宏像是函数却不会招致function call的开销，但是其编写有许多难点（比如一大堆括号）。

这事就可以用template inline function来替代

```cpp
template <typename T>
inline voide callWithMax(cont T& a,const T& b){
    f(a>b?a:b);
}
```

这个template会产生一群函数来完成任务，并且没有什么括号之类的怪怪的问题，同时这是一个“实实在在”的函数，遵循作用域等一系列规。

## 本条款总结

- 对于单纯常数，用const或enum来替换#define
- 对于宏，用inline替换

# 03 尽量使用const

## 常量的声明

 先来个典中典

```cpp
char greeting[] = "hello";
char *p = greeting; // non-const pointer, non-const data
const char *p = greeting; //non-const pointer, const data
char* const p = greeting; //const pointer, non-const data
const char* const p= greeting; //const pointer, const data
```

判断标准是const在\*前还是\*后

## 函数中的const

```cpp
# 有理数
const Rational operator* (const Rational& lhs,const Rational& rhs);
```

这里返回了一个常数，防止出现诸如`(a*b)=c`这类的离谱操作。

## const 成员函数

const用于成员函数的目的，是为了确认成员函数可用于const对象。这样的好处有二：

- 使class的接口更容易被理解
- 使“操作const”对象成为可能

常量下（constness）不同的两个成员函数可以被重载，比如

```cpp
class TextBlock{
    public:
    const char& operator[](std::size_t position) const
    {return text[position];}
    char& operator[](std::size_t position)
    {return text[position];}
    private:
    std::string text;
};

TextBlock tb("hello");
const TextBlock ctb("hello");
std::cout<<tb[0];	//ok, 读一个non-const TextBlock
tb[0]='x';	//ok，写一个non-const TextBlock
std::cout<<ctb[0];	//ok，读一个const TextBlock
ctb[0]='x';	//ok，读一个const TextBlock
```

## 令non-const调用const

`bitwise-constness`和`logical-constness`

很复杂，有空了回来再看一遍

## 总结

- 多用const，有助于debug
- 编译器强制实施`bitwise constness`，但是写的时候应当使用概念上的常量行（比如借助`mutable`）
- 当const和non-const有本质相同的实现时，令non-const调用const版本来避免代码重复

# 04 确定对象被使用前已先被初始化

主要是C part of C++部分容易出现这个问题。

重要的是不要混淆赋值(assignment)和初始化(initialization)，也就是构造函数的写法了，老问题了。

初始化次序是个大问题，尤其对于non-local static 的对象。为了确保其在使用之前能被正确初始化，应当将每个non-local static的函数搬到某个专用的函数中，然后将改对象在这个函数中声明为static，然后函数返回一个reference指向它。这是singleton模式中的常见手法。我想起了librcsc里的ServerParam，它就是靠instance()函数来完成这个的。

## 总结

- 为built-in对象手动初始化，因为cpp不保证初始化
- 构造函数使用成员列表初始化（member initialization list），而不是赋值操作。列表初始化的排序应当和其声明次序相同
- 以local static对象替换non-local static 对象
