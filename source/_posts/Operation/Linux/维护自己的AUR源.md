---
title: 维护自己的AUR源
cover : https://cdn.jsdelivr.net/gh/kawhicurry/picgo/gallery/nord/img_1206.jpg
tags:
  - linux
  - aur
categories:
  - Operation
  - Linux
abbrlink: 8d703467
date: 2022-04-09 20:53:59
---
问：arch系和其他linux distribution最大的区别在哪？

答：arch有超棒的社区

其实也可以换个思路，arch系怕是只有社区，哈哈哈哈。当然，本文重点要提到的是arch的aur仓库。包管理工具家家都有，RHEL系的yum，deb系的apt，arch系同样也有pacman。但这种仓库一般都是官方维护，如果要添加自己的包的话，就有不少麻烦，之前了解过apt的自建ppa源，但是那玩意还要自己搭服务器，还有一堆认证，给我人整麻了。

这里就得看看aur了，aur有一个官方维护的[网站](https://aur.archlinux.org/)。允许用户注册并上传自己的aur包。我在官网上查了查我的robocup2d项目，发现有人提过相关的包，比如核心组件[rcssserver](https://aur.archlinux.org/packages/rcssserver)。但是看它的版本是15.5的版本，而现在rcssserver已经迭代到17了。这个包在官网上最新的comment是2015年，这个包最后一次更新在2018年，在2020年被标记为过期。然后这种包是通过二进制代码直接更新的，因此就要求更新人员每次更新都手动去下载新的包，这也让我萌生了去维护一个自己的源的想法。

翻了翻arch wiki，然后开干。

## 准备工作

先从“表面工作”开始吧，首先注册好arch账号然后登录，然后上传自己的ssh公钥。然后clone自己希望的包的地址，比如我想维护的包取名，就可以填<ssh://aur@aur.archlinux.org/rcssserver-git.git>。后面那个名字可以自己取，不过还是注意规范，因为我这个包是打算通过git自动更新的，所以就以`-git`结尾，这点在arch wiki上是有规范的。

clone成功的话，应该会得到一个空仓库，然后就是建立一个`PKGBUILD`文件。

## 构建软件包

可以说任何一个aur源，甚至pacman源，都是通过这个叫`PKGBUILD`的文件定义的，官网wiki:<https://wiki.archlinux.org/title/PKGBUILD_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)>。可以说是非常详细了，挑几个要点说明一下，以下是rcssserver-git的pkgbuild文件：
```bash
# This is an example PKGBUILD file. Use this as a start to creating your own,
# and remove these comments. For more information, see 'man PKGBUILD'.
# NOTE: Please fill out the license field for your package! If it is unknown,
# then please put 'unknown'.

# The following guidelines are specific to BZR, GIT, HG and SVN packages.
# Other VCS sources are not natively supported by makepkg yet.

# Maintainer: Your Name <youremail@domain.com>
pkgname=rcssserver-git # '-bzr', '-git', '-hg' or '-svn'
pkgver=17.0.1
pkgrel=1
pkgdesc="Robocup 2D simulator."
arch=('any')
url="https://github.com/rcsoccersim/rcssserver"
license=('GPL')
groups=('rcss')
depends=('boost-libs>=1.44' 'bison' 'flex')
makedepends=('git') # 'bzr', 'git', 'mercurial' or 'subversion'
provides=("${pkgname%-VCS}")
conflicts=("${pkgname%-VCS}")
replaces=()
backup=()
options=()
install=
source=('rcssserver-git::git+https://github.com/rcsoccersim/rcssserver.git')
noextract=()
md5sums=('SKIP')

# Please refer to the 'USING VCS SOURCES' section of the PKGBUILD man page for
# a description of each element in the source array.

pkgver() {
	cd "$srcdir/${pkgname%-VCS}"
# Git, tags available
	printf "%s" "$(git describe --tags | sed 's/rcssserver-//')"
}

build() {
	cd "$srcdir/${pkgname%-VCS}"
	./bootstrap
	./configure --prefix=/usr
	make
}

check() {
	cd "$srcdir/${pkgname%-VCS}"
	make -k check
}

package() {
	cd "$srcdir/${pkgname%-VCS}"
	make DESTDIR="$pkgdir/" install
}
```

先谈下怎么创建这个文件，如果是arch系用户，比如我是manjaro用户，在`/usr/share/pacman/`下有一堆模板文件，都可以看看。尤其对于我这种打算从VCS(version control system,like `git`)构建的，可以直接套`PKGBUILD-vsc.proto`，然后照着模板一步一步来就是了。然后注意这个文件的语法遵循bash语法，所以脚本人表示写的很开心。

指定多个依赖时，注意用空格隔开，因为这是奇奇怪怪没有脑袋的bash语法。就像这样`('git' 'svn')`

重点要提到的是版本号的问题，现在都推荐使用pkgver函数来更新版本了，只要在pkgver里想办法print出version number就行了。至于要print出什么样的版本号，那就可以自由发挥了，官方给的例子是使用`git describe --long`，但我实际写起来用了`git describe --tags`或者直接搜索`configure.ac`和`CMakeLists.txt`中的版本号。还有就是使用VCS模板的话，上面的`${pkgname%-VCS}`是不用动的，会自动替换。

然后就是构建过程，有几个预定义的函数，用于在构建的不同阶段做不同的事情，只要其中有一步有error，整个构建过程都会结束，关于构建过程中的工作目录问题，建议自己看看wiki，有讲到各种目录的切换，以及目录的变量名。

## 构建
写好`PKGBUILD`之后就可以试试能不能编译过了，和`PKGBUILD`文件搭配的是`makepkg`指令。啥都不想的话，直接敲`makepkg`就完事了。`makepkg`有几个参数可以一块用一用。

然后就是makepkg会“假装”执行安装这一步，这步很精彩，建议细读wiki。makepkg会伪造一个root环境，然后把包安装进去，此时包并没有真正被安装到系统中去，而是被打包成了一个`.pkg.tar.zst`文件。接下来使用`sudo pacman -U *.pkg.tar.zst`就可以真正地把包安装到系统中去。这样安装的包是受`pacman`管理的。

## 上传
上传到aur仓库之前需要自己读一读arch wiki，看满足要求没有。这里写一写简洁的上传流程。

首先是使用`makepkg --printsrcinfo > .SRCINFO`。这个`.SRCINFO`是上传必须的，也是由`makepkg`读`PKGBUILD`自动生成的。如果你听了上面说的，用pkgver来自动更新版本号的话，你还得先跑一跑`makepkg -si`来调用pkgver更新`PKGBUILD`中的版本号，然后再生成`.SRCINFO`文件。接下来就可以`git add PKGBUILD .SRCINFO`然后`commit`并push，如果条件都满足，自然会上传成功的。如果失败，无非就那么几个原因：
- ssh公钥
- `.SRCINFO`格式
- git add了奇奇怪怪的东西

*注意：`.SRCINFO`必须存在于每一次commit（尤其是第一次commit）里。*

## 使用
aur的收录速度应该是非常快的，很快就可以用aur工具，比如yay来更新自己的包了，就像我现在只需`yay -S rcssserver-git`就可以安装或者更新这款软件了。在aur官网上，你也可以看看别人提交了什么好玩的包，并给别人留下评论，或是给某个好用的社区包投票（vote），也可以看看别人的`PKGBUILD`是怎么写的，看看别人的规范，甚至可以绕过pacman，参考`PKGBUILD`来直接构建软件。更多社区包的机制可以参考arch wiki，比如投票够多就可以从aur选入community之类的

## 结语
贴上我的aur包，如果有使用arch系来运行Robocup2D项目的小伙伴（应该没有，哈哈哈），欢迎使用下面这些包：
```bash
yay -S librcsc-git rcssserver-git rcssmonitor soccerwindow2-git fedit2-git
```
都是git源码构建，所以安装的时候再看看版本号好了，总之永远都是最新的，不打算做回滚。

最后感慨一句，aur真好用，我反正已经将我的所有软件都用pacman管理起来了，这样升级也好，卸载也好，都很方便。这次只是拿冷门项目练练手，以后如果有自己的软件要认真维护的话，还要考虑更新日志和自动更新之类的一系列功能。