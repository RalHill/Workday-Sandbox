'use client'

import dynamic from 'next/dynamic'

/**
 * Client-side wrapper for command search and tasks drawer
 * Uses dynamic import with ssr: false to prevent hydration mismatches
 * from zustand persist middleware.
 */

const CommandSearch = dynamic(
  () => import('./command-search').then(mod => ({ default: mod.CommandSearch })),
  { ssr: false }
)

const TasksDrawer = dynamic(
  () => import('./tasks-drawer').then(mod => ({ default: mod.TasksDrawer })),
  { ssr: false }
)

export function ClientOverlays() {
  return (
    <>
      <CommandSearch />
      <TasksDrawer />
    </>
  )
}
