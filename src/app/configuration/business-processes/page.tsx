import Link from 'next/link'
import { 
  Settings, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Workflow,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import prisma from '@/lib/db'

/**
 * Workday Business Process Configuration
 * 
 * Business Processes (BPs) are configurable workflows that:
 * - Define step sequences for transactions
 * - Route work to appropriate approvers
 * - Enforce business rules via conditions
 * - Trigger integrations and notifications
 * 
 * Key concepts:
 * - BP Definition: The template/configuration
 * - BP Instance: A running transaction
 * - Steps: Actions in the workflow (Approval, Action, To-Do, etc.)
 * - Conditions: Rules that control step execution
 */

async function getBusinessProcessDefinitions() {
  return prisma.bPDefinition.findMany({
    include: {
      steps: {
        orderBy: { stepOrder: 'asc' }
      },
      transactions: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { name: 'asc' }
  })
}

type BPDefinitionWithRelations = Awaited<ReturnType<typeof getBusinessProcessDefinitions>>[number]

function getStatusIcon(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'INACTIVE':
      return <XCircle className="h-4 w-4 text-gray-400" />
    default:
      return <Clock className="h-4 w-4 text-amber-500" />
  }
}

function getBPTypeBadge(type: string) {
  const colors: Record<string, string> = {
    'HIRE': 'bg-green-100 text-green-700',
    'TERMINATE': 'bg-red-100 text-red-700',
    'TRANSFER': 'bg-blue-100 text-blue-700',
    'PROMOTE': 'bg-purple-100 text-purple-700',
    'COMPENSATION_CHANGE': 'bg-amber-100 text-amber-700',
    'CREATE_POSITION': 'bg-cyan-100 text-cyan-700',
  }
  
  return (
    <Badge className={colors[type] || 'bg-gray-100 text-gray-700'}>
      {type.replace(/_/g, ' ')}
    </Badge>
  )
}

export default async function BusinessProcessConfigPage() {
  const bpDefinitions = await getBusinessProcessDefinitions()

  const activeBPs = bpDefinitions.filter(bp => bp.isActive)
  const inactiveBPs = bpDefinitions.filter(bp => !bp.isActive)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            Business Process Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure workflow definitions and approval routing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Definition
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Workflow className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bpDefinitions.length}</p>
                <p className="text-sm text-gray-500">Total Definitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBPs.length}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <XCircle className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inactiveBPs.length}</p>
                <p className="text-sm text-gray-500">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {bpDefinitions.reduce((sum: number, bp: BPDefinitionWithRelations) => sum + bp.transactions.length, 0)}
                </p>
                <p className="text-sm text-gray-500">Recent Instances</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search business processes..." 
                className="pl-9"
              />
            </div>
            <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">All Types</option>
              <option value="HIRE">Hire</option>
              <option value="TERMINATE">Terminate</option>
              <option value="TRANSFER">Transfer</option>
              <option value="PROMOTE">Promote</option>
              <option value="COMPENSATION_CHANGE">Compensation Change</option>
            </select>
            <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* BP Definitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Business Process Definitions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Recent Instances</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bpDefinitions.map((bp) => (
                <TableRow key={bp.id} className="group">
                  <TableCell>
                    {getStatusIcon(bp.isActive ? 'ACTIVE' : 'INACTIVE')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <Link 
                        href={`/configuration/business-processes/${bp.id}`}
                        className="font-medium hover:underline flex items-center gap-2"
                      >
                        {bp.name}
                        <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      {bp.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {bp.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getBPTypeBadge(bp.category)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{bp.steps.length}</span>
                      <span className="text-xs text-gray-500">steps</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{bp.transactions.length}</span>
                      <span className="text-xs text-gray-500">recent</span>
                    </div>
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
                          <Link href={`/configuration/business-processes/${bp.id}`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Edit Security
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {bp.isActive ? (
                          <DropdownMenuItem className="text-amber-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Understanding Business Processes</h3>
              <p className="text-sm text-blue-700 mt-1">
                Business Processes define how transactions flow through your organization. 
                Each process has steps that can require approvals, trigger actions, or collect information.
                Use conditions to dynamically route work based on transaction data.
              </p>
              <div className="flex gap-4 mt-3">
                <Link href="/docs/business-processes" className="text-sm text-blue-700 hover:underline">
                  Learn more →
                </Link>
                <Link href="/docs/bp-conditions" className="text-sm text-blue-700 hover:underline">
                  Condition rules →
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
