import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ChevronLeft,
  Settings,
  Plus,
  MoreHorizontal,
  Workflow,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Users,
  ArrowRight,
  GripVertical,
  Edit,
  Trash2,
  Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
 * Business Process Definition Detail Page
 * 
 * Configure the steps, conditions, and routing for a business process.
 * 
 * Step Types in Workday:
 * - APPROVAL: Requires approval action from an approver
 * - ACTION: System or user action (e.g., Create Account)
 * - TO_DO: Task assigned to a participant
 * - CHECKLIST: Multi-item checklist to complete
 * - INTEGRATION: External system integration
 * - NOTIFICATION: Send notification/email
 * 
 * Condition Types:
 * - ENTRY: Controls if step is included
 * - VALIDATION: Checks data before proceeding
 * - WHILE_RUNNING: Evaluated during step execution
 * - EXIT: Evaluated when step completes
 * 
 * Routing Restrictions:
 * - Exclude Initiator
 * - Exclude Prior Approvers
 * - Exclude Event Subject
 */

async function getBusinessProcess(id: string) {
  return prisma.businessProcessDefinition.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: {
          securityGroup: true,
          conditions: true,
        }
      },
      instances: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          initiator: true,
        }
      }
    }
  })
}

function getStepTypeIcon(type: string) {
  switch (type) {
    case 'APPROVAL':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'ACTION':
      return <Settings className="h-4 w-4 text-blue-600" />
    case 'TO_DO':
      return <AlertCircle className="h-4 w-4 text-amber-600" />
    case 'NOTIFICATION':
      return <AlertCircle className="h-4 w-4 text-purple-600" />
    default:
      return <Workflow className="h-4 w-4 text-gray-600" />
  }
}

function getStepTypeBadge(type: string) {
  const colors: Record<string, string> = {
    'APPROVAL': 'bg-green-100 text-green-700',
    'ACTION': 'bg-blue-100 text-blue-700',
    'TO_DO': 'bg-amber-100 text-amber-700',
    'CHECKLIST': 'bg-purple-100 text-purple-700',
    'INTEGRATION': 'bg-cyan-100 text-cyan-700',
    'NOTIFICATION': 'bg-pink-100 text-pink-700',
  }
  
  return (
    <Badge className={colors[type] || 'bg-gray-100 text-gray-700'}>
      {type.replace(/_/g, ' ')}
    </Badge>
  )
}

export default async function BusinessProcessDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const bp = await getBusinessProcess(id)

  if (!bp) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/configuration/business-processes" className="hover:text-gray-700">
          Business Processes
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-gray-900">{bp.name}</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bp.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Workflow className={`h-6 w-6 ${bp.isActive ? 'text-green-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{bp.name}</h1>
              <Badge variant={bp.isActive ? 'default' : 'secondary'}>
                {bp.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {bp.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Edit Definition
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Process Type</p>
            <p className="text-lg font-semibold">{bp.processType.replace(/_/g, ' ')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Steps</p>
            <p className="text-lg font-semibold">{bp.steps.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Approval Steps</p>
            <p className="text-lg font-semibold">
              {bp.steps.filter(s => s.stepType === 'APPROVAL').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Recent Instances</p>
            <p className="text-lg font-semibold">{bp.instances.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Steps Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Process Steps</CardTitle>
            <CardDescription>
              Configure the workflow steps and their order
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bp.steps.map((step, index) => (
              <div 
                key={step.id}
                className="group flex items-center gap-4 p-4 border rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              >
                {/* Drag Handle */}
                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Step Number */}
                <div className="w-8 h-8 rounded-full bg-[#0875E1] text-white flex items-center justify-center text-sm font-medium">
                  {step.order}
                </div>

                {/* Step Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{step.name}</span>
                    {getStepTypeBadge(step.stepType)}
                    {step.isRequired && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    {step.conditions.length > 0 && (
                      <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                        {step.conditions.length} condition{step.conditions.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {step.securityGroup && (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {step.securityGroup.name}
                      </span>
                    )}
                    {step.dueInDays && (
                      <span>Due in {step.dueInDays} days</span>
                    )}
                  </div>
                </div>

                {/* Arrow to next step */}
                {index < bp.steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-300" />
                )}

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Step
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      Change Routing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Step
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {bp.steps.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No steps configured</p>
                <p className="text-sm">Add steps to define the workflow</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Routing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Configuration</CardTitle>
          <CardDescription>
            Configure how work is routed to approvers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Exclude Initiator</p>
                <p className="text-sm text-gray-500">
                  The person who starts the process cannot approve it
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Exclude Prior Approvers</p>
                <p className="text-sm text-gray-500">
                  Previous approvers cannot approve subsequent steps
                </p>
              </div>
              <Badge variant="outline">
                Disabled
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Exclude Event Subject</p>
                <p className="text-sm text-gray-500">
                  The subject of the transaction cannot be an approver
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Instances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Instances</CardTitle>
            <CardDescription>
              Recent transactions using this business process
            </CardDescription>
          </div>
          <Link href={`/configuration/business-processes/${id}/instances`}>
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {bp.instances.length > 0 ? (
            <div className="space-y-2">
              {bp.instances.map(instance => (
                <div 
                  key={instance.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{instance.id.slice(0, 8)}...</p>
                    <p className="text-xs text-gray-500">
                      Initiated by {instance.initiator?.firstName} {instance.initiator?.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      instance.status === 'COMPLETED' ? 'default' :
                      instance.status === 'IN_PROGRESS' ? 'secondary' :
                      instance.status === 'CANCELLED' ? 'destructive' : 'outline'
                    }>
                      {instance.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(instance.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No instances yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
