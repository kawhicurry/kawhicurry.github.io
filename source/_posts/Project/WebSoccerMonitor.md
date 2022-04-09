---
title: WebSoccerMonitor
tags:
  - robocup
  - front
categories:
  - Project
abbrlink: '93340145'
date: 2022-04-09 19:50:18
---

之前看到了一个巴西小伙（也有可能是大哥？）的[项目](https://github.com/robocin/WebSoccerMonitor)

目的是做一个浏览器上的robocup 2d的monitor。他用的是ts写成的后端，掺了点py。目前已经完成的功能有通过拖拽录像文件来播放比赛的回放。打开它的issue发现，作者希望能实现一个实时的前端，我这里搭好node环境之后试用了一下，感觉ui还挺漂亮，就是没有实时功能确实有点难受。聊完之后作者表示希望这是个纯前端项目，最好只要个浏览器就能跑。当时解析rcssserver的monitor协议是个比较难受的问题，然后刚好server即将支持json格式，所以就一直在等。

等到rcssserver出version17的时候（它刚出两个小时我就更新了，然后发现了俩头文件的缺失……，提了issue后又过了两个小时出了个补丁版本），终于有json格式的协议了。然后我就开始写demo啦。然后我就发现了一个史诗级的困难。rcssserver只支持udp协议，并且和代码结合的挺深，虽然有tcp的类，但是没法用。而浏览器则是完全没法用udp，于是我就开始尝试找一个能用的协议，顺便把问题提给了巴西小伙。一天之后我们出奇地达成了一致，就是让rcssserver支持WebRTC协议，巴西小伙比较猛，直接找rcssserver的维护者秋山大神对线。秋山大神说还是写个proxy比较好，这点我也发现了，甚至写好了第一个proxy的demo。但这还远远不够，因为浏览器还需要各种各样的应用层协议。我也问了秋山能不能他直接把proxy集成到rcssserver里，秋山表示这样的代价太大了，没有必要，不如另外开发一款软件，以让rcss系统的软件更加“模块化”。

所以我就先开写啦，项目在[这里](https://github.com/kawhicurry/WebSoccerMonitor-plain)。

我的思路是先将udp转成tcp协议，然后在应用层使用WebSocket协议将数据转发至浏览器。语言选择的是python，因为想要“快速开发”，但python真的是个***********的语言。写了三个版本之后终于有一个勉强能用的了：
```python
#!/usr/bin/env python3

import asyncio
import websockets
import socket
import _thread

udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
init_message = '(dispinit version 5)'
udp.sendto(init_message.encode('utf-8'), ('127.0.0.1', 6000))


async def web(websocket):
    msg = await websocket.recv()


async def serve(websocket):
    while True:
        message = udp.recv(40960).decode('utf-8')[:-1]
        await(websocket.send(message))


async def main():
    async with websockets.serve(serve, 'localhost', 7000):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
```

主要是websockets相关的api和函数比较令人难受，但手动实现也有各种各样奇怪的问题，终究是有点难受。然后async/await的协程其实也挺痛苦，因为我是想写多线程……，这个proxy，与其说是proxy，不如说是另一个server（好像所有proxy都是某个server？）。总之代理这边搞定了，然后就是web前端，同样是为了快速开发，直接一个html把所有东西都include了。主要的js代码如下
```javascript
 socket = new WebSocket('ws://localhost:7000');
    socket.onopen = function () {
      console.log('connect success');
    }
    socket.onmessage = function () {
      //console.log('message received', event.data);
      const data = JSON.parse(event.data)
      var canvas = document.getElementById('pitch')

      if (data.type == "show") {
        var ctx = canvas.getContext('2d')
        //clear
        //ctx.height = ctx.height
        ctx.globalCompositeOperation = "copy";
        pitch()
        //ball
        ctx.beginPath();
        ctx.arc(data.ball.x * rate + canvas.width / 2, data.ball.y * rate + canvas.height / 2, BALL_SIZE, 0, 2 * Math.PI, true);
        ctx.fillStyle = "#FF0000"
        ctx.fill()
        ctx.closePath();
        //player
        for (var i = 0; i < data.players.length; i++) {
          ctx.beginPath();
          ctx.arc(data.players[i].x * rate + canvas.width / 2, data.players[i].y * rate + canvas.height / 2, PLAYER_WIDGET_SIZE, 0, 2 * Math.PI, true)
          if (data.players[i].side == "l") {
            ctx.fillStyle = "#FFFF00"
          } else {
            ctx.fillStyle = "#00FFFF"
          }
          ctx.fill()
          ctx.closePath();
        }
      }
    }
    socket.onerror = function () {
      console.log("socket error");
    }
    socket.onclose = function (e) {
      console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
      console.log(e)
    }
```

首先是websocket，让它网页打开时自动和proxy建立链接。其实一开始想的是点击按钮实现链接，发现好难用，还是网页加载时直接链接好一点。

然后就是解析json格式，果然这就到了js最擅长的地方，直接一个`JSON.parse()`就带走了。

再然后就是绘制球场，这里参考了原来的`WebSoccerMonitor`项目，用了canvas（不过好像canvas确实是最好的选择了？）。首先是用canvas画一个足球场，先在网上找了个模板，然后拿下来魔改了一下，然后把`rcssserver`的C++代码里的各种场地边线的数据copy进来，改成js格式，最后把整个球场的绘图函数丢到一个单独的函数里，在网页打开时就绘制好。然后把球员和球的绘图代码丢到WebSocket的onmessage事件监听handler里，这样就能动态更新球和球员的位置。

好像这么多就够了，代码能跑了（bushi

记录下学到的各种奇奇怪怪的东西吧
1. 协程究竟是个啥玩意
2. python的协程async/await机制
3. websocket协议，尤其是Ack-key的机制
4. JS的事件机制
5. python的多线程
6. canvas真好玩

写了这么久python和JS，感觉还是想拿Cpp试试，毕竟cpp是真的啥都能写。话说回去，拿python也没能手动实现WebSockets协议，只能说缺的不是一点cpp能力，计网和OS的能力也很缺。又又又是任重道远的一天。
