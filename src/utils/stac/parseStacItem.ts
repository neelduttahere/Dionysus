import { area } from '@turf/turf'
import type { ParsedStacItem, StacItem } from '@/types/stac'
import { getGeometryBbox } from '@/utils/geo/bbox'

export function parseStacItem(item: StacItem, url: string): ParsedStacItem {
  return {
    id: item.id,
    url,
    datetime: getItemDatetime(item),
    platform: item.properties.platform ?? null,
    constellation: item.properties.constellation ?? null,
    bandCount: getBandCount(item),
    areaSquareMeters: getItemArea(item),
    bbox: item.bbox ?? getGeometryBbox(item.geometry),
    item,
  }
}

export function sortStacItemsByDatetime(items: ParsedStacItem[]): ParsedStacItem[] {
  return [...items].sort((left, right) => {
    const leftTime = left.datetime ? Date.parse(left.datetime) : Number.POSITIVE_INFINITY
    const rightTime = right.datetime
      ? Date.parse(right.datetime)
      : Number.POSITIVE_INFINITY

    return leftTime - rightTime
  })
}

function getItemDatetime(item: StacItem): string | null {
  return (
    item.properties.datetime ??
    item.properties.start_datetime ??
    item.properties.end_datetime ??
    null
  )
}

function getBandCount(item: StacItem): number {
  const assets = Object.values(item.assets ?? {})
  const bandNames = new Set<string>()

  for (const asset of assets) {
    for (const band of asset['eo:bands'] ?? []) {
      bandNames.add(band.name ?? band.common_name ?? asset.href)
    }
  }

  return bandNames.size || assets.length
}

function getItemArea(item: StacItem): number | null {
  if (!item.geometry) {
    return null
  }

  try {
    return area(item as never)
  } catch {
    return null
  }
}
