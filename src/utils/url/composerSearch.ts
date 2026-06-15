import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import { z } from 'zod'
import type { ComposerState } from '@/types/composer'

export const composerSearchSchema = z
  .object({
    s: z.string().optional(),
    lng: z.coerce.number().optional(),
    lat: z.coerce.number().optional(),
    z: z.coerce.number().optional(),
  })
  .catch({})

export type ComposerSearch = z.infer<typeof composerSearchSchema>

export interface ShareableMapViewState {
  longitude: number
  latitude: number
  zoom: number
}

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
  const { swipePosition: _swipePosition, ...shareableState } =
    normalizeComposerState(state)

  return compressToEncodedURIComponent(JSON.stringify(shareableState))
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

export function getMapViewSearch(search: ComposerSearch): ShareableMapViewState | null {
  if (
    typeof search.lng !== 'number' ||
    typeof search.lat !== 'number' ||
    typeof search.z !== 'number' ||
    Number.isNaN(search.lng) ||
    Number.isNaN(search.lat) ||
    Number.isNaN(search.z)
  ) {
    return null
  }

  return {
    longitude: clamp(search.lng, -180, 180),
    latitude: clamp(search.lat, -85, 85),
    zoom: clamp(search.z, 0, 22),
  }
}

export function toMapViewSearch(viewState: ShareableMapViewState): ComposerSearch {
  return {
    lng: roundCoordinate(viewState.longitude),
    lat: roundCoordinate(viewState.latitude),
    z: roundZoom(viewState.zoom),
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function roundCoordinate(value: number): number {
  return Number(value.toFixed(5))
}

function roundZoom(value: number): number {
  return Number(value.toFixed(2))
}
