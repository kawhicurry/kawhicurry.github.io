---
author: kawhicurry
title: oop
categories: uncategorized
date: 2021-11-21 19:21:13
tags:
---

# 课前提醒（给我自己的）

1. 打开vscode，准备源码
2. 准备好使用g++

# 多文件编程

## Why

非结构化与结构化：`goto`满天飞的后果

## How

```cpp
//fun.h
void func();

//fun.cpp
#include "fun.h"
void func(){
	std::cout<<"hello"<<std::endl;//?
}

//main.cpp
#include <stdio.h>
#inlcude "fun.h"
using namespace std;
int main(){
    printf("hi\n");
	func();
	return 0;
}
```

**提问**：`iostream`头文件应该放在哪？

```c++
//fun.h
#include <iostream>
```

**提问**：`main.cpp` 如何找到func()的实现？

VS（IDE）的编译过程：

- 预处理
- 编译，生成中间可执行文件
- **链接**
- 生成最终可执行文件

---

演示：https://zhuanlan.zhihu.com/p/106781089

---

更进一步：Make

**提问**：如果把上面的`stdio.h`改成`iostream`，会怎么样

```c++
//fun.h
#ifndef _fun
#define _fun

#include <iostream>

#endif
```

# 面对对象

**提问**：计算机是用来干啥的？为何计算机今天能为我们带来如此多好处？一个词语，两个汉字。

1. 面向过程：我让机器干啥就干啥
2. 面向对象：以对象为中心，把问题分解成对象

*举例*：卖书

## C的对象

```c
struct book{
    char name[10];
    char ISBN[20];
    double price;
}

double getPrice(struct book* theBook){
    return theBook->price;
}
void showPrice(struct book* theBook){
    printf("%lf",theBook->price);
}
```

**提问**：考虑一另一把剑🗡

```c
struct sword{
    char name[10];
    double price;
}
double getPrice(struct sword* theSword){
    return theSword->price;
}
void showPrice(struct book* theSword){
    printf("%lf",theSword->price);
}
```

C不允许同名函数，即使允许，你也不知道show了谁的price。如何解决这个问题？（其实可以同名，在后面的重载会讲到）

把函数写在struct里面，让函数成为struct的“专属函数”。C不许我们这么做，但是C++可以

```c++
struct Book{
    char name[10];
    char ISBN[20];
    double price;
    
    double getPrice(){
    	return price;
	}
	void showPrice(){
    	printf("%lf",price);
	}
    //...
};

struct Book theBook=/*...*/;
theBook.showPrice();
```

**提问**：考虑price的合理性，如何正确的为price赋值？（price>0)

```c++
//考虑这种用法
theBook.price=100;

int setPrice(double value){
    if(value<0){
        return -1;
    }else{
        price=value;
        return 0;
    }
}
//还是没有解决问题，依然可以
theBook.price=100;
```

封装的必要性

```c++
class Book{
private:
    char name[10];
    char ISBN[20];
    double price;
public:
	int setPrice(double value){
    	if(value<0){
        	return -1;
    	}else{
        	price=value;
    	}
	}
    double getPrice(){
    	return price;
	}
	void showPrice(){
    	printf("%lf",price);
	}
    //...
};

//无法直接修改price，必须通过公共成员函数
```

## 构造函数

C中的`struct`如何创建对象？

```c
typedef struct{
	int num;
}Book;

Book b;
```

考虑 `int a=1`，我们能不能`Book b`？

我们可以如何创建一个对象？我们需要Constructor，构造函数。

```c++
class Book{
public:
    Book(){}
    //Book(double the_price):price(the_price){}
    Book(double the_price){setPrice(the_price);}
    Book(double the_price,char* the_name){
        Book(the_price,the_name,"0000");
    }
    Book(double the_price=10.0,char* the_name="none",char* ISBN){
        setPrice(the_price);
        memcpy(name,the_name,10);
        memcpy(ISBN,the_ISBN,20);
    }
    
private:
    double price;
    char name[10];
    char ISBN[20];
    //...
};

Book b0;
Book b1(10);
Book b2(10,"Apollo");
```

参考：

1. 拷贝构造
2. 移动构造
3. 合成构造

## 继承与多态

**提问**：我希望有一个科幻书，科幻书有一个别人没有的成员：科幻程度(depth)。同时有一种传记，有一个独有的值来记录传记主人公的名字(person)。

```c++
class Book{
public:
    //...
private:
    double price;
    char name[10];
    char ISBN[20];
    int depth;
    char* person;
    //...
    
    //...
};
```

有公共属性，也有独有的属性(attribute)

```c++
class Fiction:public Book{
public:
    Fiction();
    
    int setPrice(double value){
    	if(value<10){
        	return -1;
    	}else{
        	price=value;
    	}
	}
private:
    //不用写，都继承过来了
    //...
};
class biography:public Book{
  //现场要求写一个  
};
```

继承的方式有三种：

>当一个类派生自基类，该基类可以被继承为 **public、protected** 或 **private** 几种类型。继承类型是通过上面讲解的访问修饰符 access-specifier 来指定的。
>
>我们几乎不使用 **protected** 或 **private** 继承，通常使用 **public** 继承。当使用不同类型的继承时，遵循以下几个规则：
>
>- **公有继承（public）：**当一个类派生自**公有**基类时，基类的**公有**成员也是派生类的**公有**成员，基类的**保护**成员也是派生类的**保护**成员，基类的**私有**成员不能直接被派生类访问，但是可以通过调用基类的**公有**和**保护**成员来访问。
>- **保护继承（protected）：** 当一个类派生自**保护**基类时，基类的**公有**和**保护**成员将成为派生类的**保护**成员。
>- **私有继承（private）：**当一个类派生自**私有**基类时，基类的**公有**和**保护**成员将成为派生类的**私有**成员。

现在，我希望所有书都是被分了类的（如果不知道怎么分，就分到“未知分类”里面去），我们现在不允许直接创建一个Book对象，必须要先从Book继承一个专门的分类，再创建该分类的对象。

```c++
class Book{
public:
    virtual Book();
    virtual Book(double the_price);
    virtual Book(double the_price);
    
    virtual int setPrice(double value);
    
private:
    char name[10];
    char ISBN[20];
    double price;
    //...
};
```

`virtual`意味着必须由子类来实现这些函数。这叫纯虚函数，关于virtual，还有更多用法。

## 重载

`virtual`要求必须由子类来实现，这就是重载。重载允许同名，但必须接受不同参数。

```c++
#include <iostream>
using namespace std;

void func(int a) { cout << "1" << endl; }
void func(char b) { cout << "2" << endl; }

int main() {
  func(1);
  func('a');
}
```

**提问**：

```c++
//已经有了这个函数
Book(double the_price,char* the_name){
   setPrice(the_price);
   memcpy(name,the_name,10);
}
//又有了这个
Book(double the_price,char* the_ISBN){
   setPrice(the_price);
   memcpy(name,the_ISBN,10);
}

Book b3(10,"Apollo");
//Apollo 会变成name还是ISBN？
```

C++编译器不允许这样的事情发生，会出现redefinition报错，编译器认为这两个是同一函数。因此，参数的类型应该有所区别。

更进一步，考虑Book==Book

```c++
Book a(1,"apollo");
Book b(10,"apollo");

//a.equal(b);
if(a==b){}

class Book{
public:
    //...
    bool operator==(const Book) {
      if (this->name == Book::name)
        return true;
      else
        return false;
    }
    
private:
    char name[10];
    char ISBN[20];
    double price;
    //...
};
//写一个重载+，当两本书相同时，价格相加
```

## 析构函数

一个对象创建完成后，也要销毁，我们应当定义它如何被销毁。

## 两种风格的对象

- 使这个对象像个“东西”，示例如上
- 使这个对象像个“指针”，先看看内存管理

# 内存管理

**提问**：a+b中的内存是如何分配的？

>**栈区（stack）：**指那些由编译器在需要的时候分配，不需要时自动清除的变量所在的储存区，如函数执行时，函数的形参以及函数内的局部变量分配在栈区，函数运行结束后，形参和局部变量去栈（自动释放）。栈内存分配运算内置与处理器的指令集中，效率高但是分配的内存空间有限。
>
>**堆区（heap）：**指哪些由程序员手动分配释放的储存区，如果程序员不释放这块内存，内存将一直被占用，直到程序运行结束由系统自动收回，c语言中使用malloc，free申请和释放空间。
>
>**静态储存区（static）：**全局变量和静态变量的储存是放在一块的，其中初始化的全局变量和静态变量在一个区域，这块空间当程序运行结束后由系统释放。
>
>**常量储存区（const）：**常量字符串就是储存在这里的，如“ABC”字符串就储存在常量区，储存在常量区的只读不可写。const修饰的全局变量也储存在常量区，const修饰的局部变量依然在栈上。
>
>**程序代码区：**存放源程序的二进制代码。

**提问**：如何创建一个长度不定的数组

错误示范：

```c
int main(void) {
    int N = 0;

    printf("请输入数组的大小\n");
    scanf("%d", &N);
    int arr[N] = { 0 };
}
```

正确示范：

```c
int main(void) {

    int arr[1000] = { 0 };
    int N = 0;
    int i = 0;

    printf("请输入数组的大小\n");
    scanf("%d", &N);

    printf("请输入%d个数\n", N);
    for (i = 0; i < N; i++)
        scanf("%d", &arr[i]);

    return 0;
}
```

## 手动内存管理

C 使用malloc 分配内存和 free释放内存。

```c
#include<stdlib.h>

int main(void) {

    int i = 0;
    int N = 0;
    int* arr;

    printf("请输入数组的大小\n");
    scanf("%d", &N);

    arr = (int*)malloc(sizeof(int) * N);

    printf("请输入%d个数\n", N);
    for (i = 0; i < N; i++)
        scanf("%d", &arr[i]);

    free(arr);
    return 0;
}
```

C++ 使用封装好的new 和delete

```c++
int main(void) {

    int i = 0;
    int N = 0;

    printf("请输入数组的大小\n");
    cin<<N;

    int *arr = new int[N];

    cin<<"请输入%d个数\n"<<endl;
    for (i = 0; i < N; i++)
        cin<< arr[i]);

    delete[] p;
    return 0;
}
```

 **提问**：为什么不是delete p?

## 内存泄漏

画图

*share_ptr* 的原理：对指针进行计数

# 使用STL库

## String

- 创建string
- string+
- insert
- substr

## Vector

- 创建vector
- size
- begin
- end
- resize

## Algorithm

- find
- rotate
- sort
- min
- max

## Utility

- swap
- pari
- tuple

# 完整示例

```c++
//book.h
#ifndef _book
#define _book

#include <string>
#include "show.hpp"

class Book{
public:
    Book(){init();};
    //Book(double the_price):price(the_price){}
    Book(double the_price);
    Book(std::string the_name)=delete;
    //Book(double the_price,std::string the_name);
    Book(double the_price,std::string the_name,std::string ISBN);
    
    Book(Book);
    
    Book(Book b);
    
    int set_price();
    int set_name();
    int set_ISBN();
    
    friend void show_price(Book);
    
private:
    double price;
    std::string name;
    std::string ISBN;
    
    int init(double the_price=0,std::string the_name="",std::string ISBN="");
};
#endif
```

```c++
//book.cpp
#include "book.h"

Book::Book(double the_price){Book()}
//Book::Book(double the_price=0,std::string the_name):Book(the_price,the_name,""){}
Book::Book(double the_price=0,std::string the_name="",std::string the_ISBN=""){
    Book::init(the_price,the_name,the_ISBN);
}
Book::Book(Book the_book){}

int Book::init(double the_price,std::string the_name,std::string the_ISBN){
    return set_price(the_price) && set_name(the_name) && set_ISBN(the_ISBN);
}
int Book::set_price(double the_price){
    if(the_price>=0){
        this->price=the_price;
        return 1;
    }else{
        return 0;
    }
}
//set_name 和 set_ISBN 略
```

```c++
//show.hpp
void show_price(Book the_book){
    std::cout<<the_book.price<<std::endl;
}
```

```c++
//main.cpp
#include "book.hpp"

int main(){
    Book b;
    b.set_price(10);
    show_price(b);
    Book bb(b);
    //Book bb=b;
    //Book bb{b};
}
```



# Apollo2D

//这里是Agent2d中的WorldModel