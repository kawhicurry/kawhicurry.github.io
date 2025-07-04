---
title: Apollo文档的自动构建
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0132.JPG
tags:
  - gitbook
  - apollo
description: Apollo文档的自动构建
categories:
  - Auto
abbrlink: 8d15f7e6
date: 2022-01-29 09:27:38
---

# Apollo文档的自动构建

加入apollo2d组后发现，这个社团除了一份年代久远的代码，啥都没有了。上上任学长不写注释，指导老师在摸鱼，上任学长老惨了，就他一个人搞这些。Thus，我觉得把apollo的文档体系建立起来。

根据先前的经验，也为了让我的队友们了解一些规范，我选择了gitbook+gitlab+CI/CD的方案。这样大家可以熟悉下git、md，同时生成的网页也方便大家阅读。

## gitbook配置

从gitlab中创建了一个gitbook的模板，然后对它做一些配置和修改。

### 目录格式

```bash
README.md		#仓库的说明
book.json		#书籍的设置
doc/			#文档正文
	01-abaaba/		#正式章节
		README.md		#章节的封面
		1.md
	02-balabala/	#数字用于排序
	README.md		#文档封面
	SUMMARY.md		#目录
	GLORSSARY.md	#词汇表
scripts/		#用于自动部署的脚本
styles/			#用于渲染网页的css文件
template/		#写文档时的模板
```

### `book.json`的配置

`book.json`使用json格式配置书籍的各种信息

```json
{
    "title": "Apollo2d-learning",
    "root": "./doc",
    "description": "来自南邮Apllo2d的2d仿真教程",
    "author": "teammates from apollo2d@2021",
    "language": "zh-hans",
    "disableTitleFormatting": true,
    "styles": {
        "website": null,
    },
    "variables": {
        "apollo": 0
    },
    "plugins": [
        "theme-default",
        "fontsettings",
        "flexible-alerts",
        "anchors",
        "-anchor-navigation-ex",
        "back-to-top-button",
        "chapter-fold",
        "code",
        "expandable-chapters-small",
        "book-summary-scroll-position-saver",
        "tbfed-pagefooter",
        "-page-copyright",
        "pageview-count",
        "-lunr",
        "-search",
        "search-pro",
        "-sharing",
        "splitter",
        "intopic-toc",
        "-toc2",
        "prism",
        "prism-themes",
        "-highlight"
    ],
    "pluginsConfig": {
        "theme-default": {
            "showLevel": false
        },
        "anchor-navigation-ex": {
            "showLevel": true,
            "associatedWithSummary": true,
            "printLog": false,
            "multipleH1": false,
            "mode": "",
            "showGoTop": true,
            "float": {
                "floatIcon": "fa fa-navicon",
                "showLevelIcon": false,
                "level1Icon": "fa fa-hand-o-right",
                "level2Icon": "fa fa-hand-o-right",
                "level3Icon": "fa fa-hand-o-right"
            },
            "pageTop": {
                "showLevelIcon": false,
                "level1Icon": "fa fa-hand-o-right",
                "level2Icon": "fa fa-hand-o-right",
                "level3Icon": "fa fa-hand-o-right"
            }
        },
        "fontsettings": {
            "theme": "white",
            "family": "sans",
            "size": 2
        },
        "tbfed-pagefooter": {
            "copyright": "Copyright@Njupt-Apollo-2d-2021",
            "modify_label": "该文件最新修订时间：",
            "modify_format": "YYYY-MM-DD HH:mm:ss"
        },
        "toc2": {
            "addClass": true,
            "className": "toc"
        },
        "prism": {
            "css": [
                "prismjs/themes/prism-solarizedlight.css"
            ]
        },
        "intopic-toc": {
            "selector": ".markdown-section h1, .markdown-section h2, .markdown-section h3, .markdown-section h4, .markdown-section h5, .markdown-section h6",
            "mode": "nested",
            "maxDepth": 2,
            "isCollapsed": false,
            "isScrollspyActive": true,
            "visible": true,
            "label": {
                "zh-hans": "本文大纲",
                "en": "In this article"
            }
        },
        "page-copyright": {
            "description": "modified at",
            "signature": "你的签名",
            "wisdom": "Designer, Frontend Developer & overall web enthusiast",
            "format": "YYYY-MM-dd hh:mm:ss",
            "copyright": "Copyright © Apollo",
            "timeColor": "#666",
            "copyrightColor": "#666",
            "utcOffset": "8",
            "style": "normal",
            "noPowered": true
        }
    },
    "pdf": {
        "fontSize": 12,
        "footerTemplate": null,
        "headerTemplate": null,
        "margin": {
            "bottom": 36,
            "left": 62,
            "right": 62,
            "top": 36
        },
        "pageNumbers": true,
        "paperSize": "a4"
    }
}
```

挑几个重要的说明一下

- title:文档名称
- root:根目录,因为默认的文档目录就在根目录下,我这里为了做隔离把文档分到了doc目录下,因此这里要做修改
- variables:这个是自定义的变量,我把它设成0,这样只要在文中写上`{% if var %}`,中间的文本就不会输出了,而我只要把这个变量的值改为1就能生成可以输出的.
- plugins:插件列表,内容大概看看就好,短横线开头表示该插件被关闭,这是为了防止插件之间的冲突
- pluginsConfig:插件配置
- pdf:gitbook的pdf输出配置

### `SUMMARY.md`配置

SUMMARY文件应当位于doc目录下，它决定了文档的目录。一开始我采用的是手动编写的做法，然后越到后面越发现文件名与标题的对应变得困难，故改为了自动生成，一开始尝试了gitbook提供的自动生成插件，生成的SUMMARY跟个鬼一样。后面试了下gitbook-summary，这玩意好用多了，当然，还是有些美中不足的地方。

安装后只需`book sm`即可自动生成SUMMARY文件。但是这个软件可能设计上和我的用法不一样，对于我这种文档目录位于doc的做法来说，它必须在doc目录下执行才能正常生成。因此合理的做法是

```bash
cd doc
book sm
```

同时，它允许使用自己的`book.json`来修改一些配置，这个文件位于doc目录下，与根目录的`book.json`不同（不过我倒希望它能是同一个文件）

```json
{
    "title": "Apollo2d-learning",
    "outputfile": "SUMMARY.md",
    "catalog": "all",
    "ignores": [],
    "unchanged": [],
    "sortedBy": "-",
    "disableTitleFormatting": true
}
```

还有一个问题就是，doc目录下必须有一个`README.md`。这个文件会被作为整个网页的入口，而如果不在SUMMARY中手动定义该文件的文件名，网页中会自动生成一个`introduction`作为入口。对于我们一堆中文标题，这个英文会比较突兀。这个问题的解决办法在下面。

### 渲染的一些问题

代码块这方面，prism这个插件会对不同的语言进行语法高亮，而prism是对语言的定义有严格要求的，比如

```markdown
```cpp ok
```c++ no
```javascript ok
```js         no
```bash  ok
```shell no
```

怎么确定具体的名字呢？看prism的命名，比如cpp文件的prism渲染文件就是`prism-cpp.js`。所以搜一搜有没有`prism-你的语言.js`这个文件就行了。

## gitlab配置

### 权限问题

gitlab的权限规则可以用一句话说清：一个group的成员可以在subgroups中自动取得原来的权限，其他情况下都要手动分配权限。这个仓库位于`apollo-2d`这个顶级group的根目录下，拥有大组身份的同学都有完整的权限，而新来的同学都在另一个`material`的group中，它们以`developer`的身份被加入到文档所在的`project`中，因此可以正常提pr来修改文档内容。

### 多人协作

多人协作其实是个小难点。多人协作的难点在于解决冲突问题，将SUMMARY改为自动生成也是解决这个问题的一部分，因为对文件的修改最后都要修改该文件。

目前的操作应该是，从master分支clone，然后push时使用其他的分支名，然后再在gitlab仓库提交`pull request`，然后由管理员（就是我）来合并，如果有冲突，还要手动合并。

## CI/CD配置

### `.gitlab-ci.yml`配置

因为一开始建项目的时候就选了gitbook模板，所以有现成的模板了。默认的gitlab ci一个月有2000分钟，而我们一次生成大概在两分钟左右，所以理论上可以随便deploy（

不过为了减少更新次数，也为了解决上面生成SUMMARY不完美的问题，还是稍微做了些修改。修改的内容都在注释里了

```yaml
# requiring the environment of NodeJS 10
image: node:10

# add 'node_modules' to cache for speeding up builds
cache:
  paths:
    - node_modules/ # Node modules and dependencies

before_script:
  - npm install gitbook-cli -g # install gitbook
  - npm install -g gitbook-summary # 这一行是我自己加的，安装了上面提到的SUMMARY生成工具
  - gitbook fetch 3.2.3 # fetch final stable version
  - gitbook install # add any requested plugins in book.json
  - chmod a+x ./scripts/auto.sh # 我在script里写了个脚本来处理SUMMARY不完美的工具
  - ./scripts/auto.sh

test:
  stage: test
  script:
    - gitbook build . public # build to public path
  only:
    - branches # this job will affect every branch except 'master'
  except:
    - master

# the 'pages' job will deploy and build your site to the 'public' path
pages:
  stage: deploy
  script:
    - gitbook build . public # build to public path
  artifacts:
    paths:
      - public
    expire_in: 1 week
  only:
    changes:	# 这里做了修改，原来是only master，我改为了如果文档的日志有所变化，则重新deploy
      - doc/附录3-log/*
```

然后是两个脚本

```bash
# auto.sh
cd ./doc
book sm #首先生成SUMMARY文件
cd ..
node ./scripts/test.js # 然后是要给README.md一个名字，不让它自动生成introduction
# 一开始想到的是用sed来添加，然后发现这么做没用，可能是因为在容器里。然后我一看是个node的镜像，那就用nodejs来解决好了，故编写了个js文件
```

```javascript
//test.js
const fs = require("fs");

// fs.appendFile 追加文件内容
// 1, 参数1:表示要向那个文件追加内容,只一个文件的路径
// 2, 参数2:表示要追加的内容
// 3, 可选参数,表示追加文本内容的编码格式,如果省略,默认为utf-8
// 4, 参数4: 表示追加完成之后的回调[有一个参数err,是判断是否追加成功]
fs.appendFile("./doc/SUMMARY.md", "- [关于](README.md)", (error) => {
    if (error) return console.log("追加文件失败" + error.message);
    console.log("追加成功");
});
// 因为是抄下来的，所以注释就懒得删了，感谢原作者
```

