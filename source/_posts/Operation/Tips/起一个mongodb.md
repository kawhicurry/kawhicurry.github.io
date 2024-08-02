---
title: 起一个mongodb
categories:
  - Operation
  - Tips
tags: mongodb
abbrlink: e9565578
date: 2021-12-23 12:58:30
---

第一件事：`mongodb` , 不是

- mongdb
- mogodb
- ......

为了给RssSubcriber起一个数据库，在阿里云上搭了一个，本来想着直接用阿里云的市场镜像的，拿下来之后发现根本不知道咋用。。。还不如自己起一个。

官方文档中给了使用包管理工具按照的方法：<https://mongodb.net.cn/manual/tutorial/install-mongodb-on-red-hat/>

大概步骤就是添加仓库然后直接安装完事。

然后是要改一下配置文件，mongodb的配置文件位于`/etc/mongo.conf`，主要是将其中的

```
net:
   bindIp: 127.0.0.1
   port: 27017
```

这里的`bindIp`表示监听的地址，这里只监听了本地，我将其该外`0.0.0.0`即可保证外网随时访问。

然后下面的`port`也要记得加入阿里云的安全组。
