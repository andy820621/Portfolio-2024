export type OutboundLinkDestinationType = 'github' | 'npm' | 'tool'

export function resolveOutboundDestinationType(destinationUrl: URL): OutboundLinkDestinationType {
  const hostname = destinationUrl.hostname.toLowerCase()

  if (hostname === 'github.com' || hostname.endsWith('.github.com'))
    return 'github'

  if (hostname === 'npmjs.com' || hostname.endsWith('.npmjs.com'))
    return 'npm'

  return 'tool'
}
