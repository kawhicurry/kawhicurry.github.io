---
title: Qingyou_1
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/img_1327.jpg
categories: Daily
tags:
  - qingyou
abbrlink: 2bbc7ca0
date: 2021-10-27 09:01:06
---
# 青柚的这点事（1）

大一开学的时候被学校拉去听优秀学生讲座。然后青柚的指导老师上去宣传了一波，我就记得两件事：

1. 学校的小程序是青柚管的
2. 不招零基础

说是不招，还是抱着试一试的心态，去投了个ui岗，毕竟当时恰好在学原型。结果石沉大海，冒得回应。

大一上死命学会c之后，大一下堕落了起来，直到有天看到阿里云服务器打折，心血来潮，和好基友Roc买了一台49一年的小服务器，搭博客玩。

没服务器的时候就在折腾jekyll和各种pages了，有了服务器之后终于上了心心念的wordpress，然后就是折腾wp各种奇奇怪怪的东西，然后发现有个好东西叫docker，于是又拿docker部署各种各样的服务。我记得最多的时候，部署了博客，gitee，一个ftp服务器，还连了163邮箱发报警。对于一个1核心2m带宽的服务器来说，压力还是很大了哈哈哈。对了，一开始是用宝塔面板，开始还觉得挺方便的，后来lnmp的p就开始出各种各样的问题。这时候就发现了自动部署忽视细节是个多么难搞的问题。从此决定手动搭各种环境。然后又经历了几次服务器重置之后，我和Roc决定还是把网页部署到gitlab page上，毕竟写好md文档然后直接push，确实比wp舒服多了。

接下来在大一结束的那个暑假，我又一次想起了青柚的招新，这次我决定报个运维岗位试试。本想着会遇到各种可能的高难度问题，还提心吊胆地做了各种准备，结果似乎没有遇到太大困难就进来了。进来之后才发现青柚已经很久没有运维了。上一届的运维是一位后端，再往前是一位运营。也确实，运维这份活在小公司本就是可有可无的，更何况这么个工作室呢？不过我还是很喜欢这份活的，毕竟能看着各种软件稳稳的运行，不用想破脑袋实现各种奇奇怪怪的需求，其实也不错（手动狗头）。

就在今天，学校的出入校小程序上线了。这个项目一个月前就开始了，当时我也被拉进了这个项目的群里，然后被告知学校找了外面的运维，用了大公司的serverless。这一个月以来都是平稳推进，直到前天，突然改了需求，又要求昨天就要上线，整个工作室的人都被拉了进来，并且核心人员从前天晚上七点一直加班到昨天中午十一二点。当所有人都在加班的时候，一个运维坐在工作室的正中间，写着自己满是bug的minishell（狗头）。

好吧，其实几天前我几天前刚接到了要管理学校镜像站的任务，一个python+nginx的小组合，拉取镜像用了python写的mirrord工具，好像是北京外国语还是北京交大的（我估计再往上查一下会发现是清华的，此时，清华用的go），然后再在nginx里面配置下转发就行。但是仔细考虑下自己吧，好像python不咋熟练（那必然），go吧肯定不会，最要命的是线程相关的问题，基本是只知道概念（甚至不清楚），略知一二那种。所以想写出点什么，一时半会恐怕没办法，所以现在抓紧学操作系统，把线程方面搞清楚了，再找个趁手的工具，把镜像站的任务系统化一点，争取做成一个平台。

我又想起前天晚上加班的场景，虽然我啥都没干，但我还是挺喜欢这种氛围的。希望能在这里写点什么，写点什么，最后再写点什么。（老谜语人了）

