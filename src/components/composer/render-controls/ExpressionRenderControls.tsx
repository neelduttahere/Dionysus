import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Flex,
  Select,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes'
import { FieldLabelWithInfo } from '@/components/ui/FieldLabelWithInfo'
import { TITILER_COLORMAPS } from '@/utils/titiler/colormaps'

interface ExpressionRenderControlsProps {
  expression: string
  colormap: string
  appliedExpression?: string
  appliedColormap?: string
  isComputingStatistics: boolean
  onExpressionChange: (expression: string) => void
  onColormapChange: (colormap: string) => void
  onCompute: () => void
}

export function ExpressionRenderControls({
  expression,
  colormap,
  appliedExpression,
  appliedColormap,
  isComputingStatistics,
  onExpressionChange,
  onColormapChange,
  onCompute,
}: ExpressionRenderControlsProps) {
  const hasExpression = expression.trim().length > 0
  const hasAppliedExpression = Boolean(appliedExpression?.trim())

  return (
    <div className="render-mode-controls">
      <div className="field">
        <FieldLabelWithInfo
          label="Band expression"
          title="Expression rendering"
          description="Enter a TiTiler expression that combines STAC assets, such as (nir-red)/(nir+red). The map keeps showing the visual asset until you compute the expression."
          side="right"
          align="center"
        />
        <TextField.Root
          aria-label="Band expression"
          value={expression}
          onChange={(event) => onExpressionChange(event.target.value)}
          placeholder="(nir-red)/(nir+red)"
        />
      </div>

      <div className="field">
        <Flex align="center" justify="between">
          <FieldLabelWithInfo
            label="Colormap"
            title="Expression colormap"
            description="Choose the color ramp TiTiler applies to the computed single-band expression result. Diverging ramps work well for normalized indexes, while sequential ramps are better for intensity-style outputs."
            side="right"
            align="center"
          />
          {isComputingStatistics ? (
            <Flex align="center" gap="2">
              <Spinner size="1" />
              <Text size="1" color="gray">
                Computing contrast
              </Text>
            </Flex>
          ) : null}
        </Flex>
        <Select.Root value={colormap || 'viridis'} onValueChange={onColormapChange}>
          <Select.Trigger aria-label="Colormap" />
          <Select.Content>
            {TITILER_COLORMAPS.map((colormapName) => (
              <Select.Item key={colormapName} value={colormapName}>
                {colormapName}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      <Button type="button" onClick={onCompute} disabled={!hasExpression}>
        Compute
      </Button>

      {hasAppliedExpression ? (
        <Text size="1" color="gray" className="active-url">
          Rendering {appliedExpression} with {appliedColormap || colormap}
        </Text>
      ) : (
        <Callout.Root color="blue" variant="surface">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Enter an expression and compute it. Until then, the map renders the
            visual asset.
          </Callout.Text>
        </Callout.Root>
      )}
    </div>
  )
}
