import { useQuery } from '@tanstack/react-query'
import { getStacTileJson } from '@/api/titiler/endpoints'

export function useStacTileJson({
  titilerUrl,
  stacUrl,
  assets,
}: {
  titilerUrl: string
  stacUrl: string | null
  assets: string[]
}) {
  return useQuery({
    queryKey: ['titiler', 'stacTileJson', titilerUrl, stacUrl, assets],
    queryFn: () =>
      getStacTileJson({
        titilerUrl,
        stacUrl: stacUrl as string,
        assets,
      }),
    enabled: Boolean(titilerUrl && stacUrl && assets.length > 0),
    retry: false,
  })
}
