import type { GeoJsonGeometry } from '@/types/stac'

export type BBox = [number, number, number, number]

export function getGeometryBbox(geometry: GeoJsonGeometry | null): BBox | null {
  if (!geometry) {
    return null
  }

  const positions = collectPositions(geometry)

  if (positions.length === 0) {
    return null
  }

  const longitudes = positions.map(([longitude]) => longitude)
  const latitudes = positions.map(([, latitude]) => latitude)

  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes),
  ]
}

function collectPositions(geometry: GeoJsonGeometry): Array<[number, number]> {
  switch (geometry.type) {
    case 'Point':
      return [[geometry.coordinates[0], geometry.coordinates[1]]]
    case 'MultiPoint':
    case 'LineString':
      return geometry.coordinates.map(([longitude, latitude]) => [
        longitude,
        latitude,
      ])
    case 'MultiLineString':
    case 'Polygon':
      return geometry.coordinates.flatMap((line) =>
        line.map(([longitude, latitude]) => [longitude, latitude] as [number, number]),
      )
    case 'MultiPolygon':
      return geometry.coordinates.flatMap((polygon) =>
        polygon.flatMap((line) =>
          line.map(
            ([longitude, latitude]) => [longitude, latitude] as [number, number],
          ),
        ),
      )
    case 'GeometryCollection':
      return geometry.geometries.flatMap((childGeometry) =>
        collectPositions(childGeometry),
      )
  }
}
