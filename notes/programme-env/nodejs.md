# nodejs 指南

Node.js 是 JavaScript 运行时，也是 `npm` 生态和大量前端/CLI 工具的基础。这篇文档先整理 Node.js 安装，再补环境变量配置，最后说明 `npm` 镜像设置。

## 安装 nodejs

### Windows/Mac 用户下载安装包并安装

nodejs 下载地址：

<https://nodejs.org/en/download>

示意图：

![Git-Nodejs-Download-Nodejs](assets/screenshot/Git-Nodejs-Download-Nodejs.png)

下载时注意系统是 Windows 还是 Mac，选择对应的版本。

安装时选择默认选项即可。

### Linux/WSL 安装 nodejs

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm
```

### 配置 nodejs 包管理路径

由于 Mac/Linux/WSL 默认安装路径为 `/usr/local/bin`，而 npm 安装的全局包默认路径为 `/usr/local/lib/node_modules`，但由于权限问题，全局包无法直接使用，因此需要配置 npm 全局包路径。

```bash
# 创建全局包路径
mkdir ~/.npm-global
# 配置 npm 全局包路径
npm config set prefix '~/.npm-global'

# Linux/WSL 配置环境变量
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Mac 配置环境变量
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 查看生效
echo $PATH
```

## 检查安装

打开命令行，输入以下命令：

```bash
# 检查 Node.js 版本
node -v
npm -v
npx -v
```

如果显示版本号，说明安装成功。
如果显示 `command not found`，说明环境变量没有配置正确。

配置环境变量：

```bash
# Windows 添加到用户变量
setx PATH "%PATH%;C:\Program Files\nodejs"
# Mac 添加到环境变量
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
# Linux/WSL
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 配置镜像

```bash
# npm：用命令设置 npm registry
npm config set registry https://registry.npmmirror.com

# npm：查询当前 registry
npm config get registry

# Windows npm配置文件位于：C:\Users\用户名\.npmrc，用 type 打印检查
type "%USERPROFILE%\.npmrc"
# Mac/Linux/WSL 用 cat 打印检查 npm 配置文件
cat ~/.npmrc
```
