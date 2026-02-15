import { useRuntimeConfig } from '#imports'

export type MmdMotionConfig = {
  id: string
  name: string
  vmdUrl: string
}

export type MmdPoseConfig = {
  id: string
  name: string
  vpdUrl: string
  isUnicode?: boolean
}

export type MmdSourceInfo = {
  name: string
  url: string
  author?: string
  note?: string
}

export type MmdModelConfig = {
  id: string
  name: string
  subtitle: string
  modelUrl: string
  resourcePath?: string
  interactionMode?: 'character' | 'orbit'
  motions?: MmdMotionConfig[]
  poses?: MmdPoseConfig[]
  source?: MmdSourceInfo
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  modelScale: number
  modelRotation: [number, number, number]
  vmdUrl?: string
  vpdUrl?: string
  enablePhysics?: boolean
}

// const cdnBase = 'https://cdn.jsdelivr.net/gh/yourname/yourrepo@v1/miyabi/'

const createMmdModels = (baseUrl: string): MmdModelConfig[] => [
  {
    id: 'character',
    name: '星见雅',
    subtitle: '雅小姐写真集绝赞发售中',
    modelUrl: `${baseUrl}星见雅.pmx`,
    resourcePath: baseUrl,
    interactionMode: 'character',
    source: {
      name: '模之屋',
      url: 'https://www.aplaybox.com/details/model/UeIhHCMfZfBm',
      note: '仅用于非商业展示，请遵循原作者许可',
    },
    // 动作与姿势配置示例：后续只需填写 name 与 URL 即可
    motions: [],
    poses: [],
    cameraPosition: [0, 12, 38],
    cameraTarget: [0, 12, 0],
    modelScale: 1,
    modelRotation: [0, 0, 0],
    enablePhysics: true,
  },
  {
    id: 'weapon',
    name: '妖刀(材质仍有问题目前无法加载)',
    subtitle: '无尾',
    modelUrl: `${baseUrl}武器.pmx`,
    resourcePath: baseUrl,
    interactionMode: 'orbit',
    source: {
      name: '模之屋',
      url: 'https://www.aplaybox.com/details/model/UeIhHCMfZfBm',
      note: '仅用于非商业展示，请遵循原作者许可',
    },
    motions: [],
    poses: [],
    cameraPosition: [0, 10, 32],
    cameraTarget: [0, 10, 0],
    modelScale: 1,
    modelRotation: [0, 0, 0],
  },
  {
    id: 'ornament',
    name: '幽灵(材质仍有问题目前无法加载)',
    subtitle: '只在空洞中现身的鬼火',
    modelUrl: `${baseUrl}幽灵.pmx`,
    resourcePath: baseUrl,
    interactionMode: 'orbit',
    source: {
      name: '模之屋',
      url: 'https://www.aplaybox.com/details/model/UeIhHCMfZfBm',
      note: '仅用于非商业展示，请遵循原作者许可',
    },
    motions: [],
    poses: [],
    cameraPosition: [0, 10, 30],
    cameraTarget: [0, 10, 0],
    modelScale: 1,
    modelRotation: [0, 0, 0],
  },
]

export const useMmdModels = () => {
  console.log('Loading MMD models with base URL:', useRuntimeConfig().public.baseURL)
  const baseUrl = `${useRuntimeConfig().public.baseURL ?? '/'}model/miyabi/`
  return createMmdModels(baseUrl)
}
