---
title: vim小技巧（1）
cover : https://gallery-cos.kawhicurry.online/picgo/gallery/nord/DSC_9765.JPG
tags:
  - 专栏：每天几个vim小技巧
  - vim
categories: Tools
abbrlink: 88cbcb44
date: 2022-03-07 14:34:43
---

# Chapter 1: the vim way

## tip1: meet dot command

> dot command repeat the last change

So what is "the last change"?

A change could act at the level of individual characters, entire lines, or even the  whole file.

Tor example: `x` act at a character, `dd` act at a line, `>G` increases the indentation from the current line until EOF.

*The dot command is a micro macro*

Vim can record any arbitrary number of keystrokes to be played back later.

## tip2: Don't repeat yourself

To add a semicolon(;) at the end of each line, we might first press `$`, then `a;`, finally `<Esc>`.Then just run `j$.` to apply change on lines below.

*Reduce extraneous Movement*

While `a` appends after current cursor position, `A` appends at the end of line, thus squashes `&a` into a single keystroke. We can use`A;<Esc>`, then repeat by`j.` now.

There's a lot of command compounds two actions into a single keystroke. See figure 'Two for the price of one'

| Compound command | Equivalent in longhand |
| ---------------- | ---------------------- |
| C                | c$                     |
| s                | cl                     |
| S                | ^c                     |
| I                | ^i                     |
| A                | $a                     |
| o                | A<CR>                  |
| O                | ko                     |

## tip3: Take one step back, then three forward

Take this as example: add space around '+' in "method("+argument+","+argument2+")";"

First `f+` move cursor to first '+' , then `s + <Esc>`, then `;.`

The stop `s + <Esc>` first delete character '+', then add ' + 'there. One step back then three forward.

*Make the Motion Repeatable*

First we use `f{char}` to find a character, this is our first change, we can apply it later, but better way to do this is press `;`, which repeat the last search. So instead of typing `f<char>` many times, we just use `;` to repeat.

*All together now*

We can just use `;.` to repeat all jobs above now.

## tip4: Act, Repeat, Reverse

We can use dot command to repeats the last change.

Use `@:` to repeat any Ex command, use `&` to repeat command like `:command`

Use`u` to reverse last change, use `,` to reverse last search

About reverse:

| Intent                                | Act                       | Repeat | Reverse |
| ------------------------------------- | ------------------------- | ------ | ------- |
| Make a change                         | {edit}                    | .      | u       |
| Scan line for next/previous character | [f\|t]{char}/[F\|T]{char} | ;      | ,       |
| Scan document for next/previous match | /or?pattern<CR>           | n      | N       |
| Perform substitution                  | :s/target/replacement     | &      | u       |
| Execute a sequence of changes         | qx{changes}q              | @x     | u       |

## tip5: Find and Replace by Hand

Vim has a:substitude command to find and replace tasks.

Take this as example, substitute the first and third 'hello' to 'hi', but keep the second hello.

We can first move to first hello, then press`*` to choose all 'hello'. Then `cwcopy<Esc>`, then use `n` to move to next word. Finally use `.` to repeat substitution.

`*` search for all words and move to the next result, if vim don't show us highlight, we can set by ourselves with `:set hls`.

*Make the change repeatable*

`cw` deletes the word and drops us into insert mode so we can use dot command later.

*All together now*

`n.`

## tip6: Meet the dot formula

This is a summary of this chapter.

We call this pattern as `Dot Formula`

Dot Formula: *One Keystroke to Move, One Keystroke to Execute*

