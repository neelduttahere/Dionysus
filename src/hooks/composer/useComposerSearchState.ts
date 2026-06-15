import { useNavigate } from '@tanstack/react-router'
import type { ComposerInstanceState, ComposerMode, ComposerState } from '@/types/composer'
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

  function setMode(mode: ComposerMode) {
    if (
      mode === 'swipe' &&
      state.single.urls.length > 0 &&
      !hasComposerInstanceState(state.left) &&
      !hasComposerInstanceState(state.right)
    ) {
      const left = cloneComposerInstance(state.single)
      const right = cloneComposerInstance(state.single)

      setState({
        ...state,
        mode,
        left,
        right,
      })
      return
    }

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

function hasComposerInstanceState(instance: ComposerInstanceState): boolean {
  return (
    instance.urls.length > 0 ||
    Boolean(instance.activeItemId) ||
    Object.keys(instance.configs).length > 0
  )
}

function cloneComposerInstance(
  instance: ComposerInstanceState,
): ComposerInstanceState {
  return {
    urls: [...instance.urls],
    activeItemId: instance.activeItemId,
    configs: structuredClone(instance.configs),
  }
}
