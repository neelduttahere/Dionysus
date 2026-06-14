export interface StacItem {
  type: 'Feature'
  id: string
  collection?: string
  bbox?: [number, number, number, number]
  geometry: GeoJsonGeometry | null
  properties: {
    datetime?: string
    start_datetime?: string
    end_datetime?: string
    platform?: string
    constellation?: string
    [key: string]: unknown
  }
  assets?: Record<string, StacAsset>
  links?: StacLink[]
}

export interface StacAsset {
  href: string
  type?: string
  title?: string
  roles?: string[]
  'eo:bands'?: Array<{
    name?: string
    common_name?: string
    description?: string
  }>
}

export interface StacLink {
  rel: string
  href: string
  type?: string
}

export type GeoJsonGeometry =
  | GeoJsonPoint
  | GeoJsonMultiPoint
  | GeoJsonLineString
  | GeoJsonMultiLineString
  | GeoJsonPolygon
  | GeoJsonMultiPolygon
  | GeoJsonGeometryCollection

interface GeoJsonPoint {
  type: 'Point'
  coordinates: Position
}

interface GeoJsonMultiPoint {
  type: 'MultiPoint'
  coordinates: Position[]
}

interface GeoJsonLineString {
  type: 'LineString'
  coordinates: Position[]
}

interface GeoJsonMultiLineString {
  type: 'MultiLineString'
  coordinates: Position[][]
}

interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: Position[][]
}

interface GeoJsonMultiPolygon {
  type: 'MultiPolygon'
  coordinates: Position[][][]
}

interface GeoJsonGeometryCollection {
  type: 'GeometryCollection'
  geometries: GeoJsonGeometry[]
}

type Position = [number, number, ...number[]]

export interface ParsedStacItem {
  id: string
  url: string
  datetime: string | null
  platform: string | null
  constellation: string | null
  bandCount: number
  areaSquareMeters: number | null
  bbox: [number, number, number, number] | null
  item: StacItem
}
