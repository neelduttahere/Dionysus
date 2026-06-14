import { createRoute } from '@tanstack/react-router'
import { createElement } from 'react'
import { composerSearchSchema } from '@/utils/url/composerSearch'
import { LandingPage } from './routes'
import { Route as rootRoute } from './routes/__root'
import { MapRedirect } from './routes/map'
import { ComposeRoute } from './routes/map.compose'
import { SettingsRoute } from './routes/map.settings'

const IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const MapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/map',
  component: MapRedirect,
})

const MapComposeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/map/compose',
  validateSearch: composerSearchSchema,
  component: function MapComposeRouteComponent() {
    return createElement(ComposeRoute, {
      search: MapComposeRoute.useSearch(),
    })
  },
})

const MapSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/map/settings',
  component: SettingsRoute,
})

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  MapRoute,
  MapComposeRoute,
  MapSettingsRoute,
])
