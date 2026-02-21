
import { useRuntimeConfig } from '#imports'

export type OfficialInfo = {
  title: string
  description?: string
  /** 底色, 默认使用 #333 */
  baseColor?: string
  /** 跳转链接 */
  url: string
  /** 侧面图 */
  spineMediaUrl: string
  spineMediaType?: 'image' | 'video'
  /** 侧面图水平偏移百分比, 范围 0-100 */
  spineMediaHorizontalShift?: number
  /** 封面图 */
  coverMediaUrl: string
  coverMediaType?: 'image' | 'video'
  /** 封面图水平偏移百分比, 范围 0-100 */
  coverMediaHorizontalShift?: number
}
/** 最新情报 */
export const getNewsInfos = (baseUrl: string): OfficialInfo[] => [
  {
    title: '2023元旦贺图',
    url: 'https://t.bilibili.com/745696426910023689?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i0.hdslb.com/bfs/new_dyn/a982714a002b2b76ebbb4a68e22a6dad1636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i0.hdslb.com/bfs/new_dyn/a982714a002b2b76ebbb4a68e22a6dad1636034895.jpg@518w.webp',
    spineMediaType: 'image',
  },
  {
    title: '2024冬至贺图',
    url: 'https://t.bilibili.com/1013251942712868902?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/a28a22b0ec697bb217a039b6a89ddc121636034895.jpg@518w.webp',
    coverMediaType: 'image',
    coverMediaHorizontalShift: 19,
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/a28a22b0ec697bb217a039b6a89ddc121636034895.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 19,
  },
  {
    title: '2024 12 24 日常',
    url: 'https://t.bilibili.com/1014365189664931843?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i0.hdslb.com/bfs/new_dyn/7e8ba9eeda21d995226822047fc87c461636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i0.hdslb.com/bfs/new_dyn/7e8ba9eeda21d995226822047fc87c461636034895.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 53,
  },
  {
    title: '2024圣诞节贺图',
    url: 'https://t.bilibili.com/1014747866946601015?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/7b088a0117a7a14d662d1263e51d5e231636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/7b088a0117a7a14d662d1263e51d5e231636034895.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 16,
  },
  {
    title: '2025元旦贺图',
    url: 'https://t.bilibili.com/1017330009854967912?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/e8baed2ebc05ed1b4480a30cbc8a6e9e1636034895.jpg@518w.webp',
    coverMediaType: 'image',
    coverMediaHorizontalShift: 63,
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/e8baed2ebc05ed1b4480a30cbc8a6e9e1636034895.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 63,
  },
  {
    title: '1月月历壁纸',
    url: 'https://t.bilibili.com/1017345467431780357?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i0.hdslb.com/bfs/new_dyn/c449b11313b3532b75633d284ef7a4ba1636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i0.hdslb.com/bfs/new_dyn/c449b11313b3532b75633d284ef7a4ba1636034895.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 59,
  },
  {
    title: '2025生日贺图',
    url: 'https://t.bilibili.com/1080043494564692081?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/b7f840a2dc7adefaf04ce7e3b912faa51636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/b7f840a2dc7adefaf04ce7e3b912faa51636034895.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 28,
  },
]
export const useNewsInfos = () => {
  const baseUrl = `${useRuntimeConfig().public.baseURL ?? '/'}info/`
  return getNewsInfos(baseUrl)
}
/** 官方链接 */
export const getOfficialInfos = (baseUrl: string): OfficialInfo[] => [
  {
    title: '角色介绍',
    url: 'https://zzz.mihoyo.com/character?id=103307',
    coverMediaUrl: 'https://fastcdn.mihoyo.com/content-v2/nap/103307/a0b6a3fedf5b19a224dad6332f5c9404_8946648090616247411.png',
    coverMediaType: 'image',
    spineMediaUrl: 'https://fastcdn.mihoyo.com/content-v2/nap/103307/a0b6a3fedf5b19a224dad6332f5c9404_8946648090616247411.png',
    spineMediaType: 'image',
  },
  {
    title: '成为英雄的旅程',
    url: 'https://www.bilibili.com/video/BV1nNqoY4EYg?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i2.hdslb.com/bfs/archive/8b1c5a18f156c9ca2ffb44c8137f9104d9e7775b.jpg@518w.webp',
    coverMediaType: 'image',
    coverMediaHorizontalShift: 80,
    spineMediaUrl: 'https://i2.hdslb.com/bfs/archive/8b1c5a18f156c9ca2ffb44c8137f9104d9e7775b.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 72,
  },
  {
    title: '虚狩诞生之日',
    url: 'https://www.bilibili.com/video/BV1ftk3YrEhu?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/archive/3e0b1b678d3ae0b0665e8f68829bd8c28c252ed2.jpg@518w.webp',
    coverMediaType: 'image',
    coverMediaHorizontalShift: 62,
    spineMediaUrl: 'https://i1.hdslb.com/bfs/archive/3e0b1b678d3ae0b0665e8f68829bd8c28c252ed2.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 69,
  },
  {
    title: '无尽修行',
    url: 'https://www.bilibili.com/video/BV1kzrfY1EM3?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i2.hdslb.com/bfs/archive/515a134a256e0b87805766423b1761f1299b3807.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i2.hdslb.com/bfs/archive/515a134a256e0b87805766423b1761f1299b3807.jpg@518w.webp',
    spineMediaType: 'image',
  },
  {
    title: '晓',
    url: 'https://www.bilibili.com/video/BV1fGkAYSESP?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i2.hdslb.com/bfs/archive/89a88c1bbdc8a6009245529c9a878ac9aeafbb82.jpg@518w.webp',
    coverMediaType: 'image',
    coverMediaHorizontalShift: 15,
    spineMediaUrl: 'https://i2.hdslb.com/bfs/archive/89a88c1bbdc8a6009245529c9a878ac9aeafbb82.jpg@518w.webp',
    spineMediaType: 'image',
    spineMediaHorizontalShift: 32,
  },
  {
    title: 'GSC 粘土人手办',
    description: '点击跳转天猫官方旗舰店',
    url: 'https://detail.tmall.com/item.htm?id=985869374063&skuId=5953859157656',
    coverMediaUrl: `${baseUrl}GSC 粘土人手办.webp`,
    coverMediaType: 'image',
    spineMediaUrl: `${baseUrl}GSC 粘土人手办.webp`,
    spineMediaType: 'image',
  },
  {
    title: '砺世澄沧 1/7手办',
    description: '点击跳转天猫官方旗舰店',
    url: 'https://detail.tmall.com/item.htm?id=1014973766810&skuId=6186722734494',
    coverMediaUrl: `${baseUrl}砺世澄沧 1-7手办.webp`,
    coverMediaType: 'image',
    spineMediaUrl: `${baseUrl}砺世澄沧 1-7手办-spine.jpg`,
    spineMediaType: 'image',
  },
]
export const useOfficialInfos = () => {
  const baseUrl = `${useRuntimeConfig().public.baseURL ?? '/'}info/`
  return getOfficialInfos(baseUrl)
}
