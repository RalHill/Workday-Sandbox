import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * GET /api/tasks/archived
 * 
 * Fetches completed/archived business process tasks from the last 30 days.
 * In production, this would filter by the logged-in user's completed tasks.
 */
export async function GET() {
  try {
    // Calculate 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fetch completed steps from the last 30 days
    const completedSteps = await prisma.bPTransactionStep.findMany({
      where: {
        status: {
          in: ['APPROVED', 'DENIED', 'COMPLETE'],
        },
        completedAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        step: {
          include: {
            definition: true,
          }
        },
        transaction: {
          include: {
            definition: true,
          }
        },
        completedBy: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 50,
    })

    // Transform to archived task format
    const tasks = completedSteps.map((step: typeof completedSteps[number]) => ({
      id: step.id,
      transactionId: step.transaction.transactionId,
      title: `${step.transaction.definition.name}`,
      subject: step.transaction.subjectDisplay || step.transaction.subjectId,
      completedAt: step.completedAt?.toISOString() || step.updatedAt.toISOString(),
      status: step.status === 'DENIED' ? 'DENIED' : 
              step.status === 'APPROVED' ? 'APPROVED' : 'COMPLETED',
    }))

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching archived tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived tasks', tasks: [] },
      { status: 500 }
    )
  }
}
