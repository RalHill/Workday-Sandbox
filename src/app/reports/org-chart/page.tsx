import Link from 'next/link'
import { 
  Building2, 
  Download, 
  Filter,
  ChevronRight,
  ChevronDown,
  Users,
  MapPin,
  Briefcase
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import prisma from '@/lib/db'
import { OrgChartTree } from '@/components/reports/org-chart-tree'

/**
 * Workday Organization Chart
 * 
 * The org chart in Workday displays the hierarchical structure based on:
 * - Supervisory Organizations (the primary hierarchy)
 * - Manager relationships
 * - Position/Worker relationships
 * 
 * Key features:
 * - Expandable/collapsible nodes
 * - Worker details in node banners
 * - Navigate to worker profiles
 * - Filter by organization
 */

async function getOrgStructure() {
  // Get all supervisory orgs with their hierarchy
  const supervisoryOrgs = await prisma.supervisoryOrganization.findMany({
    include: {
      manager: {
        include: {
          jobProfile: true,
          location: true,
        }
      },
      workers: {
        include: {
          jobProfile: true,
          position: true,
        },
        where: {
          employmentStatus: 'ACTIVE'
        },
        orderBy: { lastName: 'asc' }
      },
      childOrgs: {
        include: {
          manager: true,
          workers: {
            where: { employmentStatus: 'ACTIVE' }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Build tree structure - find root orgs (no parent)
  const rootOrgs = supervisoryOrgs.filter(org => !org.parentOrgId)
  
  return { supervisoryOrgs, rootOrgs }
}

async function getWorkersByManager() {
  // Get workers grouped by manager for reporting hierarchy view
  const managers = await prisma.worker.findMany({
    where: {
      directReports: {
        some: {}
      }
    },
    include: {
      jobProfile: true,
      location: true,
      supervisoryOrg: true,
      directReports: {
        include: {
          jobProfile: true,
          location: true,
          directReports: {
            include: {
              jobProfile: true,
            }
          }
        },
        where: {
          employmentStatus: 'ACTIVE'
        },
        orderBy: { lastName: 'asc' }
      }
    },
    orderBy: [{ lastName: 'asc' }]
  })

  return managers
}

export default async function OrgChartPage() {
  const { supervisoryOrgs, rootOrgs } = await getOrgStructure()
  const managerHierarchy = await getWorkersByManager()
  
  // Find the CEO/top-level manager (no manager themselves)
  const topLevelManagers = managerHierarchy.filter(m => !m.managerId)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Organization Chart
          </h1>
          <p className="text-muted-foreground">
            View the organizational hierarchy
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-1">Manager Hierarchy</h3>
            <p className="text-sm text-gray-500">View workers by reporting relationship</p>
          </CardContent>
        </Card>
        <Card className="flex-1 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-1">Supervisory Organization</h3>
            <p className="text-sm text-blue-700">View by org structure</p>
          </CardContent>
        </Card>
      </div>

      {/* Org Chart Tree */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {topLevelManagers.map(manager => (
              <OrgChartTree key={manager.id} manager={manager} level={0} />
            ))}
            
            {topLevelManagers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No organization hierarchy found</p>
                <p className="text-sm">Add workers with manager relationships to see the org chart</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supervisory Organizations List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Supervisory Organizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supervisoryOrgs.map(org => (
            <Card key={org.id} className="hover:border-blue-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">{org.code}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{org.workers.length}</span>
                  </div>
                </div>
                
                {org.manager && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Manager</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {org.manager.firstName[0]}{org.manager.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          href={`/workers/${org.manager.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {org.manager.firstName} {org.manager.lastName}
                        </Link>
                        <p className="text-xs text-gray-500">{org.manager.businessTitle}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
