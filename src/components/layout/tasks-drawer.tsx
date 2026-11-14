'use client'

import { useEffect, useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  Inbox
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

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

function TaskCard({ task, onAction }: { task: Task; onAction: (action: string) => void }) {
  const isOverdue = task.status === 'OVERDUE'
  
  return (
    <div className={`p-4 border rounded-lg ${isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={task.type === 'APPROVAL' ? 'default' : 'secondary'} className="text-xs">
              {task.type}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{task.subject}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>From: {task.initiator}</span>
            <span>•</span>
            <span>{formatDistanceToNow(task.initiatedAt, { addSuffix: true })}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              <Clock className="h-3 w-3" />
              <span className={isOverdue ? 'text-destructive' : 'text-muted-foreground'}>
                Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
      
      {task.type === 'APPROVAL' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onAction('approve')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAction('sendback')}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Send Back
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onAction('deny')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Deny
          </Button>
        </div>
      )}
      
      {task.type === 'REVIEW' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onAction('complete')}
          >
            <FileText className="h-4 w-4 mr-1" />
            View & Complete
          </Button>
        </div>
      )}
      
      {task.type === 'TO_DO' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onAction('complete')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        </div>
      )}
    </div>
  )
}

export function TasksDrawer() {
  const { isTasksOpen, setTasksOpen } = useAppStore()
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)

  const pendingTasks = tasks.filter(t => t.status === 'PENDING')
  const overdueTasks = tasks.filter(t => t.status === 'OVERDUE')

  const handleTaskAction = (taskId: string, action: string) => {
    console.log(`Task ${taskId}: ${action}`)
    // In real app, this would call an API
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  return (
    <Sheet open={isTasksOpen} onOpenChange={setTasksOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            My Tasks
          </SheetTitle>
          <SheetDescription>
            {tasks.length} pending task{tasks.length !== 1 ? 's' : ''} requiring your action
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="all" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals ({tasks.filter(t => t.type === 'APPROVAL').length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-destructive">
              Overdue ({overdueTasks.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)] mt-4">
            <TabsContent value="all" className="space-y-3">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending tasks</p>
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onAction={(action) => handleTaskAction(task.id, action)} 
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="approvals" className="space-y-3">
              {tasks.filter(t => t.type === 'APPROVAL').map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onAction={(action) => handleTaskAction(task.id, action)} 
                />
              ))}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-3">
              {overdueTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-muted-foreground">No overdue tasks</p>
                </div>
              ) : (
                overdueTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onAction={(action) => handleTaskAction(task.id, action)} 
                  />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
