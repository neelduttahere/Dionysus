import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout, Flex, Select, Spinner, Text } from '@radix-ui/themes'
import { FieldLabelWithInfo } from '@/components/ui/FieldLabelWithInfo'

interface SingleBandRenderControlsProps {
  assets: Array<{ key: string; label: string }>
  selectedAssetKey: string
  isComputingStatistics: boolean
  onSelectedAssetChange: (assetKey: string) => void
}

export function SingleBandRenderControls({
  assets,
  selectedAssetKey,
  isComputingStatistics,
  onSelectedAssetChange,
}: SingleBandRenderControlsProps) {
  if (assets.length === 0) {
    return (
      <Callout.Root color="amber" variant="surface">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          No single-band raster assets were found for this item.
        </Callout.Text>
      </Callout.Root>
    )
  }

  return (
    <div className="render-mode-controls">
      <div className="field">
        <Flex align="center" justify="between">
          <FieldLabelWithInfo
            label="Band"
            title="Single-band rendering"
            description="Renders one raster asset from the active STAC item, such as red, NIR, SWIR, or scene classification. Dionysus asks TiTiler for raster statistics and applies a contrast stretch so the selected band is easier to inspect on the map."
            side="right"
            align="center"
          />
          {isComputingStatistics ? (
            <Flex align="center" gap="2">
              <Spinner size="1" />
              <Text size="1" color="gray">
                Computing contrast
              </Text>
            </Flex>
          ) : null}
        </Flex>
        <Select.Root
          value={selectedAssetKey || assets[0]?.key}
          onValueChange={onSelectedAssetChange}
        >
          <Select.Trigger aria-label="Band" />
          <Select.Content position="popper" side="top">
            {assets.map((asset) => (
              <Select.Item key={asset.key} value={asset.key}>
                {asset.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  )
}
