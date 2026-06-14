import { WebMercatorViewport } from '@deck.gl/core'
import { useState } from 'react'
import { MapCanvas, type MapViewState } from '@/components/map/MapCanvas'
import { RightMapControls } from '@/components/map/RightMapControls'
import { FloatingPanel } from '@/components/panel/FloatingPanel'
import { ComposerPanelContainer } from '@/containers/composer/ComposerPanelContainer'
import { SettingsPanelContainer } from '@/containers/settings/SettingsPanelContainer'
import { useStacAssetStatistics } from '@/hooks/api/useStacAssetStatistics'
import { useStacTileJson } from '@/hooks/api/useStacTileJson'
import { useAppPreferences } from '@/hooks/preferences/useAppPreferences'
import type { ComposerState } from '@/types/composer'
import type { BBox } from '@/utils/geo/bbox'
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
  const activeTileAssets = getActiveTileAssets(composerState)
  const shouldAutoRescale = isSingleBandRender(composerState)
  const stacAssetStatistics = useStacAssetStatistics({
    titilerUrl: preferences.titilerUrl,
    stacUrl: activeStacUrl,
    assets: activeTileAssets,
    enabled: shouldAutoRescale,
  })
  const rescale = shouldAutoRescale
    ? getSingleBandRescale(stacAssetStatistics.data, activeTileAssets[0])
    : undefined
  const fallbackRescale =
    shouldAutoRescale && stacAssetStatistics.isError ? ['0,4000'] : undefined
  const resolvedRescale = rescale ?? fallbackRescale
  const canLoadTileJson =
    !shouldAutoRescale || Boolean(resolvedRescale) || stacAssetStatistics.isError
  const stacTileJson = useStacTileJson({
    titilerUrl: preferences.titilerUrl,
    stacUrl: activeStacUrl,
    assets: activeTileAssets,
    rescale: resolvedRescale,
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

function getActiveTileAssets(composerState: ComposerState): string[] {
  const instance =
    composerState.mode === 'single' ? composerState.single : composerState.left
  const activeItemId = instance.activeItemId

  if (!activeItemId) {
    return ['visual']
  }

  const config = instance.configs[activeItemId]

  if (config?.mode === 'single-band' && config.assetKeys[0]) {
    return [config.assetKeys[0]]
  }

  return ['visual']
}

function isSingleBandRender(composerState: ComposerState): boolean {
  const instance =
    composerState.mode === 'single' ? composerState.single : composerState.left
  const activeItemId = instance.activeItemId

  if (!activeItemId) {
    return false
  }

  return instance.configs[activeItemId]?.mode === 'single-band'
}

function getSingleBandRescale(
  statistics:
    | Record<
        string,
        Record<
          string,
          {
            min?: number
            max?: number
            percentile_2?: number
            percentile_98?: number
          }
        >
      >
    | undefined,
  assetKey: string | undefined,
): string[] | undefined {
  if (!statistics || !assetKey) {
    return undefined
  }

  const firstBandStatistics = Object.values(statistics[assetKey] ?? {})[0]

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
