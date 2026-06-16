import type { ComposerInstanceState } from '@/types/composer'
import { getExpressionRenderParams } from '@/utils/titiler/expressions'

export interface TileRenderRequest {
  kind: 'visual' | 'single-band' | 'expression'
  assets: string[]
  expression?: string
  colormapName?: string
  assetAsBand?: boolean
}

export function getInstanceRenderRequest(
  instance: ComposerInstanceState,
): TileRenderRequest {
  const activeItemId = instance.activeItemId

  if (!activeItemId) {
    return getVisualRenderRequest()
  }

  const config = instance.configs[activeItemId]

  if (config?.mode === 'single-band' && config.assetKeys[0]) {
    return {
      kind: 'single-band',
      assets: [config.assetKeys[0]],
    }
  }

  if (config?.mode === 'expression' && config.appliedExpression?.trim()) {
    const expression = config.appliedExpression.trim()
    const expressionParams = getExpressionRenderParams(expression)

    if (expressionParams.assets.length === 0) {
      return getVisualRenderRequest()
    }

    return {
      kind: 'expression',
      assets: expressionParams.assets,
      expression: expressionParams.expression,
      colormapName: (config.appliedColormap || config.colormap).toLowerCase(),
      assetAsBand: true,
    }
  }

  return getVisualRenderRequest()
}

function getVisualRenderRequest(): TileRenderRequest {
  return {
    kind: 'visual',
    assets: ['visual'],
  }
}
