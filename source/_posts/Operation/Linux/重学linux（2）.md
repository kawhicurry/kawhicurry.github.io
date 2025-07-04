---
title: 重学linux（2）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0015.JPG
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 5da38e9e
date: 2022-01-20 13:34:46
---

# Linux目录与文件管理

## 路径

### 相对路径与绝对路径

略

快捷关键字：

> .	表示此层目录、
>
> ..	上层
>
> \-	前一个工作目录
>
> ~[user]	某个用户的家目录
>
> ​	空白也可表示自己的家目录 

## $PATH

添加方式：

```bash
PATH="${PATH}:/directory"
```

## 目录相关操作

- cd
- pwd -P：表示真实地址，而非链接地址
- mkdir
  - -m 设置文件权限
  - -p 递归创建
- rmdir
  - -p 连同上层空目录一起删除

## 文件相关操作

### ls

略

### cp rm mv

#### cp

| 参数                  | 选项                                      |
| --------------------- | ----------------------------------------- |
| -a -dr --preserve-all | 复制所有属性                              |
| -i                    | 若存在，询问是否覆盖                      |
| -l                    | 硬链接，相应的s为symbolic link            |
| -p                    | 带权限赋值                                |
| -r                    | 递归赋值，用于文件夹赋值                  |
| -u                    | 更新式复制，当destination比source旧才复制 |

还有一点，如果cp的source有两个以上，destination一定要是目录。

#### rm

| 参数 | 选项    |
| ---- | ------- |
| -f   | force   |
| -i   | 询问    |
| -r   | 递归    |
| -v   | verbose |

来自rm的man page：

```bash
   To remove a file whose name starts with a '-', for example '-foo', use one of these commands:

          rm -- -foo

          rm ./-foo
```

其中--可以告诉parser，后面的东西不是option，而是arguments

#### mv

同cp

**注**：rename可用于给多个文件重命名，以下为`man page`，大概是做匹配然后替换，但是rename有两个版本，C语言版使用通配符匹配，perl版本使用正则表达式匹配。可以使用`rename --verson`查看具体版本。

```bash
SYNOPSIS
       rename [options] expression replacement file...

DESCRIPTION
       rename  will  rename  the  specified  files  by  replacing the first occurrence of expression in their name by
       replacement.

OPTIONS
       -s, --symlink
              Do not rename a symlink but its target.

       -v, --verbose
              Show which files where renamed, if any.

       -n, --no-act
              Do not make any changes.

       -o, --no-overwrite
              Do not overwrite existing files.

       -V, --version
              Display version information and exit.

       -h, --help
              Display help text and exit
```

```bash
区分方法: rename --version

如果返回结果中包含 util-linux , 说明是 C 语言版本, 反之是 Perl 版本
```

### 获取文件名和目录名

```bash
$ basename /etc/sysconfig/network
network
$ dirname /etc/sysconfig/network
/etc/sysconfig
```

## 查看文件内容

### 直接查看

#### cat

concatenate（串联）：正向全部显示

| 参数 | 选项                   |
| ---- | ---------------------- |
| -n   | 打印行号               |
| -T   | 显示tab键              |
| -v   | 显示看不出来的特殊字符 |
| -A   | 相当于-vET             |
| -E   | 显示换行符             |

#### tac

cat的反向

#### nl

添加行号打印

### 可翻页查看

#### more

vim操作模式，只能向后翻页

#### less

vim操作模式，更灵活

### 数据截取

#### head

```bash
head -n [行数] 文件
```

#### tail

```bash
tail -n [行数] 文件 [-f] # f表示持续刷新
```

### 非纯文本文件

#### od

略了吧，没人会看二进制的

### 修改文件时间or建立新文件

touch

略了吧，一年到头改不了几次

## 权限

### 默认权限

```bash
umask [-S] # 查看默认权限
umask 002 # 修改默认权限,这里的数字表示被拿走的权限
#而默认情况下，文件不会有x权限，文件夹一定有x权限
#即文件为-rw-rw-rw，目录为drwxrwxrwx
```

### 隐藏属性

```bash
lsattr # 显示文件隐藏属性
chattr # 修改文件隐藏属性
```

一些隐藏属性

| 属性 | 内容                                         |
| ---- | -------------------------------------------- |
| a    | 该文件只能增加，不能删除或修改数据           |
| i    | 该文件不能被删除，改名，设置链接或写入数据   |
| s与u | s是该文件被删除后将彻底删除，无法找回，u相反 |

### 特殊权限

#### SUID--Set UID

- 只能用于binary
- 执行者要拥有该文件的x权限
- 执行者执行该文件时会获得该文件的owner的权限
- 举例：/usr/bin/passwd（权限为`-rwsr-xr-x`）

#### SGID--Set GID

同上，不过

- 获得的是该文件group的权限
- 可用于目录和binary
- 举例：/usr/bin/locate（权限为`-rwx--s--x`）

#### SBIT--Sticky Bit

- 只对目录有效
- 当用户对该目录有r和x权限，就自动拥有该目录内的w权限
- 当用户在该目录下建立文件或目录的时候，只有自己和root有权限删除该文件
- 举例：/tmp（权限为`drwxrwxrwt`）

#### 特殊权限的设置

以上三者也遵循421，举例：`chmod 4755 filename`

#### 查看文件类型

```bash
file filename
```

## 命令与文件的查找

### 命令的查找

```bash
which [-a] command # -a 表示列出所有PATH中的该命令
which history # 找不到history，因为这是bash的内置命令，只能用type来
type command # 后面会说
```

### 文件的查找

#### whereis

速查重要目录，可用`whereis -l`查看去找的主要目录

#### locate / updatedb

`locate`通过数据库速查，`updatedb`手动更新数据库

#### find

查硬盘万能大法。

时间参数的说明

- `atime`，last access time
- `ctime`，last change time
- `mtime`，last modify time

时间参数后的数字的说明

- n，表示n天前的*一天之内*
- +n，n天之前（不包括第n天）
- -n，n天之内（包括第n天）

用户参数

- -uid n
- -gid n
- -user name
- -group name
- **-nouser**
- **-nogroup**

权限参数

- -name filename
- -size [+-]SIZE
- -type TYPE
- -perm mode 权限的精确匹配
- -perm -mode 必须包含某个权限
- -perm /mode 包含任意某个权限

其他操作

- -exec command 查找完之后跟的额外操作
- -print 默认操作，输出至屏幕

exec举例

```bash
find /usr/bin /usr/sbin -perm /7000 -exec ls -l {} \;
# exec后不可使用别名
# {}表示find找到的内容
# \;表示结束，exec会从`-exec`后面执行到`\;`结束
```

