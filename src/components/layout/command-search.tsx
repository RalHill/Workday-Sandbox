'use client'

import { useCallback, useState, useEffect } from 'react'
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
  FlaskConical,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

/**
 * Workday Command Search (Global Search)
 * 
 * Based on Workday 2026R1 design:
 * - Search is the "gateway to work" - start with what you want to achieve
 * - Categories: Tasks, Reports, People, Articles
 * - AI-enhanced search with best-match results
 * - Recent searches and saved categories
 */

interface CommandItem {
  id: string
  name: string
  description?: string
  category: 'task' | 'report' | 'setup' | 'search'
  icon: React.ComponentType<{ className?: string }>
  action: string
  keywords?: string[]
}

// Workday-style command items organized by category
const COMMAND_ITEMS: CommandItem[] = [
  // Tasks - Common staffing and HR actions
  { id: 'hire-employee', name: 'Hire Employee', description: 'Start the hire business process', category: 'task', icon: UserPlus, action: '/staffing/hire', keywords: ['hire', 'new', 'employee', 'onboard', 'recruit'] },
  { id: 'create-position', name: 'Create Position', description: 'Add a new position to your organization', category: 'task', icon: Plus, action: '/positions/create', keywords: ['new', 'add', 'position', 'job', 'headcount'] },
  { id: 'terminate', name: 'Terminate Employee', description: 'Initiate termination business process', category: 'task', icon: Users, action: '/staffing/terminate', keywords: ['term', 'end', 'offboard', 'separation'] },
  { id: 'change-comp', name: 'Request Compensation Change', description: 'Propose a compensation change', category: 'task', icon: Calculator, action: '/compensation/change', keywords: ['salary', 'pay', 'raise', 'compensation', 'merit'] },
  { id: 'edit-bp', name: 'Edit Business Process Definition', description: 'Configure business process steps and rules', category: 'task', icon: Workflow, action: '/setup/business-processes', keywords: ['workflow', 'bp', 'process', 'approval', 'routing'] },
  { id: 'create-org', name: 'Create Supervisory Organization', description: 'Add a new supervisory organization', category: 'task', icon: FolderTree, action: '/organizations/create', keywords: ['org', 'department', 'team', 'hierarchy'] },
  { id: 'transfer', name: 'Transfer Employee', description: 'Move worker to different position', category: 'task', icon: Users, action: '/staffing/transfer', keywords: ['move', 'reassign', 'transfer'] },
  
  // Reports - Workday reporting
  { id: 'headcount-report', name: 'Headcount Report', description: 'View headcount by organization', category: 'report', icon: BarChart3, action: '/reports/headcount', keywords: ['count', 'workers', 'employees', 'fte'] },
  { id: 'org-chart', name: 'View Org Chart', description: 'Navigate organization hierarchy', category: 'report', icon: FolderTree, action: '/reports/org-chart', keywords: ['chart', 'hierarchy', 'structure', 'tree'] },
  { id: 'open-positions', name: 'Open Positions Report', description: 'View vacant positions', category: 'report', icon: Briefcase, action: '/reports/open-positions', keywords: ['vacant', 'unfilled', 'hiring', 'requisition'] },
  { id: 'comp-report', name: 'Compensation Summary', description: 'View compensation data', category: 'report', icon: Calculator, action: '/reports/compensation', keywords: ['salary', 'pay', 'wages', 'total rewards'] },
  { id: 'bp-transactions', name: 'Business Process Transactions', description: 'View BP status and history', category: 'report', icon: ClipboardList, action: '/reports/transactions', keywords: ['workflow', 'pending', 'status', 'audit'] },
  { id: 'worker-history', name: 'Worker History Report', description: 'View worker transaction history', category: 'report', icon: Clock, action: '/reports/worker-history', keywords: ['history', 'audit', 'changes'] },
  
  // Setup & Administration
  { id: 'job-profiles', name: 'Maintain Job Profiles', description: 'Configure job catalog', category: 'setup', icon: Briefcase, action: '/setup/job-profiles', keywords: ['job', 'title', 'catalog', 'profile'] },
  { id: 'security-groups', name: 'Maintain Security Groups', description: 'Configure access permissions', category: 'setup', icon: Shield, action: '/setup/security-groups', keywords: ['access', 'permissions', 'roles', 'security'] },
  { id: 'bp-definitions', name: 'Business Process Definitions', description: 'Configure BP steps and routing', category: 'setup', icon: Workflow, action: '/setup/business-processes', keywords: ['workflow', 'bp', 'approval', 'condition'] },
  { id: 'condition-rules', name: 'Maintain Condition Rules', description: 'Configure BP condition rules', category: 'setup', icon: Settings, action: '/setup/condition-rules', keywords: ['rule', 'condition', 'logic'] },
  { id: 'locations', name: 'Maintain Locations', description: 'Configure work locations', category: 'setup', icon: Building2, action: '/setup/locations', keywords: ['office', 'site', 'address', 'location'] },
  
  // Practice Labs - Sandbox-specific
  { id: 'practice-labs', name: 'Practice Labs', description: 'Hands-on Workday exercises', category: 'task', icon: FlaskConical, action: '/labs', keywords: ['learn', 'practice', 'exercise', 'training', 'lab'] },
]

export function CommandSearch() {
  const router = useRouter()
  const { isCommandOpen, setCommandOpen } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [localOpen, setLocalOpen] = useState(false)

  // Sync zustand state to local state after mount
  useEffect(() => {
    setLocalOpen(isCommandOpen)
  }, [isCommandOpen])

  // Handle dialog open/close
  const handleOpenChange = useCallback((open: boolean) => {
    setLocalOpen(open)
    setCommandOpen(open)
  }, [setCommandOpen])

  const runCommand = useCallback((action: string) => {
    handleOpenChange(false)
    router.push(action)
  }, [router, handleOpenChange])

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
    <CommandDialog open={localOpen} onOpenChange={handleOpenChange}>
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
