export type ComposerMode = 'single' | 'swipe'

export type RenderMode = 'default' | 'visual' | 'rgb' | 'single-band' | 'expression'

export interface ColorBucket {
  min: number
  max: number
  color: string
}

export interface RenderConfig {
  mode: RenderMode
  assetKeys: string[]
  expression: string
  colormap: string
  appliedExpression?: string
  appliedColormap?: string
  buckets: ColorBucket[]
}

export interface ComposerInstanceState {
  urls: string[]
  activeItemId: string | null
  configs: Record<string, RenderConfig>
}

export interface ComposerState {
  version: 1
  mode: ComposerMode
  swipePosition: number
  single: ComposerInstanceState
  left: ComposerInstanceState
  right: ComposerInstanceState
}
