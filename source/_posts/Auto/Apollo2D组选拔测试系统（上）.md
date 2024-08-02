---
title: Apollo2D组选拔测试系统（上）
tag:
  - apollo
  - robucup
categories:
  - Auto
abbrlink: 99ae6e60
date: 2022-03-18 16:34:02
---

# 起源

关于如何选拔2D正式成员的方案，之前就想过了。但毕竟2D和3D不一样，3D那选进来的都是底子还不错而且积极性蛮强的，2D这边水平有点参差不齐，但也确实有的人有潜力。此前刚好写完了HFO-trainer，对trainer的开发有了不错的理解，后面调试trainer的时候突发奇想，想到了用编写某个固定动作的方法来测试成员的水平。于是就有了一个大致的方案：

# 方案

>让足球从某个点以某个速度飞向某个方向，然后编写球员追球的动作，并评估球员追到球所花费的时间来判断球员代码的质量，进而选拔正式成员。

# 实现

## 核心：get ball trainer

接下来是实现，首先是需要一个trainer，为了偷懒，索性就直接从之前改好的HFO-trainer那里copy一份过来，加上了一条接到球就重置的判断，顺便取消了球出界和球离开`HFO area`（就是半场）的判断。让球可以在球场上到处乱跑。然后把HFO的重置输出时间改为自定义的时间格式，我这里选的是用`@`符号作为分隔符，因为HFO-trainer的输出不完全受我控制，有的输出被写死到了`librcsc`中，用`@`特殊符号便于我用`grep`直接筛选。格式为：`次数@花费时间@开始时间`。

然后有一个指定球的位置的问题，仔细review了HFO-trainer的源码，发现它为了搞球的随机位置搞了一大堆东西，球的初速度也被写死成（0，0）。这里注释了一大堆代码，然后在HFO-Param中加入了一些指定球、球员的位置和速度的参数，最后在参数处理那里参照样例写好参数处理函数。trainer基本就完成了。

本来是有球的速度和位置共四个参数，外加球员的位置的两个参数的。后面实战过程中遇到了一些问题，后面再谈。

## 面向参与者：第一个版本

光有上面这个trainer还不够，还得有一份基本的代码给参加选拔的同学们写，于是这里选择了经典的`HELIOS-BASE`。然后以模仿其`bhv_go_to_static_ball`的文件加了个`bhv_go_to_moving_ball`的cpp/h文件，CMake里当然也不能忘了加（遥想一个月之前，我还不会写cmake）。顺便把上面的HFO-trainer单个文件夹一块打包过来，然后CMake直接`add_subdirectory`。因为之前HFO-trainer的CMakeLists写的挺好的，所以这部分还挺轻松。

还有一个问题是，我希望代码只做追球这一个动作，但不能让球员执行决策树中的其他动作，但同时要允许在追球这个动作中调用其他的动作。最后的做法是在`sample_player`的`actionImpl`函数中做了个“截断”：

```cpp
  Bhv_GoToMovingBall().execute(this);
  return;
```

再然后就是要考虑参加选拔的同学们了，首先是编译，因为很多人还真不会cmake，所以索性写了个`build.sh`的脚本，用于自动编译。而cmake和其他的环境，如果使用我之前写的自动安装脚本的话，应该是装好了cmake的，所以环境应该问题不大。后面优化的时候，还给这个脚本加上了判断内核个数来加速编译过程。挺简洁的，贴一下也好。

```bash
if [ ! -d build ]; then
    mkdir build
fi
cd build
cmake ..
core=$(cat /proc/cpuinfo | grep -c processor)
make -j$core
```

然后就是运行，第一个版本写了个`run.sh`。

在设计上，显示把脚本分成了两块，一部分指定参数，另一部分跑指令。参数这一块，当然是要有启动HFO-trainer时的参数，以及用于观测的monitor的相关参数。然后就是执行，因为要启动包括server、monitor、trainer、player四个executable binary，输出全导到终端的话会很难受， 所以肯定要做个重定向。

首先是可有可无的monitor，写了个对monitor判空的if，这样如果该行留空monitor就不会启动了，然后monitor的重定向也是可有可无的，所以干脆就导到`/dev/null`了。再然后是server，因为server里的输出也用不上，所以操作就同monitor了。接下来trainer会在终端里输出接到球的时间，所以要重定向到一个用来存结果的文件里，后面也要对这个文件做处理，这里随手取了个`raw_result.log`的文件名。然后是player的输出，考虑到写代码的时候，大家有可能要手动debug，一般会用终端输出的方法，所以就讲player的输出导出到`player.log`，然后在文档中告诉他们输出去哪了。

最后是做了个可视化的运行界面，因为测试的时候终端是没有输出的（都被重定向走了），所以决定要加点输出，一开始只有个简单的Running，然后想到了用`grep -c`以轮询的方式从`raw_result.log`中读取当前处理的次数，然后运用`echo "-r"`来实现不换行输出，从而大致展示一种进度条的效果。这个while循环中也加入了一个sleep来避免过大的性能损耗。大致效果如下：

```bash
Preparing...
Running...
123/1000
```

除此之外，设计的时候也考虑到了后续可能会有大量数据要测试，所以预留了一个命令行处理的脚本，当然，非常简陋，但是够用的那种，当命令行参数符合要求（数量要求）时，就会弃用脚本中指定的参数，使用命令行参数中的参数。

```bash
#!/bin/bash
# set -x

echo "Preparing..."

# 监控参数
monitor="rcssmonitor" # "soccerwindow2" or "rcssmonitor"
synch=off             # 启用加速功能 off为关闭
trials=100            # 最大训练次数,0为不开启,注意第一次是无效的

# 球和球员的参数
ball_pos_x="-20.0"
ball_pos_y="20.0"
ball_vel_x="0.0"
ball_vel_y="-2.0"
# player_pos_x="0.0" # 现在不建议修改球员的位置
# player_pos_y="0.0"

# 执行部分，不建议修改----------------------------------------------------

if [ $# -eq 5 ]; then
    synch=on
    ball_pos_x=$1
    ball_pos_y=$2
    ball_vel_x=$3
    ball_vel_y=$4
    # player_pos_x=$5
    # player_pos_y=$6
    trials=$5
fi

func_exit() {
    kill -2 $(pidof rcssserver) &>/dev/null
    kill -9 $(echo ${monitor} | xargs pidof) &>/dev/null
    sleep 1
    rm *.rcg *.rcl
    ./parse.sh
    echo "Game Done"
    exit
}

trap "func_exit" SIGINT SIGTERM SIGHUP

opt="--ball-pos-x=${ball_pos_x} --ball-pos-y=${ball_pos_y}"
opt="${opt} --ball-vel-x=${ball_vel_x} --ball-vel-y=${ball_vel_y}"
opt="${opt} --player-pos-x=${player_pos_x} --player-pos-y=${player_pos_y}"
if [ ${trials} -gt 0 ]; then
    opt="${opt} --trials=${trials}"
fi

rcssserver server::coach=on server::synch_mode=${synch} &>/dev/null &
if [ ! $(pidof ${monitor}) ]; then
    $monitor -c &>/dev/null &
fi
sleep 1
./build/helios-base_hfo_trainer ${opt} &>./raw_result.log &
sleep 1
./build/src/sample_player --config_dir=./build/src/formations-dt &>./player.log &

echo "Running..."
echo "Use [Ctrl]+c to stop at any time"
while true; do
    if [ ! $(pidof helios-base_hfo_trainer) ]; then
        func_exit
    fi
    echo -en "$(grep -c @ raw_result.log)/${trials}\r"
    sleep 0.1
done
```

最后就是结果的处理了，一开始也是准备了一个`parse.sh`脚本。里面肯定起手就是一行`grep @`，从`raw_result.log`中先把有效数据提出出来，然后用`awk`来做进一步处理，这里需要由平均时间取得最小值，平均值，最大值三个数据，直接贴一下源码好了：

```bash
grep -E '@' ./raw_result.log | awk -F "@" 'BEGIN {max=0;min=65536} NR!=1{sum+=$2;if($2>max)max=$2;if($2<min)min=$2} END {print "Times: " NR-1 "\tAverage: " sum/(NR-1) "\tMax: " max "\tMin: " min}'
```

发现`-E`的参数好像不需要，这里grep不需要正则。这里的输出是直接到终端的。原先的方案比这复杂很多，是现在`run.sh`中把`raw_result.txt`中的数据先导出到`result.txt`，然后再由`parse.sh`做处理。因为考虑到了大量参数数据的情况下，raw_result.txt不会留存的情况。

本来还有个`kill.sh`脚本用来终止比赛的，因为要考虑到训练次数允许被设置为无限大。后面利用bash脚本的信号处理机制，也就是`trap`指令，写了个退出处理的函数并集成到了`run.sh`中。这个kill脚本就没有留了。

## 面向参与者：第二个版本

在第一个版本的`run.sh`使用过程中，也注意到了一些问题。

一个是当我尝试更新仓库中的某些脚本时，因为run.sh中有一些参数也被我改掉了，当其他参与者试图用git pull来更新脚本时，会有文件冲突问题，所以有聪明的参赛选手向我提出将`run.sh`中的参数部分与执行部分分开来，在此前的环境安装脚本中，我也确实是这么做的，但考虑到第二个版本里要做对大量参数的处理，加上`run.sh`中确实有些地方可以优化，所以就选择了抛弃`run.sh`，重写一个`autotest.sh`的脚本。

另一个问题就是，在HELIOS-BASE的源码中，当比赛模式被设置为before-kick-off时，球员会默认球在（0，0）位置。为了确保公平，我的做法是，将球员一开始的位置固定为（0，0），然后让球员在比赛开始时找球，因为我认为找球也应当成为考察内容的一部分。但如果是想将追求将问题的范围限制在“只是把看得到的球追到手”这个范围内的话，那应该将球固定在（0，0），然后改变球员的位置。所以这里开始脚本中删除了player位置相关的参数。

第二个版本最重要的内容就是引入了`para.csv`文件，该文件以CSV格式指定了trainer所需要的参数，使得大量数据的测试成为了可能。然后在`autotest.sh`脚本中，我将`run.sh`copy了进来并改造为一个函数，毕竟启动比赛的过程不需要大改。 

然后就是从CSV文件中读取参数并传给run函数执行。这里也是再次用到了awk，并使用了网上的awk传参大法。并且顺手更新了下输出信息，说明了下当前在测的是哪组数据。

最后是退出时，我一开始的想法是保留比赛的log（在第一个版本中，日志会被直接删除），所以使用tar指令讲比赛日志也打包到日志文件夹下，后面想起来在启动rcssserver时直接指定log位置也许是个更好的做法。不过因为后面查看日志不是特别需要的功能，也没啥人会去翻看日志，所以下个版本里索性再次砍掉了日志。

```bash
#!/bin/bash
# set -x

monitor=soccerwindow2
default_trials=100

if [ ! -d log ]; then
    mkdir log
fi
if [ ! -d log/gameLog ]; then
    mkdir log/gameLog
fi

log=./log/$(date +%Y%m%d%H%M%S).log
raw_log=./log/$(date +%Y%m%d%H%M%S).raw.log

func_exit() {
    kill -9 $(echo ${monitor} | xargs pidof) &>/dev/null
    tar -cvzf ./log/gameLog/$(date +%Y%m%d%H%M%S).rcg.tar.gz ./*.rcg --remove-files &>/dev/null
    tar -cvzf ./log/gameLog/$(date +%Y%m%d%H%M%S).rcl.tar.gz ./*.rcl --remove-files &>/dev/null
    rm *.log
    echo -e "Train Done----------------------------------------"
    cat $log | grep Average -B 1 --color=auto
    echo -e "Check $log to see the result again"
    exit 0
}

run() {
    if [ $# -eq 6 ]; then
        ball_pos_x=$1
        ball_pos_y=$2
        ball_vel_x=$3
        ball_vel_y=$4
        trials=$5
        synch=$6
    fi

    func_exit0() {
        kill -2 $(pidof rcssserver) &>/dev/null
        kill -9 $(echo ${monitor} | xargs pidof) &>/dev/null
        while [ $(pidof rcssserver) ]; do
            sleep 1
        done
        echo "#$ball_pos_x#$ball_pos_y#$ball_vel_x#$ball_vel_y" >>$raw_log
        grep @ ./raw_result.log >>$raw_log
        echo -e "\n" >>$raw_log
        echo "Game Done"
    }

    trap "func_exit" SIGINT SIGTERM SIGHUP

    opt="--ball-pos-x=${ball_pos_x} --ball-pos-y=${ball_pos_y}"
    opt="${opt} --ball-vel-x=${ball_vel_x} --ball-vel-y=${ball_vel_y}"
    opt="${opt} --player-pos-x=${player_pos_x} --player-pos-y=${player_pos_y}"
    if [ ${trials} -gt 0 ]; then
        opt="${opt} --trials=${trials}"
    fi

    rcssserver server::coach=on server::synch_mode=${synch} &>/dev/null &
    if [ ! $(pidof ${monitor}) ]; then
        $monitor -c &>/dev/null &
    fi
    sleep 1
    ./build/helios-base_hfo_trainer ${opt} &>./raw_result.log &
    sleep 1
    ./build/src/sample_player --config_dir=./build/src/formations-dt &>/dev/null &

    # echo "Running..."
    # echo "Use [Ctrl]+c to stop at any time"
    while true; do
        if [ ! $(pidof helios-base_hfo_trainer) ]; then
            func_exit0
            return 0
        fi
        echo -en "$(grep -c @ raw_result.log)/${trials}\r"
        sleep 0.1
    done

}

trap "func_exit" SIGINT SIGTERM SIGHUP

if [ $# -eq 2 ]; then
    Line=$1
    let "Line++"
    eval $(awk -F ',' 'NR=="'$Line'"{printf("group=%s; ball_pos_x=%s; ball_pos_y=%s; ball_vel_x=%s; ball_vel_y=%s",$1,$2,$3,$4,$5)}' para.csv)
    let "Line--"
    echo "Running group $group"
    echo "ball_pos_x:$ball_pos_x ball_pos_y:$ball_pos_y ball_vel_x:$ball_vel_x ball_vel_y:$ball_vel_y" >>$log
    run $ball_pos_x $ball_pos_y $ball_vel_x $ball_vel_y $default_trials $2
    ./parse.sh >>$log
    func_exit
fi

Line=$(cat para.csv | wc -l)
let "Line++"
while (($Line > 1)); do
    eval $(awk -F ',' 'NR=="'$Line'"{printf("group=%s; ball_pos_x=%s; ball_pos_y=%s; ball_vel_x=%s; ball_vel_y=%s",$1,$2,$3,$4,$5)}' para.csv)
    let "Line--"
    echo "Running group $group"
    echo "ball_pos_x:$ball_pos_x ball_pos_y:$ball_pos_y ball_vel_x:$ball_vel_x ball_vel_y:$ball_vel_y" >>$log
    run $ball_pos_x $ball_pos_y $ball_vel_x $ball_vel_y $default_trials on
    ./parse.sh >>$log
done

func_exit

```

上面的就是提供给参赛者需要的主要脚本了，或者换句话，参赛者需要的这么多也够了，但如果是多个参赛选手+多组参数数据，那就又需要新的脚本来完成任务。所以上半篇章就到这里结束了，关于多选手多数据的测试在会在下半篇章介绍，而完成那种任务的脚本以及相关工具也更为复杂，但完成的效果也更棒。