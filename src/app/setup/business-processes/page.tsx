import Link from 'next/link'

export const instant = false
import { 
  Workflow, 
  Plus, 
  Edit, 
  MoreHorizontal,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  ChevronRight,
  AlertCircle,
  Play
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import prisma from '@/lib/db'

const CATEGORY_COLORS: Record<string, string> = {
  'STAFFING': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'COMPENSATION': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'TALENT': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'RECRUITING': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'ORGANIZATION': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  'SECURITY': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const STEP_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'INITIATION': Play,
  'APPROVAL': CheckCircle2,
  'REVIEW': FileText,
  'TO_DO': Clock,
  'NOTIFICATION': AlertCircle,
}

async function getBusinessProcesses() {
  return prisma.bPDefinition.findMany({
    include: {
      steps: {
        orderBy: { stepOrder: 'asc' },
        include: {
          conditionRules: true,
          assigneeGroup: true,
        }
      },
      securityPolicies: {
        include: {
          securityGroup: true,
        }
      },
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function BusinessProcessesPage() {
  const processes = await getBusinessProcesses()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            Business Process Definitions
          </h1>
          <p className="text-muted-foreground">
            Configure workflows, approvals, and routing rules
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Business Process
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Processes</div>
              <div className="text-2xl font-bold">{processes.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {processes.filter(p => p.isActive).length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">With Conditions</div>
              <div className="text-2xl font-bold">
                {processes.filter(p => p.steps.some(s => s.conditionRules.length > 0)).length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Transactions</div>
              <div className="text-2xl font-bold">
                {processes.reduce((sum, p) => sum + p._count.transactions, 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process List */}
      <Accordion className="space-y-4">
        {processes.map((bp) => (
          <AccordionItem 
            key={bp.id} 
            value={bp.id}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <Workflow className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">{bp.name}</div>
                    <div className="text-xs text-muted-foreground">{bp.code}</div>
                  </div>
                </div>
                <Badge className={CATEGORY_COLORS[bp.category]}>
                  {bp.category}
                </Badge>
                <Badge variant={bp.isActive ? 'default' : 'secondary'}>
                  {bp.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto mr-4">
                  <span>{bp.steps.length} steps</span>
                  <span>•</span>
                  <span>{bp._count.transactions} transactions</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Description */}
                {bp.description && (
                  <p className="text-sm text-muted-foreground">{bp.description}</p>
                )}

                {/* Steps */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Process Steps</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Step Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead className="text-center">Due</TableHead>
                          <TableHead className="text-center">Required</TableHead>
                          <TableHead className="text-center">Conditions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bp.steps.map((step, index) => {
                          const StepIcon = STEP_TYPE_ICONS[step.stepType] || Clock
                          return (
                            <TableRow key={step.id}>
                              <TableCell className="font-medium">
                                {step.stepOrder}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <StepIcon className="h-4 w-4 text-muted-foreground" />
                                  <span>{step.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{step.stepType}</Badge>
                              </TableCell>
                              <TableCell>
                                {step.assigneeGroup ? (
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">{step.assigneeGroup.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {step.assigneeType}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {step.dueInDays ? (
                                  <span className="text-sm">{step.dueInDays}d</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {step.isRequired ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {step.conditionRules.length > 0 ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {step.conditionRules.length} rule{step.conditionRules.length !== 1 ? 's' : ''}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Security Policies */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Security Policies</h4>
                  <div className="flex flex-wrap gap-2">
                    {bp.securityPolicies.map((policy) => (
                      <Badge key={policy.id} variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {policy.securityGroup.name}
                        <span className="text-muted-foreground">
                          ({[
                            policy.canInitiate && 'Init',
                            policy.canApprove && 'Approve',
                            policy.canViewAll && 'View',
                          ].filter(Boolean).join(', ')})
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Steps
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Edit Security
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Add Condition Rule
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
