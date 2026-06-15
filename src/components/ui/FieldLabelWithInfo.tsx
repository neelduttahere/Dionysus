import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Flex, HoverCard, Text } from '@radix-ui/themes'
import type { ComponentProps, ReactNode } from 'react'
import './FieldLabelWithInfo.css'

type HoverCardContentProps = ComponentProps<typeof HoverCard.Content>

interface FieldLabelWithInfoProps {
  label: string
  title: string
  description: string
  icon?: ReactNode
  align?: HoverCardContentProps['align']
  side?: HoverCardContentProps['side']
  contentWidth?: HoverCardContentProps['width']
}

export function FieldLabelWithInfo({
  label,
  title,
  description,
  icon,
  align = 'start',
  side,
  contentWidth = '320px',
}: FieldLabelWithInfoProps) {
  return (
    <Flex align="center" gap="2" className="field-label-with-info">
      {icon ? <span className="field-label-leading-icon">{icon}</span> : null}
      <Text size="2" weight="medium">
        {label}
      </Text>
      <HoverCard.Root>
        <HoverCard.Trigger>
          <InfoCircledIcon className="field-label-info-icon" />
        </HoverCard.Trigger>
        <HoverCard.Content align={align} side={side} width={contentWidth}>
          <Flex direction="column" gap="2">
            <Text size="2" weight="bold">
              {title}
            </Text>
            <Text size="2" color="gray">
              {description}
            </Text>
          </Flex>
        </HoverCard.Content>
      </HoverCard.Root>
    </Flex>
  )
}
