---
title: 关于Apollo2D未来的一些思考
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0004.JPG
tags:
  - apollo
  - robucup
categories:
  - Auto
abbrlink: a8ec5d07
date: 2022-03-30 17:39:14
---

新队员终于选拔出来了，现在大二五个人，大一两个。按照林总的想法也推了些进度，不过总感觉哪里怪怪的。所以今天趁着安排了时间来做apollo相关的东西，决定来捋一捋哪里不对。

# 主要问题

## 主要问题

感觉是人员的分配问题。

现在林总拉着几个人去看论文，我拉着几个人搞penaltyKick。但是人员的流动性略有点麻烦，主要有以下几种情况：
1. 任务安排后没有及时完成（拖延情况）
2. 上个任务安排完成后，没有安排后续任务（无任务情况）
3. 有其他比赛需要安排时间（中断情况）

## 次要问题

队员对代码的熟悉程度问题。

果然只要我不催，就没人看代码，但不看肯定不行。之前安排鸡米花和陈总去写penaltykick的对攻，结果我不催，两个人都没动。今天翻看了一下之前列出来的一大堆issue，果然任务不止远方的机器学习，还有苟且的基本代码问题。下一步按我的想法的话，试着除一除编译器的issue好了。

# 解决方案

首先是对人员的分管，之前的想法是让林总把握大权，自由安排任务，但他自己有比赛在身，所以还是得我这个闲人来盯一盯。既然是我来的话，那首先还是不再对人员进行分管了，直接把任务安排到人，而不是分组进行，毕竟组里总共也没几个人。这样的话就得安排一下工具了，初步决定是用表格（因为我用libreoffice，就不叫excel了）制作gantt图，也要顺便去复习一下pert图，看看哪个更合适。然后就是对任务量的把控，这个还是得跟林总商量一下，尽可能制定一个长远的计划，然后我来负责实施。最后是鸡米花提的一个想法，抽个时间坐到一起来推进度，这样确实有助于提高效率。


