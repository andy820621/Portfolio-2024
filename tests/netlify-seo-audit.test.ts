import { afterEach, describe, expect, it, vi } from 'vitest'
import { onSuccess } from '../plugins/netlify-plugin-seo-audit/index.js'
import { auditLiveSeo } from '../scripts/audit-seo-live.js'

vi.mock('../scripts/audit-seo-live.js', () => ({ auditLiveSeo: vi.fn() }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetAllMocks()
})

function pluginContext(isLocal = false) {
  return { constants: { IS_LOCAL: isLocal }, utils: { status: { show: vi.fn() }, build: { failPlugin: vi.fn() } } }
}

describe('netlify post-deploy SEO audit', () => {
  it.each(['deploy-preview', 'branch-deploy'])('skips %s', async (context) => {
    vi.stubEnv('CONTEXT', context)
    await onSuccess(pluginContext())
    expect(auditLiveSeo).not.toHaveBeenCalled()
  })

  it('skips local production builds', async () => {
    vi.stubEnv('CONTEXT', 'production')
    await onSuccess(pluginContext(true))
    expect(auditLiveSeo).not.toHaveBeenCalled()
  })

  it('audits the canonical production URL and reports the result', async () => {
    vi.stubEnv('CONTEXT', 'production')
    vi.stubEnv('NUXT_SITE_URL', 'https://barz.app')
    vi.stubEnv('URL', 'https://portfolio.netlify.app')
    vi.mocked(auditLiveSeo).mockResolvedValue({ pages: 64, sitemaps: 3, redirects: 13, maxLinkDepth: 4 })
    const context = pluginContext()
    await onSuccess(context)
    expect(auditLiveSeo).toHaveBeenCalledWith('https://barz.app')
    expect(context.utils.status.show).toHaveBeenCalledWith(expect.objectContaining({ title: 'Live SEO audit passed' }))
    expect(context.utils.build.failPlugin).not.toHaveBeenCalled()
  })

  it('reports audit errors without claiming to undo a completed deploy', async () => {
    vi.stubEnv('CONTEXT', 'production')
    vi.stubEnv('NUXT_SITE_URL', '')
    vi.stubEnv('URL', 'https://barz.app')
    const error = new Error('https://barz.app/license/: no crawlable internal-link path')
    vi.mocked(auditLiveSeo).mockRejectedValue(error)
    const context = pluginContext()
    await onSuccess(context)
    expect(auditLiveSeo).toHaveBeenCalledWith('https://barz.app')
    expect(context.utils.build.failPlugin).toHaveBeenCalledWith(expect.stringContaining('after deployment'), { error })
    expect(context.utils.status.show).not.toHaveBeenCalled()
  })
})
