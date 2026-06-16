import { useQuery } from '@tanstack/react-query'
import { getStacAssetStatistics } from '@/api/titiler/endpoints'

export function useStacAssetStatistics({
  titilerUrl,
  stacUrl,
  assets,
  expression,
  assetAsBand,
  histogramBins,
  enabled = true,
}: {
  titilerUrl: string
  stacUrl: string | null
  assets: string[]
  expression?: string
  assetAsBand?: boolean
  histogramBins?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: [
      'titiler',
      'stacAssetStatistics',
      titilerUrl,
      stacUrl,
      assets,
      expression,
      assetAsBand,
      histogramBins,
    ],
    queryFn: () =>
      getStacAssetStatistics({
        titilerUrl,
        stacUrl: stacUrl as string,
        assets,
        expression,
        assetAsBand,
        histogramBins,
      }),
    enabled: Boolean(enabled && titilerUrl && stacUrl && assets.length > 0),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
