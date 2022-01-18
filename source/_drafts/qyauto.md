# 背景

想起来再写

## 设备

- 4个树莓派4b。其中三个有16g存储卡，一个有64g存储卡。
- 一个500g机械硬盘
- 战神笔记本及其打印机（可能）

## 方案

- 使用kubesphere为管理平台，实现自动部署功能。
- 使用openfunction为serverless平台，实现函数计算功能。
- 使用nexus作为本地缓存仓库，搭建私有镜像站和前端工具缓存
- 

# 过程

## 安装系统

本次安装选择了树莓派专用的ubuntu server20.04.3，为了方便快捷，使用了官方提供的烧录软件。（期间烧坏了自己的拓展坞）每份镜像烧录后都需要在其启动目录下添加一个无后缀的SSH文件，以开启ssh功能。

## 固定IP

由于dhcp协议的存在，路由器会首先为每个树莓派分配一个ip地址。首先手动ssh登录到每个树莓派，修改其默认密码。ubuntu server的默认账号密码均为**ubuntu**。在修改完密码之后，先不急着退出登录。首先登录路由器管理页面，为每个路由器固定ip，目前采用的固定方案如下：
```bash
192.168.50.200 （64g存储卡）
192.168.50.201
192.168.50.202
192.168.50.203
```

然后在终端中重启四个树莓派，路由器会重新为其分配上方的ip地址。

## 安装

### Ansible连接

由于有多个节点，我希望使用ansible来简化流程。ansible安装在管理机器上即可，我这里直接使用win11的wsl2。

首先创建一个inventory文件：

```ini
# ~/ansible/qyhosts
[all]

[all:vars]
ansible_ssh_port=22
ansible_ssh_user=ubuntu
ansible_ssh_pass=//略

ansible_become=true
ansible_become_method=sudo
ansible_become_user=root
ansible_become_pass=//略

[manager]
node0 ansible_ssh_host=192.168.50.200

[node]
node1 ansible_ssh_host=192.168.50.201
node2 ansible_ssh_host=192.168.50.202
node3 ansible_ssh_host=192.168.50.203
```

注意，此处使用的是密码连接，需要安装sshpass软件。并且在使用ansible ping之前需要先手动连接一次，保证被连接机器已经被加入known_hosts。

（这里感觉可以简化，留给读者证明）

然后就可以使用使用ansible ping。

```bash
root@LAPTOP-86RSEGF8:~/ansible/roles# ansible all -m ping -i ../qyhosts
node0 | SUCCESS => {

    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
node3 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
node1 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
node2 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```

### ansible设置免密登录

如果按照上面的办法登录，密码将不得不以明文的方式存在，所以我们使用ansible向树莓派传递ssh公钥（也刚好拿来练习一下playbook的写法）。

参考：https://www.jianshu.com/p/65191d01e9c2

实操：

```yaml
---
- hosts: all
  gather_facts: no
  tasks:
  - name: set up ssh key
    authorized_key:
      user: ubuntu
      state: present
      key: "{{ lookup('file', '/root/.ssh/id_rsa.pub') }}"//文件位置可任意修改
```

注意：yaml语法有诸多坑，比如不能用tab，{{和}}前后要有空格等。

（这里其实还可以改下playbook，自动检测是否添加成功）

### ansible安装docker

（因为ubuntu20.04不支持podman，也没有现成的playbook）

```yaml
---
//docker.yaml
- hosts: all
  gather_facts: no
  become: yes
  become_method: sudo
  tasks:
    - name: get docker
      script: /root/ansible/roles/get_docker.sh
```

这个get_docker.sh 来源于官方的安装脚本https://get.docker.com/

接下来为手动部署环节，仅在node0上操作。

### kubekey安装kubesphere

官方教程：https://kubesphere.com.cn/docs/quick-start/all-in-one-on-linux/

官方文档里的链接是无效的，直接去仓库下：https://github.com/kubesphere/kubekey

> 注意：请先切换到root，并在root的家目录下执行上述指令

安装kk是个痛苦的事情，我在这里挂了梯子才得以下载，并且官方的脚本必须在家目录下执行，否则会出问题。

> 注意，在下一步使用kk部署前，请先前往 `/boot/firmware/cmdline.txt` 加入
>
> `cgroup_enable=memory cgroup_memory=1`
>
> 否则接下来会报错该cgroup未打开（要加在同一行）

```bash
$ vi /boot/firmware/cmdline.txt

net.ifnames=0 dwc_otg.lpm_enable=0 console=serial0,115200 console=tty1 root=LABEL=writable rootfstype=ext4 elevator=deadline cgroup_enable=memory cgroup_memory=1 rootwait fixrtc

$ reboot
```

安装完毕后需要安装conntrack工具，然后再使用kk部署kubesphere和k8s。

自此，它卡住了。
