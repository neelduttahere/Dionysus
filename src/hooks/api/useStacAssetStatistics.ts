import { useQuery } from '@tanstack/react-query'
import { getStacAssetStatistics } from '@/api/titiler/endpoints'

export function useStacAssetStatistics({
  titilerUrl,
  stacUrl,
  assets,
  enabled = true,
}: {
  titilerUrl: string
  stacUrl: string | null
  assets: string[]
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ['titiler', 'stacAssetStatistics', titilerUrl, stacUrl, assets],
    queryFn: () =>
      getStacAssetStatistics({
        titilerUrl,
        stacUrl: stacUrl as string,
        assets,
      }),
    enabled: Boolean(enabled && titilerUrl && stacUrl && assets.length > 0),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
