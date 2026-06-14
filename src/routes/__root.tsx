import { Theme } from '@radix-ui/themes'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { useSystemThemeClass } from '@/hooks/theme/useSystemThemeClass'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  useSystemThemeClass()

  return (
    <Theme accentColor="iris" grayColor="auto" panelBackground="solid" radius="small">
      <Outlet />
    </Theme>
  )
}
