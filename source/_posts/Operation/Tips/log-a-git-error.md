---
title: log-a-git-error
categories:
  - Operation
  - Tips
tags:
  - git
abbrlink: 1bfaedf6
date: 2021-11-10 20:01:01
---

When I tried to clone a repo from self-built gitlab. I met a error like this：

```bash
$> git clone https://git.qingyou.ren/KawhiCurry/ansible.git  Cloning into 'ansible'...
fatal: unable to access 'https://git.qingyou.ren/KawhiCurry/ansible.git/': Failed to connect to 127.0.0.1 port 7890: Connection refused
```

Anyway, 7890 refuse me. Finally, I got this: [cnblogs](https://www.cnblogs.com/lfri/p/15377383.html)

Seems my proxy(or vpn?)ruin it. It leads my git somewhere strange.

record the operation here.

```bash
git config --global -l
git config --global -e
//delete or comment on the lines about port
```

