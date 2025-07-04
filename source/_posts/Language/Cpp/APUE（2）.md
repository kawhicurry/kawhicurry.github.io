---
title: APUE（2）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0164.JPG
tags:
  - 专栏：APUE
  - linux
categories:
  - Language
  - Cpp
abbrlink: a113ba1f
date: 2022-04-11 17:30:11
---

# Chapter4

这章主要讲文件和目录，上一章针对的是普通文件的I/O，这章是各种奇奇怪怪的文件I/O。

## 各种stat

```c
#include <sys/stat.h>

int stat(const char *restrict pathname,struct stat *restrict buf);

int fstat(int fd,struct stat *buf);

int lstat(const char *restrict pathname,struct stat *restrict buf);

int fstatat(int fd,const char* restrict pathname,struct stat *restrict buf,int flag);
```

主要是会取得一个记录了各种信息的struct stat

## permission

测试顺序
1. uid是否为0
2. uid与owner符合，判断owner permission
3. gid与group owner符合，判断group permission
4. 判断other permission

## access

```c
#include <unistd.h>

int access(const char* pathname,int mode);

int faccessat(int fd,const char* pathname,int mode,int flag);
```

return true if accessed

## umask

```c
#include <sys/stat.h>

mode_t umask(mode_t cmask);
```
return mode_t is the previous umask

## 各种chmod

```c
#include <sys/stat.h>

int chmod(const char* pathname,mode_t mode);

int fchmod(int fd,mode_t mode);

int fchmodat(int fd,const char *pathname,mode_t mode,int flag);
```

To change the permission bits of the file,the effective ID of the process must be equal to the owner ID of the file,or the process must have superuser permissions.

## 各种chown

```c
#include <unistd.h>

int chown(const char* pathname,uid_t owner,git_t group);

int fchown(int fd,uid_t owner,git_t group);

int fchownat(int fd,const char* pathname,uid_t owner,git_t group,int flag);

int lchown(const char* pathname,uid_t owner,git_t group);
```

