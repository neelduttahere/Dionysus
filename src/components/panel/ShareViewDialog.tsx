import { CheckIcon, CopyIcon, Share2Icon } from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Dialog,
  Flex,
  IconButton,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { useState } from 'react'
import './ShareViewDialog.css'

export function ShareViewDialog() {
  const [shareUrl, setShareUrl] = useState('')
  const [hasCopied, setHasCopied] = useState(false)

  function refreshShareUrl() {
    setShareUrl(window.location.href)
    setHasCopied(false)
  }

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl)
    setHasCopied(true)
  }

  return (
    <Dialog.Root onOpenChange={(isOpen) => (isOpen ? refreshShareUrl() : null)}>
      <Tooltip content="Share view">
        <Dialog.Trigger>
          <IconButton size="1" variant="ghost" aria-label="Share view">
            <Share2Icon />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>

      <Dialog.Content width="min(560px, calc(100vw - 32px))">
        <Dialog.Title>Share View</Dialog.Title>
        <Dialog.Description size="2" color="gray">
          Copy a link to the current Dionysus view.
        </Dialog.Description>

        <Callout.Root color="blue" variant="surface" className="share-view-callout">
          <Callout.Icon>
            <Share2Icon />
          </Callout.Icon>
          <Callout.Text>
            Shared links include the loaded STAC URLs, selected scene, render
            configuration, swipe mode state, and current map center and zoom. The map
            position updates in the URL after pan or zoom interactions finish.
          </Callout.Text>
        </Callout.Root>

        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            Link
          </Text>
          <Flex gap="2" align="center">
            <TextField.Root
              aria-label="Share view link"
              value={shareUrl}
              readOnly
              className="share-view-field"
            />
            <Button type="button" onClick={copyShareUrl}>
              {hasCopied ? <CheckIcon /> : <CopyIcon />}
              {hasCopied ? 'Copied' : 'Copy'}
            </Button>
          </Flex>
        </Flex>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button type="button" variant="surface">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
