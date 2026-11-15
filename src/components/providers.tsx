'use client'

import { TooltipProvider } from '@/components/ui/tooltip'

/**
 * Application providers wrapper
 * - TooltipProvider for shadcn tooltips
 * 
 * Note: CommandSearch and TasksDrawer are now in ClientOverlays (layout.tsx)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  )
}
