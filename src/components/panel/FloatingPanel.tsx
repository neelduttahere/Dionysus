import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon,
  ImageIcon,
} from '@radix-ui/react-icons'
import { IconButton, ScrollArea, Text, Tooltip } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import './FloatingPanel.css'

interface FloatingPanelProps {
  activePanel: 'compose' | 'settings'
  children: ReactNode
}

export function FloatingPanel({ activePanel, children }: FloatingPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={
        isCollapsed ? 'floating-panel floating-panel-collapsed' : 'floating-panel'
      }
      aria-label="Map workspace panel"
    >
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
        {isCollapsed ? (
          <Tooltip content="Expand sidebar">
            <IconButton
              size="3"
              variant="ghost"
              aria-label="Expand sidebar"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </nav>
      <section
        className="floating-panel-body"
        aria-label="Panel content"
        aria-hidden={isCollapsed}
      >
        <div className="floating-panel-header">
          <Text asChild size="1" weight="bold" className="floating-panel-kicker">
            <Link to="/">Dionysus</Link>
          </Text>
          <Tooltip content="Collapse sidebar">
            <IconButton
              size="1"
              variant="outline"
              aria-label="Collapse sidebar"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        </div>
        <ScrollArea className="floating-panel-scroll" scrollbars="vertical" type="hover">
          <div className="floating-panel-content">
            {children}
          </div>
        </ScrollArea>
      </section>
    </aside>
  )
}
