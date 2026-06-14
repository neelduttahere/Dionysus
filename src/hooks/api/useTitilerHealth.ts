import { useQuery } from '@tanstack/react-query'
import { getTileMatrixSets } from '@/api/titiler/endpoints'

export function useTitilerHealth(titilerUrl: string, enabled = true) {
  return useQuery({
    queryKey: ['titiler', 'tileMatrixSets', titilerUrl],
    queryFn: () => getTileMatrixSets(titilerUrl),
    enabled,
    retry: false,
  })
}
