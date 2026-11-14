'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { CommandSearch } from '@/components/layout/command-search'
import { TasksDrawer } from '@/components/layout/tasks-drawer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <CommandSearch />
      <TasksDrawer />
    </TooltipProvider>
  )
}
