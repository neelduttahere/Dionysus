import { useNavigate } from '@tanstack/react-router'
import { MapShellContainer } from '@/containers/map/MapShellContainer'
import type { ComposerSearch } from '@/utils/url/composerSearch'
import {
  encodeComposerSearch,
  getMapViewSearch,
  type ShareableMapViewState,
  toMapViewSearch,
} from '@/utils/url/composerSearch'

export function ComposeRoute({ search }: { search: ComposerSearch }) {
  const navigate = useNavigate({ from: '/map/compose' })

  return (
    <MapShellContainer
      activePanel="compose"
      composerState={encodeComposerSearch(search)}
      initialMapViewState={getMapViewSearch(search)}
      hasMapViewSearch={Boolean(getMapViewSearch(search))}
      onMapViewStateCommit={(viewState: ShareableMapViewState) => {
        void navigate({
          search: (previousSearch) => ({
            ...previousSearch,
            ...toMapViewSearch(viewState),
          }),
          replace: true,
        })
      }}
    />
  )
}
