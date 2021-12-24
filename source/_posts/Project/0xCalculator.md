---
author: kawhicurry
title: 0xCalculator 16进制计算器
categories:
  - Project
tags: cpp
date: 2021-11-28 17:31:31
---

# 功能

1. 对十六进制数进行双目、表达式运算
2. 对运算结果进行保存和再读取，支持自动保存和手动保存
3. 自定义运算结果储存位置
4. 自定义字体大小
5. 可更换窗口风格（换肤）
6. 自动保存设置

# 任务分配

1. ：ui设计与qt框架
2. ：核心算法
3. ：文件读写

# 开源地址
<https://github.com/kawhicurry/0xCalculator>

# 开发过程

## Qt框架

qt文件将会以平铺的方式放置在同一工程目录下，其组织结构由`.pro`文件记录，该文件类似于makefile（可以看作是qmakefile？）。其标准目录如下：

> .pro：记录文件
>
> /Headers：略
>
> /Sources：略
>
> /Forms：存放`.ui`文件，实际为`xml`格式，但不建议直接编辑，所有操作应当在设计模块中完成
>
> /Resources：存放qt标准资源（可以qt方式引用的资源）
>
> /Other files

## UI设计

直接在qt creator的设计界面中打开`设计`模块。从画面左侧拖动组件，摆放至设计框中即可。

*问题*：组件散乱

- 左侧组件库中有`layout`组件,将其拖动至设计框中,再向layout中添加组件，即可使所有组件呈现一定规律。

>布局类型：
>
>垂直：略
>
>水平：略
>
>栅格（grid）：上面俩合起来
>
>窗口：？存疑，不是很能理解这是啥

*问题*：使用layout组件后无法布局固定，启动ui界面后拖动窗口改变其大小，layout组件位置不动。

- 应当首先在右侧`对象`框中选中主窗口（mainwindow）中的中间部件（centralwidget），右键选择布局，为整个中间部分设定大的布局，（注：主窗口除了中间部件还初始化了一个菜单栏（menubar）），然后在该布局中嵌套布局或组件。本方案选择了栅格布局，虽然只需垂直布局即可，但为了可拓展性，还是选择栅格。接下来在整个中间部分的栅格布局中，嵌套了一个垂直布局（用于输入和输出）和一个栅格布局（用于存放按键）。

接下来在主窗口中添加所需的组件，分别为输入框、输出框、5*6个按键。然后可以对其属性进行可视化的设计，以下是对`设计`界面中一些工具的解释：

> 右侧下方为属性框，显示了所选定组件的属性，每个组件都是层层继承而来，因此要注意每一层的具体属性以及继承关系。
>
> 右侧上方为对象框，显示了当前ui文件中所有文件属性。
>
> 正中央下方的框实际上有两个可编辑区域，一个为action editor，即为组件添加动作（可方便设置快捷键）。另一个为信号与槽。
>
> 注：信号与槽是最Qt制作ui界面中最重要的机制。

创建槽函数：在信号与槽编辑框中点击加号创建信号与槽，然后选择信号的发送对象、发送信号量、槽、响应函数。此处的创建**只支持内定的槽函数**，想要自定义槽函数，需在右侧对象中找到对象，然后右键选择转到槽，接下来选择信号量之后，Qt会跳转该ui文件对应的cpp文件下，并自动创建一个该槽函数的实现（.h文件中也会自动添加声明）。接下来只需在此槽函数中编写发送信号后（触发信号发送条件），所需只需的步骤即可。

> 信号量是Qt类自带的属性，某个类既有自己的属性，也有继承而来的属性。如pushButton组件继承自QAbstractButton，后者又继承自QWidget，后者又继承自QObject。对于QAbstractButton，其自带的信号有`clicked()`,`pressed()`等，对于QWidget，有`windowIconChanged`等。具体解释请参考官方文档。

`设计`界面支持大量的属性设置，如字体，背景等。并且可以直接在ui界面中即时显示，但并不推荐直接做修改。

一种渲染方式：Qt提供了qss来进行类似css的样式渲染，只需选中对象然后右键改变样式表，修改某个组件的样式表即可。Qss还提供了选择器的功能，因此，只需在某个较大的组件中设置样式表，并对不同的渲染对象进行选择即可。本方案一开始的办法就是在centralwidget组件中设置样式表，完成了酷炫的按键风格。需要注意的是，改变样式表的方法在Qt中是存在一定问题的，并且，**任何写死的方法都可能在以后要修改时造成麻烦**。关于样式表后面还会再进一步设定。

## 模拟按键

一个计算器应当提供一系列的按键，因此要在栅格布局中拖入一定数量的按键。按键分为输入按键和功能按键。

- 输入按键：0123456789ABCDEF+-*/（）
- 功能按键：<- -> DEL CE UP DOWN =

对于输入按键，按下按键后应当在输入框中显示对应的输入，同时这些按键应当有对应的键盘输入。

对于输出按键，左移和右移是为了移动输入框中的光标。DEL清除一个字符，CE要同时清除输入和输出框。UP和DOWN提供了查看历史功能。等号是整个计算器的核心功能，按下等号后，应当读取输入框中的算式，进行计算后将结果字符串返回至输出框中。

通过在组件上右键选择 转到槽 可以快捷创建槽函数。示例如图：

```cpp
//mainwindow.h
void MainWindow::on_pushButton_left_bracket_clicked();
//mainwindow.cpp
void MainWindow::on_pushButton_left_bracket_clicked() {
  ui->textBrowser_input->setFocus();
  ui->textBrowser_input->insertPlainText("(");
}
```

手动创建几个后，就可以发现其规矩。一个槽函数的名称由`on_name_action`组成。`pushButton_left_bracket`是改按键的名称，这个名称需要在ui文件中指定，当拖动pushButton的时候，qt会按照12345依次给其一个默认名称，并且上面的默认文字都是pushButton。因此对于声明，可以用宏生成。

```cpp
//mainwindwo.h
#define clicked_func(name) void on_pushButton_##name##_clicked();
  clicked_func(0);
  clicked_func(1);
  clicked_func(2);
  clicked_func(3);
//...
#define triggered_func(name) void on_action##name##_triggered();

  triggered_func(Author);
  triggered_func(Save) triggered_func(Read);
  triggered_func(History_location);
  triggered_func(Auto_Save);
```

对于实现，部分直接输入的槽函数也可以用宏生成

```cpp
//mainwindow.cpp
#define set_insert_func(name)                         \
  void MainWindow::on_pushButton_##name##_clicked() { \
    ui->textBrowser_input->setFocus();                \
    ui->textBrowser_input->insertPlainText(#name);    \
  }

set_insert_func(0);
set_insert_func(1);
set_insert_func(2);
set_insert_func(3);
set_insert_func(4);
```

剩下的就只能自己写咯。

## 输入输出框

qt为用户提供了`text Browser`,`text Edit`,`Plain text edit`,`line edit`等组件作为文本框。这里选择了text Browser，目的是屏蔽直接复制粘贴输入，防止非法字符进入。结果后面发现`text Browser`是由`text Edit`继承而来，因此browser也可以提供输入功能（离谱，read Only属性。

所有的输入按键都将在输入框中插入一个对应的字符。这里只需要调用`text Browser`类中自带的public function member：`insertPlainText(QString)`。

*问题*：文本框中的光标只有在选中文本框时才会显示，如果使用鼠标点击按键进行输入，输入框中的光标实际仍然存在但不显示。

- 为了使得光标时刻存在，这里使用了一个简单粗暴的方法，为所有按键功能加上`setFocus()`。从而保证焦点始终在输入框中。

对于输出框，每次显示结果都是更新所有内容（而不是插入），因此需要`setPlainText`。

## 等号

等号按键是计算器最核心的按键，以下为等号按键的槽函数

```cpp
//mainwindow.cpp
void MainWindow::on_pushButton_equal_clicked() {
  ui->textBrowser_input->setFocus();

  Location::isRead = 0;

  QString s = ui->textBrowser_input->toPlainText();
  QString rst = parser(s);
  ui->textBrowser_output->setPlainText(rst);
  if (Location::autoSave) {
    save(Location::filePath, s, rst);
  }
}
```

按下等号后，程序首先保证焦点仍然在输入框口上，然后讲是否正在读取历史记录按键设置为0（这讲在后面的历史记录读取中说到），然后获取输入框中的内容，交给由竞赛大佬@龚程昊编写的parser函数进行处理（这将在后面数据处理中说到），然后将parser函数返回的字符串（QString）显示到输出框中，然后在自动保存功能开启的情况下，保存至本地文件中。

## 数据处理

等会儿copy大佬写的东西，大致思路是使用栈和转化为前缀表达式。

但大佬使用的使用的是std库，并且是作为一个单独的cpp程序书写的（方便调试）。因此，这里将源文件复制到parser文件中，并将main函数改写成接受`QString`作为参数，返回`QString`的parser()函数。这里用到了`QString::toStdString`和`QString::fromStdString`。

记录几个当时测试出来的bug：

1. 只写一个数后按等号，直接返回0
2. 没有考虑负数
3. 没有考虑溢出

附上代码

```cpp
//parser.cpp
#include "parser.h"

using namespace std;

bool pd(char i) {
  if ((i <= 57 && i >= 48) || (i >= 65 && i <= 70)) return 0;
  return 1;
}

int pri(char i)  // priority
{
  if (i == '+' || i == '-') return 1;
  if (i == '*' || i == '/') return 2;
  if (i == '(') return 0;
  if (i == ')') return -1;
  return 255;
}
bool judge(char i)  //乱码
{
  if ((i <= 57 && i >= 48) || (i >= 65 && i <= 70) || i == '+' || i == '-' ||
      i == '*' || i == '/' || i == '(' || i == ')') {
    return 0;
  }
  return 1;
}

QString parser(QString expression) {
  using namespace std;
  const int N = 1007;
  const long R = LONG_MAX;
  char s[N], stack1[N];
  long read[N], sta[N], stack2[N], stt[N];
  bool f[N] = {0}, flag[N] = {0}, ff = 0, fff = 0;
  string c, sc;
  string str, as = expression.toStdString();
  str = "0+" + as;
  int l = str.length();
  for (int i = 0; i < l; i++) {
    s[i] = str[i];
    if (judge(s[i])) {
      ff = 1;
    }
    if (s[i] == '(' && (s[i + 1] == '*' || s[i + 1] == '/')) ff = 1;
    if (s[i] == ')' && (s[i - 1] == '+' || s[i - 1] == '-' || s[i - 1] == '*' ||
                        s[i - 1] == '/'))
      ff = 1;
  }
  if (pd(s[l - 1]) && s[l - 1] != ')') ff = 1;
  int st = 0;
  for (int i = 0; i < l; i++)  //括号是否匹配
  {
    if (s[i] == '(') st++;
    if (s[i] == ')') st--;
  }
  if (st != 0) ff = 1;
  int j = 0, k = 0, m = 0;
  while (j < l && ff == 0) {
    if (!pd(s[j]))  //数字
    {
      if (s[j] <= 57 && s[j] >= 48) {
        sta[k] = s[j] - 48;
        j++;
        k++;
      } else if (s[j] >= 65 && s[j] <= 70) {
        sta[k] = s[j] - 55;
        j++;
        k++;
      }
    } else if (pd(s[j]))  //符号
    {
      if (!pd(s[j - 1]) && j > 0)  //前面的数字
      {
        int cnt = 0;
        char c = s[j];
        for (int h = 0; k > 0; h++) {
          cnt += sta[k - 1] * pow(16, h);
          k--;
        }
        read[m] = cnt;
        m++;
        j++;
        read[m] = c;
        f[m] = 1;
        m++;

      } else {  //前面的符号
        char c = s[j];
        read[m] = c;
        f[m] = 1;
        m++;
        j++;
      }
    }
  }
  if (!pd(s[l - 1]))  //数字
  {
    if (k > 9) {
      return "Detect Overflow";
    }
    int cnt = 0;
    for (int h = 0; k > 0; h++) {
      cnt += sta[k - 1] * pow(16, h);
      if (cnt > R) return "Detect Overflow";
      k--;
    }
    read[m] = cnt;
    m++;
    j++;
  }
  for (int i = 0; i < m - 1; i++) {
    if (i == 1) {
      if (f[i] == 1 && f[i + 1] == 1 && pri(read[i]) >= 1 &&
          pri(read[i + 1]) == 2) {
        ff = 1;
      }
    } else if (f[i] == 1 && f[i + 1] == 1 && pri(read[i]) >= 1 &&
               pri(read[i + 1]) >= 1) {
      ff = 1;
    }
  }
  int a = 0, b = 0;  //反缀表达式
  for (int i = 0; i < m; i++) {
    if (f[i] == 0) {
      stack2[a] = read[i];
      a++;
    } else if (f[i] == 1) {
      if (read[i] == '(') {
        stack1[b] = '(';
        b++;
      } else if (pri(read[i]) == 1)  //+-
      {
        while (pri(stack1[b - 1]) >= 1 && b > 0) {
          stack2[a] = stack1[b - 1];
          flag[a] = 1;
          b--;
          a++;
        }
        stack1[b] = read[i];
        b++;
      } else if (pri(read[i]) == 2)  //*/
      {
        while (pri(stack1[b - 1]) == 2 && b > 0) {
          stack2[a] = stack1[b - 1];
          flag[a] = 1;
          b--;
          a++;
        }
        stack1[b] = read[i];
        b++;
      } else if (read[i] == ')') {
        while (stack1[b - 1] != '(') {
          stack2[a] = stack1[b - 1];
          flag[a] = 1;
          b--;
          a++;
        }
        b--;
      }
    }
  }
  while (b > 0) {
    stack2[a] = stack1[b - 1];
    flag[a] = 1;
    a++;
    b--;
  }
  // calculation
  int g = 0, cn = 0;
  for (int i = 0; i < a; i++) {
    if (!flag[i])  //数字
    {
      stt[g] = stack2[i];
      g++;
    } else if (flag[i])  //符号
    {
      switch (stack2[i]) {
        case '+':
          cn = stt[g - 2] + stt[g - 1];
          if (cn > R) ff = 1;
          break;
        case '-':
          cn = stt[g - 2] - stt[g - 1];
          if (cn < -R) ff = 1;
          break;
        case '*':
          cn = stt[g - 2] * stt[g - 1];
          if (cn > R || cn < -R) ff = 1;
          break;
        case '/':
          if (stt[g - 1] != 0) {
            cn = stt[g - 2] / stt[g - 1];
            break;
          } else if (stt[g - 1] == 0) {
            ff = 1;
            break;
          }
      }
      g -= 2;
      stt[g] = cn;
      g++;
    }
  }
  int x;
  int cnn = cn;
  if (cn == 0 && !ff) {
    //        cout<<str<<"="<<cn<<endl;
    return "0";
    fff = 1;
  }
  while (cn != 0 && !ff)  //转十六进制
  {
    if (cn >= 0) {
      x = cn % 16;
      if (x < 10)
        c = x + '0';
      else
        c = x + 'A' - 10;
      sc = c + sc;
      cn /= 16;
    } else if (cn <= 0) {
      x = cn % 16;
      if (x > -10)
        c = -x + '0';
      else
        c = -x + 'A' - 10;
      sc = c + sc;
      cn /= 16;
    }
  }
  if (cnn < 0) {
    sc = '-' + sc;
  }
  if (!ff && !fff) {
    //        cout<<as<<"=";
    //        cout<<sc<<endl;
    if (sc == "-80000000") {
      return "Detect Overflow";
    }
    return QString::fromStdString(sc);
  }
  return "Formula Error";
}

```

贴代码的时候才发现大佬写了一个pd（判断）和一个judge（还是判断）。算了算了，能用就行（

## 历史记录

如果只是作为计算器，以上功能就已经可以算完成了。但大多数计算器都是有历史记录功能的，因此这个计算器也该有一个。

这里将历史记录分为底层和顶层两部分来设计，顶层使用Qt框架，而底层使用c的基本库，从而实现更加原子化和方便的操作。

顶层实现的用户接口功能：

- 手动保存当前结果
- 选择是否自动保存结果
- 选择保存位置
- 读取历史记录

底层实现的文本的读写功能

- 获取时间
- 记录结果
- 写入和读取

### 底层设计细节

保存功能被设计为，获取当前时间和本次运算的算式和结果，以新行的方式追加到某文件的结尾。保存功能的底层设计都被保存在`saving`文件下。

为此底层使用std库设计了`save()`函数。该函数还调用了`getCurrentTime()`来获取当前时间。当然，这个函数也是由`main()`函数修改而来，由std框架接入了qt框架。源码如下：

```cpp
//saving.cpp
static string getCurrentTime()  //输出当前时间
{
  time_t t = time(0);
  char ch[64] = {0};
  strftime(ch, sizeof(ch) - 1, "%Y-%m-%d %H:%M:%S", localtime(&t));
  return ch;
}
bool save(QString location, QString fomula, QString data) {
  string addr = location.toStdString();
  fstream f;
  f.open(addr, ios::out | ios::app);
  f << getCurrentTime() << " " << fomula.toStdString() << "="
    << data.toStdString()
    << endl;  //变量addr、以及gch的等式和输出结果变量还需加进去
  f.close();
  return 1;
}
```

除了保存结果外，还需要读取结果，读取结果需要始终从最后一行开始往上读。经历了一系列讨论之后，本项目决定使用读取整个文件来获取所有的行数，并根据行数来获取内容。为此有了`CountLine()`和`readLine()`两个函数：

```cpp
int CountLines(QString filename) {
  ifstream f;
  int n = 0;
  string tmp;
  string stdfilename = filename.toStdString();
  // ios::in 表示以只读的方式读取文件
  f.open(stdfilename, ios::in);
  //文件打开失败:返回0
  if (f.fail()) {
    return 0;
  } else {
    //文件存在
    while (getline(f, tmp, '\n')) {
      n++;
    }
    f.close();
    return n;
  }
}
QString ReadLine(QString filename, int line)  //读取指定行文件
{
  // line行数限制 1 - lines
  if (line > 0 && line <= CountLines(filename)) {
    ifstream f;
    string stdfilename = filename.toStdString();
    f.open(stdfilename, ios::in);

    vector<string> strVec;
    //行0 - 行lines对应strvect[0] - strvect[lines]
    while (!f.eof()) {
      string inbuf;
      getline(f, inbuf, '\n');
      strVec.push_back(inbuf);
    }
    return QString::fromStdString(strVec[line - 1]);
  } else {
    return NULL;
  }
}
```

读取整个文件并计算行数并不是一个效率高的方式，但在文件不大和不追求高效率的条件下，这是最好的实践方式。因为考虑这里还需要考虑到连续读取历史文件。

当用户按下`UP`按键时，表示用户开始读取历史文件。用户首先查看的应该是历史文件的最后一行，当用户再次按下`UP`时，读取倒数第二行，依次类推。为了实现该功能，这里使用了一个全局变量`line`表示当前正在读取的行数，该行数被初始化为历史记录的总行数。然后再次读取将会`--line`后读取。当用户按下`DOWN`按键时，++line后读取。

这里就要考虑到另一个问题，读取一定历史记录后，用户重新进行计算，然后再次查看历史记录，这样行数应当从新的历史记录最后一行开始计算。为此，这里引入了`isRead`变量，该变量初始化为`0`，表示现在未在读取。首次按下`UP`按键时，该变量置`1`，同时将`line`变量初始化为当前历史记录行数。当用户按下`UP`或`DOWN`按键时，正常修改`line`变量的值并进行读取即可。当用户按下`=`或手动保存时，需要将`isRead`置零。这样下一次按下`UP`时，将重新读取历史文件行数并为`line`赋值。

```cpp
//mainwindow.cpp
//等号的槽函数在上面
void MainWindow::on_pushButton_Up_clicked() {
  ui->textBrowser_input->setFocus();
  if (Location::isRead) {
    --Location::line;
  } else {
    Location::line = CountLines(Location::filePath);
    Location::isRead = 1;
  }
  ui->textBrowser_output->setText(ReadLine(Location::filePath, Location::line));
}
void MainWindow::on_pushButton_Down_clicked() {
  ui->textBrowser_input->setFocus();
  if (Location::isRead) {
    ++Location::line;
  }
  ui->textBrowser_output->setText(ReadLine(Location::filePath, Location::line));
}
```

保存和读取的路径将在`顶层设计细节`中进一步讨论。

### 顶层设计细节

这里在menubar中设置了一个`history location`按键，用于修改历史文件的存放位置。当按下此按键时，程序应当打开一个新的窗口，因此，需要首先在源文件中创建一个新的窗口。右键点击`项目`，选择`add new`，选择`qt设计师类`，然后会分别在三个文件夹中依次得到头文件、源文件、ui设计文件。然后需要在主窗口中设置点击`history location`按键打开新窗口。

```cpp
//mainwindow.cpp
void MainWindow::on_actionHistory_location_triggered() {
  Location *new_win = new Location();
  new_win->show();
}
```

**注意**：记得在`mainwindow.h`中include`location.h`，按下打开新窗口实际上就是创建一个新的Location窗口，然后展示。

接下来就是在`location.ui`中修改和设计可视化窗口，此项目使用了栅格布局，在左侧设置了一个较大的`textBrowser`和较小的`lineEdit`（设为不可修改，用于给出提示），在右侧依次设置了`选择文件`，`选择文件夹`，`确定`，`取消` 四个按键。

> 选择文件：调用Qt库，打开系统默认的文件选择框，设置必须选择.txt格式结尾的文件，将返回的结果输出至`textBrowser`。
>
> 选择文件夹：同上，但是选择的是文件夹，并且返回的是存在的文件夹的路径，将返回的结果加上`/result.txt`后输入至`textBrowser`。
>
> 确定：按下后，读取`textBrowser`中的路径，检查其合法性（因为一开始`textBrowser`设置了可以直接更改，因此可能会输入奇怪的路径），若不合法则在`lineEdit`中给出相应的报错（格式不合法或路径不合法）。若合法，则检查文件是否存在，不存在则创建。当一切都合理以后，将全局变量`filePath`设为文本框中的内容，并关闭`Location`窗口。
>
> 取消：直接关闭，不做任何修改。

```cpp
//location.cpp
void Location::on_pushButton_path_clicked() {
  QString file_name =
      QFileDialog::getOpenFileName(NULL, "选择txt文件", ".", "*.txt");
  ui->textEdit->setText(file_name);
}

void Location::on_pushButton_dir_clicked() {
  QString dir_name = QFileDialog::getExistingDirectory(NULL, "选择文件夹", ".");
  ui->textEdit->setText(dir_name + "/result.txt");
}

void Location::on_pushButton_cancel_clicked() { Location::close(); }

void Location::on_pushButton_sure_clicked() {
  QString new_path = ui->textEdit->toPlainText();
  QFileInfo info(new_path);

  if (!info.exists()) {
    if (new_path.contains(".txt")) {
      QFile f(new_path);
      f.open(QIODevice::WriteOnly);
      f.close();
    } else {
      ui->prompt->setText("路径或格式不合法，请重新输入");
    }
  }
  Location::filePath=new_path;
  Location::close();
}
```

自动保存功能被设计为主窗口中菜单栏中的一个按键，默认为开启状态，显示为`Auto Save On`，当点击该按键后，槽函数将该文本替换为`Auto Save Off`，并将全局变量`autoSave`置零。

`filePath`和`autoSave`以及底层中的`isRead`和`line`都设计为一个全局变量，便于主窗口调用。

```cpp
//location.h
class Location : public QDialog {
 public:
  static QString filePath;
  static int line;
  static bool isRead;
  static bool autoSave;
}

//location.cpp
QString Location::filePath = "result.txt";
int Location::line = 0;
bool Location::isRead = 0;
bool Location::autoSave = 1;
```

在主窗口中，只有用户按下等号（并且自动保存功能开启）或手动保存（在`menubar`中设置了一个保存按键并且设置了快捷键）时，才会保存。因此只需在这些地方加入`save()`函数即可。当然，也要有对`autoSave`的判断。

## 样式设定

前面提到了可以在`ui`文件中直接修改样式，但这种方式并不利于后面的修改，因此我们选择直接调用函数的方式。如要为`centralWidget`设定样式，可以调用`setStyelSheet()`，后接一个QString，该字符串中直接书写qss内容。

这里选择了另一种方式，使用qt的资源文件管理功能来存储单独的qss文件，然后以前缀引用的方式来调用这些文件。

在`项目`中右键新建`qt resource file`，设定名称后打开管理界面，点击添加前缀`add prefix`。然后添加文件`add Files`。前缀决定了调用的方式（将会在源代码中演示）。文件可以新建一个`general file`后添加，也可以将其他方式创建的qss文件加入。

引入的资源可以以`QFile`的方式引用。本项目在菜单栏中添加了一个黑色主题的选项，其槽函数如下

```cpp
void MainWindow::on_actionBlack_theme_triggered() {
  globalQss = ":/Black.qss";
  QFile defaultQss(globalQss);
  defaultQss.open(QFile::ReadOnly);
  QString qssContent = defaultQss.readAll();
  centralWidget()->setStyleSheet(qssContent);
}
```

`/`为我设定的前缀，只需以冒号开头，加上前缀和文件，即表明在应用qt指定好的资源文件。接下来就只需打开该文件并读取其内容，然后为需要的组件设定qss样式即可。

**注意**：使用qss的一些麻烦：后面我希望能设定字体的大小、样式等，但这时通过`setFont()`等函数并不起作用。原因估计是qss的优先级很高，直接设定将不起作用。这时我只能再写一个`changeStyle()`函数，通过qss样式表更新来进行样式更新

```cpp
void MainWindow::changeStyle(QString newStyle, QWidget *widget) {
  QString oldStyle = widget->styleSheet();
  oldStyle += newStyle;
  widget->setStyleSheet(oldStyle);
}
```

所以这里我只写了改变字体的函数。

```cpp
void MainWindow::on_actionLarge_font_size_triggered() {
  changeStyle("*{font:30px;}", MainWindow::centralWidget());
}
```

## 保存设置

类似于文件的保存位置，是否自动保存等功能，每次重新启动程序后都会按照程序的设定重新初始化。为了使得这些设定能被保存下来，需要使用一个文件将这些配置保存下来。恰好最近见到了许多`ini`格式文件，qt也提供了`QSetting`及配套的`ini`配置文件读写。

配置文件应当在主窗口创建时被读取，在主窗口被销毁时被存入。因此只需在`mainwindow`的构造函数和析构函数中加入读写`ini`文件的步骤即可。需要注意的是，要考虑`ini`文件不存在的情况，不存在时需要使用程序的内置设定。

 ```cpp
 MainWindow::MainWindow(QWidget *parent)
     : QMainWindow(parent), ui(new Ui::MainWindow) {
   ui->setupUi(this);
 
   this->grabKeyboard();
 
   QSettings *iniRead = new QSettings("config.ini", QSettings::IniFormat);
   QString iniAuto = iniRead->value("autoSave").toString();
   QString iniPath = iniRead->value("filePath").toString();
   QString iniQss = iniRead->value("globalQss").toString();
   delete iniRead;
 
   // init autoSave
   if (!iniAuto.isEmpty() && !iniAuto.toInt()) {
     Location::autoSave = 0;
     ui->actionAuto_Save->setText("Auto Save Off");
   }
 
   // init filePath
   QFile iniPathFile(iniPath);
   if (iniPathFile.open(QFile::WriteOnly)) {
     Location::filePath = iniPath;
   }
 
   // init Qss file(theme)
   QFile iniQssFile(iniQss);
   QString qssContent;
   if (iniQssFile.open(QFile::ReadOnly)) {
     qssContent = iniQssFile.readAll();
     globalQss = iniQss;
   } else {
     QFile defaultQss(":/Black.qss");
     defaultQss.open(QFile::ReadOnly);
     qssContent = defaultQss.readAll();
   }
   centralWidget()->setStyleSheet(qssContent);
 }
 
 MainWindow::~MainWindow() {
   QSettings *IniWrite = new QSettings("config.ini", QSettings::IniFormat);
   IniWrite->setValue("autoSave", Location::autoSave);
   IniWrite->setValue("filePath", Location::filePath);
   IniWrite->setValue("globalQss", globalQss);
   delete IniWrite;
 
   delete ui;
 }
 
 ```

## 其他

- 在主函数中为整个窗口设置了透明度，让它看起来酷炫一点点。
- 在主函数中为窗口设定名称。
- 在`.pro`文件中加入图标文件，使得生成的程序有图标

# 感想

## 收获

- 不再害怕qt框架了，反而觉得它好用。
- qt的窗口类很舒服，有清晰且层次分明的关系，有足够好用的成员函数。
- qt的基本库也有不少可以讨论的，如QString的设计，不仅提供了基本的可变长度和操作符重载，还考虑到了和std库之间的转换。
- qt的信号与槽机制是qt最精髓的东西之一，信号是一种非常不错的线程间通信方式，很遗憾我没有手动使用connect函数来创建信号与槽。但确实在写qt的过程中，qtcreator已经为我提供了足够的可视化信号与槽构建工具。
- qss基本等于css
- qt以易于制作ui界面出名，但用了之后发现，qt实际上是借鉴了很多现代浏览器（前端）的实现方式。我写的时候感觉自己像是在写js+css。对于一个web项目来说，前端工程师书写html，css，以及利用框架来写js。后端工程师则使用各种工具来构建web服务。但对于qt这样一种前后结合的一体化程序设计框架来说，前后的分离并不彻底（虽然对硬件工程师来说可能会很友好）。
- 我还是支持“qt是一个平台而不只是一个ui框架”这种说法。qt在基本库中的内容一点也不比它在ui界面中的少。无论是基本库还是ui库，都有很多可以研究的东西。
- 宏的自动扩展确实好用
- qt毕竟还是封装的比较高层了，要是需要一些简单的功能，还是老老实实写原生的c和std吧。

## 遗憾

- 大佬说他使用了前缀表达式，求余和翻方功能不好实现，我懂的算法也不多，这两个功能没能实现。只能说算法能力有待提高了。
