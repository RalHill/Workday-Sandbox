'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
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
  TrendingUp,
  Loader2
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { globalSearch } from '@/actions'


/**
 * Workday Command Search (Global Search)
 * 
 * Based on Workday 2026R1 design:
 * - Search is the "gateway to work" - start with what you want to achieve
 * - Categories: Tasks, Reports, People, Articles
 * - AI-enhanced search with best-match results
 * - Recent searches and saved categories
 */

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface CommandItemType {
  id: string
  name: string
  description?: string
  category: 'task' | 'report' | 'setup' | 'search'
  icon: React.ComponentType<{ className?: string }>
  action: string
  keywords?: string[]
}

interface SearchResult {
  workers: Array<{
    id: string
    workerId: string
    firstName: string
    lastName: string
    businessTitle: string | null
  }>
  positions: Array<{
    id: string
    positionId: string
    title: string
    status: string
  }>
  organizations: Array<{
    id: string
    code: string
    name: string
  }>
}

// Workday-style command items organized by category
const COMMAND_ITEMS: CommandItemType[] = [
  // Tasks - Common staffing and HR actions
  { id: 'hire-employee', name: 'Hire Employee', description: 'Start the hire business process', category: 'task', icon: UserPlus, action: '/staffing/hire', keywords: ['hire', 'new', 'employee', 'onboard', 'recruit'] },
  { id: 'create-position', name: 'Create Position', description: 'Add a new position to your organization', category: 'task', icon: Plus, action: '/staffing/create-position', keywords: ['new', 'add', 'position', 'job', 'headcount'] },
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
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Perform global search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true)
      globalSearch(debouncedQuery, 5)
        .then(results => {
          setSearchResults(results)
          setIsSearching(false)
        })
        .catch(error => {
          console.error('Search error:', error)
          setIsSearching(false)
        })
    } else {
      setSearchResults(null)
    }
  }, [debouncedQuery])

  // Clear results when dialog closes
  useEffect(() => {
    if (!isCommandOpen) {
      setSearchQuery('')
      setSearchResults(null)
    }
  }, [isCommandOpen])

  // Handle dialog open/close
  const handleOpenChange = useCallback((open: boolean) => {
    setCommandOpen(open)
  }, [setCommandOpen])

  const runCommand = useCallback((action: string) => {
    handleOpenChange(false)
    router.push(action)
  }, [router, handleOpenChange])

  // Filter static items based on search
  const filteredItems = useMemo(() => {
    return COMMAND_ITEMS.filter(item => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.keywords?.some(k => k.toLowerCase().includes(query))
      )
    })
  }, [searchQuery])

  const taskItems = filteredItems.filter(i => i.category === 'task')
  const reportItems = filteredItems.filter(i => i.category === 'report')
  const setupItems = filteredItems.filter(i => i.category === 'setup')

  // Check if we have any results
  const hasStaticResults = filteredItems.length > 0
  const hasDynamicResults = searchResults && (
    searchResults.workers.length > 0 ||
    searchResults.positions.length > 0 ||
    searchResults.organizations.length > 0
  )
  const hasResults = hasStaticResults || hasDynamicResults

  return (
    <CommandDialog open={isCommandOpen} onOpenChange={handleOpenChange}>
      <CommandInput 
        placeholder="Search tasks, reports, workers, positions..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {!hasResults && !isSearching && searchQuery && (
          <CommandEmpty>
            <div className="flex flex-col items-center py-6 text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No results found.</p>
              <p className="text-xs text-muted-foreground">Try searching for a task, report, or worker name.</p>
            </div>
          </CommandEmpty>
        )}

        {isSearching && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Dynamic search results - Workers */}
        {searchResults && searchResults.workers.length > 0 && (
          <CommandGroup heading="Workers">
            {searchResults.workers.map((worker) => (
              <CommandItem
                key={worker.id}
                value={`worker-${worker.workerId}`}
                onSelect={() => runCommand(`/workers/${worker.id}`)}
                className="flex items-center gap-3"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{worker.firstName} {worker.lastName}</span>
                  <span className="text-xs text-muted-foreground">
                    {worker.businessTitle || worker.workerId}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Dynamic search results - Positions */}
        {searchResults && searchResults.positions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Positions">
              {searchResults.positions.map((position) => (
                <CommandItem
                  key={position.id}
                  value={`position-${position.positionId}`}
                  onSelect={() => runCommand(`/positions/${position.id}`)}
                  className="flex items-center gap-3"
                >
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{position.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {position.positionId} • {position.status}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Dynamic search results - Organizations */}
        {searchResults && searchResults.organizations.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Organizations">
              {searchResults.organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={`org-${org.code}`}
                  onSelect={() => runCommand(`/organizations/${org.id}`)}
                  className="flex items-center gap-3"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{org.name}</span>
                    <span className="text-xs text-muted-foreground">{org.code}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Static command items */}
        {taskItems.length > 0 && (
          <>
            {(hasDynamicResults) && <CommandSeparator />}
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
          </>
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
