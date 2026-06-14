import { GearIcon, ImageIcon } from '@radix-ui/react-icons'
import { Button, IconButton, ScrollArea, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import './FloatingPanel.css'

interface FloatingPanelProps {
  activePanel: 'compose' | 'settings'
  children: ReactNode
}

export function FloatingPanel({ activePanel, children }: FloatingPanelProps) {
  return (
    <aside className="floating-panel" aria-label="Map workspace panel">
      <nav className="floating-panel-sidebar" aria-label="Panel routes">
        <IconButton asChild variant={activePanel === 'compose' ? 'solid' : 'ghost'}>
          <Link to="/map/compose" aria-label="Composer">
            <ImageIcon />
          </Link>
        </IconButton>
        <IconButton asChild variant={activePanel === 'settings' ? 'solid' : 'ghost'}>
          <Link to="/map/settings" aria-label="Settings">
            <GearIcon />
          </Link>
        </IconButton>
      </nav>
      <section className="floating-panel-body" aria-label="Panel content">
        <ScrollArea className="floating-panel-scroll" scrollbars="vertical" type="hover">
          <div className="floating-panel-content">
            <div className="floating-panel-header">
              <Text size="1" weight="bold" className="floating-panel-kicker">
                Dionysus
              </Text>
              <Button asChild size="1" variant="ghost">
                <Link to="/">Home</Link>
              </Button>
            </div>
            {children}
          </div>
        </ScrollArea>
      </section>
    </aside>
  )
}
