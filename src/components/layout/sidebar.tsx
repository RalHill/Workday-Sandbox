'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Building2,
  Briefcase,
  Workflow,
  Shield,
  BarChart3,
  Settings,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Calculator,
  FileText,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAppStore } from '@/store/app-store'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { title: 'Home', href: '/', icon: Home },
      { title: 'My Tasks', href: '/tasks', icon: Workflow, badge: 3 },
    ],
  },
  {
    title: 'Staffing',
    items: [
      { title: 'Workers', href: '/workers', icon: Users },
      { title: 'Positions', href: '/positions', icon: Briefcase },
      { title: 'Organizations', href: '/organizations', icon: FolderTree },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { title: 'Business Processes', href: '/setup/business-processes', icon: Workflow },
      { title: 'Security Groups', href: '/setup/security-groups', icon: Shield },
      { title: 'Job Profiles', href: '/setup/job-profiles', icon: Briefcase },
      { title: 'Calculated Fields', href: '/setup/calculated-fields', icon: Calculator },
    ],
  },
  {
    title: 'Reports',
    items: [
      { title: 'Headcount', href: '/reports/headcount', icon: BarChart3 },
      { title: 'Org Chart', href: '/reports/org-chart', icon: FolderTree },
      { title: 'Custom Reports', href: '/reports/custom', icon: FileText },
    ],
  },
  {
    title: 'Practice',
    items: [
      { title: 'Practice Labs', href: '/labs', icon: FlaskConical },
      { title: 'Sandbox Data', href: '/sandbox', icon: Database },
    ],
  },
]

function NavItemComponent({ 
  item, 
  isCollapsed 
}: { 
  item: NavItem
  isCollapsed: boolean 
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href || 
    (item.href !== '/' && pathname.startsWith(item.href))

  const content = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-muted-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-primary')} />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-background transition-all duration-300',
        isSidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={toggleSidebar}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 px-2">
          {NAV_GROUPS.map((group, index) => (
            <div key={group.title}>
              {!isSidebarCollapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    isCollapsed={isSidebarCollapsed}
                  />
                ))}
              </div>
              {index < NAV_GROUPS.length - 1 && !isSidebarCollapsed && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Settings at bottom */}
      <div className="border-t p-2">
        <NavItemComponent
          item={{ title: 'Settings', href: '/settings', icon: Settings }}
          isCollapsed={isSidebarCollapsed}
        />
      </div>
    </aside>
  )
}
