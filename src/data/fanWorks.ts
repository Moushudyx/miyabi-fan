import { useRuntimeConfig } from '#imports'

export type FanWork = {
  /** 作品标题 */
  title: string
  /** 作者 */
  author: string
  /** 缩略图 */
  thumbUrl?: string
  /** 占位颜色 #57ab69, #57ab7e, #57ab93, #57aba8, #5799ab, #5784ab, #576fab */
  thumbColor?: string
  /** 媒体链接 */
  mediaUrl: string
  /** 移动端媒体链接, 如果没有则使用 mediaUrl */
  mediaUrlMobile?: string
  /** 作品链接 */
  url?: string
  /** 额外链接 */
  extraLinks?: { label: string; url: string }[]
  /** mediaUrl 的类型 */
  type: 'image' | 'video'
}

const getFanWorks = (baseUrl: string): FanWork[] => [
  {
    title: '作品 A',
    author: '某位同人画师',
    thumbColor: '#57ab69',
    mediaUrl: `${baseUrl}作品A.jpg`,
    type: 'image',
  },
  {
    title: '【自制动画】《星见雅》 | 真的爆炸帅！！！',
    author: '旋风博文',
    thumbColor: '#57ab7e',
    mediaUrl: `${baseUrl}【自制动画】《星见雅》.png`,
    type: 'image',
    url: 'https://www.bilibili.com/video/BV1gkkFYYE3D/?from=moushudyx.github.io%2Fmiyabi-fans%2F',
  },
  {
    title: '耳朵有什么问题吗？',
    author: '邦布帮',
    thumbColor: '#57ab93',
    mediaUrl: `${baseUrl}耳朵有什么问题吗？.png`,
    mediaUrlMobile: `${baseUrl}耳朵有什么问题吗？-小屏.png`,
    type: 'image',
    url: 'https://www.bilibili.com/video/BV145kiYtEWw/?from=moushudyx.github.io%2Fmiyabi-fans%2F',
    extraLinks: [
      { label: '原图', url: 'https://www.bilibili.com/opus/1015196267987337224?from=moushudyx.github.io%2Fmiyabi-fans%2F' },
    ],
  },
]

export const useFanWorks = () => {
  const baseUrl = `${useRuntimeConfig().public.baseURL ?? '/'}works/`
  return getFanWorks(baseUrl)
}
