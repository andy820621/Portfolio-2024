import process from 'node:process'
import { auditLiveSeo } from '../../scripts/audit-seo-live.js'

export async function onSuccess({ constants, utils }) {
  if (constants.IS_LOCAL || process.env.CONTEXT !== 'production')
    return

  try {
    const result = await auditLiveSeo(process.env.NUXT_SITE_URL || process.env.URL)
    utils.status.show({
      title: 'Live SEO audit passed',
      summary: `${result.pages} canonical pages, ${result.redirects} redirects; maximum link depth ${result.maxLinkDepth}.`,
    })
  }
  catch (error) {
    utils.build.failPlugin('Live SEO audit failed after deployment; inspect the URLs below.', { error })
  }
}
