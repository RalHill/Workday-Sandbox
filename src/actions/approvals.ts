'use server'

import prisma from '@/lib/db'
import { z } from 'zod'
import { revalidatePath } from '@/lib/revalidate'
import {
  determineAssignee,
  assignNextPendingStep,
  handleTransactionCompletion,
} from './bp-engine'

/**
 * Approval Actions
 *
 * Server actions for approving, denying, and sending back
 * business process transaction steps.
 */

// =============================================================================
// Types
// =============================================================================

export type ApprovalResult = {
  success: true
  data: {
    stepId: string
    transactionId: string
    status: string
    nextStepId?: string
    transactionComplete: boolean
  }
} | {
  success: false
  error: string
  details?: Record<string, string[]>
}

// =============================================================================
// Validation Schemas
// =============================================================================

const ApprovalInputSchema = z.object({
  stepId: z.string().min(1, 'Step ID is required'),
  comments: z.string().optional(),
})

const DenyInputSchema = z.object({
  stepId: z.string().min(1, 'Step ID is required'),
  reason: z.string().min(10, 'Denial reason must be at least 10 characters'),
})

const SendBackInputSchema = z.object({
  stepId: z.string().min(1, 'Step ID is required'),
  targetStepOrder: z.number().int().min(1, 'Target step must be specified'),
  comments: z.string().min(10, 'Comments explaining the send-back are required'),
})

export type ApprovalInput = z.infer<typeof ApprovalInputSchema>
export type DenyInput = z.infer<typeof DenyInputSchema>
export type SendBackInput = z.infer<typeof SendBackInputSchema>

async function routeToNextStep(
  transactionId: string,
  currentStepId: string,
  completedById: string
) {
  const currentStep = await prisma.bPTransactionStep.findUnique({
    where: { id: currentStepId },
    include: { step: true },
  })

  if (!currentStep) {
    throw new Error('Step not found')
  }

  const nextStepId = await assignNextPendingStep(
    transactionId,
    currentStep.step.stepOrder,
    completedById
  )

  if (nextStepId) {
    return { nextStepId, transactionComplete: false }
  }

  await prisma.bPTransaction.update({
    where: { id: transactionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })

  await handleTransactionCompletion(transactionId)

  return { transactionComplete: true }
}

// =============================================================================
// Server Actions
// =============================================================================

/**
 * Approve a business process step
 */
export async function approveStep(
  input: ApprovalInput,
  completedById: string
): Promise<ApprovalResult> {
  // Validate input
  const validation = ApprovalInputSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors as Record<string, string[]>
    }
  }

  const { stepId, comments } = validation.data

  try {
    // Get the step
    const step = await prisma.bPTransactionStep.findUnique({
      where: { id: stepId },
      include: {
        step: true,
        transaction: true
      }
    })

    if (!step) {
      return { success: false, error: 'Step not found' }
    }

    if (step.status !== 'PENDING') {
      return { success: false, error: 'Step is not pending approval' }
    }

    // Update the step to approved
    await prisma.bPTransactionStep.update({
      where: { id: stepId },
      data: {
        status: 'APPROVED',
        completedById,
        completedAt: new Date(),
        comments
      }
    })

    // Route to next step or complete transaction
    const routing = await routeToNextStep(
      step.transactionId,
      stepId,
      completedById
    )

    revalidatePath('/')
    revalidatePath('/staffing')

    return {
      success: true,
      data: {
        stepId,
        transactionId: step.transactionId,
        status: 'APPROVED',
        nextStepId: routing.nextStepId,
        transactionComplete: routing.transactionComplete
      }
    }
  } catch (error) {
    console.error('Error approving step:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve step'
    }
  }
}

/**
 * Deny a business process step
 */
export async function denyStep(
  input: DenyInput,
  completedById: string
): Promise<ApprovalResult> {
  // Validate input
  const validation = DenyInputSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors as Record<string, string[]>
    }
  }

  const { stepId, reason } = validation.data

  try {
    // Get the step
    const step = await prisma.bPTransactionStep.findUnique({
      where: { id: stepId },
      include: {
        step: true,
        transaction: true
      }
    })

    if (!step) {
      return { success: false, error: 'Step not found' }
    }

    if (step.status !== 'PENDING') {
      return { success: false, error: 'Step is not pending' }
    }

    // Update the step to denied
    await prisma.bPTransactionStep.update({
      where: { id: stepId },
      data: {
        status: 'DENIED',
        completedById,
        completedAt: new Date(),
        comments: reason
      }
    })

    // Mark the entire transaction as denied
    await prisma.bPTransaction.update({
      where: { id: step.transactionId },
      data: {
        status: 'DENIED',
        completedAt: new Date(),
        comments: `Denied at step "${step.step.name}": ${reason}`
      }
    })

    // Mark all remaining pending steps as skipped
    await prisma.bPTransactionStep.updateMany({
      where: {
        transactionId: step.transactionId,
        status: 'PENDING',
        id: { not: stepId }
      },
      data: {
        status: 'SKIPPED'
      }
    })

    revalidatePath('/')
    revalidatePath('/staffing')

    return {
      success: true,
      data: {
        stepId,
        transactionId: step.transactionId,
        status: 'DENIED',
        transactionComplete: true
      }
    }
  } catch (error) {
    console.error('Error denying step:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deny step'
    }
  }
}

/**
 * Send back a business process step to an earlier step
 */
export async function sendBackStep(
  input: SendBackInput,
  completedById: string
): Promise<ApprovalResult> {
  // Validate input
  const validation = SendBackInputSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors as Record<string, string[]>
    }
  }

  const { stepId, targetStepOrder, comments } = validation.data

  try {
    // Get the current step
    const currentStep = await prisma.bPTransactionStep.findUnique({
      where: { id: stepId },
      include: {
        step: true,
        transaction: {
          include: {
            definition: true
          }
        }
      }
    })

    if (!currentStep) {
      return { success: false, error: 'Step not found' }
    }

    if (currentStep.status !== 'PENDING') {
      return { success: false, error: 'Step is not pending' }
    }

    // Find the target step definition
    const targetStepDef = await prisma.bPStep.findFirst({
      where: {
        definitionId: currentStep.transaction.definitionId,
        stepOrder: targetStepOrder
      }
    })

    if (!targetStepDef) {
      return { success: false, error: 'Target step not found' }
    }

    if (targetStepDef.stepOrder >= currentStep.step.stepOrder) {
      return { success: false, error: 'Can only send back to an earlier step' }
    }

    // Mark current step as sent back
    await prisma.bPTransactionStep.update({
      where: { id: stepId },
      data: {
        status: 'SENT_BACK',
        completedById,
        completedAt: new Date(),
        comments
      }
    })

    // Find the target step instance
    const targetStep = await prisma.bPTransactionStep.findFirst({
      where: {
        transactionId: currentStep.transactionId,
        stepId: targetStepDef.id
      }
    })

    if (targetStep) {
      // Reset the target step to pending
      const assigneeId = await determineAssignee(
        targetStepDef.assigneeType,
        targetStepDef.assigneeGroupId,
        currentStep.transactionId,
        completedById
      )

      await prisma.bPTransactionStep.update({
        where: { id: targetStep.id },
        data: {
          status: 'PENDING',
          assigneeId,
          completedById: null,
          completedAt: null,
          comments: `Sent back from "${currentStep.step.name}": ${comments}`,
          dueDate: targetStepDef.dueInDays
            ? new Date(Date.now() + targetStepDef.dueInDays * 24 * 60 * 60 * 1000)
            : null
        }
      })
    }

    revalidatePath('/')
    revalidatePath('/staffing')

    return {
      success: true,
      data: {
        stepId,
        transactionId: currentStep.transactionId,
        status: 'SENT_BACK',
        nextStepId: targetStep?.id,
        transactionComplete: false
      }
    }
  } catch (error) {
    console.error('Error sending back step:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send back step'
    }
  }
}

/**
 * Get available send-back targets for a step
 */
export async function getSendBackTargets(stepId: string) {
  const step = await prisma.bPTransactionStep.findUnique({
    where: { id: stepId },
    include: {
      step: true,
      transaction: {
        include: {
          steps: {
            include: {
              step: true
            },
            orderBy: {
              step: {
                stepOrder: 'asc'
              }
            }
          }
        }
      }
    }
  })

  if (!step) return []

  type StepWithDetails = typeof step.transaction.steps[number]

  // Return all steps before the current one that are completed
  return step.transaction.steps
    .filter((s: StepWithDetails) => 
      s.step.stepOrder < step.step.stepOrder &&
      (s.status === 'APPROVED' || s.status === 'COMPLETE')
    )
    .map((s: StepWithDetails) => ({
      id: s.id,
      stepOrder: s.step.stepOrder,
      name: s.step.name,
      stepType: s.step.stepType
    }))
}
