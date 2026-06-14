import maplibregl from 'maplibre-gl'
import { useMemo } from 'react'
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
  onViewStateChange: (viewState: MapViewState) => void
  onCursorMove: (coordinates: { longitude: number; latitude: number }) => void
}

export function MapCanvas({
  preferences,
  viewState,
  rasterTileUrl,
  onViewStateChange,
  onCursorMove,
}: MapCanvasProps) {
  const mapStyle = useMemo(
    () => createRasterStyle(getTileUrl(preferences), rasterTileUrl),
    [preferences, rasterTileUrl],
  )

  return (
    <MapLibreMap
      {...viewState}
      mapLib={maplibregl}
      mapStyle={mapStyle}
      attributionControl={false}
      onMove={(event: ViewStateChangeEvent) => onViewStateChange(event.viewState)}
      onMouseMove={(event) =>
        onCursorMove({
          longitude: event.lngLat.lng,
          latitude: event.lngLat.lat,
        })
      }
      reuseMaps
    />
  )
}

function getTileUrl(preferences: AppPreferences): string {
  if (preferences.basemapKind === 'custom-xyz' && preferences.customXyzUrl) {
    return preferences.customXyzUrl
  }

  return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
}

function createRasterStyle(basemapTileUrl: string, rasterTileUrl: string | null) {
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
