import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * GET /api/tasks/pending
 * 
 * Fetches pending business process tasks for the current user.
 * In production, this would filter by the logged-in user's assigned tasks.
 */
export async function GET() {
  try {
    // Fetch pending steps with all related data
    const pendingSteps = await prisma.bPTransactionStep.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        step: {
          include: {
            definition: true,
          }
        },
        transaction: {
          include: {
            initiator: true,
            definition: true,
          }
        },
        assignee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Transform to task format
    const tasks = pendingSteps.map((step: typeof pendingSteps[number]) => {
      const now = new Date()
      const isOverdue = step.dueDate ? new Date(step.dueDate) < now : false
      
      // Map step type to task type
      const stepTypeMap: Record<string, string> = {
        'APPROVAL': 'APPROVAL',
        'REVIEW': 'REVIEW',
        'TO_DO': 'TO_DO',
        'INITIATION': 'TO_DO',
        'NOTIFICATION': 'TO_DO',
      }
      const taskType = stepTypeMap[step.step.stepType] || 'TO_DO'
      
      return {
        id: step.id,
        transactionId: step.transaction.transactionId,
        type: taskType,
        title: `${step.step.stepType === 'APPROVAL' ? 'Approve' : 
                step.step.stepType === 'REVIEW' ? 'Review' : 
                'Complete'} ${step.transaction.definition.name}`,
        subject: step.transaction.subjectDisplay || step.transaction.subjectId,
        subjectType: step.transaction.subjectType,
        initiator: `${step.transaction.initiator.firstName} ${step.transaction.initiator.lastName}`,
        initiatedAt: step.transaction.initiatedAt.toISOString(),
        dueDate: step.dueDate?.toISOString() || null,
        status: isOverdue ? 'OVERDUE' : 'PENDING',
        businessProcess: step.transaction.definition.name,
        stepName: step.step.name,
      }
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching pending tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', tasks: [] },
      { status: 500 }
    )
  }
}
