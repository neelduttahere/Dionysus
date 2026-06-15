import { Theme } from '@radix-ui/themes'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { NotFoundPage } from '@/components/navigation/NotFoundPage'
import { useSystemThemeClass } from '@/hooks/theme/useSystemThemeClass'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  useSystemThemeClass()

  return (
    <Theme
      accentColor="violet"
      grayColor="mauve"
      panelBackground="solid"
      radius="medium"
      scaling="95%"
    >
      <Outlet />
    </Theme>
  )
}
