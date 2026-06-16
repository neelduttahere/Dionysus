import { ColumnSpacingIcon } from '@radix-ui/react-icons'
import { IconButton } from '@radix-ui/themes'
import maplibregl from 'maplibre-gl'
import { useMemo, useRef } from 'react'
import MapLibreMap, { type ViewStateChangeEvent } from 'react-map-gl/maplibre'
import type { AppPreferences } from '@/types/preferences'
import './MapCanvas.css'

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
}

interface MapCanvasProps {
  preferences: AppPreferences
  viewState: MapViewState
  rasterTileUrl: string | null
  leftRasterTileUrl: string | null
  rightRasterTileUrl: string | null
  isSwipeMode: boolean
  swipePosition: number
  onSwipePositionChange: (swipePosition: number) => void
  onViewStateChange: (viewState: MapViewState) => void
  onViewStateCommit: (viewState: MapViewState) => void
  onCursorMove: (coordinates: { longitude: number; latitude: number }) => void
  onSwipeHoverSideChange?: (side: 'left' | 'right' | null) => void
}

export function MapCanvas({
  preferences,
  viewState,
  rasterTileUrl,
  leftRasterTileUrl,
  rightRasterTileUrl,
  isSwipeMode,
  swipePosition,
  onSwipePositionChange,
  onViewStateChange,
  onViewStateCommit,
  onCursorMove,
  onSwipeHoverSideChange,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapStyle = useMemo(
    () => createMapStyle(getTileUrl(preferences), isSwipeMode ? null : rasterTileUrl),
    [preferences, rasterTileUrl, isSwipeMode],
  )
  const leftRasterStyle = useMemo(
    () => createRasterOnlyStyle(leftRasterTileUrl, 'left'),
    [leftRasterTileUrl],
  )
  const rightRasterStyle = useMemo(
    () => createRasterOnlyStyle(rightRasterTileUrl, 'right'),
    [rightRasterTileUrl],
  )

  return (
    <div
      className="map-canvas"
      ref={containerRef}
      onPointerLeave={() => onSwipeHoverSideChange?.(null)}
    >
      <MapLibreMap
        {...viewState}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        attributionControl={false}
        onMove={(event: ViewStateChangeEvent) => onViewStateChange(event.viewState)}
        onMoveEnd={(event: ViewStateChangeEvent) =>
          onViewStateCommit(event.viewState)
        }
        onMouseMove={(event) =>
          {
            onCursorMove({
              longitude: event.lngLat.lng,
              latitude: event.lngLat.lat,
            })

            if (!isSwipeMode) {
              onSwipeHoverSideChange?.(null)
              return
            }

            const containerWidth = containerRef.current?.clientWidth

            if (!containerWidth) {
              return
            }

            const dividerX = (swipePosition / 100) * containerWidth

            onSwipeHoverSideChange?.(event.point.x <= dividerX ? 'left' : 'right')
          }
        }
        reuseMaps
      />

      {isSwipeMode && leftRasterTileUrl ? (
        <div
          className="map-canvas-overlay map-canvas-overlay-left"
          style={{ clipPath: `inset(0 ${100 - swipePosition}% 0 0)` }}
        >
          <MapLibreMap
            {...viewState}
            mapLib={maplibregl}
            mapStyle={leftRasterStyle}
            attributionControl={false}
            interactive={false}
          />
        </div>
      ) : null}

      {isSwipeMode && rightRasterTileUrl ? (
        <div
          className="map-canvas-overlay map-canvas-overlay-right"
          style={{ clipPath: `inset(0 0 0 ${swipePosition}%)` }}
        >
          <MapLibreMap
            {...viewState}
            mapLib={maplibregl}
            mapStyle={rightRasterStyle}
            attributionControl={false}
            interactive={false}
          />
        </div>
      ) : null}

      {isSwipeMode ? (
        <div className="map-swipe-divider" style={{ left: `${swipePosition}%` }}>
          <div
            className="map-swipe-thumb-hitbox"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              updateSwipePosition(
                event.clientX,
                containerRef.current,
                onSwipePositionChange,
              )
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                return
              }

              updateSwipePosition(
                event.clientX,
                containerRef.current,
                onSwipePositionChange,
              )
            }}
            onPointerUp={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }}
          >
            <IconButton
              type="button"
              className="map-swipe-thumb"
              aria-label="Adjust swipe comparison"
              size="2"
              variant="solid"
              tabIndex={-1}
              style={{
                backgroundColor: '#fff',
                color: '#111',
              }}
            >
              <ColumnSpacingIcon />
            </IconButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function getTileUrl(preferences: AppPreferences): string {
  if (preferences.basemapKind === 'custom-xyz' && preferences.customXyzUrl) {
    return preferences.customXyzUrl
  }

  return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
}

function createMapStyle(basemapTileUrl: string, rasterTileUrl: string | null) {
  return {
    version: 8,
    sources: {
      basemap: {
        type: 'raster',
        tiles: [basemapTileUrl],
        tileSize: 256,
        attribution: 'OpenStreetMap contributors',
      },
      ...(rasterTileUrl
        ? {
            stacRaster: {
              type: 'raster',
              tiles: [rasterTileUrl],
              tileSize: 512,
              attribution: 'Sentinel-2 / TiTiler',
            },
          }
        : {}),
    },
    layers: [
      {
        id: 'basemap',
        type: 'raster',
        source: 'basemap',
      },
      ...(rasterTileUrl
        ? [
            {
              id: 'stac-raster',
              type: 'raster',
              source: 'stacRaster',
              paint: {
                'raster-opacity': 1,
              },
            },
          ]
        : []),
    ],
  } as maplibregl.StyleSpecification
}

function createRasterOnlyStyle(rasterTileUrl: string | null, side: 'left' | 'right') {
  const sourceId = `${side}StacRaster`
  const layerId = `${side}-stac-raster`

  return {
    version: 8,
    sources: rasterTileUrl
      ? {
          [sourceId]: {
            type: 'raster',
            tiles: [rasterTileUrl],
            tileSize: 512,
            attribution: 'Sentinel-2 / TiTiler',
          },
        }
      : {},
    layers: rasterTileUrl
      ? [
          {
            id: layerId,
            type: 'raster',
            source: sourceId,
            paint: {
              'raster-opacity': 1,
            },
          },
        ]
      : [],
  } as maplibregl.StyleSpecification
}

function updateSwipePosition(
  clientX: number,
  container: HTMLDivElement | null,
  onSwipePositionChange: (swipePosition: number) => void,
) {
  if (!container) {
    return
  }

  const bounds = container.getBoundingClientRect()
  const nextPosition = ((clientX - bounds.left) / bounds.width) * 100

  onSwipePositionChange(Math.min(90, Math.max(10, nextPosition)))
}
