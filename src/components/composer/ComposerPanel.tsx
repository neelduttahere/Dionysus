import {
  CalendarIcon,
  ClockIcon,
  CopyIcon,
  InfoCircledIcon,
  MixerVerticalIcon,
} from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Flex,
  Heading,
  ScrollArea,
  SegmentedControl,
  Select,
  Separator,
  Spinner,
  Text,
  TextArea,
} from '@radix-ui/themes'
import { useState } from 'react'
import { ExpressionRenderControls } from '@/components/composer/render-controls/ExpressionRenderControls'
import { SingleBandRenderControls } from '@/components/composer/render-controls/SingleBandRenderControls'
import { formatTimelineDate } from '@/components/composer/timeline/formatTimelineDate'
import { TimelineItemDetails } from '@/components/composer/timeline/TimelineItemDetails'
import { FieldLabelWithInfo } from '@/components/ui/FieldLabelWithInfo'
import type {
  ComposerInstanceState,
  ComposerState,
  RenderConfig,
  RenderMode,
} from '@/types/composer'
import type { AreaUnit } from '@/types/preferences'
import type { ParsedStacItem } from '@/types/stac'
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
  const activeIndex = Math.max(0, instance.urls.indexOf(instance.activeItemId ?? ''))
  const activeItem =
    timelineItems.find((item) => item.url === instance.activeItemId) ??
    timelineItems[0] ??
    null
  const activeConfig = getActiveRenderConfig(instance, activeItem)
  const singleBandAssets = getSingleBandAssetOptions(activeItem)

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
              <FieldLabelWithInfo
                label="Timeline"
                title="Scene timeline"
                description="Switch between the loaded STAC items. Items are sorted by acquisition date, and each selection renders one scene at a time for this composer side."
                icon={<CalendarIcon />}
                side="right"
                align="center"
              />
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
                >
                  <div className="timeline-scroll-content">
                    <SegmentedControl.Root
                      className="timeline-segments"
                      value={instance.activeItemId ?? timelineItems[0]?.url}
                      onValueChange={selectTimelineItem}
                    >
                      {timelineItems.map((item, index) => (
                        <SegmentedControl.Item key={item.url} value={item.url}>
                          <span className="timeline-segment-label">
                            {formatTimelineDate(item.datetime, index)}
                          </span>
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
            {activeItem ? (
              <div className="active-timeline-details">
                <TimelineItemDetails item={activeItem} areaUnit={areaUnit} />
              </div>
            ) : null}
          </div>

          <Separator size="4" />

          <div className="render-controls">
            <div className="field">
              <FieldLabelWithInfo
                label="Render mode"
                title="Imagery render mode"
                description="Choose how the active STAC item is sent to TiTiler. Default and visual use the scene preview, single band inspects one raster asset, and expression computes a band formula with a colormap."
                icon={<MixerVerticalIcon />}
                side="right"
                align="center"
              />
              <Select.Root
                value={activeConfig.mode}
                onValueChange={(value) => updateRenderMode(value as RenderMode)}
              >
                <Select.Trigger aria-label="Render mode" />
                <Select.Content position="popper" side="top">
                  <Select.Item value="default">Default</Select.Item>
                  <Select.Item value="visual" disabled>
                    <span className="render-mode-option">
                      <span>Force TCI asset</span>
                      <span className="render-mode-coming-soon">
                        Coming soon!
                        <ClockIcon />
                      </span>
                    </span>
                  </Select.Item>
                  <Select.Item value="rgb" disabled>
                    <span className="render-mode-option">
                      <span>RGB composite</span>
                      <span className="render-mode-coming-soon">
                        Coming soon!
                        <ClockIcon />
                      </span>
                    </span>
                  </Select.Item>
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

            {activeConfig.mode === 'expression' ? (
              <ExpressionRenderControls
                expression={activeConfig.expression}
                colormap={activeConfig.colormap}
                appliedExpression={activeConfig.appliedExpression}
                appliedColormap={activeConfig.appliedColormap}
                isComputingStatistics={isComputingRasterStatistics}
                onExpressionChange={(expression) =>
                  updateActiveConfig({
                    ...activeConfig,
                    expression,
                  })
                }
                onColormapChange={(colormap) =>
                  updateActiveConfig({
                    ...activeConfig,
                    colormap,
                  })
                }
                onCompute={() => {
                  const expression = activeConfig.expression.trim()

                  if (!expression) {
                    return
                  }

                  updateActiveConfig({
                    ...activeConfig,
                    expression,
                    appliedExpression: expression,
                    appliedColormap: activeConfig.colormap,
                  })
                }}
              />
            ) : null}
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
    appliedExpression: '',
    appliedColormap: 'viridis',
    buckets: [],
  }
}
