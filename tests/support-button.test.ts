import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(path: string) {
  return readFileSync(`${projectRoot}/${path}`, 'utf8')
}

describe('support button', () => {
  const contentCases = [
    ['content/en/projects/nuxt-content-mermaid.md', 'Sponsor on Ko-fi'],
    ['content/zh/projects/nuxt-content-mermaid.md', '在 Ko-fi 支持我'],
  ] as const

  it.each(contentCases)('uses the reusable button in %s', (path, label) => {
    const content = readProjectFile(path)
    const supportCopy = path.includes('/zh/')
      ? '如果這個模組對你有幫助，歡迎透過 Ko-fi 支持我持續維護。謝謝！'
      : 'If this module is useful to you, consider sponsoring me to help maintain it. Thank you!'

    expect(content).toContain('::SupportButton')
    expect(content).toContain('href="https://ko-fi.com/barzhsieh"')
    expect(content).toContain('icon="mdi:hand-heart-outline"')
    expect(content).toContain(`label="${label}"`)
    expect(content.indexOf(supportCopy)).toBeLessThan(content.indexOf('::SupportButton'))
    expect(content).not.toContain('githubbutton_sm.svg')
    expect(content).not.toContain('Why support?')
  })

  it('exposes href, icon, and label as component props', () => {
    const path = 'app/components/content/SupportButton.vue'
    const component = existsSync(`${projectRoot}/${path}`) ? readProjectFile(path) : ''

    expect(component).toContain('href: string')
    expect(component).toContain('icon?: string')
    expect(component).toContain('label: string')
  })
})
