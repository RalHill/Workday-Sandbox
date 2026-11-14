'use client'

import { useState } from 'react'
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
  Search
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Input } from '@/components/ui/input'

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

// Mock data - in real app this would come from an API
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    transactionId: 'TXN-00002',
    type: 'APPROVAL',
    title: 'Approve Compensation Change',
    subject: 'Alex Rivera',
    subjectType: 'Worker',
    initiator: 'Priya Patel',
    initiatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'PENDING',
    businessProcess: 'Change Compensation',
    stepName: 'VP Approval (High Value)',
  },
  {
    id: '2',
    transactionId: 'TXN-00003',
    type: 'APPROVAL',
    title: 'Approve Position Request',
    subject: 'Senior Data Engineer - Platform Engineering',
    subjectType: 'Position',
    initiator: 'Priya Patel',
    initiatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'PENDING',
    businessProcess: 'Create Position',
    stepName: 'Finance Approval',
  },
  {
    id: '3',
    transactionId: 'TXN-00004',
    type: 'REVIEW',
    title: 'Review Hire Request',
    subject: 'New Software Engineer',
    subjectType: 'Worker',
    initiator: 'Rachel Green',
    initiatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'OVERDUE',
    businessProcess: 'Hire Employee',
    stepName: 'HR Review',
  },
]

/**
 * Workday Inbox Task Card
 * Matches Workday's task item design with status indicator bar
 */
function TaskCard({ task, onAction }: { task: Task; onAction: (action: string) => void }) {
  const isOverdue = task.status === 'OVERDUE'
  
  // Workday uses color bars to indicate task type
  const statusBarColor = {
    APPROVAL: 'bg-amber-500',
    REVIEW: 'bg-blue-500',
    TO_DO: 'bg-gray-400',
  }[task.type]
  
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
        
        {/* Action buttons - Workday style */}
        {task.type === 'APPROVAL' && (
          <div className="flex items-center gap-2 mt-3">
            <button 
              className="workday-btn-primary text-xs px-4 py-1.5"
              onClick={(e) => { e.stopPropagation(); onAction('approve'); }}
            >
              Approve
            </button>
            <button 
              className="workday-btn-secondary text-xs px-3 py-1.5"
              onClick={(e) => { e.stopPropagation(); onAction('sendback'); }}
            >
              Send Back
            </button>
            <button 
              className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-full border border-red-200"
              onClick={(e) => { e.stopPropagation(); onAction('deny'); }}
            >
              Deny
            </button>
          </div>
        )}
        
        {task.type === 'REVIEW' && (
          <div className="flex items-center gap-2 mt-3">
            <button 
              className="workday-btn-primary text-xs px-4 py-1.5"
              onClick={(e) => { e.stopPropagation(); onAction('complete'); }}
            >
              Review
            </button>
          </div>
        )}
        
        {task.type === 'TO_DO' && (
          <div className="flex items-center gap-2 mt-3">
            <button 
              className="workday-btn-primary text-xs px-4 py-1.5"
              onClick={(e) => { e.stopPropagation(); onAction('complete'); }}
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

export function TasksDrawer() {
  const { isTasksOpen, setTasksOpen } = useAppStore()
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const overdueTasks = filteredTasks.filter(t => t.status === 'OVERDUE')
  const approvalTasks = filteredTasks.filter(t => t.type === 'APPROVAL')

  const handleTaskAction = (taskId: string, action: string) => {
    console.log(`Task ${taskId}: ${action}`)
    // In real app, this would call an API and route to next step
    setTasks(tasks.filter(t => t.id !== taskId))
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
              {tasks.length} item{tasks.length !== 1 ? 's' : ''} requiring your action
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
              Archive
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 bg-gray-50">
            <TabsContent value="actions" className="m-0 p-0">
              {filteredTasks.length === 0 ? (
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
                      onAction={(action) => handleTaskAction(task.id, action)} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archive" className="m-0 p-0">
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
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
