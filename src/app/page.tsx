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
  Plus,
  Calendar,
  FileText,
  DollarSign,
  Heart,
  GraduationCap,
  MoreHorizontal,
  ChevronRight,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/db'

/**
 * Workday Home Page - 2026R1 Design
 * 
 * Based on research from Workday documentation:
 * - Dynamic launchpad (not a "digital filing cabinet")
 * - Prominent search bar (handled in header)
 * - "Awaiting Your Action" section for critical tasks
 * - Quick access to commonly used apps
 * - Recent activity and announcements
 */

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

async function getPendingTasks() {
  return prisma.bPTransaction.findMany({
    where: { status: 'IN_PROGRESS' },
    take: 5,
    orderBy: { initiatedAt: 'desc' },
    include: {
      definition: true,
      initiator: true,
    },
  })
}

async function getRecentActivity() {
  return prisma.bPTransaction.findMany({
    take: 5,
    orderBy: { initiatedAt: 'desc' },
    include: {
      definition: true,
      initiator: true,
    },
  })
}

// Workday App Tile Component
function AppTile({ 
  icon: Icon, 
  label, 
  href, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="workday-app-tile flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  )
}

// Task Item Component
function TaskItem({ 
  title, 
  subtitle, 
  dueDate,
  status,
  href 
}: { 
  title: string
  subtitle: string
  dueDate?: string
  status: 'approval' | 'action' | 'todo'
  href: string
}) {
  const statusColors = {
    approval: 'bg-amber-500',
    action: 'bg-blue-500',
    todo: 'bg-gray-400',
  }

  return (
    <Link
      href={href}
      className="workday-inbox-item flex items-start gap-4 p-4 hover:bg-gray-50 border-b last:border-b-0"
    >
      <div className={`w-1 h-12 rounded-full ${statusColors[status]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        {dueDate && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Due {dueDate}
          </p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </Link>
  )
}

export default async function HomePage() {
  const stats = await getStats()
  const pendingTasks = await getPendingTasks()
  const recentActivity = await getRecentActivity()

  return (
    <div className="min-h-full bg-[#F7F7F7]">
      {/* Hero Section with Greeting */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-normal text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-1">
            Your Workday Sandbox • <span className="font-medium text-gray-700">Global Tech Corp</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Awaiting Your Action - Critical Tasks */}
            <div className="workday-card bg-white rounded-lg border">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="font-semibold text-gray-900">Awaiting Your Action</h2>
                  <p className="text-sm text-gray-500">
                    {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} require your attention
                  </p>
                </div>
                <Link 
                  href="/inbox" 
                  className="text-sm text-[#0875E1] hover:underline flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div>
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      title={task.definition.name}
                      subtitle={`${task.subjectDisplay} • Initiated by ${task.initiator.firstName} ${task.initiator.lastName}`}
                      dueDate="Today"
                      status="approval"
                      href={`/inbox/${task.id}`}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                    <p className="font-medium">You're all caught up!</p>
                    <p className="text-sm">No pending tasks require your action</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="workday-card bg-white rounded-lg border p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/staffing/hire"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#0875E1] hover:bg-blue-50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-[#0875E1]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Hire</p>
                    <p className="text-xs text-gray-500">Employee</p>
                  </div>
                </Link>

                <Link
                  href="/positions/create"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#0875E1] hover:bg-blue-50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-green-100">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Create</p>
                    <p className="text-xs text-gray-500">Position</p>
                  </div>
                </Link>

                <Link
                  href="/time-off/request"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#0875E1] hover:bg-blue-50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Request</p>
                    <p className="text-xs text-gray-500">Time Off</p>
                  </div>
                </Link>

                <Link
                  href="/reports/run"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#0875E1] hover:bg-blue-50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-amber-100">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Run</p>
                    <p className="text-xs text-gray-500">Report</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="workday-card bg-white rounded-lg border">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                <Link 
                  href="/reports/transactions" 
                  className="text-sm text-[#0875E1] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0">
                      {activity.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : activity.status === 'IN_PROGRESS' ? (
                        <Clock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.definition.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.subjectDisplay} • {activity.initiator.firstName} {activity.initiator.lastName}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        activity.status === 'COMPLETED' ? 'default' :
                        activity.status === 'IN_PROGRESS' ? 'secondary' :
                        'destructive'
                      }
                      className={
                        activity.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                        activity.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        ''
                      }
                    >
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Apps Section */}
            <div className="workday-card bg-white rounded-lg border p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Apps</h2>
              <div className="grid grid-cols-3 gap-2">
                <AppTile icon={DollarSign} label="Pay" href="/pay" color="bg-green-500" />
                <AppTile icon={Heart} label="Benefits" href="/benefits" color="bg-red-500" />
                <AppTile icon={Calendar} label="Absence" href="/time-off" color="bg-purple-500" />
                <AppTile icon={TrendingUp} label="Career" href="/career" color="bg-amber-500" />
                <AppTile icon={GraduationCap} label="Learning" href="/learning" color="bg-pink-500" />
                <AppTile icon={FileText} label="Documents" href="/documents" color="bg-blue-500" />
              </div>
            </div>

            {/* Sandbox Stats */}
            <div className="workday-card bg-white rounded-lg border p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Tenant Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Active Workers</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.workerCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Positions</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.positionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Organizations</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.orgCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Workflow className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Pending BPs</span>
                  </div>
                  <span className="font-semibold text-amber-600">{stats.pendingTransactions}</span>
                </div>
              </div>
            </div>

            {/* Practice Labs CTA */}
            <div className="workday-card bg-gradient-to-br from-[#0875E1] to-[#004387] rounded-lg p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Practice Labs</h3>
              </div>
              <p className="text-sm text-blue-100 mb-4">
                {stats.labCount} hands-on exercises to master Workday configuration
              </p>
              <Link
                href="/labs"
                className="inline-flex items-center gap-2 bg-white text-[#0875E1] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Announcements */}
            <div className="workday-card bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Announcements</h2>
              </div>
              <div className="divide-y">
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Sandbox Environment Ready
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your practice tenant has been provisioned with sample data from Global Tech Corp.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Today</p>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900">
                    New Practice Labs Available
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Business Process Configuration and Security Audit labs now available.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
