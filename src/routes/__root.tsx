import { Theme } from '@radix-ui/themes'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <Theme appearance="dark" accentColor="iris" grayColor="slate" radius="small">
      <Outlet />
    </Theme>
  )
}
