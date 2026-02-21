---
name: get-bilibili-video
description: 用户想要获取 B 站视频信息并记录到 `src/data/officialInfos.ts` 的官方链接中
---

# 获取 B 站视频信息并记录到官方链接（Official Links）

视频页通常形如 `https://www.bilibili.com/video/{BV...}`

## 要提取的信息
- `title`：从页面 head 的 meta 标签中读取 `og:title`，对标题做合理截取（保留能表达内容的短句）
- `coverMediaUrl`：从 head 的 `meta[property="og:image"]` 获取视频封面 URL（通常是 i2.hdslb.com / i0.hdslb.com 域名）
- `coverMediaType`：image
- `spineMediaUrl`：可复用同一个封面 URL

示例输出结构（和 `OfficialInfo` 类型一致）：

{
  title: '成为英雄的旅程',
  url: 'https://www.bilibili.com/video/BV1nNqoY4EYg?from=moushudyx.github.io%2Fmiyabi-fans%2F',
  coverMediaUrl: 'https://i2.hdslb.com/bfs/archive/8b1c5a18f156c9ca2ffb44c8137f9104d9e7775b.jpg',
  coverMediaType: 'image',
  spineMediaUrl: 'https://i2.hdslb.com/bfs/archive/8b1c5a18f156c9ca2ffb44c8137f9104d9e7775b.jpg',
  spineMediaType: 'image',
}

（用户提供的示例 `https://www.bilibili.com/video/BV1nNqoY4EYg/` 的正确 title 为 “成为英雄的旅程”，封面为 `https://i2.hdslb.com/bfs/archive/8b1c5a18f156c9ca2ffb44c8137f9104d9e7775b.jpg`，可从页面 head 的 meta 中获取）

## 操作步骤（手工或脚本化）
1. 打开视频页面 `https://www.bilibili.com/video/{BV}`（忽略 URL 后的参数）
2. 读取 HTML head 中的 meta 标签：
  - `meta[property="og:title"]` → 原始标题
  - `meta[property="og:image"]` → 封面 URL
3. 对原始标题做清洗/截取：去除站内分段（如含 `-`、`|` 或频道名的前缀/尾缀），保留最能表达内容的短语; 例如 `《绝区零》星见雅动画短片 | 成为英雄的旅程` → `成为英雄的旅程`
4. 构造 `OfficialInfo` 对象，`url` 可加上 `?from=moushudyx.github.io%2Fmiyabi-fans%2F` 后缀（可选）
5. 打开文件 `src/data/officialInfos.ts`，定位 `getOfficialInfos` 返回数组，检查是否已存在相同 `url` 或相同 `coverMediaUrl`，避免重复
6. 将新的对象以相同格式插入数组中合适位置（按时间顺序，最新放在数组最后）

## 注意事项
- 使用 `og:image` 时直接写原始 URL（不强制改后缀为 `@518w.webp`，因为视频封面服务器可能没有该缩放后缀）
- 插入前务必检查是否已存在相似项，避免重复
- `title` 尽量简短，避免包含站内冗余信息

## 示例（BV1nNqoY4EYg）

- 页面：https://www.bilibili.com/video/BV1nNqoY4EYg/
- 建议记录的 `title`：成为英雄的旅程
- 建议记录的 `coverMediaUrl`：https://i2.hdslb.com/bfs/archive/8b1c5a18f156c9ca2ffb44c8137f9104d9e7775b.jpg

## 当需要自动化脚本时的示例伪代码

1. 发起 GET 请求获取 HTML
2. 解析 head，读取 `og:title` 与 `og:image`
3. 清洗标题并构建 `OfficialInfo` 对象
4. 在 `src/data/officialInfos.ts` 中插入（或输出到控制台，由人工确认后粘贴）
