/**
 * NavigationTracker — emits a Sentry breadcrumb on every route change.
 *
 * Mount this once inside the Router (NOT outside it — it needs access to
 * the router context). Each navigation appends a breadcrumb to the current
 * Sentry session so when an error happens, the "Breadcrumbs" tab in
 * Sentry shows the user's path through the app leading up to it.
 */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { addBreadcrumb } from '@/lib/sentry'

export function NavigationTracker(): null {
  const location = useLocation()

  useEffect(() => {
    addBreadcrumb(`Navigated to ${location.pathname}${location.search}`, 'navigation', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    })
  }, [location.pathname, location.search, location.hash])

  return null
}
