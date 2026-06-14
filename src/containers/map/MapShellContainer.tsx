import { WebMercatorViewport } from '@deck.gl/core'
import { useState } from 'react'
import { MapCanvas, type MapViewState } from '@/components/map/MapCanvas'
import { RightMapControls } from '@/components/map/RightMapControls'
import { FloatingPanel } from '@/components/panel/FloatingPanel'
import { ComposerPanelContainer } from '@/containers/composer/ComposerPanelContainer'
import { SettingsPanelContainer } from '@/containers/settings/SettingsPanelContainer'
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
  const stacTileJson = useStacTileJson({
    titilerUrl: preferences.titilerUrl,
    stacUrl: activeStacUrl,
    assets: ['visual'],
  })
  const rasterTileUrl = stacTileJson.data?.tiles[0] ?? null

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
        composerState={composerState}
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
        onEnableSwipe={() => undefined}
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
