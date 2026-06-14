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
  rescale,
}: {
  titilerUrl: string
  stacUrl: string
  assets: string[]
  rescale?: string[]
}): Promise<TileJsonResponse> {
  const client = createTitilerClient(titilerUrl)
  const params = new URLSearchParams()

  params.set('url', stacUrl)

  for (const asset of assets) {
    params.append('assets', asset)
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

export async function getStacAssetStatistics({
  titilerUrl,
  stacUrl,
  assets,
}: {
  titilerUrl: string
  stacUrl: string
  assets: string[]
}): Promise<AssetStatisticsResponse> {
  const client = createTitilerClient(titilerUrl)
  const params = new URLSearchParams()

  params.set('url', stacUrl)

  for (const asset of assets) {
    params.append('assets', asset)
  }

  const response = await client.get<AssetStatisticsResponse>(
    `/stac/asset_statistics?${params.toString()}`,
    {
      timeout: 90_000,
    },
  )

  return response.data
}
