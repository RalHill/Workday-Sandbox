import Link from 'next/link'

export const instant = false
import { 
  FolderTree, 
  ChevronRight, 
  Users, 
  Briefcase,
  Building2,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import prisma from '@/lib/db'

interface OrgWithCounts {
  id: string
  code: string
  name: string
  description: string | null
  parentId: string | null
  manager: {
    id: string
    firstName: string
    lastName: string
  } | null
  _count: {
    workers: number
    positions: number
    children: number
  }
  children: OrgWithCounts[]
}

async function getOrgTree(): Promise<OrgWithCounts[]> {
  const orgs = await prisma.supervisoryOrganization.findMany({
    include: {
      manager: {
        select: { id: true, firstName: true, lastName: true }
      },
      _count: {
        select: { workers: true, positions: true, children: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Build tree structure
  const orgMap = new Map(orgs.map(org => [org.id, { ...org, children: [] as OrgWithCounts[] }]))
  const rootOrgs: OrgWithCounts[] = []

  orgs.forEach(org => {
    const orgWithChildren = orgMap.get(org.id)!
    if (org.parentId && orgMap.has(org.parentId)) {
      orgMap.get(org.parentId)!.children.push(orgWithChildren)
    } else {
      rootOrgs.push(orgWithChildren)
    }
  })

  return rootOrgs
}

async function getOrgStats() {
  const [totalOrgs, totalWorkers, openPositions] = await Promise.all([
    prisma.supervisoryOrganization.count(),
    prisma.worker.count({ where: { employmentStatus: 'ACTIVE' } }),
    prisma.position.count({ where: { status: 'OPEN' } }),
  ])

  return { totalOrgs, totalWorkers, openPositions }
}

function OrgTreeNode({ org, level = 0 }: { org: OrgWithCounts; level?: number }) {
  const hasChildren = org.children.length > 0

  return (
    <div className="relative">
      {level > 0 && (
        <div 
          className="absolute left-0 top-0 w-px bg-border"
          style={{ 
            height: '24px',
            marginLeft: `${(level - 1) * 24 + 12}px`
          }}
        />
      )}
      
      <div 
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent group"
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasChildren ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <div className="w-4" />
        )}
        
        <Building2 className="h-4 w-4 text-primary" />
        
        <div className="flex-1 min-w-0">
          <Link 
            href={`/organizations/${org.id}`}
            className="font-medium hover:underline"
          >
            {org.name}
          </Link>
          <span className="text-xs text-muted-foreground ml-2">
            {org.code}
          </span>
        </div>

        {org.manager && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {org.manager.firstName[0]}{org.manager.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">
              {org.manager.firstName} {org.manager.lastName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{org._count.workers}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>{org._count.positions}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="h-4 w-4 mr-2" />
              Add Child Organization
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Position
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Organization
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Inactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && (
        <div>
          {org.children.map((child) => (
            <OrgTreeNode key={child.id} org={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function OrganizationsPage() {
  const [orgTree, stats] = await Promise.all([getOrgTree(), getOrgStats()])

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6" />
            Supervisory Organizations
          </h1>
          <p className="text-muted-foreground">
            Organization hierarchy and structure
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrgs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.openPositions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Org Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Hierarchy</CardTitle>
          <CardDescription>
            Click on an organization to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {orgTree.map((org) => (
              <OrgTreeNode key={org.id} org={org} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
