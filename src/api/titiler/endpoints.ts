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
}: {
  titilerUrl: string
  stacUrl: string
  assets: string[]
}): Promise<TileJsonResponse> {
  const client = createTitilerClient(titilerUrl)
  const params = new URLSearchParams()

  params.set('url', stacUrl)

  for (const asset of assets) {
    params.append('assets', asset)
  }

  const response = await client.get<TileJsonResponse>(
    `/stac/WebMercatorQuad/tilejson.json?${params.toString()}`,
  )

  return response.data
}
