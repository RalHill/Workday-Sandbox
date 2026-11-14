import { Suspense } from 'react'
import Link from 'next/link'

// Disable instant prerendering to allow database access
export const instant = false
import { 
  Users, 
  Briefcase, 
  Building2, 
  Workflow, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FlaskConical,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/db'

async function getStats() {
  const [
    workerCount,
    positionCount,
    openPositions,
    orgCount,
    pendingTransactions,
    completedTransactions,
    labCount,
  ] = await Promise.all([
    prisma.worker.count({ where: { employmentStatus: 'ACTIVE' } }),
    prisma.position.count(),
    prisma.position.count({ where: { status: 'OPEN' } }),
    prisma.supervisoryOrganization.count(),
    prisma.bPTransaction.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.bPTransaction.count({ where: { status: 'COMPLETED' } }),
    prisma.practiceLab.count({ where: { isActive: true } }),
  ])

  return {
    workerCount,
    positionCount,
    openPositions,
    orgCount,
    pendingTransactions,
    completedTransactions,
    labCount,
  }
}

async function getRecentTransactions() {
  return prisma.bPTransaction.findMany({
    take: 5,
    orderBy: { initiatedAt: 'desc' },
    include: {
      definition: true,
      initiator: true,
    },
  })
}

export default async function HomePage() {
  const stats = await getStats()
  const recentTransactions = await getRecentTransactions()

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to Workday Sandbox</h1>
            <p className="text-muted-foreground mt-1">
              Practice configuring Workday HCM in a safe environment. Your tenant: <span className="font-medium">Global Tech Corp</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/labs">
                <FlaskConical className="h-4 w-4 mr-2" />
                Practice Labs
              </Link>
            </Button>
            <Button asChild>
              <Link href="/workers">
                <Users className="h-4 w-4 mr-2" />
                View Workers
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workerCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.positionCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">{stats.openPositions} open</span> positions available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orgCount}</div>
            <p className="text-xs text-muted-foreground">
              Supervisory organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BP Transactions</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-600 font-medium">{stats.pendingTransactions} pending</span> approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/positions/create">
                <Plus className="h-4 w-4 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Create Position</div>
                  <div className="text-xs text-muted-foreground">Add a new position to your org</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/staffing/hire">
                <Users className="h-4 w-4 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Hire Employee</div>
                  <div className="text-xs text-muted-foreground">Start a new hire process</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/setup/business-processes">
                <Workflow className="h-4 w-4 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Edit Business Process</div>
                  <div className="text-xs text-muted-foreground">Configure BP steps and rules</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/reports/headcount">
                <TrendingUp className="h-4 w-4 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Run Headcount Report</div>
                  <div className="text-xs text-muted-foreground">View headcount by org</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest business process activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports/transactions">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {txn.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : txn.status === 'IN_PROGRESS' ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {txn.definition.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {txn.subjectDisplay} • by {txn.initiator.firstName} {txn.initiator.lastName}
                    </p>
                  </div>
                  <Badge variant={
                    txn.status === 'COMPLETED' ? 'default' :
                    txn.status === 'IN_PROGRESS' ? 'secondary' :
                    'destructive'
                  }>
                    {txn.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}

              {recentTransactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent transactions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Labs Promo */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-800">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900">
              <FlaskConical className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold">Practice Labs Available</h3>
              <p className="text-sm text-muted-foreground">
                {stats.labCount} hands-on exercises to master Workday configuration
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/labs">
              Start Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
