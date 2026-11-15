import Link from 'next/link'
import { 
  Shield, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Lock,
  Key,
  Eye,
  Edit,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import prisma from '@/lib/db'

/**
 * Workday Security Configuration
 * 
 * Workday security is built on these concepts:
 * 
 * 1. Security Groups - Collections of users with specific permissions
 *    - User-Based: Assigned directly to workers (system-wide access)
 *    - Role-Based: Assigned via roles to organizations (constrained access)
 *    - Unconstrained: Role-based but not limited by org
 * 
 * 2. Security Domains - Categories of data/actions to secure
 *    - Worker Data, Compensation Data, Position Data, etc.
 * 
 * 3. Security Policies - Rules connecting domains to groups
 *    - View (Get), Modify (Put), Report access
 * 
 * 4. Domain Security - What data can be accessed
 * 5. Business Process Security - Who can initiate/approve transactions
 */

async function getSecurityGroups() {
  return prisma.securityGroup.findMany({
    include: {
      members: {
        take: 5,
      },
      _count: {
        select: { members: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

function getGroupTypeBadge(type: string) {
  switch (type) {
    case 'USER_BASED':
      return <Badge className="bg-blue-100 text-blue-700">User-Based</Badge>
    case 'ROLE_BASED':
      return <Badge className="bg-green-100 text-green-700">Role-Based</Badge>
    case 'ROLE_BASED_ORG':
      return <Badge className="bg-purple-100 text-purple-700">Role-Based (Constrained)</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

// Mock security domains
const SECURITY_DOMAINS = [
  { id: 'sd1', name: 'Worker Data: Personal Information', category: 'HCM', policies: 12 },
  { id: 'sd2', name: 'Worker Data: Job Information', category: 'HCM', policies: 8 },
  { id: 'sd3', name: 'Compensation Data: Base Pay', category: 'Compensation', policies: 6 },
  { id: 'sd4', name: 'Compensation Data: Bonus', category: 'Compensation', policies: 4 },
  { id: 'sd5', name: 'Position Data', category: 'Staffing', policies: 5 },
  { id: 'sd6', name: 'Organization Data', category: 'Core', policies: 7 },
  { id: 'sd7', name: 'Business Process Administration', category: 'Setup', policies: 3 },
  { id: 'sd8', name: 'Security Administration', category: 'Setup', policies: 2 },
]

export default async function SecurityConfigPage() {
  const securityGroups = await getSecurityGroups()

  const userBasedGroups = securityGroups.filter(g => g.groupType === 'USER_BASED')
  const roleBasedGroups = securityGroups.filter(g => g.groupType.startsWith('ROLE'))

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage security groups, domains, and access policies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Security Group
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityGroups.length}</p>
                <p className="text-sm text-gray-500">Security Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{SECURITY_DOMAINS.length}</p>
                <p className="text-sm text-gray-500">Security Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {SECURITY_DOMAINS.reduce((sum, d) => sum + d.policies, 0)}
                </p>
                <p className="text-sm text-gray-500">Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Building2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleBasedGroups.length}</p>
                <p className="text-sm text-gray-500">Role-Based Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="groups">Security Groups</TabsTrigger>
          <TabsTrigger value="domains">Security Domains</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Security Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search security groups..." 
                    className="pl-9"
                  />
                </div>
                <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">All Types</option>
                  <option value="USER_BASED">User-Based</option>
                  <option value="ROLE_BASED">Role-Based</option>
                  <option value="ROLE_BASED_ORG">Role-Based (Constrained)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Groups Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Security Group</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div>
                          <Link 
                            href={`/configuration/security/groups/${group.id}`}
                            className="font-medium hover:underline"
                          >
                            {group.name}
                          </Link>
                          {group.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getGroupTypeBadge(group.groupType)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{group._count.members}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Members
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Members
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Key className="h-4 w-4 mr-2" />
                              View Permissions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Domains Tab */}
        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search security domains..." 
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Security Domain</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Policies</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SECURITY_DOMAINS.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{domain.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{domain.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{domain.policies} policies</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>
                Policies define what security groups can access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Policy types explanation */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">View (Get)</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Permission to view/read data in the domain
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit className="h-5 w-5 text-amber-600" />
                      <h3 className="font-medium">Modify (Put)</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Permission to create/update/delete data
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium">Report</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Permission to include data in reports
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Understanding Workday Security
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Security policies connect security groups to domains. A worker must be 
                        a member of a security group that has the appropriate policy to access 
                        secured data or perform secured actions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
