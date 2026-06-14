import type { AppPreferences } from '@/types/preferences'

export const DEFAULT_TITILER_URL =
  import.meta.env.VITE_DEFAULT_TITILER_URL ?? 'https://titiler.xyz'

export const DEFAULT_CUSTOM_XYZ_URL =
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export const defaultPreferences: AppPreferences = {
  titilerUrl: DEFAULT_TITILER_URL,
  basemapKind: 'osm',
  customXyzUrl: DEFAULT_CUSTOM_XYZ_URL,
  areaUnit: 'km2',
}
