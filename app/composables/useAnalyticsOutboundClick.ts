type OutboundDestinationType
  = | 'github'
    | 'npm'
    | 'demo'
    | 'social'
    | 'tool'
    | 'other'

interface TrackOutboundClickInput {
  destinationType: OutboundDestinationType
  destinationUrl: string
  destinationDomain?: string
  linkGroup?: string
  sourceComponent: string
  sourcePage?: string
  itemId?: string
}

export function useAnalyticsOutboundClick() {
  const route = useRoute()
  const { gtag } = useGtag()

  function trackOutboundClick(input: TrackOutboundClickInput) {
    const destinationUrl = input.destinationUrl.trim()

    if (!destinationUrl)
      return

    const resolvedDestinationDomain = (() => {
      if (input.destinationDomain)
        return input.destinationDomain

      try {
        return new URL(destinationUrl).hostname.toLowerCase()
      }
      catch {
        return undefined
      }
    })()

    gtag('event', 'outbound_click', {
      destination_type: input.destinationType,
      destination_url: destinationUrl,
      ...(resolvedDestinationDomain ? { destination_domain: resolvedDestinationDomain } : {}),
      ...(input.linkGroup ? { link_group: input.linkGroup } : {}),
      source_component: input.sourceComponent,
      source_page: input.sourcePage || route.path,
      ...(input.itemId ? { item_id: input.itemId } : {}),
      transport_type: 'beacon',
    })
  }

  return {
    trackOutboundClick,
  }
}
