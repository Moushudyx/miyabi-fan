---
name: get-bilibili-dynamic
description: 用户想要获取一条 bilibili (B站) 动态信息时必须阅读此 skill
---

# 获取 bilibili 动态信息

动态信息的网址一般是这样的结构 `https://t.bilibili.com/{一串数字}?后面可能带有一些参数`

其中忽略 `?` 后面的参数, 直接访问 `https://t.bilibili.com/{一串数字}` 即可

## 获取图片 URL

获取到的网页中, 可能存在 `bili-album` 的元素, 其下的 `img` 中, 寻找 `i0.hdslb.com` 或 `i1.hdslb.com` 或类似域名的 `src`, 这些是 bilibili 动态 的图片 URL

## 记录到首页的 "最新情报" 一栏

打开 src\data\officialInfos.ts 文件, 找到 getNewsInfos 方法, 在列表的合适位置按已有的格式添加信息

记录之前需要检查是否重复

"合适位置" 指需要看时间信息排序, 最新的放在最后面

其中 `title` 最好简短一些

`url` 可以加上一个 `?from=moushudyx.github.io%2Fmiyabi-fans%2F` 的后缀, 虽然这个后缀没什么具体作用

`coverMediaUrl` `spineMediaUrl` 则可以考虑将获取到的图片信息的后缀改为 `@518w.webp` 这样访问到的就是一个压缩为 webp 的小图片, 用户访问时可以加速

如果要记录到 "官方链接" 即 `getOfficialInfos` 同理

## 执行任务的流程

以记录到首页的 "最新情报" 一栏的任务为例

1. 打开网页 `https://t.bilibili.com/{一串数字}` 获取网页信息
2. 读取内容, 对大体内容有个认识, 方便生成 `title`
3. 获取图片 URL, 获取这条动态的发布时间
4. 综合一下当前获取的信息, 因为用户给予的提示词可能是模糊的甚至出错, 所以要复查一遍(类似 review)
5. 如果是需要修改代码的需求: 打开对应的代码文件, 确定位置, 修改内容; 如果不需要修改代码, 则向用户输出内容的大体描述(比如谁在何时发布的、起个合适的 `title`、这个动态整体内容是什么、有几张图等等)
