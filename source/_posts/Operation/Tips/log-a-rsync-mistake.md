---
title: log-a-rsync-mistake
categories:
  - Operation
  - Tips
tags:
  - rsync
abbrlink: 2571fbb2
date: 2021-12-03 16:16:26
---

# log a rsync mistake

I want to sync some files from 2 directories `mirror1` and`mirror2`.So I run:

```bash
nohup rsync <src>/mirror1 ./tmp -a --delete &
nohup rsync <src>/mirror2 ./tmp -a --delete &
```

the argument `--delete` would delete all the file not exist in source directories. So only second command make effect.

Avoid abusing of `--delete` when using `rsync`. 
