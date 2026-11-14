'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  Settings, 
  Plus,
  Search,
  UserPlus,
  ClipboardList,
  Shield,
  BarChart3,
  Workflow,
  FolderTree,
  Calculator,
  FlaskConical
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

interface CommandItem {
  id: string
  name: string
  description?: string
  category: 'task' | 'report' | 'setup' | 'search'
  icon: React.ComponentType<{ className?: string }>
  action: string
  keywords?: string[]
}

const COMMAND_ITEMS: CommandItem[] = [
  // Tasks
  { id: 'create-position', name: 'Create Position', category: 'task', icon: Plus, action: '/positions/create', keywords: ['new', 'add', 'position', 'job'] },
  { id: 'hire-employee', name: 'Hire Employee', category: 'task', icon: UserPlus, action: '/staffing/hire', keywords: ['hire', 'new', 'employee', 'onboard'] },
  { id: 'change-comp', name: 'Request Compensation Change', category: 'task', icon: Calculator, action: '/compensation/change', keywords: ['salary', 'pay', 'raise', 'compensation'] },
  { id: 'terminate', name: 'Terminate Employee', category: 'task', icon: Users, action: '/staffing/terminate', keywords: ['term', 'end', 'offboard'] },
  { id: 'edit-bp', name: 'Edit Business Process', category: 'task', icon: Workflow, action: '/setup/business-processes', keywords: ['workflow', 'bp', 'process', 'approval'] },
  { id: 'create-org', name: 'Create Supervisory Organization', category: 'task', icon: FolderTree, action: '/organizations/create', keywords: ['org', 'department', 'team'] },
  
  // Reports
  { id: 'headcount-report', name: 'Headcount Report', category: 'report', icon: BarChart3, action: '/reports/headcount', keywords: ['count', 'workers', 'employees'] },
  { id: 'org-chart', name: 'Organization Chart', category: 'report', icon: FolderTree, action: '/reports/org-chart', keywords: ['chart', 'hierarchy', 'structure'] },
  { id: 'open-positions', name: 'Open Positions Report', category: 'report', icon: Briefcase, action: '/reports/open-positions', keywords: ['vacant', 'unfilled', 'hiring'] },
  { id: 'comp-report', name: 'Compensation Summary', category: 'report', icon: Calculator, action: '/reports/compensation', keywords: ['salary', 'pay', 'wages'] },
  { id: 'bp-transactions', name: 'Business Process Transactions', category: 'report', icon: ClipboardList, action: '/reports/transactions', keywords: ['workflow', 'pending', 'status'] },
  
  // Setup
  { id: 'job-profiles', name: 'Maintain Job Profiles', category: 'setup', icon: Briefcase, action: '/setup/job-profiles', keywords: ['job', 'title', 'catalog'] },
  { id: 'security-groups', name: 'Maintain Security Groups', category: 'setup', icon: Shield, action: '/setup/security-groups', keywords: ['access', 'permissions', 'roles'] },
  { id: 'bp-definitions', name: 'Business Process Definitions', category: 'setup', icon: Workflow, action: '/setup/business-processes', keywords: ['workflow', 'bp', 'approval'] },
  { id: 'locations', name: 'Maintain Locations', category: 'setup', icon: Building2, action: '/setup/locations', keywords: ['office', 'site', 'address'] },
  { id: 'cost-centers', name: 'Maintain Cost Centers', category: 'setup', icon: Calculator, action: '/setup/cost-centers', keywords: ['budget', 'finance', 'cc'] },
  
  // Practice Labs
  { id: 'practice-labs', name: 'Practice Labs', category: 'task', icon: FlaskConical, action: '/labs', keywords: ['learn', 'practice', 'exercise', 'training'] },
]

export function CommandSearch() {
  const router = useRouter()
  const { isCommandOpen, setCommandOpen } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  const runCommand = useCallback((action: string) => {
    setCommandOpen(false)
    router.push(action)
  }, [router, setCommandOpen])

  // Filter items based on search
  const filteredItems = COMMAND_ITEMS.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.keywords?.some(k => k.toLowerCase().includes(query))
    )
  })

  const taskItems = filteredItems.filter(i => i.category === 'task')
  const reportItems = filteredItems.filter(i => i.category === 'report')
  const setupItems = filteredItems.filter(i => i.category === 'setup')

  return (
    <CommandDialog open={isCommandOpen} onOpenChange={setCommandOpen}>
      <CommandInput 
        placeholder="Search tasks, reports, people..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center py-6 text-center">
            <Search className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No results found.</p>
            <p className="text-xs text-muted-foreground">Try searching for a task, report, or worker name.</p>
          </div>
        </CommandEmpty>

        {taskItems.length > 0 && (
          <CommandGroup heading="Tasks">
            {taskItems.map((item) => (
              <CommandItem
                key={item.id}
                value={item.name}
                onSelect={() => runCommand(item.action)}
                className="flex items-center gap-3"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {reportItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Reports">
              {reportItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => runCommand(item.action)}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {setupItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Setup & Administration">
              {setupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => runCommand(item.action)}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem 
            value="search-workers"
            onSelect={() => runCommand('/workers')}
            className="flex items-center gap-3"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Search Workers</span>
            <CommandShortcut>⌘W</CommandShortcut>
          </CommandItem>
          <CommandItem 
            value="search-positions"
            onSelect={() => runCommand('/positions')}
            className="flex items-center gap-3"
          >
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>Search Positions</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem 
            value="search-orgs"
            onSelect={() => runCommand('/organizations')}
            className="flex items-center gap-3"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>Search Organizations</span>
            <CommandShortcut>⌘O</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
