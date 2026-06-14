import { WebMercatorViewport } from '@deck.gl/core'
import { useState } from 'react'
import type { StacStatisticsResponse, StatisticsBand } from '@/api/titiler/endpoints'
import { MapCanvas, type MapViewState } from '@/components/map/MapCanvas'
import { RightMapControls } from '@/components/map/RightMapControls'
import { FloatingPanel } from '@/components/panel/FloatingPanel'
import { ComposerPanelContainer } from '@/containers/composer/ComposerPanelContainer'
import { SettingsPanelContainer } from '@/containers/settings/SettingsPanelContainer'
import { useStacAssetStatistics } from '@/hooks/api/useStacAssetStatistics'
import { useStacTileJson } from '@/hooks/api/useStacTileJson'
import { useAppPreferences } from '@/hooks/preferences/useAppPreferences'
import type { ComposerInstanceState, ComposerState } from '@/types/composer'
import type { BBox } from '@/utils/geo/bbox'
import { getExpressionRenderParams } from '@/utils/titiler/expressions'
import { defaultComposerState } from '@/utils/url/composerSearch'
import './MapShellContainer.css'

interface MapShellContainerProps {
  activePanel: 'compose' | 'settings'
  composerState?: ComposerState
}

export function MapShellContainer({
  activePanel,
  composerState = defaultComposerState,
}: MapShellContainerProps) {
  const [preferences, setPreferences, resetPreferences] = useAppPreferences()
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4,
  })
  const [cursor, setCursor] = useState<{ longitude: number; latitude: number } | null>(
    null,
  )
  const activeStacUrl = getActiveStacUrl(composerState)
  const activeRenderRequest = getActiveRenderRequest(composerState)
  const activeTileAssets = activeRenderRequest.assets
  const shouldAutoRescale =
    activeRenderRequest.kind === 'single-band' ||
    activeRenderRequest.kind === 'expression'
  const stacAssetStatistics = useStacAssetStatistics({
    titilerUrl: preferences.titilerUrl,
    stacUrl: activeStacUrl,
    assets: activeTileAssets,
    expression: activeRenderRequest.expression,
    assetAsBand: activeRenderRequest.assetAsBand,
    enabled: shouldAutoRescale,
  })
  const rescale = shouldAutoRescale
    ? getStatisticsRescale(stacAssetStatistics.data, activeTileAssets[0])
    : undefined
  const fallbackRescale = getFallbackRescale(
    activeRenderRequest.kind,
    stacAssetStatistics.isError,
  )
  const resolvedRescale = rescale ?? fallbackRescale
  const canLoadTileJson =
    !shouldAutoRescale || Boolean(resolvedRescale) || stacAssetStatistics.isError
  const stacTileJson = useStacTileJson({
    titilerUrl: preferences.titilerUrl,
    stacUrl: activeStacUrl,
    assets: activeTileAssets,
    rescale: resolvedRescale,
    expression: activeRenderRequest.expression,
    colormapName: activeRenderRequest.colormapName,
    assetAsBand: activeRenderRequest.assetAsBand,
    enabled: canLoadTileJson,
  })
  const rasterTileUrl = canLoadTileJson ? (stacTileJson.data?.tiles[0] ?? null) : null

  function fitBounds(bbox: BBox) {
    const viewport = new WebMercatorViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    })
    const fittedViewState = viewport.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      {
        padding: {
          top: 72,
          right: 96,
          bottom: 72,
          left: Math.min(560, window.innerWidth * 0.42),
        },
      },
    )

    setViewState({
      longitude: fittedViewState.longitude,
      latitude: fittedViewState.latitude,
      zoom: Math.min(fittedViewState.zoom, 14),
    })
  }

  return (
    <main className="map-shell">
      <MapCanvas
        preferences={preferences}
        viewState={viewState}
        rasterTileUrl={rasterTileUrl}
        onViewStateChange={setViewState}
        onCursorMove={setCursor}
      />
      <FloatingPanel activePanel={activePanel}>
        {activePanel === 'compose' ? (
          <ComposerPanelContainer
            state={composerState}
            areaUnit={preferences.areaUnit}
            isComputingRasterStatistics={
              shouldAutoRescale && stacAssetStatistics.isFetching
            }
            onFitBounds={fitBounds}
          />
        ) : (
          <SettingsPanelContainer
            preferences={preferences}
            onPreferencesChange={setPreferences}
            onReset={resetPreferences}
          />
        )}
      </FloatingPanel>
      <RightMapControls
        preferences={preferences}
        cursor={cursor}
        onPreferencesChange={setPreferences}
        onZoomIn={() =>
          setViewState((currentViewState) => ({
            ...currentViewState,
            zoom: Math.min(currentViewState.zoom + 1, 22),
          }))
        }
        onZoomOut={() =>
          setViewState((currentViewState) => ({
            ...currentViewState,
            zoom: Math.max(currentViewState.zoom - 1, 0),
          }))
        }
      />
    </main>
  )
}

function getActiveStacUrl(composerState: ComposerState): string | null {
  if (composerState.mode === 'single') {
    return composerState.single.activeItemId
  }

  return composerState.left.activeItemId
}

interface TileRenderRequest {
  kind: 'visual' | 'single-band' | 'expression'
  assets: string[]
  expression?: string
  colormapName?: string
  assetAsBand?: boolean
}

function getActiveRenderRequest(composerState: ComposerState): TileRenderRequest {
  const instance = getVisibleComposerInstance(composerState)
  const activeItemId = instance.activeItemId

  if (!activeItemId) {
    return getVisualRenderRequest()
  }

  const config = instance.configs[activeItemId]

  if (config?.mode === 'single-band' && config.assetKeys[0]) {
    return {
      kind: 'single-band',
      assets: [config.assetKeys[0]],
    }
  }

  if (config?.mode === 'expression' && config.appliedExpression?.trim()) {
    const expression = config.appliedExpression.trim()
    const expressionParams = getExpressionRenderParams(expression)

    if (expressionParams.assets.length === 0) {
      return getVisualRenderRequest()
    }

    return {
      kind: 'expression',
      assets: expressionParams.assets,
      expression: expressionParams.expression,
      colormapName: (config.appliedColormap || config.colormap).toLowerCase(),
      assetAsBand: true,
    }
  }

  return getVisualRenderRequest()
}

function getVisibleComposerInstance(
  composerState: ComposerState,
): ComposerInstanceState {
  return composerState.mode === 'single' ? composerState.single : composerState.left
}

function getVisualRenderRequest(): TileRenderRequest {
  return {
    kind: 'visual',
    assets: ['visual'],
  }
}

function getStatisticsRescale(
  statistics: StacStatisticsResponse | undefined,
  assetKey: string | undefined,
): string[] | undefined {
  if (!statistics) {
    return undefined
  }

  const firstBandStatistics = getFirstStatisticsBand(statistics, assetKey)

  if (!firstBandStatistics) {
    return undefined
  }

  const min = firstBandStatistics.percentile_2 ?? firstBandStatistics.min
  const max = firstBandStatistics.percentile_98 ?? firstBandStatistics.max

  if (typeof min !== 'number' || typeof max !== 'number' || min >= max) {
    return undefined
  }

  return [`${min},${max}`]
}

function getFirstStatisticsBand(
  statistics: StacStatisticsResponse,
  assetKey: string | undefined,
): StatisticsBand | undefined {
  if (assetKey) {
    const assetStatistics = statistics[assetKey]

    if (assetStatistics && !isStatisticsBand(assetStatistics)) {
      const firstAssetBand = Object.values(assetStatistics).find(isStatisticsBand)

      if (firstAssetBand) {
        return firstAssetBand
      }
    }
  }

  for (const value of Object.values(statistics)) {
    if (isStatisticsBand(value)) {
      return value
    }

    const firstNestedBand = Object.values(value).find(isStatisticsBand)

    if (firstNestedBand) {
      return firstNestedBand
    }
  }

  return undefined
}

function isStatisticsBand(value: unknown): value is StatisticsBand {
  if (!value || typeof value !== 'object') {
    return false
  }

  const band = value as StatisticsBand

  return (
    typeof band.percentile_2 === 'number' ||
    typeof band.percentile_98 === 'number' ||
    typeof band.min === 'number' ||
    typeof band.max === 'number'
  )
}

function getFallbackRescale(
  renderKind: TileRenderRequest['kind'],
  hasStatisticsError: boolean,
): string[] | undefined {
  if (!hasStatisticsError) {
    return undefined
  }

  if (renderKind === 'single-band') {
    return ['0,4000']
  }

  if (renderKind === 'expression') {
    return ['-1,1']
  }

  return undefined
}
