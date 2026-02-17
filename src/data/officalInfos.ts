
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
  /** 封面图 */
  coverMediaUrl: string
  coverMediaType?: 'image' | 'video'
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
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/a28a22b0ec697bb217a039b6a89ddc121636034895.jpg@518w.webp',
    spineMediaType: 'image',
  },
  {
    title: '2024圣诞节贺图',
    url: 'https://t.bilibili.com/1014747866946601015?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/7b088a0117a7a14d662d1263e51d5e231636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/7b088a0117a7a14d662d1263e51d5e231636034895.jpg@518w.webp',
    spineMediaType: 'image',
  },
  {
    title: '2025元旦贺图',
    url: 'https://t.bilibili.com/1017330009854967912?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/e8baed2ebc05ed1b4480a30cbc8a6e9e1636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/e8baed2ebc05ed1b4480a30cbc8a6e9e1636034895.jpg@518w.webp',
    spineMediaType: 'image',
  },
  {
    title: '2025生日贺图',
    url: 'https://t.bilibili.com/1080043494564692081?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    coverMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/b7f840a2dc7adefaf04ce7e3b912faa51636034895.jpg@518w.webp',
    coverMediaType: 'image',
    spineMediaUrl: 'https://i1.hdslb.com/bfs/new_dyn/b7f840a2dc7adefaf04ce7e3b912faa51636034895.jpg@518w.webp',
    spineMediaType: 'image',
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
