'use client'

import { useState, useEffect, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  Inbox,
  Archive,
  Search,
  Loader2
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Input } from '@/components/ui/input'
import { approveStep, denyStep, sendBackStep, getSendBackTargets } from '@/actions'
import { getCurrentWorkerId } from '@/lib/session'


/**
 * Workday Inbox (Tasks Drawer)
 * 
 * Based on Workday documentation:
 * - Actions tab: pending Approvals, To Dos, and Action items
 * - Archive tab: completed business processes (last 30 days)
 * - Title search to quickly find tasks
 * - Approve, Send Back, Deny actions for approvals
 */

interface Task {
  id: string
  transactionId: string
  type: 'APPROVAL' | 'REVIEW' | 'TO_DO'
  title: string
  subject: string
  subjectType: string
  initiator: string
  initiatedAt: Date
  dueDate: Date | null
  status: 'PENDING' | 'OVERDUE'
  businessProcess: string
  stepName: string
}

interface ArchivedTask {
  id: string
  transactionId: string
  title: string
  subject: string
  completedAt: Date
  status: 'APPROVED' | 'DENIED' | 'COMPLETED'
}

/**
 * Fetch pending tasks from the server
 */
async function fetchPendingTasks(): Promise<Task[]> {
  try {
    const response = await fetch('/api/tasks/pending')
    if (!response.ok) return []
    const data = await response.json()
    return data.tasks.map((t: any) => ({
      ...t,
      initiatedAt: new Date(t.initiatedAt),
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
    }))
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return []
  }
}

/**
 * Fetch archived tasks from the server
 */
async function fetchArchivedTasks(): Promise<ArchivedTask[]> {
  try {
    const response = await fetch('/api/tasks/archived')
    if (!response.ok) return []
    const data = await response.json()
    return data.tasks.map((t: any) => ({
      ...t,
      completedAt: new Date(t.completedAt),
    }))
  } catch (error) {
    console.error('Failed to fetch archived tasks:', error)
    return []
  }
}

/**
 * Workday Inbox Task Card
 * Matches Workday's task item design with status indicator bar
 */
function TaskCard({ 
  task, 
  onAction,
  isProcessing 
}: { 
  task: Task
  onAction: (action: string, data?: any) => void
  isProcessing: boolean
}) {
  const isOverdue = task.status === 'OVERDUE'
  const [showDenyReason, setShowDenyReason] = useState(false)
  const [denyReason, setDenyReason] = useState('')
  
  // Workday uses color bars to indicate task type
  const statusBarColor = {
    APPROVAL: 'bg-amber-500',
    REVIEW: 'bg-blue-500',
    TO_DO: 'bg-gray-400',
  }[task.type]
  
  const handleDeny = () => {
    if (!showDenyReason) {
      setShowDenyReason(true)
      return
    }
    if (denyReason.length >= 10) {
      onAction('deny', { reason: denyReason })
      setShowDenyReason(false)
      setDenyReason('')
    }
  }
  
  return (
    <div 
      className={`workday-inbox-item flex gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isOverdue ? 'bg-red-50' : ''
      }`}
    >
      {/* Status indicator bar */}
      <div className={`w-1 rounded-full flex-shrink-0 ${statusBarColor}`} />
      
      {/* Task content */}
      <div className="flex-1 min-w-0">
        {/* Task type badge and overdue indicator */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            task.type === 'APPROVAL' ? 'bg-amber-100 text-amber-700' :
            task.type === 'REVIEW' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {task.type === 'APPROVAL' ? 'Approval' : 
             task.type === 'REVIEW' ? 'Review' : 'To Do'}
          </span>
          {isOverdue && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>
        
        {/* Task title */}
        <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
        
        {/* Subject */}
        <p className="text-sm text-gray-600 mt-0.5">{task.subject}</p>
        
        {/* Step name */}
        <p className="text-xs text-gray-500 mt-1">{task.stepName}</p>
        
        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>From {task.initiator}</span>
          <span>•</span>
          <span>{formatDistanceToNow(task.initiatedAt, { addSuffix: true })}</span>
        </div>
        
        {/* Due date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <Clock className="h-3 w-3" />
            <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
              Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
            </span>
          </div>
        )}
        
        {/* Deny reason input */}
        {showDenyReason && (
          <div className="mt-3 space-y-2">
            <textarea
              placeholder="Enter denial reason (min 10 characters)..."
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              className="w-full p-2 text-sm border rounded-md"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {/* Action buttons - Workday style */}
        {task.type === 'APPROVAL' && (
          <div className="flex items-center gap-2 mt-3">
            <button 
              className="workday-btn-primary text-xs px-4 py-1.5 flex items-center gap-1 disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); onAction('approve'); }}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
              Approve
            </button>
            <button 
              className="workday-btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); onAction('sendback'); }}
              disabled={isProcessing}
            >
              Send Back
            </button>
            <button 
              className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-full border border-red-200 disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); handleDeny(); }}
              disabled={isProcessing || (showDenyReason && denyReason.length < 10)}
            >
              {showDenyReason ? 'Confirm Deny' : 'Deny'}
            </button>
            {showDenyReason && (
              <button 
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                onClick={(e) => { e.stopPropagation(); setShowDenyReason(false); setDenyReason(''); }}
              >
                Cancel
              </button>
            )}
          </div>
        )}
        
        {task.type === 'REVIEW' && (
          <div className="flex items-center gap-2 mt-3">
            <button 
              className="workday-btn-primary text-xs px-4 py-1.5 disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); onAction('complete'); }}
              disabled={isProcessing}
            >
              Review
            </button>
          </div>
        )}
        
        {task.type === 'TO_DO' && (
          <div className="flex items-center gap-2 mt-3">
            <button 
              className="workday-btn-primary text-xs px-4 py-1.5 disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); onAction('complete'); }}
              disabled={isProcessing}
            >
              Complete
            </button>
          </div>
        )}
      </div>
      
      {/* Chevron */}
      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
    </div>
  )
}

/**
 * Archived Task Card
 */
function ArchivedTaskCard({ task }: { task: ArchivedTask }) {
  const statusColor = {
    APPROVED: 'text-green-600',
    DENIED: 'text-red-600',
    COMPLETED: 'text-blue-600',
  }[task.status]
  
  const statusIcon = {
    APPROVED: <CheckCircle className="h-4 w-4 text-green-600" />,
    DENIED: <XCircle className="h-4 w-4 text-red-600" />,
    COMPLETED: <CheckCircle className="h-4 w-4 text-blue-600" />,
  }[task.status]
  
  return (
    <div className="flex gap-3 p-4 hover:bg-gray-50">
      <div className="w-1 rounded-full flex-shrink-0 bg-gray-300" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {statusIcon}
          <span className={`text-xs font-medium ${statusColor}`}>
            {task.status}
          </span>
        </div>
        <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
        <p className="text-sm text-gray-600 mt-0.5">{task.subject}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(task.completedAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

export function TasksDrawer() {
  const { isTasksOpen, setTasksOpen } = useAppStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  
  // Fetch tasks when drawer opens
  useEffect(() => {
    if (isTasksOpen) {
      setIsLoading(true)
      Promise.all([
        fetchPendingTasks(),
        fetchArchivedTasks()
      ]).then(([pending, archived]) => {
        setTasks(pending)
        setArchivedTasks(archived)
        setIsLoading(false)
      })
    }
  }, [isTasksOpen])

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const overdueTasks = filteredTasks.filter(t => t.status === 'OVERDUE')
  const approvalTasks = filteredTasks.filter(t => t.type === 'APPROVAL')

  const handleTaskAction = async (taskId: string, action: string, data?: any) => {
    setProcessingTaskId(taskId)
    
    const task = tasks.find(t => t.id === taskId)
    if (!task) {
      setProcessingTaskId(null)
      return
    }
    
    startTransition(async () => {
      try {
        const currentUserId = await getCurrentWorkerId()
        let result
        
        switch (action) {
          case 'approve':
            result = await approveStep(
              { stepId: taskId, comments: 'Approved via Inbox' },
              currentUserId
            )
            break
            
          case 'deny':
            result = await denyStep(
              { stepId: taskId, reason: data?.reason || 'Denied via Inbox' },
              currentUserId
            )
            break
            
          case 'sendback':
            // For send back, we need to route to step 1 (initiation)
            // In a full implementation, this would show a modal to select target step
            const targets = await getSendBackTargets(taskId)
            if (targets.length > 0) {
              result = await sendBackStep(
                { 
                  stepId: taskId, 
                  targetStepOrder: targets[0].stepOrder,
                  comments: 'Sent back for revision via Inbox'
                },
                currentUserId
              )
            } else {
              console.error('No send-back targets available')
              setProcessingTaskId(null)
              return
            }
            break
            
          case 'complete':
            // For TO_DO and REVIEW, just approve/complete
            result = await approveStep(
              { stepId: taskId, comments: 'Completed via Inbox' },
              currentUserId
            )
            break
            
          default:
            console.error('Unknown action:', action)
            setProcessingTaskId(null)
            return
        }
        
        if (result?.success) {
          // Remove task from list
          setTasks(prev => prev.filter(t => t.id !== taskId))
          
          // Add to archive
          if (result.data.transactionComplete) {
            const archived: ArchivedTask = {
              id: taskId,
              transactionId: task.transactionId,
              title: task.title,
              subject: task.subject,
              completedAt: new Date(),
              status: action === 'deny' ? 'DENIED' : 
                      action === 'approve' ? 'APPROVED' : 'COMPLETED'
            }
            setArchivedTasks(prev => [archived, ...prev])
          }
        } else {
          console.error('Action failed:', result?.error)
        }
      } catch (error) {
        console.error('Task action error:', error)
      } finally {
        setProcessingTaskId(null)
      }
    })
  }

  return (
    <Sheet open={isTasksOpen} onOpenChange={setTasksOpen}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        {/* Workday Inbox Header */}
        <div className="p-4 border-b bg-white">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-gray-900">
              <Inbox className="h-5 w-5 text-[#0875E1]" />
              Inbox
            </SheetTitle>
            <SheetDescription>
              {isLoading ? 'Loading...' : `${tasks.length} item${tasks.length !== 1 ? 's' : ''} requiring your action`}
            </SheetDescription>
          </SheetHeader>
          
          {/* Title Search - Workday pattern */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Title Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Workday-style Tabs: Actions | Archive */}
        <Tabs defaultValue="actions" className="flex flex-col h-[calc(100vh-160px)]">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-white h-auto p-0">
            <TabsTrigger 
              value="actions" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0875E1] data-[state=active]:bg-transparent data-[state=active]:text-[#0875E1] py-3"
            >
              Actions ({filteredTasks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="archive"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0875E1] data-[state=active]:bg-transparent data-[state=active]:text-[#0875E1] py-3"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive ({archivedTasks.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 bg-gray-50">
            <TabsContent value="actions" className="m-0 p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-8 w-8 text-[#0875E1] animate-spin mb-4" />
                  <p className="text-sm text-gray-500">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <p className="font-medium text-gray-900">You're all caught up!</p>
                  <p className="text-sm text-gray-500 mt-1">No pending tasks require your action</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 bg-white">
                  {filteredTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onAction={(action, data) => handleTaskAction(task.id, action, data)}
                      isProcessing={processingTaskId === task.id || isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archive" className="m-0 p-0">
              {archivedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Archive className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="font-medium text-gray-900">Archive</p>
                  <p className="text-sm text-gray-500 mt-1">
                    View completed business processes from the past 30 days
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    No archived items to display
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 bg-white">
                  {archivedTasks.map((task) => (
                    <ArchivedTaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
