const EXPRESSION_RESERVED_WORDS = new Set([
  'abs',
  'acos',
  'asin',
  'atan',
  'cos',
  'exp',
  'log',
  'log10',
  'max',
  'min',
  'nan',
  'pi',
  'sin',
  'sqrt',
  'tan',
  'where',
])

export function getExpressionAssetKeys(expression: string): string[] {
  return getExpressionRenderParams(expression).assets
}

export function getExpressionRenderParams(expression: string): {
  assets: string[]
  expression: string
} {
  const assetKeys = new Set<string>()
  const tokenPattern = /[A-Za-z_][A-Za-z0-9_]*/g
  const matches = expression.matchAll(tokenPattern)

  for (const match of matches) {
    const token = match[0]

    if (!EXPRESSION_RESERVED_WORDS.has(token.toLowerCase())) {
      assetKeys.add(token)
    }
  }

  const assets = [...assetKeys]
  const expressionByAsset = new Map(
    assets.map((assetKey, index) => [assetKey, `b${index + 1}`]),
  )
  const titilerExpression = expression.replace(tokenPattern, (token) => {
    if (EXPRESSION_RESERVED_WORDS.has(token.toLowerCase())) {
      return token
    }

    return expressionByAsset.get(token) ?? token
  })

  return {
    assets,
    expression: titilerExpression,
  }
}
