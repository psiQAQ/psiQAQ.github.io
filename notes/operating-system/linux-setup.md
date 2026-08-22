# Windows 10/11 + Ubuntu 26.04 LTS 双系统安装指南

本文适用于在已有 Windows 10/11 的 x86-64 电脑上安装 Ubuntu 26.04 LTS，目标是：

```text
Windows 保留
+ Ubuntu 独立分区
+ UEFI/GRUB 双系统启动
+ NVIDIA 驱动正常
```

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

# 查看 BitLocker
manage-bde -status

# 查看休眠状态
powercfg /a
```

按 `Win + R`：

```text
msinfo32
```

确认：

```text
系统类型：x64-based PC
BIOS 模式：UEFI
```

建议条件：

| 项目 | 推荐 |
| ------------- | -------------------- |
| CPU | Intel / AMD x86-64 |
| 启动模式 | UEFI |
| 系统盘 | GPT |
| Ubuntu 空间 | ≥80GB，开发建议 150–300GB |
| U盘 | ≥8GB，推荐 16GB |
| BitLocker恢复密钥 | 已备份 |

> 这里修改成直接关闭 BitLocker恢复密钥，因为安装过程中会解密磁盘，如果恢复密钥丢失将无法恢复。

如果 Windows 是：

```text
Legacy + MBR
```

不要直接切换 BIOS 到 UEFI，应先单独完成 MBR→GPT 转换并确认 Windows 可以 UEFI 启动。

---

## 2. 备份

至少备份：

```text
重要文件
SSH Key
代码
BitLocker 48位恢复密钥
磁盘管理界面截图
```

双系统安装涉及 EFI、分区表和启动链，BitLocker 恢复密钥尤其重要。

---

## 3. 下载 Ubuntu 26.04

> 给出官方地址，同时也给出华为云地址，华为云下载速度快。

Ubuntu各个版本的安装镜像文件可以从华为云下载：

<http://repo.huaweicloud.com/ubuntu-releases/>

Ubuntu桌面版的安装镜像文件名为：ubuntu-<版本号>-desktop-amd64.iso

普通 Intel/AMD 电脑下载：

```text
ubuntu-26.04-desktop-amd64.iso
```

`amd64` 同时适用于 Intel 和 AMD 64 位 CPU。

下载后校验 SHA-256：

```powershell
# 具体改成下载地址
Get-FileHash `
  "$env:USERPROFILE\Downloads\ubuntu-26.04-desktop-amd64.iso" `
  -Algorithm SHA256
```

与 `SHA256SUMS` 完全一致后再制作 U 盘。

---

## 4. Rufus 制作安装盘

推荐参数：

```text
设备：安装 U 盘
引导选择：Ubuntu ISO
分区类型：GPT
目标系统：UEFI（非 CSM）
文件系统：保持 Rufus 自动选择
写入方式：ISO Image mode
```

注意：

```text
不要强制指定 FAT32
不要选择 Legacy/CSM
制作过程会清空 U 盘
```

---

## 5. Windows 中准备 Ubuntu 空间

### 5.1 BitLocker

先备份恢复密钥，再检查：

```cmd
manage-bde -status
```

如果 Ubuntu 要使用的 Windows 磁盘/分区启用了 BitLocker，建议先完整解密：

```cmd
manage-bde -off C:
```

等待：

```text
Percentage Encrypted: 0.0%
Fully Decrypted
```

不要使用来源不明的第三方“BitLocker关闭工具”。

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

运行：

```text
diskmgmt.msc
```

选择空间充足的 NTFS 分区：

```text
右键
→ 压缩卷
→ 输入 Ubuntu 空间
```

例如：

```text
200GB = 204800MB
```

得到：

```text
200GB 未分配空间
```

这里：

```text
不要格式化
不要新建 NTFS 卷
不要分配盘符
```

---

## 6. 双硬盘时的推荐结构

例如：

```text
Disk 0：Windows SSD
├── EFI
├── Windows
└── Recovery

Disk 1：数据/Ubuntu SSD
├── 原数据分区
└── 200GB 未分配
```

有两种方案。

### 方案 A：共用 Windows EFI

```text
Disk 0 EFI  → /boot/efi
Disk 1 ext4 → /
```

完全可用。

### 方案 B：Ubuntu 独立 EFI【双硬盘更推荐】

```text
Disk 0
├── Windows EFI
└── Windows

Disk 1
├── 1GiB FAT32 ESP → /boot/efi
└── 约199GiB ext4 → /
```

优点：

```text
Windows 与 Ubuntu 启动链独立
任意一块硬盘拆除时另一系统仍更容易独立启动
重装 Windows 不容易影响 Ubuntu 引导
```

---

## 7. 从 U 盘启动

重启后进入 Boot Menu，常见：

```text
F12
F2
Esc
F10
```

具体可参见

![开机热键启动汇总](./assets/linux-setup/开机热键启动汇总.png)

必须选择：

```text
UEFI: <U盘名称>
```

而不是 Legacy USB。

先进入：

```text
Try Ubuntu
```

检查：

```text
屏幕
键盘
Wi-Fi
触控板
声音
SSD/NVMe
```

如果 NVIDIA 电脑 Live 环境黑屏，可尝试：

```text
Ubuntu (safe graphics)
```

---

## 8. 如果 Ubuntu 看不到 SSD

如果出现：

```text
Intel RST
VMD
RAID
SSD 不可见
```

不要继续安装。

不要直接：

```text
RAID → AHCI
```

否则 Windows 可能出现：

```text
INACCESSIBLE_BOOT_DEVICE
```

应先让 Windows 准备 AHCI 驱动，再在 BIOS 中关闭 RST/VMD。

这一问题与普通分区问题不同，应单独解决后再安装 Ubuntu。

---

## 9. 安装 Ubuntu

推荐：

```text
Install Ubuntu
→ Interactive installation
→ Default selection
```

网络稳定时可以联网安装。

安装类型优先：

```text
Install Ubuntu alongside Windows Boot Manager
```

绝对不要误选：

```text
Erase disk and install Ubuntu
```

---

## 10. 手动分区

如果使用手动分区，可以选择两种方案，对于多硬盘且分区在非系统盘时，共用 EFI 便于后期扩容，独立 EFI 更利于双系统独立启动，硬盘单独拆除时另一系统仍更容易独立启动。

### 共用 EFI

现有 Windows EFI：

```text
FAT32
挂载：/boot/efi
格式化：否
```

Ubuntu 空间：

```text
ext4
挂载：/
格式化：是
```

### 独立 EFI

Ubuntu 所在第二块硬盘：

```text
1 GiB
FAT32
EFI System Partition
挂载：/boot/efi
```

剩余：

```text
ext4
挂载：/
```

普通桌面系统没有必要专门建立 swap 分区，可以使用 swapfile。

### 安装前必须再次检查

不能格式化：

```text
Windows NTFS
Windows EFI
Microsoft Reserved
Recovery
OEM
```

---

## 11. 安装后检查

重启后 GRUB 应能看到：

```text
Ubuntu
Windows Boot Manager
```

先分别启动一次 Ubuntu 和 Windows。

Ubuntu 中：

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y
sudo reboot
```

检查 UEFI：

```bash
test -d /sys/firmware/efi && echo UEFI
```

检查分区：

```bash
lsblk -f
findmnt /
findmnt /boot/efi
```

---

## 12. NVIDIA 驱动方案一：Canonical 预编译模块【推荐】

如果没有 NVIDIA 电脑，可以跳过此步骤。

这是 Ubuntu 26.04 标准内核的首选方案。

其结构是：

```text
NVIDIA 提供驱动代码
        ↓
Canonical 针对 Ubuntu 内核预编译
        ↓
Canonical 签名
        ↓
Ubuntu 官方仓库
        ↓
Secure Boot 可直接验证
```

优点：

```text
不需要本机编译
内核升级失败概率低
不需要自行管理 MOK
与 Secure Boot 配合最好
适合普通 Desktop / CUDA / AI / Docker
```

Ubuntu 官方建议普通用户使用 `ubuntu-drivers`，默认选择预编译、已签名的模块。([Ubuntu][2])

### 安装

先更新：

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

查看可用驱动：

```bash
sudo ubuntu-drivers list
```

自动安装推荐驱动：

```bash
sudo ubuntu-drivers install
sudo reboot
```

不要加：

```text
--include-dkms
```

除非明确需要 DKMS。

### 验证

```bash
# NVIDIA 驱动
nvidia-smi

# 当前模块文件
modinfo -n nvidia

# 模块签名者
modinfo -F signer nvidia
```

理想状态类似：

```text
/lib/modules/<kernel>/kernel/nvidia-595-open/nvidia.ko

Canonical Ltd. Kernel Module Signing
```

而不是：

```text
/updates/dkms/nvidia.ko
```

再检查：

```bash
mokutil --sb-state
```

如果已经确认：

```text
Canonical signed module
+
nvidia-smi 正常
```

可以在 BIOS 中保持或重新开启：

```text
Secure Boot = Enabled
```

重新进入 Ubuntu 后再次验证：

```bash
mokutil --sb-state
nvidia-smi
```

---

## 13. NVIDIA 驱动方案二：DKMS

DKMS：

```text
Dynamic Kernel Module Support
```

工作方式是：

```text
NVIDIA kernel source
        ↓
你的电脑
        ↓
针对当前 Linux kernel 本地编译
        ↓
nvidia.ko
```

适合：

```text
自定义 kernel
mainline kernel
特殊 kernel flavour
Canonical 尚未提供对应预编译模块
```

普通 Ubuntu Desktop **不推荐优先使用**。Ubuntu 官方明确指出，DKMS 模块并非使用 Canonical key 签名，因此 Secure Boot 下需要额外处理自己的签名密钥/MOK。([Ubuntu][1])

### 安装内核

```bash
# 安装当前内核 headers
sudo apt install linux-headers-$(uname -r)

# 让 ubuntu-drivers 明确允许使用 DKMS
sudo ubuntu-drivers install --include-dkms
```

也可以手动安装指定分支：

```bash
sudo apt install nvidia-dkms-<版本>
```

例如：

```text
nvidia-dkms-595-open
```

### Secure Boot 下的问题

DKMS 模块通常类似：

```text
/lib/modules/<kernel>/updates/dkms/nvidia.ko.zst
```

签名者可能是：

```text
<电脑名称> Secure Boot Module Signature key
```

这意味着：

```text
本机生成 MOK key
        ↓
签名 DKMS module
        ↓
重启
        ↓
MokManager
        ↓
Enroll MOK
```

启动时可能出现：

```text
Press any key to perform MOK management
```

然后：

```text
Enroll MOK
→ Continue
→ Yes
→ 输入安装时设置的 MOK 密码
→ Reboot
```

如果不完成 MOK 注册，在 Secure Boot 开启时 DKMS NVIDIA 模块可能无法加载。

---

## 14. 实际踩坑：MOK 界面键盘完全失效

实际可能遇到：

```text
安装 nvidia-driver / DKMS
        ↓
重启
        ↓
Press any key to perform MOK management
        ↓
笔记本内置键盘无响应
        ↓
有线 USB 键盘也无响应
        ↓
倒计时结束自动跳过
```

此时不是 Ubuntu 桌面键盘驱动的问题：

```text
MokManager 位于 Linux 内核启动之前
```

因此：

```text
蓝牙键盘
SSH
屏幕键盘
Ubuntu 键盘设置
```

都不能解决。

如果标准 Ubuntu 内核已经有 Canonical 预编译模块，最合理的方法不是继续折腾 MOK，而是切换回预编译模块。

---

## 15. 如何判断自己是否误用了 DKMS

```bash
modinfo -n nvidia
```

如果看到：

```text
.../updates/dkms/nvidia.ko.zst
```

说明当前使用 DKMS。

检查签名：

```bash
modinfo -F signer nvidia
```

如果类似：

```text
<hostname> Secure Boot Module Signature key
```

也是本机 DKMS/MOK 签名。

检查预编译包：

```bash
dpkg -l |
grep -E 'nvidia-driver|nvidia-dkms|linux-modules-nvidia'
```

例如系统可能同时存在：

```text
linux-modules-nvidia-595-open-7.0.0-30-generic
linux-modules-nvidia-595-open-generic-hwe-26.04
nvidia-dkms-595-open
nvidia-driver-595-open
```

注意：

```text
包同时安装
≠
两个模块同时工作
```

真正加载哪一个由：

```bash
modinfo -n nvidia
```

判断。

---

## 16. 从 DKMS 切回预编译模块

先关闭 Secure Boot，保证当前系统可以正常启动。

确认预编译模块存在：

```bash
dpkg -l | grep linux-modules-nvidia
```

先模拟删除 DKMS：

```bash
sudo apt -s purge nvidia-dkms-<版本>
```

确认不会误删必要驱动后再执行：

```bash
sudo apt purge nvidia-dkms-<版本>
```

然后重建模块依赖和 initramfs：

```bash
sudo depmod -a
sudo update-initramfs -u
sudo reboot
```

如果：

```bash
reboot
```

提示：

```text
Operation inhibited by gnome-session
```

说明当前图形用户还有活动会话。

保存所有工作后可以：

```bash
sudo systemctl reboot -i
```

---

## 17. 切换成功的验收标准

重启：

```bash
uname -r
modinfo -n nvidia
modinfo -F signer nvidia
nvidia-smi
```

实际成功状态示例：

```text
7.0.0-30-generic

/lib/modules/7.0.0-30-generic/kernel/nvidia-595-open/nvidia.ko

Canonical Ltd. Kernel Module Signing

NVIDIA-SMI 595.84
Driver Version: 595.84
CUDA Version: 13.2
```

这说明已经实现：

```text
Ubuntu 官方内核
        +
Canonical 预编译 NVIDIA open kernel module
        +
Canonical 签名
        +
NVIDIA 用户态驱动
```

此时可以重新进入 BIOS：

```text
Secure Boot = Enabled
```

再次进入 Ubuntu：

```bash
mokutil --sb-state
nvidia-smi
```

预期：

```text
SecureBoot enabled
nvidia-smi 正常
```

不再需要 MOK。

---

## 18. NVIDIA 两种方案对比

| 项目 | Canonical 预编译 | DKMS |
| ------------ | ------------- | -------- |
| 编译位置 | Canonical | 本机 |
| 标准 Ubuntu 内核 | **推荐** | 一般不需要 |
| 自定义内核 | 可能没有模块 | **适合** |
| 内核升级 | 下载对应模块 | 本机重新编译 |
| 编译失败风险 | 低 | 较高 |
| Canonical 签名 | **有** | 无 |
| Secure Boot | **直接支持** | 通常需要 MOK |
| MOK 操作 | 通常无需 | 经常需要 |
| CUDA/AI性能 | 基本相同 | 基本相同 |

两者区别主要是：

```text
模块如何产生
+
如何签名
+
如何跟随 kernel 更新
```

而不是 CUDA 或 GPU 本身性能。

---

## 19. 最终推荐配置

普通 Ubuntu 26.04 开发电脑：

```text
UEFI + GPT

Windows
+
Ubuntu ext4

Ubuntu 官方 HWE kernel

NVIDIA：
ubuntu-drivers install
        ↓
Canonical pre-built module
        ↓
Canonical signed
        ↓
Secure Boot Enabled
```

如果主要用途是：

```text
Python
CUDA
PyTorch
Docker
AI
科学计算
```

通常也没有必要使用：

```text
DKMS
NVIDIA 官网 .run 安装包
独显直连
```

标准 Ubuntu 官方仓库提供的驱动栈通常是维护成本最低的方案。

---

[1]: https://ubuntu.com/desktop/docs/en/26.04/how-to/graphics/nvidia-driver-packages/?utm_source=chatgpt.com "Select NVIDIA driver packages manually - Ubuntu Desktop documentation"
[2]: https://ubuntu.com/desktop/docs/en/latest/how-to/graphics/install-nvidia-drivers/?utm_source=chatgpt.com "Install NVIDIA drivers - Ubuntu Desktop documentation"
