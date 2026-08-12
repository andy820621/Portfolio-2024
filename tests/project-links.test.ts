import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(path: string) {
  return readFileSync(`${projectRoot}/${path}`, 'utf8')
}

describe('project links', () => {
  const projectContentPaths = [
    'content/en/projects/nuxt-content-mermaid.md',
    'content/zh/projects/nuxt-content-mermaid.md',
  ]

  it.each(projectContentPaths)('keeps ordered project links in frontmatter only: %s', (path) => {
    const content = readProjectFile(path)
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] || ''

    expect(frontmatter).toContain('projectLinks:')
    expect(frontmatter).toContain('- label: npm package')
    expect(frontmatter).toContain('href: https://www.npmjs.com/package/@barzhsieh/nuxt-content-mermaid')
    expect(frontmatter).toContain('icon: simple-icons:npm')
    expect(frontmatter).toContain('- label: GitHub repository')
    expect(frontmatter).toContain('href: https://github.com/andy820621/nuxt-content-mermaid')
    expect(frontmatter).toContain('icon: mdi:github')
    expect(content).not.toMatch(/^## (Links|外部連結)$/m)
    expect(content).not.toContain('img.shields.io')
  })

  it('renders generic project links without platform-specific branches', () => {
    const component = readProjectFile('app/components/project/Links.vue')

    expect(component).toContain('links: ProjectLink[]')
    expect(component).toContain('v-for="link in links"')
    expect(component).toContain('v-if="link.icon"')
    expect(component).toContain(':name="link.icon"')
    expect(component).toContain('{{ link.label }}')
    expect(component).not.toContain('links.npm')
    expect(component).not.toContain('links.github')
    expect(component).not.toContain('npm package')
    expect(component).not.toContain('GitHub repository')
    expect(component).not.toContain('↗')
  })

  it('declares project links in the project collection schema', () => {
    const contentConfig = readProjectFile('content.config.ts')
    const articleSchema = contentConfig.slice(
      contentConfig.indexOf('const articleSchema = z.object({'),
      contentConfig.indexOf('// projects 內容模式'),
    )
    const projectSchema = contentConfig.slice(
      contentConfig.indexOf('const projectSchema = z.object({'),
      contentConfig.indexOf('// demos 內容模式'),
    )

    expect(contentConfig).toContain('const projectLinkSchema = z.object({')
    expect(articleSchema).not.toContain('projectLinks: z.array(projectLinkSchema).optional()')
    expect(projectSchema).toContain('projectLinks: z.array(projectLinkSchema).optional()')
  })

  it('places project links between the article header and Markdown content', () => {
    const wrapper = readProjectFile('app/components/WrapperPost.vue')
    const headerIndex = wrapper.indexOf('<postHeader')
    const projectLinksIndex = wrapper.indexOf('<ProjectLinks')
    const contentRendererIndex = wrapper.indexOf('<ContentRenderer')

    expect(headerIndex).toBeGreaterThan(-1)
    expect(projectLinksIndex).toBeGreaterThan(headerIndex)
    expect(contentRendererIndex).toBeGreaterThan(projectLinksIndex)
  })
})
