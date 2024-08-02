---
title: 重学linux（8）
tags:
  - 专栏：重学linux
  - linux
categories:
  - Operation
  - Linux
abbrlink: 321e6efa
date: 2022-02-11 17:16:09
---

# 重定向

## stream

- stdin: code 0,< <<
- stdout: code 1,> >>
- stderr: code 2,2> 2>>

丢弃数据`/dev/null`

所有输出重定向至同一文件`2>&1`或`&>`

`<<`右侧用于定义结束字符

## `;` ,`&&`和 `||`

  `$?`查看上一条指令的返回值

# pipe

将前一个command的stdout作为后一个command的stdin

*注*：可以使用前面的`2>&1`来使得stdout也通过pipe。

## 选取

### cut

```bash
# 按分隔符来处理数据
cut -d 'divide character' -c 'character number' -f field
# -c 取一个字符区间 如 -c 12- 或 -c -12
# -f 指定第一个区间
```

### grep

```bash
# 按行来处理数据
grep 'charcter' filename
# -c 计算查找到的数量
# -i 忽略大小写
# -n 输出符号
# -v 反选
```

## 排序

### sort

| 参数 | 含义                     |
| ---- | ------------------------ |
| -f   | 忽略大小写               |
| -b   | 忽略最前面的空格         |
| -M   | 以月份排序               |
| -n   | 以纯数字排序             |
| -r   | 反向                     |
| -u   | uniq，相同选项只列出一项 |
| -t   | 分隔符                   |
| -k   | 选定区间                 |

```bash
# 一直想干的事，把/etc/passwd按uid从小到大排序
cat /etc/passwd | sort -t ':' -k 3 -r
```

### uniq

去重

### wc

统计字数，直接使用输出的数据分别为行数，字数，字符数

可以用选项`-l`,`-w`,`-m`，分别输出

## 双向重定向

### tee

```bash
tee [-a] file
# -a append
```

将数据流分别重定向到file和screen。输送到screen的部分实质上是stdout，也就是说可以接着重定向。

## 字符替换

### tr

删除一段信息中的某些文字

```bash
tr [-ds] SET1
# -d delete
# -s substitude

# 大小写转换
ls -l / | tr '[a-z]' '[A-Z]'
# 删除字符
cat /etc/passwd | tr -d ':'
# dos2unix
cat file | tr -d '\r' > newfile # \r是dos的换行符
```

### col

tab转空格（终于找到这个令人好东西了，可以解决好多奇怪的tab按键）

```bash
col -x # tab转空格
```

### join

将两个文件有相同数据的部分合并

```bash
join -t '分隔符' -1 第x部分 file_1 -2 第y部分 file_2
join -t ':' -l 4 /etc/passwd -2 3 /etc/group | head -n 3
```

过于高级，暂时不展开。

### paste

将两个文件的同一行粘贴在一起

```bash
paste [-d 分隔符，默认为tab] file_1 file_2
```

### expand

tab转空格（又来？）

```bash
expand [-t tab转空格的数量,默认为8] file
```

## 文件划分

### split

```bash
split [-bt] file PREFIX
-b: 按大小划分
-t: 按行数划分
PREFIX: 分割后的文件名前缀（后缀会按abc的方式命名）

cd /tmp; split -b 300k /etc/services services
```

### 重组

使用重定向即可

```bash
cat services* >> services_back
```

## 参数代换

### xargs

用于产生某个命令的参数

超级nb的东西，用于给不支持管道的命令提供参数。

```bash
id root
# 使用id可以查询某个用户的id信息
# 接下来查询/etc/passwd中前3个用户的id信息
 cut -d ':' -f 1 /etc/passwd | head -n 3 | id
# 最后只执行了id，因为id不是管道命令，不接受前面的参数
 cut -d ':' -f 1 /etc/passwd | head -n 3 | xargs -n 1 id
# 要制定id只接收1个参数，多了也不行

xargs [-0epn] command
```

| 参数 | 含义                              |
| ---- | --------------------------------- |
| -0   | 将stdin中的特殊字符还原成一般字符 |
| -e   | 指定EOF                           |
| -p   | 每次执行都询问用户                |
| -n   | 指定command要使用几个参数         |

## - 减号

pipe中，`-`可用于替代stdin和stdout

```bash
tar -cvf - /home | tar -xvf - -C /tmp/homework
# 前一个tar打包的数据不会写入到文件，而是交给pipe
# 后一个tar的stdin来自pipe
```

# 文件的格式化

## 格式化打印

### printf

```bash
printf 'format' content
# 固定格式（表格形式
printf '%10s %5i' content1 content2
```

过于高级，不再多说，现用现查

## 数据处理

### awk

数据处理工具，适用于小型文本

```bash
awk 'condition_1{operation_1} condition_2{operation_2}' filename
```

awk以**行**为一次处理的单位，以**字段**为最小的处理单位。

- \$1 \$2 分别表示一行中的第一和第二个字段（默认以空格或tab分割）
- \$0表示**第一列**的所有数据

关于数据总共有多少行多少列，可以用以下变量

- NF：每一列拥有的字段数
- NR：目前awk所处理的是第几段数据
- FS：目前的分割字符，默认是空格

awk的逻辑运算符与C一致

awk的关键字

- BEGIN从头开始
- END从末尾开始

## 文件比对

### diff

```bash
dirr [-bBI] from-file to-file
# -b 忽略空格差异
# -B 忽略空白行差异
# -i 忽略大小写差异

# 以下为diff的输出

3d2 # 左边的第三行被删除（d）了，基准是右边第二行
< bin:x:2:2:bin:/bin:/usr/sbin/nologin # 这是左边（<)被删除的哪一行
6c5 # 左边的第六行被替换（c）成了右边第五行
< games:x:5:60:games:/usr/games:/usr/sbin/nologin # 左边（<）第六行的内容
---
> no six line # 接上面，这是右边（>）第五行的内容

```

### cmp

```bash
cmp [-l] file1 file2
# -l 将所有不懂点全部标出来，默认只标出第一个
# cmp可用于比较二进制文件
```

### patch

使用`diff`制作补丁，然后使用`patch`更新

```bash
# 流程
## 记录差异
diff -Naur old_file new_file > file.patch
## 更新
patch -pN < patch_file
## 还原
patch -R -pN < patch_file

# N 表示目录层级，新旧文件在同一目录下时使用-p0即可
# 更详细的内容在后面y
```

### pr

文件打印，鸟哥说这玩意参数太多
