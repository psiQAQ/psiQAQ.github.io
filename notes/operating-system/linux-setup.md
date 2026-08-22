# Windows 10/11 + Ubuntu 26.04 LTS 双系统安装指南

本文适用于在已有 Windows 10/11 的 x86-64 电脑上安装 Ubuntu 26.04 LTS，目标是在保留 Windows 的前提下，使用独立 Ubuntu 分区和 UEFI/GRUB 双系统启动，并让 NVIDIA 驱动正常工作。

对于标准 Ubuntu 内核，NVIDIA 驱动优先使用 **Canonical 预编译并签名的内核模块**；只有自定义内核或官方没有对应预编译模块时才考虑 DKMS。Ubuntu 官方也明确推荐普通用户优先使用 `ubuntu-drivers`，默认选择预编译、已签名且兼容 Secure Boot 的驱动。([Ubuntu][1])

---

## 1. 安装前检查

管理员 PowerShell：

```powershell
# 查看 Windows 架构
Get-CimInstance Win32_OperatingSystem |
    Select Caption, OSArchitecture

# 查看磁盘是否为 GPT
Get-Disk |
    Select Number, FriendlyName, PartitionStyle, Size

# 查看 BitLocker，需要管理员方式运行
manage-bde -status

# 查看休眠状态
powercfg /a
```

按 `Win + R`，输入 `msinfo32`。确认“系统类型”为 `x64-based PC`，“BIOS 模式”为 `UEFI`。

建议条件：

| 项目 | 推荐 |
| ------------- | -------------------- |
| CPU | Intel / AMD x86-64 |
| 启动模式 | UEFI |
| 系统盘 | GPT |
| Ubuntu 空间 | ≥80GB，开发建议 150–300GB |
| U盘 | ≥8GB，推荐 16GB |
| BitLocker恢复密钥 | 已备份 |

安装前请确认恢复密钥已保存到 Microsoft 帐户或离线安全位置。后续若需要对 Windows 分区完整解密，恢复密钥丢失会增加数据恢复风险。

如果 Windows 使用 `Legacy + MBR`，不要直接切换 BIOS 到 UEFI；应先单独完成 MBR→GPT 转换，并确认 Windows 可以在 UEFI 模式启动。

---

## 2. 备份

至少备份重要文件、SSH Key、代码、BitLocker 48 位恢复密钥和磁盘管理界面截图。

双系统安装涉及 EFI、分区表和启动链，BitLocker 恢复密钥尤其重要。

如果 BitLocker 未启用，可跳过 BitLocker 恢复密钥备份。

---

## 3. 下载 Ubuntu 26.04

优先从 [Ubuntu 官方下载页](https://ubuntu.com/download/desktop) 获取镜像。下载较慢时，可使用 [华为云 Ubuntu Releases 镜像目录](https://repo.huaweicloud.com/ubuntu-releases/)；无论使用哪一来源，都必须从同一发布目录取得对应的 `SHA256SUMS`。

Ubuntu 桌面版镜像文件名为 `ubuntu-<版本号>-desktop-amd64.iso`；普通 Intel/AMD 电脑下载 `ubuntu-26.04-desktop-amd64.iso`。

`amd64` 同时适用于 Intel 和 AMD 64 位 CPU。

下载后校验 SHA-256：

```powershell
# 将路径替换为实际下载位置
Get-FileHash `
  "$env:USERPROFILE\Downloads\ubuntu-26.04-desktop-amd64.iso" `
  -Algorithm SHA256
```

与 `SHA256SUMS` 完全一致后再制作 U 盘。

---

## 4. Rufus 制作安装盘

Rufus 是一款免费开源的 U 盘制作工具，支持 Windows 和 Linux，支持 UEFI/BIOS 双启动，支持 GPT/MBR 分区表，支持 NTFS/FAT32 文件系统，支持 ISO 镜像和 ISO 镜像 + 启动文件。

下载地址：

- 官网：[https://rufus.ie/zh/#download](https://rufus.ie/zh/#download)
- github：[https://github.com/pbatard/rufus](https://github.com/pbatard/rufus)

下载 `rufus-x.xx.exe` 或者 `rufus-x.xxp.exe`，安装后打开。

在 Rufus 中选择安装 U 盘和 Ubuntu ISO，分区类型选 `GPT`，目标系统选 `UEFI（非 CSM）`，文件系统保持 Rufus 自动选择，写入方式选 `ISO Image mode`。不要强制指定 FAT32 或选择 Legacy/CSM；制作过程会清空 U 盘。

---

## 5. Windows 中准备 Ubuntu 空间

### 5.1 BitLocker

先备份恢复密钥，再检查：

```cmd
manage-bde -status
```

如果 Ubuntu 要使用的 Windows 磁盘/分区启用了 BitLocker，建议先完整解密，时长根据文件数量而定：

```cmd
manage-bde -off C:
```

等待 `manage-bde -status` 显示 `Percentage Encrypted: 0.0%` 和 `Fully Decrypted`。不要使用来源不明的第三方“BitLocker 关闭工具”。

### 5.2 关闭休眠/快速启动

管理员 CMD：

```cmd
powercfg /hibernate off
```

然后真正关机一次：

```cmd
shutdown /s /t 0
```

避免 Windows NTFS 保持休眠状态。

### 5.3 压缩分区

`Win + R` 输入 `diskmgmt.msc`，选择空间充足的 NTFS 分区，右键 → 压缩卷 → 输入 Ubuntu 使用空间，例如 200GB = 204800MB，输入 `204800`，点击 `压缩`，等待完成，得到 `200GB 未分配空间`。

注意：不要格式化、不要新建 NTFS 卷、不要分配盘符！

---

## 6. 开始安装 Ubuntu 26.04

### 1. 重启进入安装界面

1. 确保 Ubuntu 26.04 安装 U 盘已经插入电脑；

2. 重启电脑，连续快速按 `启动菜单快捷键（Boot Menu Key）`，不同品牌/机型快捷键不同，例如常见的 `F12`、`F11`、`F9`、`Esc` 等，根据自己的电脑型号选择对应快捷键，具体可参见：

    | 组装机主板 | 启动按键 | 品牌笔记本 | 启动按键 | 品牌台式机 | 启动按键 |
    | --- | --- | --- | --- | --- | --- |
    | 华硕主板 | F8 | 联想笔记本 | F12 | 联想台式机 | F12 |
    | 技嘉主板 | F12 | 宏基笔记本 | F12 | 惠普台式机 | F12 |
    | 微星主板 | F11 | 华硕笔记本 | ESC | 宏基台式机 | F12 |
    | 映泰主板 | F9 | 惠普笔记本 | F9 | 戴尔台式机 | ESC |
    | 梅捷主板 | ESC 或 F12 | 联想 ThinkPad | F12 | 神舟台式机 | F12 |
    | 七彩虹主板 | ESC 或 F11 | 戴尔笔记本 | F12 | 华硕台式机 | F8 |
    | 华擎主板 | F11 | 神舟笔记本 | F12 | 方正台式机 | F12 |
    | 斯巴达主板 | ESC | 东芝笔记本 | F12 | 清华同方台式机 | F12 |
    | 昂达主板 | F11 | IBM 笔记本 | F12 | 海尔台式机 | F12 |
    | 双敏主板 | ESC | 海尔笔记本 | F12 | 明基台式机 | F8 |
    | 翔升主板 | F10 | 方正笔记本 | F12 | | |
    | 精英主板 | ESC 或 F11 | 清华同方笔记本 | F12 | | |
    | 冠盟主板 | F11 或 F12 | 微星笔记本 | F11 | | |
    | 富士康主板 | ESC 或 F12 | 明基笔记本 | F9 | | |
    | 顶星主板 | F11 或 F12 | 技嘉笔记本 | F12 | | |
    | 铭瑄主板 | ESC | Gateway 笔记本 | F12 | | |
    | 盈通主板 | F8 | eMachines 笔记本 | F12 | | |
    | 捷波主板 | ESC | 索尼笔记本 | ESC | | |
    | Intel 主板 | F12 | 苹果笔记本 | 长按 Option | | |
    | 杰微主板 | ESC 或 F8 | 三星笔记本 | F12 | | |
    | 致铭主板 | F12 | 富士通笔记本 | F12 | | |
    | 磐英主板 | ESC | 雷神笔记本 | F12 或 ESC | | |
    | 磐正主板 | ESC | 机械革命 | F10 | | |
    | 冠铭主板 | F9 | 未来人类 | F7 | | |
    | | | 小米笔记本 | F12 | | |

3. 进入启动选项菜单后，选择 U 盘（展示为 U 盘的品牌名）对应的 USB 启动项；

4. 进入安装界面后，选择第一个启动选项： `Try or Install Ubuntu`；

### 2. Ubuntu 安装设置和启动流程

1. `选择您的语言` 选择 `中文（简体）`；

2. `可访问性` 设置保持默认；

3. `键盘布局` 设置保持默认（汉语）；

4. `连接到互联网` 选择 `我现在不想连接互联网`，避免安装过程中因为网络、软件源等问题导致卡住；

5. `你想对 Ubuntu 做什么？` 选择 `安装 Ubuntu`；

6. `您想如何安装 Ubuntu？` 选择 `交互式安装`；

7. `您想先安装哪些应用？` 选择 `默认合集`；

8. `安装推荐的专有软件` 不勾选；

9. `您想如何安装 Ubuntu？` 选择 `手动安装`；

10. `手动分区`：
    - 选中之前为 Ubuntu 预留的 `空闲空间`
    - 点击左下角的 `+` 按钮，创建分区
    - 文件系统保持 `Ext4`
    - 在挂载点中选择 `/`，即 Ubuntu 的根目录
    - 确认分区设置无误后，点击 `OK`
    - 如果磁盘压缩分区划出的 Ubuntu 安装位置与 Windows 系统盘在不同磁盘上，参考下一章节说明，有两种方案；

11. `设置您的账户`，填写：
    - 姓名
    - 计算机名称
    - Ubuntu 用户名
    - 登录密码
    - 确认密码

12. `选择您的时区` 选择自己所在的地区和时区；

13. 进入安装设置确认页面，确认无误后，点击 `安装`；

14. 接下来等待 Ubuntu 26.04 完成文件复制和系统安装；

15. 界面提示 `安装完成` 后，点击 `立即重启`；

16. 如果重启过程中提示拔出安装介质，拔掉 Ubuntu 安装 U 盘，按 `Enter` 继续重启；

17. 重启后进入 GRUB 双系统启动菜单；
    - 如果要进入 Ubuntu 就选择第一个 Ubuntu 启动项
    - 如果要进入 Windows 就选择菜单中的 `Windows Boot Manager`

成功进入对应系统后，Ubuntu 26.04 + Windows 11 双系统安装完成！

---

## 9. 手动分区与双硬盘布局

如果使用手动分区，且 Ubuntu 分配空间不在 Windows 系统硬盘/分区，可先确认目标磁盘。
例如，`Disk 0` 为包含 EFI、Windows 和 Recovery 分区的 Windows SSD，`Disk 1` 为包含原数据分区和 `200GB 未分配空间` 的数据/Ubuntu SSD。

此时将 Ubuntu 安装在非 Windows 系统硬盘/分区时有两种方案。方案 A 完全可用；方案 B 更推荐，因为 Windows 与 Ubuntu 启动链独立，任意一块硬盘拆除时另一系统仍更容易独立启动，重装 Windows 也不容易影响 Ubuntu 引导。

- 方案 A：共用 Windows EFI
  - `手动分区界面` 中，`用于安装引导程序的设备` **选择 Windows EFI 所在磁盘**，再点击左下角的 `+` 按钮，创建分区完成后，引导程序会自动挂载 `/boot/efi` 到 Windows EFI 分区。
- 方案 B：Ubuntu 独立 EFI【双硬盘更推荐】
  - `手动分区界面` 中，`用于安装引导程序的设备` **不用修改，保持默认**，当点击左下角的 `+` 按钮，创建分区完成后，会自动在 Ubuntu 所在的第二块硬盘上建立 `1 GiB` 的 `FAT32` EFI System Partition，挂载到 `/boot/efi`；其余 Ubuntu 空间设为 `ext4`，挂载到 `/`。

此外，普通桌面系统没有必要专门建立 swap 分区，可以使用 swapfile。

安装前必须再次检查：不要格式化 Windows NTFS、Windows EFI、Microsoft Reserved、Recovery 或 OEM 分区。

---

## 10. Ubuntu 账户、sudo 与 root

安装器要求填写的用户名和密码创建的是日常登录账户。Ubuntu 不设置一个供日常登录的独立“管理员账户”：`root` 账户仍然存在，但默认没有可用于直接登录的密码；安装时创建的账户通常属于 `sudo` 组，可在需要时临时取得管理员权限。([Ubuntu][3])

| 账户 | 日常用途 | 管理系统的方式 |
| --- | --- | --- |
| 安装时创建的普通账户 | 登录桌面、保存文件、日常开发 | 通过 `sudo` 临时执行管理员命令 |
| `root` | 系统的最高权限账户 | 默认锁定直接登录；仅在必要时由 `sudo` 临时进入 |

可用以下命令确认当前账户是否具有管理员权限：

```bash
groups
```

输出中包含 `sudo` 表示该账户可以使用 `sudo`。

### 如何使用 sudo

对单条需要管理员权限的命令，在前面加 `sudo`：

```bash
sudo apt update
```

首次执行时输入的是**当前登录账户的密码**，不是 root 密码；终端不会显示密码字符，这是正常现象。`sudo` 只提升这一条命令的权限，因此应优先使用这种方式，并在执行前确认命令内容。([Ubuntu][4])

如果确实需要连续执行多条系统管理命令，可以临时进入 root shell：

```bash
sudo -i
# 在这里执行必要的管理员命令
exit
```

完成后立即执行 `exit` 回到普通账户；不要把 root shell 当作日常终端。

### root 密码：默认不设置，也不建议设置

普通账户改自己的密码使用：

```bash
passwd
```

只有存在明确的离线维护、兼容旧流程等需求时，才考虑为 root 设置密码：

```bash
sudo passwd root
```

之后可用 `su -` 并输入 root 密码直接进入 root shell。对普通桌面电脑不推荐这样做：它新增了一套需要保护的最高权限密码，也失去了使用个人账户和 `sudo` 记录管理员操作的优势。若已不需要 root 密码，可重新锁定它：

```bash
sudo passwd -l root
```

这种设计遵循最小权限原则：日常操作保持普通权限，只有明确的管理动作才短暂提升；每个人使用自己的账户和密码，便于审计与撤销授权，而不是共享 root 密码。([Ubuntu][3])

---

## 11. 安装后检查

重启后，GRUB 应能看到 `Ubuntu` 和 `Windows Boot Manager`。

先分别启动一次 Ubuntu 和 Windows。

Ubuntu 中进行更新并检查，执行 `apt update` 或者 `apt upgrade` ，建议设置镜像，参考 [配置-ubuntu-镜像](./linux.md#配置-ubuntu-镜像)：

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y
sudo reboot

# 检查 Ubuntu 是否以 UEFI 模式启动
# 正常应输出：UEFI
test -d /sys/firmware/efi && echo UEFI

# 查看所有磁盘、分区、文件系统和挂载点
# 重点确认：
# 1. Ubuntu 根分区 `/` 对应 ext4
# 2. EFI 分区 `/boot/efi` 对应 vfat/FAT32
lsblk -f

# 检查 Ubuntu 根分区
# 正常应看到：
# TARGET = /
# FSTYPE = ext4
# SOURCE = 实际安装 Ubuntu 的分区，例如 /dev/nvme1n1p2
findmnt /

# 检查 EFI System Partition
# 正常应看到：
# TARGET = /boot/efi
# FSTYPE = vfat
# SOURCE = EFI 分区，例如 /dev/nvme0n1p1 或 /dev/nvme1n1p1
findmnt /boot/efi
```

---

## 12. NVIDIA 驱动：Canonical 预编译模块【推荐】

> 如果没有 NVIDIA 显卡的电脑，可以跳过此步骤。

Canonical 预编译模块是 Ubuntu 26.04 标准内核的首选方案。

其路径是 NVIDIA 提供驱动代码，Canonical 针对 Ubuntu 内核预编译并签名，再通过 Ubuntu 官方仓库分发，因此 Secure Boot 可以直接验证。

该方案不需要本机编译，内核升级失败概率较低，也不需要自行管理 MOK；它与 Secure Boot 的配合最好，适合普通 Desktop、CUDA、AI 和 Docker 使用场景。

Ubuntu 官方建议普通用户使用 `ubuntu-drivers` 或“附加驱动”管理驱动；默认只会安装已知可与 Secure Boot 配合的预编译、已签名模块。([Ubuntu][1])

### 安装

先更新：

```bash
sudo apt update
sudo apt upgrade
sudo reboot
```

确认系统识别到 NVIDIA 显卡：

```bash
lspci | grep -E 'VGA|3D|Display'
```

`ubuntu-drivers` 通常已随 Ubuntu Desktop 安装。若提示找不到该命令，再安装其提供包：

```bash
sudo apt install ubuntu-drivers-common
```

查看可用驱动：

```bash
sudo ubuntu-drivers list
```

自动安装推荐驱动（默认第一个就是推荐去驱动）：

```bash
sudo ubuntu-drivers install
sudo reboot
```

若因兼容性要求必须指定分支，用以下命令代替上一条自动安装命令；不要同时执行两者：

```bash
sudo ubuntu-drivers install nvidia:<版本>
sudo reboot
```

不要添加 `--include-dkms`；它会改为选择 DKMS 方案，相关限制见文末附录。

### 验证

```bash
# NVIDIA 驱动
nvidia-smi

# 当前模块文件
modinfo -n nvidia

# 模块签名者
modinfo -F signer nvidia
```

理想情况下，模块路径类似 `/lib/modules/<kernel>/kernel/nvidia-<版本>/nvidia.ko`，签名者为 `Canonical Ltd. Kernel Module Signing`；模块路径不应位于 `/updates/dkms/nvidia.ko`。

### 混合显卡模式（可选）

本节只适用于带 **Intel 核显 + NVIDIA 独显** 的混合显卡笔记本，且驱动已经按上文安装完成。它与预编译模块或 DKMS 的选择无关；普通台式机、仅有 NVIDIA 显卡的电脑，以及 AMD 核显 + NVIDIA 独显的组合不要使用这些命令。

查看当前模式：

```bash
prime-select query
```

选择一种模式后重启，不要连续执行多种模式命令：

```bash
# 独显模式：性能优先
sudo prime-select nvidia
sudo reboot
```

```bash
# 核显模式：省电优先
sudo prime-select intel
sudo reboot
```

```bash
# 按需混合模式：需要 NVIDIA 时再调用独显
sudo prime-select on-demand
sudo reboot
```

支持 PRIME 的 Ubuntu 系统也可在 GNOME 中对单个应用选择“使用独立显卡启动”。([Ubuntu][5])

---

## 附录：仅在需要时使用 DKMS

DKMS 会在本机为正在运行的内核编译 NVIDIA 模块。只有使用自定义内核、特殊内核 flavour，或官方仓库暂时没有当前内核的预编译模块时才选择它。普通 Ubuntu Desktop、CUDA、PyTorch、Docker 和科学计算场景均应继续使用正文方案；不要安装 NVIDIA 官网 `.run` 包。([Ubuntu][2])

在 Secure Boot 启用时，DKMS 模块不由 Canonical 密钥签名，需要创建并在启动时注册自己的 MOK；未完成注册时模块无法加载。安装过程若要求设置 MOK 密码，重启后在 MokManager 依次选择 `Enroll MOK`、`Continue`、`Yes`，输入该密码后再重启。若启动至 MokManager 时键盘无响应，这是内核启动前的固件界面问题，蓝牙键盘、SSH 与桌面键盘设置都无效。标准内核已有预编译模块时，应改回正文方案，而不是反复尝试 MOK。

需要 DKMS 时，可由 `ubuntu-drivers` 自动选择分支：

```bash
sudo apt install linux-headers-$(uname -r)
sudo ubuntu-drivers install --include-dkms
```

若需要固定驱动分支，必须同时安装对应的 DKMS 内核模块和用户态驱动；不要只执行 `sudo apt install nvidia-driver-<版本>`：

```bash
sudo apt install linux-headers-$(uname -r)
sudo apt install nvidia-dkms-<版本>
sudo apt install nvidia-driver-<版本>
sudo reboot
```

用以下命令确认当前实际加载的模块：

```bash
modinfo -n nvidia
modinfo -F signer nvidia
```

`/updates/dkms/nvidia.ko*` 或本机 MOK 签名表示正在使用 DKMS；`/kernel/nvidia-<版本>/nvidia.ko` 与 `Canonical Ltd. Kernel Module Signing` 表示正在使用预编译模块。系统同时安装相关包不代表两个模块同时工作，以上两个命令才是判断依据。

若要从 DKMS 切回预编译模块，先暂时关闭 Secure Boot，确保移除过程中系统可正常启动；再确认 `dpkg -l | grep linux-modules-nvidia` 能找到对应包，随后先模拟、后删除 DKMS 包。重启后按正文“验证”复查并重新开启 Secure Boot。不同驱动分支的包名不同，切勿使用通配删除命令。

```bash
sudo apt -s purge nvidia-dkms-<版本>
sudo apt purge nvidia-dkms-<版本>
sudo depmod -a
sudo update-initramfs -u
sudo reboot
```

两种方案的 CUDA/AI 性能通常无本质差异；主要区别是模块由谁编译和签名，以及内核升级时的维护成本。Canonical 预编译模块由 Canonical 构建与签名，可直接配合 Secure Boot；DKMS 由本机构建，需自行处理 MOK。

---

[1]: https://ubuntu.com/desktop/docs/en/latest/how-to/graphics/install-nvidia-drivers/ "Install NVIDIA drivers - Ubuntu Desktop documentation"
[2]: https://ubuntu.com/desktop/docs/en/26.04/how-to/graphics/nvidia-driver-packages/ "Select NVIDIA driver packages manually - Ubuntu Desktop documentation"
[3]: https://ubuntu.com/server/docs/security-users/ "User management - Ubuntu Server documentation"
[4]: https://ubuntu.com/desktop/docs/en/latest/tutorial/install-ubuntu-desktop/ "Install Ubuntu Desktop - Ubuntu Desktop documentation"
[5]: https://help.ubuntu.com/community/BinaryDriverHowto/Nvidia "NVIDIA drivers - Ubuntu Community Help Wiki"
