import { useNavigate } from '@tanstack/react-router'
import type { ComposerInstanceState, ComposerState } from '@/types/composer'
import { toComposerSearch } from '@/utils/url/composerSearch'

export function useComposerSearchState(state: ComposerState) {
  const navigate = useNavigate({ from: '/map/compose' })

  function setState(nextState: ComposerState) {
    void navigate({
      search: toComposerSearch(nextState),
      replace: true,
    })
  }

  function updateSingle(nextInstance: ComposerInstanceState) {
    setState({
      ...state,
      single: nextInstance,
    })
  }

  function updateSide(side: 'left' | 'right', nextInstance: ComposerInstanceState) {
    setState({
      ...state,
      [side]: nextInstance,
    })
  }

  function setMode(mode: ComposerState['mode']) {
    setState({
      ...state,
      mode,
    })
  }

  return {
    setState,
    updateSingle,
    updateSide,
    setMode,
  }
}
