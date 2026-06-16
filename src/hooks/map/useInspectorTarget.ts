import type { InspectorTarget } from '@/components/map/inspector/PixelInspectorButton'
import { useStacAssetStatistics } from '@/hooks/api/useStacAssetStatistics'
import type { ComposerInstanceState } from '@/types/composer'
import {
  getInstanceRenderRequest,
  type TileRenderRequest,
} from '@/utils/map/renderRequest'

export function useInspectorTarget({
  label,
  instance,
  titilerUrl,
  histogramBins,
  enabled,
}: {
  label: string
  instance: ComposerInstanceState
  titilerUrl: string
  histogramBins: number
  enabled: boolean
}): InspectorTarget {
  const stacUrl = instance.activeItemId
  const renderRequest = getInstanceRenderRequest(instance)
  const statistics = useStacAssetStatistics({
    titilerUrl,
    stacUrl,
    assets: renderRequest.assets,
    expression: renderRequest.expression,
    assetAsBand: renderRequest.assetAsBand,
    histogramBins,
    enabled: enabled && Boolean(stacUrl),
  })

  return {
    label,
    itemLabel: stacUrl ? getItemLabel(stacUrl) : null,
    renderLabel: getRenderLabel(renderRequest),
    statistics: statistics.data,
    isLoading: statistics.isFetching,
    isError: statistics.isError,
    isEnabled: Boolean(enabled && stacUrl),
  }
}

function getItemLabel(stacUrl: string): string {
  return decodeURIComponent(stacUrl.split('/').pop() ?? stacUrl)
}

function getRenderLabel(renderRequest: TileRenderRequest): string {
  if (renderRequest.kind === 'single-band') {
    return `Single band: ${renderRequest.assets[0]}`
  }

  if (renderRequest.kind === 'expression') {
    return `Expression: ${renderRequest.expression}`
  }

  return 'Default visual rendering'
}
