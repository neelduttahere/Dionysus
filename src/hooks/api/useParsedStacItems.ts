import { useQuery } from '@tanstack/react-query'
import { fetchParsedStacItems } from './useLoadStacItems'

export function useParsedStacItems(urls: string[]) {
  return useQuery({
    queryKey: ['stac', 'items', urls],
    queryFn: () => fetchParsedStacItems(urls),
    enabled: urls.length > 0,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
