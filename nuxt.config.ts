const baseURL = process.env.NUXT_APP_BASE_URL || '/miyabi-fan/'

export default defineNuxtConfig({
  srcDir: 'src/',
  app: {
    baseURL,
    head: {
      title: '星见雅 Fan Site',
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: `${baseURL}favicon.svg`,
        },
        {
          rel: 'alternate icon',
          href: `${baseURL}favicon.ico`,
        },
      ],
      meta: [
        {
          name: 'description',
          content: '星见雅角色同人站，收录视觉展示、3D 鉴赏与相关资讯。',
        },
        {
          property: 'og:title',
          content: '星见雅 Fan Site',
        },
        {
          property: 'og:description',
          content: '星见雅角色同人站，收录视觉展示、3D 鉴赏与相关资讯。',
        },
        {
          property: 'og:type',
          content: 'website',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      baseURL,
    },
  },
  css: ['~/style.scss'],
  nitro: {
    preset: 'github-pages',
    publicAssets: [
      {
        baseURL,
        dir: 'public',
      },
    ],
  },
})
