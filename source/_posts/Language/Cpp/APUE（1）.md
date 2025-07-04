---
title: APUE（1）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0088.JPG
tags:
  - 专栏：APUE
  - linux
categories:
  - Language
  - Cpp
abbrlink: b3a615f1
date: 2022-04-06 12:53:34
---

# 3 File I/O

直接从第三章开始好了，文件I/O

本章的任务是，用各种各样的方式来读写文件

## 概念

`File Descriptor`：non-negative integer, managed by kernel
- 0 : stdin
- 1 : stdout
- 2 : stderr

## open

open函数和它的flag们在`<fcntl.h>`里，话说这个头文件为啥叫这个。

open有俩参数，一个path，一个是oflag，但那个flag是vary argument。

oflag有5个必选参数和一堆option。

os会保证open和openat获得的fd尽可能小。

### openat

那openat是干啥的。openat的第一个参数是个fd，后面都一样。使用openat有三种情况（possibility）：
- 指定path时使用了绝对路径，这时候fd会被忽略，fd有跟没有一样，at跟没at一样。
- 指定path时使用了相对路径，fd指定了从哪里开始计算文件的最终位置。即：从一个拥有的fd开始，加上相对路径来得到最终文件的位置
- 指定path时使用了相对路径，并且fd使用了一个特殊值`AT_FDCWD`。这个时候，文件名会从当前工作目录开始计算。除此之外和open没有区别。即，从工作目录开始，加上相对路径，得到最终文件位置。

话说这个宏的展开是什么？

openat主要用来解决两个问题，一个是多线程下的相对路径引用问题，一个是time-of-check-to-time-of-use errors。（表示不是很理解这个问题，哪天再看到再来补充）

### filename and pathname truncation

其实就是文件名过长时，os怎么处理的问题，无非两种方法：
- 抛个异常
- 返回一个截断的文件名

这玩意要看os怎么想，但是posix给了个`_POSIX_NO_TRUNC`的宏来判断其行为。这个macro在`<unistd.h>`里

### 实践

```c
#include <fcntl.h>
#include <stdio.h>

int main() {
    int fd  = open("3.txt", O_RDONLY);
    int fd2 = openat(AT_FDCWD, "3.txt", O_RDONLY);
    printf("%d %d", fd, fd2);
    return 0;
}
```

## creat

首先，这是`creat`不是`create`。然后，这玩意好像可以用来实现一个touch指令诶。

creat也在`<fcntl.h>`里。它和open的`O_WRONLY`,`O_CREATE`,`O_TRUNC`这几个flag等价。以前的open不能打开不存在的文件，所以才有了这个函数，不然为啥不直接上open呢。

creat的第一个参数为路径，第二个为模式，与权限相关。

用open吧，别看了，反正作者也没写（

## close

众所周知，文件有开有关

close在`<unistd.h>`下，woc，为啥和open不在一个头文件？

close只接受一个fd参数。如果ok，return 0.不过就算不手动调用，os也会在程序结束的时候自动回收fd的，除非想写daemon。

## lseek

每个打开的文件都会有的`current file offset`，也是个non-negative integer。都是相对于`beginning of the file`

```c
#include <unistd.h>

off_t lseek(int fd,off_t offset,int whence);
```

whence:from what place or source.有三种
- SEEK_SET 文件开头+offset
- SEEK_CUR 当前位置+offset，offset可正可负
- SEEK_END 文件尾+offset，offset可正可负

lseek里面的l是long integer的意思，因为以前lseek的return是个long integer，后来有了struct off_t

### hole

可以把offset移动到比文件大小更大的地方，然后进行写操作，中间空缺的部分会用0补齐

```c
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define err_sys perror
char buf1[] = "abcdefghij";
char buf2[] = "ABCDEFGHIJ";
int  main(void) {
    int fd;
    if((fd = creat("file.hole", O_RDWR)) < 0) err_sys("creat error");

    if(write(fd, buf1, 10) != 10) err_sys("buf1 write error");
    /* offset now = 10 */
    if(lseek(fd, 16384, SEEK_SET) == -1) err_sys("lseek error");
    /* offset now = 16384 */
    if(write(fd, buf2, 10) != 10) err_sys("buf2 write error");
    /* offset now = 16394 */
    exit(0);
}
```

```bash
$ gcc hole.c
$ ./a.out
$ ls -l file.hole
-rwxr--r-x 1 kawhicurry kawhicurry 16394 Apr  6 13:48 file.hole
$ od -c file.hole
0000000   a   b   c   d   e   f   g   h   i   j  \0  \0  \0  \0  \0  \0
0000020  \0  \0  \0  \0  \0  \0  \0  \0  \0  \0  \0  \0  \0  \0  \0  \0
*
0040000   A   B   C   D   E   F   G   H   I   J
0040012
```

offset 有两种模式，32位和64位，有一堆POSIX的宏可以用来指定模式

## read

```c
#include <unistd.h>

ssize_t read(int fd,void *buf,size_t nbytes);
```
当需要的bytes比实际读到的bytes多的时候，有几种情况
- 提前碰到EOF，返回实际读到的bytes数
- 从terminal读入，多于一行的bytes被读入
- 从网络I/O读入，buffer中内容比实际需要的少
- 从pipe或FIFO读入
- 从record-oriented device读入

以前的prototype长这样
```c
int read(int fd, char *buf, unsigned nbytes);
```
- char* 后来按照ISO标准被替换为void*，用来接受各种pointer
- 返回值被换为ssize_t，就是signed size_t
- 第三个参数后来就是size_t了,这玩意用来跨平台，不过一般是unsigned int的typedef

## write
```c
#include <unistd.h>

ssize_t write(int fd,const void *buf,size_t nbytes);
```
只有return value等于size_t的时候，才算正常write

write会在文件的current offset开始写

## I/O Efficiency

其实这是个考虑buffer长度的topic，读大文件（或者其他输入）的时候，多大的buffer比较合适？

然后作者没给答案，说是晚点回来看看。不过从数据来看，buffer开大点好，因为cpu有read-ahead to improve performance。当buffer超过4096（实际上是st_blksize的值）时，提升就不大了。

## File Sharing

1. 每个process有个process table entry，记录了自己持有的fd
2. kernel持有所有open file的file table，内容包括
  - status flag: read,write,append,sync,nonblocking
  - current file offset
  - pointer to the v-node table entry for the file
3. 每个open file都有个v-node structure，包括
  - type of file
  - pointer to functions that operate on the file
  - 对于大多数文件，还有个i-node

## Atomic Operation

The operation that requires only one function calls(steps)

这一节是用来描述，多个process不适用append来进行文件追加的后果

一些atomic operation：
- open with O_APPEND
- pread and pwrite : substitute lseek followed by read
- open with both O_CREATE and O_EXCL : substitute simply creat

## dup and dup2

```c
#include <unistd.h>

int dup(int fd);
int dup2(int fd,int fd2);
```

new descriptor returned by dup is guaranteed to be the lowest-numbered available fd.

dup2可以用fd2指定一个复制后你想要得到的fd参数，如果fd2打开了，fd2会被关掉，如果fd等于fd2，dup2会返回fd2。除此之外，fd2的FD_CLOEXEC宏会被清楚，以让fd2保持open。（除此之外后面的看不懂了，后面回来看看）

dup是fcntl函数的某种特例，后面回来看看。

```c
#include <stdio.h>
#include <unistd.h>

int main() {
    char buf[1024];
    int  newfd = dup(1);
    read(0, buf, 10);
    write(newfd, buf, 10);
}
```

## sync fsync fdatasync

```c
#include <unistd.h>

int fsync(int fd);
int fdatasync(int fd);
void sync(void);
```

强制写入磁盘

## fcntl

> The fcntl function can change the properties of a file that is already open.

```c
#include <fcntl.h>

int fcntl(int fd,int cmd,...);
```

purpose:
1. duplicated an existing descriptor(cmd=F_DUPFD or F_DUPFD_CLOEXEC)
2. get/set fd flags(cmd=F_GETFD or F_SETFD)
3. get/set file status flags(cmd=F_GETFL or F_SETFL)
4. get/set asynchronous I/O ownership(cmd=F_GETOWN or F_SETOWN)
5. get/set recode locks(cmd=F_GETLK,F_SETLK or F_SETLKW)

## ioctl

```c
#include <unistd.h>
#include <sys/ioctl.h>

int ioctl(int fd,int request,...);
```

Terminal I/O

## /dev/fd

open the file in `/dev/fd` is equivalent to duplicating descriptor n,assuming that descriptor n is open
