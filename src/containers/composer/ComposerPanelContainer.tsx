import { useState } from 'react'
import { ComposerPanel } from '@/components/composer/ComposerPanel'
import { useLoadStacItems } from '@/hooks/api/useLoadStacItems'
import { useParsedStacItems } from '@/hooks/api/useParsedStacItems'
import { useComposerSearchState } from '@/hooks/composer/useComposerSearchState'
import type { ComposerState } from '@/types/composer'
import type { AreaUnit } from '@/types/preferences'
import type { BBox } from '@/utils/geo/bbox'

interface ComposerPanelContainerProps {
  state: ComposerState
  areaUnit: AreaUnit
  isComputingRasterStatistics: boolean
  onFitBounds: (bbox: BBox) => void
}

export function ComposerPanelContainer({
  state,
  areaUnit,
  isComputingRasterStatistics,
  onFitBounds,
}: ComposerPanelContainerProps) {
  const composerSearch = useComposerSearchState(state)
  const loadStacItems = useLoadStacItems()
  const singleItems = useParsedStacItems(state.single.urls)
  const leftItems = useParsedStacItems(state.left.urls)
  const rightItems = useParsedStacItems(state.right.urls)
  const [loadingSide, setLoadingSide] = useState<'single' | 'left' | 'right' | null>(
    null,
  )
  const [loadError, setLoadError] = useState<string | null>(null)

  async function loadUrls(side: 'single' | 'left' | 'right', urls: string[]) {
    setLoadError(null)

    if (urls.length === 0) {
      const emptyInstance = {
        urls: [],
        activeItemId: null,
        configs: {},
      }

      if (side === 'single') {
        composerSearch.updateSingle(emptyInstance)
      } else {
        composerSearch.updateSide(side, emptyInstance)
      }

      return
    }

    setLoadingSide(side)

    try {
      const items = await loadStacItems.mutateAsync(urls)
      const sortedUrls = items.map((item) => item.url)
      const firstItem = items[0]
      const nextInstance = {
        ...(side === 'single' ? state.single : state[side]),
        urls: sortedUrls,
        activeItemId: firstItem?.url ?? null,
      }

      if (side === 'single') {
        composerSearch.updateSingle(nextInstance)
      } else {
        composerSearch.updateSide(side, nextInstance)
      }

      if (side === 'single' && firstItem?.bbox) {
        onFitBounds(firstItem.bbox)
      }
    } catch (error) {
      setLoadError(getLoadErrorMessage(error))
    } finally {
      setLoadingSide(null)
    }
  }

  return (
    <ComposerPanel
      state={state}
      areaUnit={areaUnit}
      isComputingRasterStatistics={isComputingRasterStatistics}
      singleTimelineItems={singleItems.data ?? []}
      leftTimelineItems={leftItems.data ?? []}
      rightTimelineItems={rightItems.data ?? []}
      onModeChange={composerSearch.setMode}
      onLoadSingleUrls={(urls) => loadUrls('single', urls)}
      onLoadSideUrls={(side, urls) => loadUrls(side, urls)}
      onTimelineItemSelect={(item) => {
        if (state.mode === 'single' && item.bbox) {
          onFitBounds(item.bbox)
        }
      }}
      onSingleChange={composerSearch.updateSingle}
      onSideChange={composerSearch.updateSide}
      loadingSide={loadingSide}
      loadError={loadError}
    />
  )
}

function getLoadErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Could not load one or more STAC item URLs.'
}
