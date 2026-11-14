'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { TasksDrawer } from '@/components/layout/tasks-drawer'

/**
 * Application providers wrapper
 * - TooltipProvider for shadcn tooltips
 * - TasksDrawer (Workday Inbox) for task management
 * 
 * Note: CommandSearch is rendered in layout.tsx
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <TasksDrawer />
    </TooltipProvider>
  )
}
