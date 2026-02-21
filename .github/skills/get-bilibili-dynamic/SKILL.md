---
name: get-bilibili-dynamic
description: 获取 bilibili (B站) 动态信息并记录到 `src/data/officialInfos.ts` 的最新情报中
---

# 获取 bilibili 动态信息

动态页通常形如 `https://t.bilibili.com/{动态ID}`，URL 可能含查询字符串，忽略 `?` 及其后的参数

## 目标字段

- `title`：短且描述性的标题（人工裁剪或从内容中抽取）
- `url`：动态的原始链接（可附加 `?from=...` 跟踪参数）
- `coverMediaUrl` / `spineMediaUrl`：动态中的图片封面（优先使用原始 `i*.hdslb.com` 域名）
- `coverMediaType` / `spineMediaType`：一般为 `image`

## 提取图片的优先位置

1. 页面 DOM 中可能含有 `bili-album`（相册）节点：查找其下的 `img` 元素，优先读取 `src`、`data-src` 或 `data-origin`
2. 如果找不到 `bili-album`，在正文中查找 `img` 标签，优先匹配域名 `i0.hdslb.com`、`i1.hdslb.com`、`i2.hdslb.com` 等
3. 作为兜底，可查看页面 head 的 meta（`og:image`）或页面内脚本中嵌入的 JSON 数据

注意：动态图片可能用懒加载（`data-src`）或 CDN 缩略后缀; 若希望减少带宽，可把图片 URL 改为 `@518w.webp`（非强制，需确认该后缀在该资源上有效）

## 生成 `title` 的技巧

- 首先读取正文的首句文字或图片说明、发布日期
- 理解核心思想(节日贺图、游戏新版本宣发、还是日常运营发帖、角色介绍或别的什么)
- 保持简短（建议 <= 12 个中文字符或 2-4 个短词），以便在 UI 中显示

示例：2024年12月25日的动态内容节日相关 → `2024圣诞贺图`

## 插入到 `src/data/officialInfos.ts` 的步骤

1. 打开 `src/data/officialInfos.ts`，找到 `getNewsInfos` 函数返回的数组（最新项应放在数组末尾）
2. 检查是否已存在相同 `url` 或 `coverMediaUrl`，若存在则跳过以避免重复
3. 按现有对象格式新增条目：

```ts
{
	title: '短标题',
	url: 'https://t.bilibili.com/12345678?from=moushudyx.github.io%2Fmiyabi-fans%2F',
	coverMediaUrl: 'https://i0.hdslb.com/…jpg',
	coverMediaType: 'image',
	spineMediaUrl: 'https://i0.hdslb.com/…jpg',
	spineMediaType: 'image',
},
```

4. 保存并提交更改；如有疑问可先把构造好的对象发回由人工确认

## 常见问题与建议

- 如果图片是 GIF 或视频缩略图，仍可作为 `image` 处理，但注意文件大小与格式兼容性
- `@518w.webp` 后缀大部分情况下可用, 但仍需建议用户测试
- 当动态含多张图片时，封面可取第一张, 但同时需要询问用户是否有使用其他图片的需求

## 大体流程

1. 请求 `https://t.bilibili.com/{id}` 获取 HTML
2. 解析 DOM：优先 `bili-album` → 正文 `img` → `meta[property="og:image"]`
3. 清洗标题并构建 `OfficialInfo` 对象
4. 将对象输出为 JSON，由人工粘贴到 `src/data/officialInfos.ts`

## 示例

- 页面：`https://t.bilibili.com/1013251942712868902`（示例动态）
- 建议 title：`冬至贺图`（示例）
- 建议封面来源：`img` 标签或 `og:image` 中的 `i*.hdslb.com` 链接
