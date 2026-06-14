import axios from 'axios'
import type { StacItem } from '@/types/stac'

export async function getStacItem(url: string): Promise<StacItem> {
  const response = await axios.get<StacItem>(url, {
    timeout: 20_000,
  })

  return response.data
}
