import { useMutation } from '@tanstack/react-query'
import { getStacItem } from '@/api/stac/endpoints'
import type { ParsedStacItem } from '@/types/stac'
import { parseStacItem, sortStacItemsByDatetime } from '@/utils/stac/parseStacItem'

export async function fetchParsedStacItems(urls: string[]): Promise<ParsedStacItem[]> {
  const items = await Promise.all(
    urls.map(async (url) => parseStacItem(await getStacItem(url), url)),
  )

  return sortStacItemsByDatetime(items)
}

export function useLoadStacItems() {
  return useMutation({
    mutationFn: fetchParsedStacItems,
  })
}
