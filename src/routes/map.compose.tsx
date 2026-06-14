import { MapShellContainer } from '@/containers/map/MapShellContainer'
import type { ComposerSearch } from '@/utils/url/composerSearch'
import { encodeComposerSearch } from '@/utils/url/composerSearch'

export function ComposeRoute({ search }: { search: ComposerSearch }) {
  return (
    <MapShellContainer
      activePanel="compose"
      composerState={encodeComposerSearch(search)}
    />
  )
}
