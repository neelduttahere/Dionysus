import { Text } from '@radix-ui/themes'
import { type MouseEvent, useMemo, useState } from 'react'
import './HistogramChart.css'

export interface HistogramSeries {
  label: string
  color: string
  counts: number[]
  bins: number[]
}

interface HistogramChartProps {
  renderLabel: string
  series: HistogramSeries[]
}

interface HoveredBin {
  series: HistogramSeries
  index: number
  x: number
  y: number
}

interface ChartStats {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

const WIDTH = 360
const HEIGHT = 180
const PADDING = {
  top: 12,
  right: 12,
  bottom: 28,
  left: 58,
}
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom

export function HistogramChart({ renderLabel, series }: HistogramChartProps) {
  const [hoveredBin, setHoveredBin] = useState<HoveredBin | null>(null)
  const chartStats = useMemo(() => getChartStats(series), [series])

  if (series.length === 0 || chartStats.maxY <= 0 || chartStats.maxX <= chartStats.minX) {
    return (
      <div className="histogram-empty">
        <Text size="2" color="gray">
          Histogram data is not available for this statistics response.
        </Text>
      </div>
    )
  }

  return (
    <div className="histogram-chart">
      <HistogramHeader renderLabel={renderLabel} hoveredBin={hoveredBin} />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Raster histogram"
        className="histogram-svg"
        onMouseMove={(event) =>
          setHoveredBin(getHoveredBin(event, series, chartStats))
        }
        onMouseLeave={() => setHoveredBin(null)}
      >
        <title>Raster histogram</title>
        <AxisLines />
        {getTicks(chartStats.minY, chartStats.maxY).map((tick) => {
          const y = scaleY(tick, chartStats.maxY)

          return (
            <g key={`y-${tick}`}>
              <line
                className="histogram-grid-line"
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
              />
              <text
                className="histogram-axis-label"
                x={PADDING.left - 14}
                y={y + 4}
                textAnchor="end"
              >
                {formatTick(tick)}
              </text>
            </g>
          )
        })}
        {getTicks(chartStats.minX, chartStats.maxX).map((tick) => {
          const x = scaleX(tick, chartStats.minX, chartStats.maxX)

          return (
            <g key={`x-${tick}`}>
              <line
                className="histogram-tick-line"
                x1={x}
                x2={x}
                y1={HEIGHT - PADDING.bottom}
                y2={HEIGHT - PADDING.bottom + 4}
              />
              <text
                className="histogram-axis-label"
                x={x}
                y={HEIGHT - PADDING.bottom + 18}
                textAnchor="middle"
              >
                {formatTick(tick)}
              </text>
            </g>
          )
        })}
        {series.map((histogramSeries) => (
          <path
            key={histogramSeries.label}
            d={getSeriesPath(histogramSeries, chartStats.minX, chartStats.maxX, chartStats.maxY)}
            fill="none"
            stroke={histogramSeries.color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}
        {hoveredBin ? (
          <circle
            cx={hoveredBin.x}
            cy={hoveredBin.y}
            r="3"
            fill={hoveredBin.series.color}
          />
        ) : null}
      </svg>
      <div className="histogram-legend">
        {series.map((histogramSeries) => (
          <span key={histogramSeries.label} className="histogram-legend-item">
            <span
              className="histogram-legend-swatch"
              style={{ backgroundColor: histogramSeries.color }}
            />
            <Text size="1">{histogramSeries.label}</Text>
          </span>
        ))}
      </div>
    </div>
  )
}

function AxisLines() {
  return (
    <>
      <line
        className="histogram-axis-line"
        x1={PADDING.left}
        x2={PADDING.left}
        y1={PADDING.top}
        y2={HEIGHT - PADDING.bottom}
      />
      <line
        className="histogram-axis-line"
        x1={PADDING.left}
        x2={WIDTH - PADDING.right}
        y1={HEIGHT - PADDING.bottom}
        y2={HEIGHT - PADDING.bottom}
      />
    </>
  )
}

function HistogramHeader({
  renderLabel,
  hoveredBin,
}: {
  renderLabel: string
  hoveredBin: HoveredBin | null
}) {
  const hoverDescription = getHoverDescription(hoveredBin)

  return (
    <div className="histogram-header">
      <div className="histogram-header-primary">
        <Text as="div" size="2" weight="bold">
          Histogram
        </Text>
        <Text as="div" size="1" color="gray">
          {renderLabel}
        </Text>
      </div>
      <div className="histogram-header-readout">
        <Text as="div" size="1" weight={hoveredBin ? 'bold' : 'regular'}>
          {hoveredBin?.series.label ?? 'Hover to inspect'}
        </Text>
        <Text as="div" size="1" color="gray">
          {hoverDescription}
        </Text>
      </div>
    </div>
  )
}

function getHoverDescription(hoveredBin: HoveredBin | null): string {
  if (!hoveredBin) {
    return 'Value range and count'
  }

  const binStart = hoveredBin.series.bins[hoveredBin.index]
  const binEnd = hoveredBin.series.bins[hoveredBin.index + 1]
  const count = hoveredBin.series.counts[hoveredBin.index]

  return `${formatTick(binStart)} - ${formatTick(binEnd)} · ${formatTick(count)}`
}

function getChartStats(series: HistogramSeries[]): ChartStats {
  const allBins = series.flatMap((histogramSeries) => histogramSeries.bins)
  const allCounts = series.flatMap((histogramSeries) => histogramSeries.counts)
  const minX = Math.min(...allBins)
  const maxX = Math.max(...allBins)
  const maxY = Math.max(...allCounts)

  return {
    minX: Number.isFinite(minX) ? minX : 0,
    maxX: Number.isFinite(maxX) ? maxX : 1,
    minY: 0,
    maxY: Number.isFinite(maxY) ? maxY : 0,
  }
}

function getHoveredBin(
  event: MouseEvent<SVGSVGElement>,
  series: HistogramSeries[],
  chartStats: ChartStats,
): HoveredBin | null {
  const bounds = event.currentTarget.getBoundingClientRect()
  const svgX = ((event.clientX - bounds.left) / bounds.width) * WIDTH

  if (svgX < PADDING.left || svgX > WIDTH - PADDING.right) {
    return null
  }

  const value =
    chartStats.minX +
    ((svgX - PADDING.left) / PLOT_WIDTH) * (chartStats.maxX - chartStats.minX)
  const candidates = series
    .flatMap((histogramSeries) =>
      histogramSeries.counts.map((count, index) => {
        const binStart = histogramSeries.bins[index]
        const binEnd = histogramSeries.bins[index + 1]

        if (
          typeof binStart !== 'number' ||
          typeof binEnd !== 'number' ||
          value < binStart ||
          value > binEnd
        ) {
          return null
        }

        const xStart = scaleX(binStart, chartStats.minX, chartStats.maxX)
        const xEnd = scaleX(binEnd, chartStats.minX, chartStats.maxX)

        return {
          series: histogramSeries,
          index,
          count,
          x: xStart + (xEnd - xStart) / 2,
          y: scaleY(count, chartStats.maxY),
        }
      }),
    )
    .filter(isHoveredBinCandidate)
    .sort((firstCandidate, secondCandidate) => secondCandidate.count - firstCandidate.count)

  return candidates[0] ?? null
}

function isHoveredBinCandidate(
  value: unknown,
): value is HoveredBin & { count: number } {
  return Boolean(value)
}

function getTicks(min: number, max: number): number[] {
  if (max <= min) {
    return [min]
  }

  return [0, 1, 2, 3].map((index) => min + ((max - min) * index) / 3)
}

function getSeriesPath(
  series: HistogramSeries,
  minX: number,
  maxX: number,
  maxY: number,
): string {
  return series.counts
    .map((count, index) => {
      const binStart = series.bins[index]
      const binEnd = series.bins[index + 1]

      if (typeof binStart !== 'number' || typeof binEnd !== 'number') {
        return ''
      }

      const x = scaleX(binStart + (binEnd - binStart) / 2, minX, maxX)
      const y = scaleY(count, maxY)

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .filter(Boolean)
    .join(' ')
}

function scaleX(value: number, minX: number, maxX: number): number {
  return PADDING.left + ((value - minX) / (maxX - minX)) * PLOT_WIDTH
}

function scaleY(value: number, maxY: number): number {
  return PADDING.top + PLOT_HEIGHT - (value / maxY) * PLOT_HEIGHT
}

function formatTick(value: number): string {
  if (Math.abs(value) >= 1000) {
    return Intl.NumberFormat('en', { notation: 'compact' }).format(value)
  }

  if (Math.abs(value) >= 10) {
    return value.toFixed(0)
  }

  return Number(value.toFixed(2)).toString()
}
