export const navbarData = {
  homeTitle: 'BarZ Hsieh',
}

export const seoData = {
  description: 'Hello, I\'m BarZ Hsieh. \nWelcome to my personal blog website. I am a software engineer who loves technology, specializing in frontend development with expertise in Nuxt, Vue, TypeScript, and other modern technologies. \nHere you can explore my technical articles and personal projects, and I also share my life through the lens in the Gallery.',
  ogTitle: 'BarZ Hsieh',
  ogHeadline: 'Portfolio | Blogger | Creativity',
  twitterDescription: 'My blog website, where I play around with Nuxt, Vue, and more and showcase my blog, resources, etc',
  mySite: 'https://barz.app/',
  email: 'andy820621@gmail.com',
  twitterSite: '@Barz3064',
  twitterLink: 'https://x.com/Barz3064',
  githubLink: 'https://github.com/andy820621',
  instagramLink: 'https://www.instagram.com/andy820621',
  mailAddress: 'andy820621@gmail.com',
  icon: '/apple-touch-icon/apple-touch-icon.png',
  keywords: {
    en: 'Web Design, Frontend, Developer, Engineer, Graphic Design, Logo, Blogs, technical, Portfolio, Gallery, Demo, Projects',
    zh: '前端開發, 前端工程師, 部落格, 技術, 個人作品集, 照片牆, 專案',
    always: 'Hsieh Yao Tsu, 謝耀祖, BarZ, andy820621, ヒカル, HTML, CSS, Javascript, Typescript, SEO, UI, UX, Nuxt, Nuxt3, Vue3, Tailwind CSS, Uno CSS, Vite, Netlify, Vercel, Github, Codepen, Nuxt Content, Nuxt Image, Nuxt SEO, Nuxt Sitemap, SchemaOrg',
  },
  fbAppId: '428754658904201',
  // fbPagesId: '123456789012345',
  googleSiteVerification: 'Q4b0n0FVQLUp85bYQ7sBxLsxxvm7f5fJ2gwvpO2Ti4I',
}

export const linkConfig = {
  link: { name: 'Demo', icon: 'mdi:link-variant' },
  github: { name: 'GitHub', icon: 'mdi:github' },
  codepen: { name: 'CodePen', icon: 'ri:codepen-fill' },
}

export function getKeywords(locale: string, extraKeywords?: string | string[]): string {
  const lang = locale.startsWith('zh') ? 'zh' : 'en'
  const base = [seoData.keywords[lang], seoData.keywords.always]
  if (extraKeywords) {
    if (Array.isArray(extraKeywords))
      base.push(...extraKeywords)
    else
      base.push(extraKeywords)
  }
  // 將所有關鍵字拆分為陣列，去除空白與重複（不分大小寫）
  const keywordsArr = base
    .filter(Boolean) // 確保陣列中不會有 undefined、null 或空字串
    .join(',')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean) // 確保原始字串都不為空

  // 用 Set 去除重複（不分大小寫）
  const unique = Array.from(
    keywordsArr.reduce((acc, cur) => {
      acc.set(cur.toLowerCase(), cur)
      return acc
    }, new Map<string, string>())
      .values(),
  )
  return unique.join(', ')
}
