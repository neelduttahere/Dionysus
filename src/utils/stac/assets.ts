import type { ParsedStacItem, StacAsset } from '@/types/stac'

export interface RenderableAssetOption {
  key: string
  label: string
}

export function getSingleBandAssetOptions(
  item: ParsedStacItem | null,
): RenderableAssetOption[] {
  if (!item?.item.assets) {
    return []
  }

  return Object.entries(item.item.assets)
    .filter(([, asset]) => isSingleBandRasterAsset(asset))
    .map(([key, asset]) => ({
      key,
      label: asset.title ? `${asset.title} (${key})` : key,
    }))
}

function isSingleBandRasterAsset(asset: StacAsset): boolean {
  if (asset.roles?.some((role) => role === 'metadata' || role === 'thumbnail')) {
    return false
  }

  if (asset.type && !asset.type.includes('image/tiff')) {
    return false
  }

  const bandCount = asset['eo:bands']?.length ?? 0

  return bandCount <= 1
}
