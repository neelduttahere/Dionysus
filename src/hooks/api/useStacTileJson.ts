import { useQuery } from '@tanstack/react-query'
import { getStacTileJson } from '@/api/titiler/endpoints'

export function useStacTileJson({
  titilerUrl,
  stacUrl,
  assets,
  expression,
  colormapName,
  assetAsBand,
  rescale,
  enabled = true,
}: {
  titilerUrl: string
  stacUrl: string | null
  assets: string[]
  expression?: string
  colormapName?: string
  assetAsBand?: boolean
  rescale?: string[]
  enabled?: boolean
}) {
  return useQuery({
    queryKey: [
      'titiler',
      'stacTileJson',
      titilerUrl,
      stacUrl,
      assets,
      expression,
      colormapName,
      assetAsBand,
      rescale,
    ],
    queryFn: () =>
      getStacTileJson({
        titilerUrl,
        stacUrl: stacUrl as string,
        assets,
        expression,
        colormapName,
        assetAsBand,
        rescale,
      }),
    enabled: Boolean(
      enabled && titilerUrl && stacUrl && (assets.length > 0 || expression),
    ),
    retry: false,
  })
}
