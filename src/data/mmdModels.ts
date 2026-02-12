import characterModel from '../assets/model/miyabi/星见雅.pmx?url'
import weaponModel from '../assets/model/miyabi/武器.pmx?url'
import ornamentModel from '../assets/model/miyabi/幽灵.pmx?url'
import { splitFileUrl } from '../utils'

console.log('Character Model URL:', characterModel)
console.log('Weapon Model URL:', weaponModel)
console.log('Ornament Model URL:', ornamentModel)

export type MmdModelConfig = {
  id: 'character' | 'weapon' | 'ornament'
  name: string
  subtitle: string
  modelUrl: string
  resourcePath?: string
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  modelScale: number
  modelRotation: [number, number, number]
  vmdUrl?: string
  vpdUrl?: string
  enablePhysics?: boolean
}

// const cdnBase = 'https://cdn.jsdelivr.net/gh/yourname/yourrepo@v1/miyabi/'

export const mmdModels: MmdModelConfig[] = [
  {
    id: 'character',
    name: '星见雅',
    subtitle: '雅小姐写真集绝赞发售中',
    modelUrl: characterModel,
    resourcePath: splitFileUrl(characterModel).baseUrl,
    cameraPosition: [0, 12, 38],
    cameraTarget: [0, 12, 0],
    modelScale: 1,
    modelRotation: [0, 0, 0],
    enablePhysics: true,
  },
  {
    id: 'weapon',
    name: '妖刀',
    subtitle: '无尾',
    modelUrl: weaponModel,
    resourcePath: splitFileUrl(weaponModel).baseUrl,
    cameraPosition: [0, 10, 32],
    cameraTarget: [0, 10, 0],
    modelScale: 1,
    modelRotation: [0, 0, 0],
  },
  {
    id: 'ornament',
    name: '幽灵',
    subtitle: '只在空洞中现身的鬼火',
    modelUrl: ornamentModel,
    resourcePath: splitFileUrl(ornamentModel).baseUrl,
    cameraPosition: [0, 10, 30],
    cameraTarget: [0, 10, 0],
    modelScale: 1,
    modelRotation: [0, 0, 0],
  },
]
