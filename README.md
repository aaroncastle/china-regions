## china-regions

> 根据中国国家统计局 **http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021/index.html** 提供数据抓取。

数据包含中国31 个省直辖市、市、区（不包含港澳台地区）

得到的**数据在 src/regions 文件夹中，自取即可**

> 数据已做调整处理，将省直辖市作为一般地级市保存（<font color=orange>河南省</font>的济源市，<font color=orange>湖北省</font>的仙桃市、潜江市、天门市、神农架林区，<font color=orange>海南省</font>的五指山市、琼海市、文昌市、万宁市、东方市、定安县、屯昌县、澄迈县、临高县、白沙黎族自治县、昌江黎族自治县、乐东黎族自治县、陵水黎族自治县、保亭黎族苗族自治县、琼中黎族苗族自治县），将县级市作为县区保存（<font color=orange>河南省</font><font color=red>郑州市</font>的巩义市、荥阳市、新密市、新郑市、登封市，其他省份以此类同，不再一一详举）

*****

如需要使用项目亲自爬取，在使用前确保已经安装 nodejs。

## 安装node（已安装可忽略）

1. windows 可通过官网地址 **https://nodejs.org/en/download/** 下载安装

2. Mac 可通过`homebrew`安装`node`
   ```shell
   brew install node
   ```

3. Centos7 安装 node

   - 通过 yum 安装
     ```shell
     curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
     yum install -y nodejs
     node -v
     curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo | sudo yum install yarn -y
     ```

## 克隆项目

克隆项目之前须选安装 git。
Mac 安装 git

```shell
brew install git
```

Centos7 安装 git
```shell
yum install git -y
```

Windows 安装 git 地址 **https://git-scm.com/downloads**

1. 克隆本仓库
   ```shell
   git clone https://github.com/aaroncastle/china-regions.git
   ```

2. 进入项目目录
   ```shell
   cd china-regions
   ```

3. 安装依赖库
   ```shell
   # 用 yarn 或 npm 安装，以下方法任选其一
   yarn  #用 yarn 安装
   npm install # 用 npm 安装
   ```

4. 可通过 config.ts 文件修改伪装的操作系统平台与浏览器
   操作系统 `platform`的可选项有：`Mac`和`Windows`(默认)
   浏览器`browser`的可选项有：`Chrome`、`Safari`(默认)、`FireFox`、`Edge`

   > 当浏览器选 `Safari` 时，操作系统配置为 `Windows` 将无效，操作系统会强制修改为 `Mac`

5. 运行项目（完成后会有`所有数据爬取完成，数据保存在 regions 文件夹中`提示，可按`ctrl`或`⌘`+ `c`退出进程或用第 6 条，使用 Node直接运行，完成后自动退出）

   ```shell
   # 以下方法任选其一
   yarn dev
   npm run dev
   ```

6. 将本`ts`项目编译成 `js` 项目并运行
   ```shell
   yarn build # 或用 npm (npm run build)
   node src/main.js
   ```

   
