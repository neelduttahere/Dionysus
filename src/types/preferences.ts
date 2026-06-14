export type AreaUnit = 'm2' | 'km2' | 'hectare' | 'acre'

export type BasemapKind = 'osm' | 'custom-xyz'

export interface AppPreferences {
  titilerUrl: string
  basemapKind: BasemapKind
  customXyzUrl: string
  areaUnit: AreaUnit
}
