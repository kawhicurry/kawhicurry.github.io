---
title: 记录一次hexo生成的错误
tags:
  - hexo
description: 记录一次hexo生成的错误
categories:
  - Front-end
date: 2022-01-29 15:17:20
---

# 记录一次hexo生成的错误

之前hexo生成时显示

```bash
 err: Template render error: (unknown path)
```

查了一下发现是之前的文档演示了gitbook中jinja模板的内容，需要演示`{% if apollo %}`。

而hexo也识别该语法，所以在演示时需要加上\`符号或其他方式来使其不被渲染。
