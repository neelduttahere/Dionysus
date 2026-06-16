import { Cross2Icon, MixerVerticalIcon } from '@radix-ui/react-icons'
import {
  Callout,
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  SegmentedControl,
  Select,
  Separator,
  Spinner,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import type { StacStatisticsResponse, StatisticsBand } from '@/api/titiler/endpoints'
import {
  HistogramChart,
  type HistogramSeries,
} from '@/components/map/inspector/HistogramChart'
import type { ComposerMode } from '@/types/composer'
import './PixelInspectorButton.css'

export interface InspectorTarget {
  label: string
  itemLabel: string | null
  renderLabel: string
  statistics: StacStatisticsResponse | undefined
  isLoading: boolean
  isError: boolean
  isEnabled: boolean
}

interface PixelInspectorButtonProps {
  mode: ComposerMode
  single: InspectorTarget
  left: InspectorTarget
  right: InspectorTarget
  hoveredSide: 'left' | 'right' | null
  histogramBins: number
  onHistogramBinsChange: (histogramBins: number) => void
}

const HISTOGRAM_COLORS = ['#e5484d', '#30a46c', '#3e63dd', '#f76808']
const HISTOGRAM_BIN_OPTIONS = [5, 15, 25, 35, 45, 55, 60]

export function PixelInspectorButton({
  mode,
  single,
  left,
  right,
  hoveredSide,
  histogramBins,
  onHistogramBinsChange,
}: PixelInspectorButtonProps) {
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left')
  const [isPopoverHovered, setIsPopoverHovered] = useState(false)
  const activeTarget = mode === 'swipe' ? (activeSide === 'left' ? left : right) : single

  useEffect(() => {
    if (mode !== 'swipe' || isPopoverHovered || !hoveredSide) {
      return
    }

    setActiveSide(hoveredSide)
  }, [hoveredSide, isPopoverHovered, mode])

  return (
    <Popover.Root>
      <Tooltip content="Inspector">
        <Popover.Trigger>
          <IconButton
            variant="solid"
            size="3"
            aria-label="Open inspector"
            className="map-overlay-control"
          >
            <MixerVerticalIcon />
          </IconButton>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content
        width="390px"
        className="pixel-inspector-popover"
        align="end"
        side="left"
        sideOffset={12}
        onInteractOutside={(event) => event.preventDefault()}
        onMouseEnter={() => setIsPopoverHovered(true)}
        onMouseLeave={() => setIsPopoverHovered(false)}
      >
        <Flex direction="column" gap="3">
          <Flex align="start" justify="between" gap="3">
            <Text as="div" size="3" weight="bold">
              Inspector
            </Text>
            <Popover.Close>
              <IconButton size="1" variant="ghost" aria-label="Close inspector">
                <Cross2Icon />
              </IconButton>
            </Popover.Close>
          </Flex>

          {mode === 'single' ? <Separator size="4" /> : null}

          <Flex align="center" justify="between" gap="3">
            {mode === 'swipe' ? (
              <SegmentedControl.Root
                value={activeSide}
                onValueChange={(value) => setActiveSide(value as 'left' | 'right')}
              >
                <SegmentedControl.Item value="left">Left</SegmentedControl.Item>
                <SegmentedControl.Item value="right">Right</SegmentedControl.Item>
              </SegmentedControl.Root>
            ) : (
              <Text size="1" color="gray">
                Histogram settings
              </Text>
            )}
            <Flex align="center" gap="2">
              <Text size="1" color="gray">
                Bins
              </Text>
              <Select.Root
                value={String(histogramBins)}
                onValueChange={(value) => onHistogramBinsChange(Number(value))}
              >
                <Select.Trigger aria-label="Histogram bins" />
                <Select.Content position="popper" side="top">
                  {HISTOGRAM_BIN_OPTIONS.map((option) => (
                    <Select.Item key={option} value={String(option)}>
                      {option}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>

          <ScrollArea
            className="pixel-inspector-scroll"
            scrollbars="vertical"
            type="hover"
          >
            <div className="pixel-inspector-content">
              <InspectorHistogram target={activeTarget} />
            </div>
          </ScrollArea>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}

function InspectorHistogram({ target }: { target: InspectorTarget }) {
  if (!target.isEnabled) {
    return (
      <Callout.Root color="blue" variant="surface" className="pixel-inspector-state">
        <Callout.Icon>
          <MixerVerticalIcon />
        </Callout.Icon>
        <Callout.Text>Load a STAC item to inspect histogram statistics.</Callout.Text>
      </Callout.Root>
    )
  }

  if (target.isLoading) {
    return (
      <Flex className="pixel-inspector-loading" justify="center" align="center">
        <Flex gap="2" align="center">
          <Spinner size="2" />
          <Text size="2" color="gray">
            Loading histogram statistics
          </Text>
        </Flex>
      </Flex>
    )
  }

  if (target.isError) {
    return (
      <Callout.Root color="red" variant="surface" className="pixel-inspector-state">
        <Callout.Icon>
          <MixerVerticalIcon />
        </Callout.Icon>
        <Callout.Text>
          TiTiler could not return statistics for this render configuration.
        </Callout.Text>
      </Callout.Root>
    )
  }

  return (
    <HistogramChart
      renderLabel={target.itemLabel ? target.renderLabel : 'No active STAC item'}
      series={toHistogramSeries(target.statistics)}
    />
  )
}

function toHistogramSeries(
  statistics: StacStatisticsResponse | undefined,
): HistogramSeries[] {
  if (!statistics) {
    return []
  }

  return getStatisticsBands(statistics)
    .filter((entry) => entry.band.histogram)
    .map((entry, index) => {
      const histogram = entry.band.histogram as [number[], number[]]

      return {
        label: entry.label,
        color: HISTOGRAM_COLORS[index % HISTOGRAM_COLORS.length],
        counts: histogram[0],
        bins: histogram[1],
      }
    })
}

function getStatisticsBands(
  statistics: StacStatisticsResponse,
): Array<{ label: string; band: StatisticsBand }> {
  const bands: Array<{ label: string; band: StatisticsBand }> = []

  for (const [outerKey, outerValue] of Object.entries(statistics)) {
    if (isStatisticsBand(outerValue)) {
      bands.push({ label: outerKey, band: outerValue })
      continue
    }

    for (const [bandKey, bandValue] of Object.entries(outerValue)) {
      if (isStatisticsBand(bandValue)) {
        bands.push({ label: `${outerKey} ${bandKey}`, band: bandValue })
      }
    }
  }

  return bands
}

function isStatisticsBand(value: unknown): value is StatisticsBand {
  if (!value || typeof value !== 'object') {
    return false
  }

  const band = value as StatisticsBand

  return (
    Array.isArray(band.histogram) ||
    typeof band.min === 'number' ||
    typeof band.max === 'number'
  )
}
