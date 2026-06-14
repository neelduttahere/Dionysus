import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import { z } from 'zod'
import type { ComposerState } from '@/types/composer'

export const composerSearchSchema = z
  .object({
    s: z.string().optional(),
  })
  .catch({})

export type ComposerSearch = z.infer<typeof composerSearchSchema>

export const emptyComposerInstance = {
  urls: [],
  activeItemId: null,
  configs: {},
}

export const defaultComposerState: ComposerState = {
  version: 1,
  mode: 'single',
  swipePosition: 50,
  single: emptyComposerInstance,
  left: emptyComposerInstance,
  right: emptyComposerInstance,
}

export function encodeComposerState(state: ComposerState): string {
  return compressToEncodedURIComponent(JSON.stringify(state))
}

export function decodeComposerState(encodedState: string | undefined): ComposerState {
  if (!encodedState) {
    return defaultComposerState
  }

  try {
    const json = decompressFromEncodedURIComponent(encodedState)

    if (!json) {
      return defaultComposerState
    }

    return normalizeComposerState(JSON.parse(json))
  } catch {
    return defaultComposerState
  }
}

export function encodeComposerSearch(search: ComposerSearch): ComposerState {
  return decodeComposerState(search.s)
}

export function toComposerSearch(state: ComposerState): ComposerSearch {
  return {
    s: encodeComposerState(normalizeComposerState(state)),
  }
}

export function normalizeComposerState(value: unknown): ComposerState {
  const state = value as Partial<ComposerState>

  return {
    version: 1,
    mode: state.mode === 'swipe' ? 'swipe' : 'single',
    swipePosition: clampSwipePosition(state.swipePosition),
    single: {
      ...emptyComposerInstance,
      ...state.single,
      urls: Array.isArray(state.single?.urls) ? state.single.urls : [],
      configs: state.single?.configs ?? {},
    },
    left: {
      ...emptyComposerInstance,
      ...state.left,
      urls: Array.isArray(state.left?.urls) ? state.left.urls : [],
      configs: state.left?.configs ?? {},
    },
    right: {
      ...emptyComposerInstance,
      ...state.right,
      urls: Array.isArray(state.right?.urls) ? state.right.urls : [],
      configs: state.right?.configs ?? {},
    },
  }
}

function clampSwipePosition(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 50
  }

  return Math.min(90, Math.max(10, value))
}
