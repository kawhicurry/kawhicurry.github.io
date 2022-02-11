---
title: 记录一次makefile改CMake
tags:
  - c
  - cpp
  - cmake
  - makefile
categories:
  - Language
abbrlink: 147c20ee
date: 2022-02-03 10:58:06
---

# 前言

其实这是apollo2019年的代码，原来用makefile也挺稳定的，整个2019的代码也因此显的非常简洁，没有奇奇怪怪的各种文件。只有几个零散的mk文件，大部分都是源码。但也是因为makefile，添加文件会略显麻烦，每次都要在makefile中添加object文件和指定源文件，头文件。因此想换成工程上的CMake。

> 有必要给出结论，在这个过程中因为各种各样的原因，最终没能成功。但是在这个过程中很多东西是值得记录和学习的。

# 需求

明确三点需求

- 可随意添加源文件而不用改动构建系统文件（即`CMakeLists.txt`）
- 可提升编译速度（应对将来的大量修改内容）
- 提升代码可迁移性（想让它在windows上跑起来）

主要还是考虑到这份代码将给后面的新同学跑，希望能尽可能减少新同学的难度，也让有实力的同学专注于代码本身。

# 过程

## 第一个想法

一开始，我想到的办法是在每个子目录下都建立`CMakeLists.txt`，然后使用较新的`aux_source_directory`来自动搜索目录下的所有文件，并建成一个`static library`。接下来在上层目录中使用`add_subdirectory`，并通过`add_library`来讲之前的所有静态库合成一个。最后为三个可执行文件分别书写`add_executable`并将为其`link library`。

现在回头去看的话，这个过程真的是槽点满满。

- 首先是自动搜索后新建静态库，搜索这点其实没问题，但是为每个文件夹都建立静态库就有点奇怪了。不过也不是不行，接着往下走。
- 然后是将静态库合成一个，这个想法其实也不是不行，问题在于cmake**本身**并没有提供任何将多个静态库合成一个的方法。只能调用外部工具如`ar`。参考[stackoverflow](https://stackoverflow.com/questions/37924383/combining-several-static-libraries-into-one-using-cmake)
- 接下来是`add_executable`，这里也是对源码不够了解，我以为三个`main`文件都需要对除了三个文件夹下的源码有所依赖，实际上它们是完全分开的。也就是说，就算上面的都完成了，最后`link library`也会使得生成的`binary`过于庞大和臃肿。

## 任意源文件问题

其实在使用`aux_source_directory`之前，就已经了解到有`FILE(GLOB_RECURSE)`方法了。但因为`main`文件和其他源文件位于同一个目录下，不敢乱用（后面了解到可以使用`list`方法去掉`main`，但感觉这样~~不够优雅~~意义不大）

后面参考了其他CMake工程的写法，尤其是apollo原先的底层`helios-base`的`CMakeLists`写法（刚好在我准备些的前28天，`helios`先写出来一份了）。发现大部分都是使用单个文件添加的，这样可达不到*任意添加*的目的。因此我还是坚持，使用每个子文件夹下一个`CMakeLists.txt`，然后使用`aux_source_directory`的方法来搜索所有源文件，但绝不是为每个子文件夹都建立*静态库*。

比较正确的想法是把每个源文件都添加到一个列表，然后“一起”生成一个可执行文件或库。这里我了解到了`target_source(target Files)`方法，在上层指定要生成的`target`，然后在下层为源文件指定target即可。

关于添加源文件的依赖这里，[librcsc](https://github.com/helios-base/librcsc)给了我很大的参考，它们使用了`add_library(name OBJECT sources)`，建立`object library`来包含所有生成的中间文件，然后在上层通过`$<target_object:name>`来引用中间文件，并生成最终的`executable binary`。这样的写法就像是我在`makefile`中写`Obj += a.o b.o`。我觉得这种写法才像是`best practice`。

## 生成需要的依赖库

apollo2019的源码携带了`rcsc`文件夹，该目录下是apollo源码的底层库的源文件。按照原来的makefile写法，`make`会先将该文件夹整个打包并生成一个`librcsc.so`的动态链接库，并在最后生成`executable binary`时将其链接上去。

一开始我是想偷懒，用`FILE(GLOB_RECURSE)`来直接包含所有**.cpp**文件，然后生成一个大的`lib`。这个操作一开始没发现问题，也确实生成了一个`librcsc.so`，但后面链接时就各种出错。仔细观察才发现，一堆.cpp文件中间混了个装着**.c**的文件夹（该文件来源于[libig](https://github.com/libigl/libigl)，一个图形库）。而.c文件怎么都无法和.cpp文件链接到一起。这里我去翻阅了下最新的[librcsc](https://github.com/helios-base/librcsc)的写法，发现它时完完全全每个子目录下一个CMakeLists的标准写法。对于.c的文件夹，也有专门的处理方式。我想着，这感情好呀，于是把最新的`rcsc`目录拖到了自己的目录下并替换了原来的目录，准备改改CMakeLists就解决问题。这在后面也成了“拖垮我的最后一根稻草”，不过我也不觉得这“都是我的错~”。

`librcsc`正确的使用方式应该还是下载源码后安装到系统库中，然后球队源码带着src文件夹就够了，这种带着rcsc文件夹到处跑的做法其实还是落后了（虽然看源码还是方便）

> 在尝试链接.c和.cpp的时候，还有些小东西值得记录，如果不为CMake工程指定编译器，它会使用`cc`和`c++`来编译c和cpp文件，而指定编译器需要在指定LANGUAGE之前才有效。这点算是让我对CMakeLists的执行顺序有了进一步了解。

## CMakeLists的书写顺序

其实没有那么多复杂的东西，也是一个顺序问题，CMakeLists鼓励我们先把要生成的东西写出来比如`add_executable`或是`add_library`；然后为其设定要链接的库，比如`target_link_libraries`，还有相关的依赖`target_link_directories`，属性`set_property`等等；最后是去把前面提到的变量“找”出来，比如`add_subdirectory`。

当然，最前面肯定是写好`cmake_minimum_required`和`project`，以及其他的全局设定。

对于编译器的参数来说，使用`set(CMAKE_CXX_FLAGS)`之类的方式就可以设定其参数，但对于c系的`definition`，最好还是使用`add_definition(-D)`来指定宏。更进一步，编写`configuration file`并指定`add_definition(-DHAVE_CONFIG_H)`和`configure_file`。

# 总结

CMake确实是有比Makefile有优势的地方，但仍然显的有些繁琐和奇怪。至少它还在不断发展，比如使用`target_link_directories`来替代`link_libraries`，但其中复杂的规则确实会让人痛苦。虽然最后没成功把这个项目改成CMake，但还是稍微深入地了解了CMake的用法。想想大过年的还抽时间来看这个，投入其中的感觉其实挺不错的。不过还是希望下次有项目能把CMakeLists写出来写好，哈哈。

# 后记

为什么最后没有写成？因为换`librcsc`底层的时候发现有的文件名对不上了，一查`librcsc`的更新日志发现，有的变量在08年就改了，也就是说，我们用的是**22-08=14**年前的底层代码。这是真的忍不了，准备重构好了。新的代码基于CMakeLists就ok了。
