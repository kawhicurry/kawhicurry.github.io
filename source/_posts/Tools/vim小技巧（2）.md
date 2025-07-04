---
title: vim小技巧（2）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_0004.JPG
tags:
  - 专栏：每天几个vim小技巧
  - vim
categories: Tools
abbrlink: 9a7e64aa
date: 2022-03-10 18:25:44
---

# Chapter 2: Normal Mode

接下来几章都是关于模式的

## tip7: Pause with your brush off the page

Why is the normal mode the default mode?

Because we spent the most of of time on thinking rather than typing.

## tip8: Chunk Your Undoes

use `u` to undo your changes at any time.

And always go back to normal mode when you feel like you want to "have a rest".

## tip9: Compose Repeatable Changes

*Vim is optimized for repetition*

To delete a word backward, we can press `db`

To delete a word forward, we can use `dw`

To delete a word, we can use `daw`

To make our operation more **repeatable**, we need to make our operation more clearly.

Take above as example, we can use `dbx`,`bdw`,`daw` to delete a word. But only the last operation involves one steps. So it's the most **repeatable** one.

Thus, we can use `.` the dot command to repeat it easily.

## Tip10: Use Counts to Do Simple Arithmetic

VIM CAN DO ARITHEMETIC !!!!

When cursor is on a number, we can use `number<C-a>`to do addition or use `number<C-x>` to do subtraction.

What if cursor is not on a number? The cursor will look for ahead for a digit. This is really convenient.

Another notice: numbers begin with 0 will be considered as a octal number. Of you can edit it in `vimrc` , `set nrformats=`. And numbers begin with 0x are same.

## Tip11: Don't Count If You Can Repeat

If we want to delete next two word now. We can press `d2w`  `2dw` or `dw.`. The previous one means `delete two words`, while the later one means `repeat delete a word twice`.

Dot is convenient for undoes. But use a count when it matters.

## Tip12: Combine and Conquer

*Operator+Motion=Action*

| Trigger | Effect                                          |
| ------- | ----------------------------------------------- |
| c       | change                                          |
| d       | delete                                          |
| y       | yank into register                              |
| g~      | switch case                                     |
| gu      | make lowercase                                  |
| gU      | make uppercase                                  |
| >       | shift right                                     |
| <       | shift left                                      |
| =       | autoindent                                      |
| !       | filter{motion}lines through an external program |

auto indent with `gg=G`

when we type `dw`, there is a special mode called *Operator-pending Mode* between `d` and `w`. Vim will only accept motion in this mode (or use <Esc> to cancel it).
