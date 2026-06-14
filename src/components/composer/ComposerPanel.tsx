import { CopyIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  DataList,
  Flex,
  Heading,
  HoverCard,
  ScrollArea,
  SegmentedControl,
  Select,
  Separator,
  Spinner,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { FieldLabelWithInfo } from '@/components/ui/FieldLabelWithInfo'
import type {
  ComposerInstanceState,
  ComposerState,
  RenderConfig,
  RenderMode,
} from '@/types/composer'
import type { AreaUnit } from '@/types/preferences'
import type { ParsedStacItem } from '@/types/stac'
import { formatArea } from '@/utils/geo/formatArea'
import { getSingleBandAssetOptions } from '@/utils/stac/assets'
import { parseCommaSeparatedUrls } from '@/utils/stac/parseStacUrls'
import './ComposerPanel.css'

interface ComposerPanelProps {
  state: ComposerState
  areaUnit: AreaUnit
  isComputingRasterStatistics: boolean
  singleTimelineItems: ParsedStacItem[]
  leftTimelineItems: ParsedStacItem[]
  rightTimelineItems: ParsedStacItem[]
  onModeChange: (mode: ComposerState['mode']) => void
  onLoadSingleUrls: (urls: string[]) => Promise<void>
  onLoadSideUrls: (side: 'left' | 'right', urls: string[]) => Promise<void>
  onTimelineItemSelect: (item: ParsedStacItem) => void
  onSingleChange: (instance: ComposerInstanceState) => void
  onSideChange: (side: 'left' | 'right', instance: ComposerInstanceState) => void
  loadingSide: 'single' | 'left' | 'right' | null
  loadError: string | null
}

export function ComposerPanel({
  state,
  areaUnit,
  isComputingRasterStatistics,
  singleTimelineItems,
  leftTimelineItems,
  rightTimelineItems,
  onModeChange,
  onLoadSingleUrls,
  onLoadSideUrls,
  onTimelineItemSelect,
  onSingleChange,
  onSideChange,
  loadingSide,
  loadError,
}: ComposerPanelProps) {
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left')

  return (
    <div className="composer-panel">
      <Flex justify="between" align="start" gap="3">
        <div>
          <Heading as="h2" size="5">
            Composer
          </Heading>
          <Text as="p" size="2" color="gray" className="composer-intro">
            Load comma-separated STAC item URLs and render one date at a time.
          </Text>
        </div>
        <SegmentedControl.Root
          size="1"
          value={state.mode}
          onValueChange={(value) => onModeChange(value as ComposerState['mode'])}
        >
          <SegmentedControl.Item value="single">Single</SegmentedControl.Item>
          <SegmentedControl.Item value="swipe">Swipe</SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>

      <Separator size="4" />

      {state.mode === 'single' ? (
        <ComposerInstanceEditor
          label="Scene"
          instance={state.single}
          timelineItems={singleTimelineItems}
          areaUnit={areaUnit}
          isComputingRasterStatistics={isComputingRasterStatistics}
          isLoading={loadingSide === 'single'}
          loadError={loadError}
          onLoadUrls={onLoadSingleUrls}
          onTimelineItemSelect={onTimelineItemSelect}
          onChange={onSingleChange}
        />
      ) : (
        <>
          <SegmentedControl.Root
            value={activeSide}
            onValueChange={(value) => setActiveSide(value as 'left' | 'right')}
          >
            <SegmentedControl.Item value="left">Left</SegmentedControl.Item>
            <SegmentedControl.Item value="right">Right</SegmentedControl.Item>
          </SegmentedControl.Root>
          <ComposerInstanceEditor
            label={activeSide === 'left' ? 'Left scene' : 'Right scene'}
            instance={state[activeSide]}
            timelineItems={activeSide === 'left' ? leftTimelineItems : rightTimelineItems}
            areaUnit={areaUnit}
            isComputingRasterStatistics={isComputingRasterStatistics}
            isLoading={loadingSide === activeSide}
            loadError={loadError}
            onLoadUrls={(urls) => onLoadSideUrls(activeSide, urls)}
            onTimelineItemSelect={onTimelineItemSelect}
            onChange={(instance) => onSideChange(activeSide, instance)}
          />
        </>
      )}
    </div>
  )
}

interface ComposerInstanceEditorProps {
  label: string
  instance: ComposerInstanceState
  timelineItems: ParsedStacItem[]
  areaUnit: AreaUnit
  isComputingRasterStatistics: boolean
  isLoading: boolean
  loadError: string | null
  onLoadUrls: (urls: string[]) => Promise<void>
  onTimelineItemSelect: (item: ParsedStacItem) => void
  onChange: (instance: ComposerInstanceState) => void
}

function ComposerInstanceEditor({
  label,
  instance,
  timelineItems,
  areaUnit,
  isComputingRasterStatistics,
  isLoading,
  loadError,
  onLoadUrls,
  onTimelineItemSelect,
  onChange,
}: ComposerInstanceEditorProps) {
  const [draftUrls, setDraftUrls] = useState(instance.urls.join(', '))
  const [alert, setAlert] = useState<string | null>(null)
  const [isTimelineScrolling, setIsTimelineScrolling] = useState(false)
  const timelineScrollTimeout = useRef<number | null>(null)
  const activeIndex = Math.max(0, instance.urls.indexOf(instance.activeItemId ?? ''))
  const activeItem =
    timelineItems.find((item) => item.url === instance.activeItemId) ??
    timelineItems[0] ??
    null
  const activeConfig = getActiveRenderConfig(instance, activeItem)
  const singleBandAssets = getSingleBandAssetOptions(activeItem)

  useEffect(() => {
    return () => {
      if (timelineScrollTimeout.current !== null) {
        window.clearTimeout(timelineScrollTimeout.current)
      }
    }
  }, [])

  async function loadUrls() {
    const urls = parseCommaSeparatedUrls(draftUrls)

    await onLoadUrls(urls)
  }

  function selectTimelineItem(url: string) {
    const selectedItem = timelineItems.find((item) => item.url === url)

    onChange({
      ...instance,
      activeItemId: url,
    })

    if (selectedItem) {
      onTimelineItemSelect(selectedItem)
    }
  }

  function updateActiveConfig(nextConfig: RenderConfig) {
    if (!activeItem) {
      return
    }

    onChange({
      ...instance,
      configs: {
        ...instance.configs,
        [activeItem.url]: nextConfig,
      },
    })
  }

  function updateRenderMode(mode: RenderMode) {
    const firstSingleBandAsset = singleBandAssets[0]?.key

    updateActiveConfig({
      ...activeConfig,
      mode,
      assetKeys:
        mode === 'single-band'
          ? [activeConfig.assetKeys[0] ?? firstSingleBandAsset ?? '']
          : activeConfig.assetKeys,
    })
  }

  function handleTimelineScroll() {
    setIsTimelineScrolling(true)

    if (timelineScrollTimeout.current !== null) {
      window.clearTimeout(timelineScrollTimeout.current)
    }

    timelineScrollTimeout.current = window.setTimeout(() => {
      setIsTimelineScrolling(false)
    }, 180)
  }

  return (
    <section className="composer-instance">
      <Heading as="h3" size="3">
        {label}
      </Heading>
      <div className="field">
        <Text size="2" weight="medium">
          STAC URLs
        </Text>
        <TextArea
          aria-label="STAC URLs"
          value={draftUrls}
          onChange={(event) => setDraftUrls(event.target.value)}
          placeholder="https://example.com/item-1.json, https://example.com/item-2.json"
          rows={5}
        />
      </div>
      <Button onClick={loadUrls} disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        {isLoading ? 'Loading STAC items' : 'Load / Generate'}
      </Button>

      {loadError ? (
        <Callout.Root color="red" variant="surface">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{loadError}</Callout.Text>
        </Callout.Root>
      ) : null}

      {instance.urls.length === 0 ? (
        <Callout.Root color="blue" variant="surface">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Add at least one STAC URL to enable imagery rendering and swipe compare.
          </Callout.Text>
        </Callout.Root>
      ) : (
        <>
          <div className="timeline-block">
            <Flex justify="between" align="center">
              <Text size="2" weight="medium">
                Timeline
              </Text>
              <Text size="1" color="gray">
                {activeIndex + 1} of {instance.urls.length}
              </Text>
            </Flex>

            {timelineItems.length > 0 ? (
              <div className="timeline-scroll-shell">
                <ScrollArea
                  className="timeline-scroll-area"
                  scrollbars="horizontal"
                  type="hover"
                  onScrollCapture={handleTimelineScroll}
                >
                  <div className="timeline-scroll-content">
                    <SegmentedControl.Root
                      className="timeline-segments"
                      value={instance.activeItemId ?? timelineItems[0]?.url}
                      onValueChange={selectTimelineItem}
                    >
                      {timelineItems.map((item, index) => (
                        <SegmentedControl.Item key={item.url} value={item.url}>
                          <HoverCard.Root open={isTimelineScrolling ? false : undefined}>
                            <HoverCard.Trigger>
                              <span className="timeline-segment-label">
                                {formatTimelineDate(item.datetime, index)}
                              </span>
                            </HoverCard.Trigger>
                            <HoverCard.Content width="340px">
                              <TimelineItemDetails item={item} areaUnit={areaUnit} />
                            </HoverCard.Content>
                          </HoverCard.Root>
                        </SegmentedControl.Item>
                      ))}
                    </SegmentedControl.Root>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <Text size="2" color="gray">
                Loading timeline metadata...
              </Text>
            )}

            <Text as="p" size="1" color="gray" className="active-url">
              {instance.activeItemId}
            </Text>
          </div>

          <Separator size="4" />

          <div className="render-controls">
            <div className="field">
              <Text size="2" weight="medium">
                Render mode
              </Text>
              <Select.Root
                value={activeConfig.mode}
                onValueChange={(value) => updateRenderMode(value as RenderMode)}
              >
                <Select.Trigger aria-label="Render mode" />
                <Select.Content>
                  <Select.Item value="default">Default</Select.Item>
                  <Select.Item value="visual">Visual asset</Select.Item>
                  <Select.Item value="rgb">RGB composite</Select.Item>
                  <Select.Item value="single-band">Single band</Select.Item>
                  <Select.Item value="expression">Expression</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>

            {activeConfig.mode === 'single-band' ? (
              <SingleBandRenderControls
                assets={singleBandAssets}
                selectedAssetKey={activeConfig.assetKeys[0] ?? ''}
                isComputingStatistics={isComputingRasterStatistics}
                onSelectedAssetChange={(assetKey) =>
                  updateActiveConfig({
                    ...activeConfig,
                    assetKeys: [assetKey],
                  })
                }
              />
            ) : null}

            {activeConfig.mode === 'expression' ? <ExpressionRenderControls /> : null}
          </div>

          <Button
            type="button"
            variant="surface"
            onClick={() =>
              setAlert('Copy config validation will be enabled with STAC parsing.')
            }
          >
            <CopyIcon />
            Copy config
          </Button>

          {alert ? (
            <Callout.Root color="amber" variant="surface">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>{alert}</Callout.Text>
            </Callout.Root>
          ) : null}
        </>
      )}
    </section>
  )
}

function getActiveRenderConfig(
  instance: ComposerInstanceState,
  activeItem: ParsedStacItem | null,
): RenderConfig {
  if (activeItem && instance.configs[activeItem.url]) {
    return instance.configs[activeItem.url]
  }

  return {
    mode: 'default',
    assetKeys: [],
    expression: '',
    colormap: 'viridis',
    buckets: [],
  }
}

function SingleBandRenderControls({
  assets,
  selectedAssetKey,
  isComputingStatistics,
  onSelectedAssetChange,
}: {
  assets: Array<{ key: string; label: string }>
  selectedAssetKey: string
  isComputingStatistics: boolean
  onSelectedAssetChange: (assetKey: string) => void
}) {
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
          <Select.Content>
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

function ExpressionRenderControls() {
  return (
    <div className="render-mode-controls">
      <div className="field">
        <Text size="2" weight="medium">
          Band expression
        </Text>
        <TextField.Root aria-label="Band expression" placeholder="(nir-red)/(nir+red)" />
      </div>

      <div className="field">
        <Text size="2" weight="medium">
          Colormap
        </Text>
        <Select.Root defaultValue="viridis">
          <Select.Trigger aria-label="Colormap" />
          <Select.Content>
            <Select.Item value="viridis">viridis</Select.Item>
            <Select.Item value="plasma">plasma</Select.Item>
            <Select.Item value="rdylgn">RdYlGn</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  )
}

function TimelineItemDetails({
  item,
  areaUnit,
}: {
  item: ParsedStacItem
  areaUnit: AreaUnit
}) {
  return (
    <div className="timeline-details">
      <Text size="1" weight="bold">
        {item.id}
      </Text>
      <DataList.Root size="1">
        <TimelineDetail label="Datetime" value={item.datetime ?? 'Unknown'} />
        <TimelineDetail label="Constellation" value={item.constellation ?? 'Unknown'} />
        <TimelineDetail label="Platform" value={item.platform ?? 'Unknown'} />
        <TimelineDetail label="Bands" value={String(item.bandCount)} />
        <TimelineDetail
          label="Coverage"
          value={
            item.areaSquareMeters === null
              ? 'Unknown'
              : formatArea(item.areaSquareMeters, areaUnit)
          }
        />
      </DataList.Root>
    </div>
  )
}

function TimelineDetail({ label, value }: { label: string; value: string }) {
  return (
    <DataList.Item>
      <DataList.Label>{label}</DataList.Label>
      <DataList.Value>{value}</DataList.Value>
    </DataList.Item>
  )
}

function formatTimelineDate(datetime: string | null, index: number): string {
  if (!datetime) {
    return `Item ${index + 1}`
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(datetime))
}
