---
title: Magic-Macro
cover : https://cdn.jsdelivr.net/gh/kawhicurry/picgo/gallery/nord/DSC_0143.JPG
categories:
  - Language
  - Cpp
tags: C
abbrlink: 17d8837d
date: 2021-11-07 20:28:58
---

# The magic of macro
最近在写c，遇到了这样一段逻辑，要根据接受的字符串
```
# The magic of macro

最近在写c，遇到了这样一段逻辑，根据要接受的字符串，比如`name=ubuntu`来在结构体mirror中找到对应的mirror.name进行赋值，一开始是这样设计的：

```c
static const char* PARA_LIST[MAX_ARG_NUM] = {"name", "cmd", "arg", "url", "timeout"};
//然后对'='前的值与上述值匹配，得到一个id，如name的id为0
switch(i){
    case 0:
      if (para_len > MAX_NAME_LEN) {
        printf("name too long!");
        return;
      }
      memcpy(mirror->name, parameter + 1, MAX_NAME_LEN);
      break;
    case 1:
      //...
    case 4:
      //...  
}
//然后switch进行匹配，在switch中都需要先做长度判断，再给结构体mirror赋值
```

对于每个case来说，这样的事情都要做一遍，而其中除了struct中的元素不同之外，其他基本都完全一致（除了最后一个timeout），于是我就想简化这个过程。一开始，我想到了写n个不同的函数，这样我就可以在每个case中用一个函数替换，但仔细一想，这样还不是要给每个case写一个函数。这时候我想起了宏，上网查找一番后发现的宏的拼接功能。于是我写出了这个：

```c
#define set_mirror(the_mirror, element, parameter)            \
  {                                                           \
    if (!strcmp(#element, "timeout")) {                       \
      the_mirror.timeout_len = strlen(parameter);             \
    }                                                         \
    memset(the_mirror.element, 0, strlen(parameter) + 1);     \
    memcpy(the_mirror.element, parameter, sizeof(parameter)); \
  }
```

其中的`#element`,会讲element替换成字符串，而`##`可以将set_mirror的参数和后面的内容进行拼接（在后面的版本有示范）。上面这个版本已经可以替换赋值的功能了，但还没对长度进行考察。然后我脑子一抽，写了个`#define len_set_mirror` 其实就是上面`set_mirror`加一个参数，然后再调用`set_mirror`的宏。当时是记住了宏的一种“延迟”的机制，可以在有限次数内对宏进行一个嵌套。后面发现length可以直接从parameter获取，于是就将两个宏合并成了一个：

```c
#define set_mirror(p_mirror, element, parameter, id)               \
  do {                                                             \
    if (length(parameter) > MAX_##element##_LEN) {                 \
      printf("##element too long!");                               \
      return 0;                                                    \
    }                                                              \
    if (!strcmp(#element, "timeout")) {                            \
      (p_mirror)->timeout_len = length(parameter);                 \
    }                                                              \
    memset((p_mirror)->element, '\0', length(parameter) + 1);      \
    memcpy((p_mirror)->element, parameter, length(parameter) - 1); \
    ((p_mirror)->available) << id;                                 \
  } while (0)

```

这次成功将所有功能合并了，并且学到了用do...while(0)来提高宏的安全性（其实我也想到了用大括号的方法来避免，但确实do...while(0)是一个更好的方案。这种写法之后我只需在case中写两行：

```c
    case 0:
      set_mirror(p_mirror, name, parameter, id);
      break;//break还是老老实实写吧，方便set_mirror复用
```

其实在第一个宏之前，我还写了个在宏中构造变量来接受值的做法，但我发现完全没有必要，毕竟传递进来的值都应该可以被直接操作的（宏展开后直接获得变量）。由此也引出一条经验，大可不必在宏中定义新变量来处理数据。

我对宏最大的印象就是文本替换，关于上面这段逻辑，switch还可以进一步优化。而对于整个c来说，宏是底层库的基础，我后面试图去实现一个strlen函数时，发现这玩意就是靠宏和汇编来实现的，而像c中的attribute，__VA_ARGS__(可变参数)，更有一片天地。甚至可以做逻辑运算，过于离谱了。

结论：宏是魔法，这是我第一次真正近距离接触它，它真的是c的魔法。