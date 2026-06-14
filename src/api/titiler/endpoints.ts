import { createTitilerClient } from './client'

export async function getTileMatrixSets(titilerUrl: string) {
  const client = createTitilerClient(titilerUrl)
  const response = await client.get('/tileMatrixSets')

  return response.data
}

export interface TileJsonResponse {
  tilejson: string
  tiles: string[]
  bounds?: [number, number, number, number]
  minzoom?: number
  maxzoom?: number
}

export async function getStacTileJson({
  titilerUrl,
  stacUrl,
  assets,
  expression,
  colormapName,
  assetAsBand,
  rescale,
}: {
  titilerUrl: string
  stacUrl: string
  assets: string[]
  expression?: string
  colormapName?: string
  assetAsBand?: boolean
  rescale?: string[]
}): Promise<TileJsonResponse> {
  const client = createTitilerClient(titilerUrl)
  const params = new URLSearchParams()

  params.set('url', stacUrl)

  for (const asset of assets) {
    params.append('assets', asset)
  }

  if (expression) {
    params.set('expression', expression)
  }

  if (assetAsBand) {
    params.set('asset_as_band', 'true')
  }

  if (colormapName) {
    params.set('colormap_name', colormapName)
  }

  for (const rescaleRange of rescale ?? []) {
    params.append('rescale', rescaleRange)
  }

  const response = await client.get<TileJsonResponse>(
    `/stac/WebMercatorQuad/tilejson.json?${params.toString()}`,
  )

  return response.data
}

export interface AssetStatisticsResponse {
  [assetKey: string]: {
    [bandKey: string]: {
      min?: number
      max?: number
      percentile_2?: number
      percentile_98?: number
    }
  }
}

export interface StatisticsBand {
  min?: number
  max?: number
  percentile_2?: number
  percentile_98?: number
}

export interface StatisticsResponse {
  [bandKey: string]: StatisticsBand
}

export type StacStatisticsResponse = AssetStatisticsResponse | StatisticsResponse

export async function getStacAssetStatistics({
  titilerUrl,
  stacUrl,
  assets,
  expression,
  assetAsBand,
}: {
  titilerUrl: string
  stacUrl: string
  assets: string[]
  expression?: string
  assetAsBand?: boolean
}): Promise<StacStatisticsResponse> {
  const client = createTitilerClient(titilerUrl)
  const params = new URLSearchParams()

  params.set('url', stacUrl)

  for (const asset of assets) {
    params.append('assets', asset)
  }

  if (expression) {
    params.set('expression', expression)
  }

  if (assetAsBand) {
    params.set('asset_as_band', 'true')
  }

  const endpoint = expression ? '/stac/statistics' : '/stac/asset_statistics'

  const response = await client.get<StacStatisticsResponse>(
    `${endpoint}?${params.toString()}`,
    {
      timeout: 90_000,
    },
  )

  return response.data
}
