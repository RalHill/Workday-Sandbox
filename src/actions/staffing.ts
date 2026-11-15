'use server'

/**
 * Server Actions - Staffing Mutations
 * 
 * Handles Hire, Terminate, Create Position, and Job Changes.
 * All actions create BP transactions for audit and approval routing.
 */

import prisma from '@/lib/db'
import { revalidatePath } from '@/lib/revalidate'
import { z } from 'zod'
import { assignNextPendingStep } from './bp-engine'
import { getCurrentWorkerId } from '@/lib/session'

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const HireEmployeeSchema = z.object({
  // Pre-hire info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  
  // Job details
  hireDate: z.string().min(1, 'Hire date is required'),
  hireReason: z.string().min(1, 'Hire reason is required'),
  supervisoryOrgId: z.string().min(1, 'Supervisory organization is required'),
  positionId: z.string().optional(), // Optional if creating new position
  jobProfileId: z.string().min(1, 'Job profile is required'),
  businessTitle: z.string().optional(),
  employeeType: z.enum(['EMPLOYEE', 'CONTINGENT_WORKER']),
  timeType: z.enum(['FULL_TIME', 'PART_TIME']),
  locationId: z.string().min(1, 'Location is required'),
  scheduledHours: z.number().min(1).max(80),
  
  // Organization
  companyId: z.string().min(1, 'Company is required'),
  costCenterId: z.string().optional(),
  
  // Compensation
  compensationType: z.enum(['SALARY', 'HOURLY']),
  amount: z.number().positive('Compensation amount must be positive'),
  currency: z.string().default('USD'),
  frequency: z.enum(['ANNUAL', 'MONTHLY', 'HOURLY']),
})

const CreatePositionSchema = z.object({
  title: z.string().min(1, 'Position title is required'),
  jobProfileId: z.string().min(1, 'Job profile is required'),
  supervisoryOrgId: z.string().min(1, 'Supervisory organization is required'),
  locationId: z.string().min(1, 'Location is required'),
  costCenterId: z.string().optional(),
  workerType: z.enum(['EMPLOYEE', 'CONTINGENT_WORKER']),
  timeType: z.enum(['FULL_TIME', 'PART_TIME']),
  scheduledHours: z.number().min(1).max(80),
  ftePercentage: z.number().min(0).max(1).default(1),
  isManagement: z.boolean().default(false),
  isCritical: z.boolean().default(false),
  earliestHireDate: z.string().optional(),
  latestHireDate: z.string().optional(),
  availableForHire: z.boolean().default(true),
})

const TerminateEmployeeSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  terminationType: z.enum(['VOLUNTARY', 'INVOLUNTARY']),
  terminationReason: z.string().min(1, 'Termination reason is required'),
  terminationDate: z.string().min(1, 'Termination date is required'),
  noticeDate: z.string().optional(),
  lastDayWorked: z.string().min(1, 'Last day worked is required'),
  payThroughDate: z.string().min(1, 'Pay through date is required'),
  regrettable: z.boolean().default(false),
  payoutVacation: z.boolean().default(true),
  vacationHours: z.number().optional(),
  returnEquipment: z.boolean().default(true),
  exitInterview: z.boolean().default(true),
  revokeAccess: z.boolean().default(true),
})

// =============================================================================
// TYPES
// =============================================================================

export type HireEmployeeInput = z.infer<typeof HireEmployeeSchema>
export type CreatePositionInput = z.infer<typeof CreatePositionSchema>
export type TerminateEmployeeInput = z.infer<typeof TerminateEmployeeSchema>

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> }

// =============================================================================
// ID GENERATORS
// =============================================================================

async function generateWorkerId(): Promise<string> {
  const count = await prisma.worker.count()
  return `EMP-${String(count + 1).padStart(5, '0')}`
}

async function generatePositionId(): Promise<string> {
  const count = await prisma.position.count()
  return `P-${String(count + 1).padStart(5, '0')}`
}

async function generateTransactionId(): Promise<string> {
  const count = await prisma.bPTransaction.count()
  return `TXN-${String(count + 1).padStart(6, '0')}`
}

// =============================================================================
// HIRE EMPLOYEE
// =============================================================================

export async function hireEmployee(
  input: HireEmployeeInput,
  initiatorId?: string
): Promise<ActionResult<{ workerId: string; transactionId: string }>> {
  try {
    const resolvedInitiatorId = initiatorId || (await getCurrentWorkerId())

    // Validate input
    const validationResult = HireEmployeeSchema.safeParse(input)
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const data = validationResult.data

    // Check for duplicate email
    const existingWorker = await prisma.worker.findUnique({
      where: { email: data.email }
    })
    if (existingWorker) {
      return {
        success: false,
        error: 'A worker with this email already exists'
      }
    }

    // Generate IDs
    const workerId = await generateWorkerId()
    const transactionId = await generateTransactionId()

    // Get or find the Hire BP definition
    let hireBP = await prisma.bPDefinition.findFirst({
      where: { code: 'BP-HIRE', isActive: true },
      include: { steps: { orderBy: { stepOrder: 'asc' } } }
    })

    // If no BP definition exists, create a basic one
    if (!hireBP) {
      hireBP = await prisma.bPDefinition.create({
        data: {
          code: 'BP-HIRE',
          name: 'Hire Employee',
          description: 'Standard hire employee business process',
          category: 'STAFFING',
          isActive: true,
          steps: {
            create: [
              {
                stepOrder: 1,
                name: 'Initiation',
                stepType: 'INITIATION',
                assigneeType: 'INITIATOR',
                isRequired: true,
              },
              {
                stepOrder: 2,
                name: 'Manager Approval',
                stepType: 'APPROVAL',
                assigneeType: 'MANAGER',
                isRequired: true,
                dueInDays: 3,
              },
              {
                stepOrder: 3,
                name: 'HR Review',
                stepType: 'REVIEW',
                assigneeType: 'HR_PARTNER',
                isRequired: true,
                dueInDays: 2,
              },
            ]
          }
        },
        include: { steps: { orderBy: { stepOrder: 'asc' } } }
      })
    }

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the worker
      const worker = await tx.worker.create({
        data: {
          workerId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          workerType: data.employeeType === 'EMPLOYEE' ? 'EMPLOYEE' : 'CONTINGENT_WORKER',
          employmentStatus: 'PENDING_HIRE', // Will be ACTIVE after BP completes
          hireDate: new Date(data.hireDate),
          businessTitle: data.businessTitle || null,
          jobProfileId: data.jobProfileId,
          supervisoryOrgId: data.supervisoryOrgId,
          companyId: data.companyId,
          locationId: data.locationId,
          costCenterId: data.costCenterId || null,
          annualSalary: data.compensationType === 'SALARY' ? data.amount : null,
          hourlyRate: data.compensationType === 'HOURLY' ? data.amount : null,
          currency: data.currency,
          payFrequency: data.frequency === 'ANNUAL' ? 'BIWEEKLY' : data.frequency,
        }
      })

      // 2. If position was specified, link it
      if (data.positionId) {
        await tx.position.update({
          where: { id: data.positionId },
          data: {
            workerId: worker.id,
            status: 'FILLED',
          }
        })
      }

      // 3. Create BP transaction
      const transaction = await tx.bPTransaction.create({
        data: {
          transactionId,
          definitionId: hireBP!.id,
          subjectType: 'Worker',
          subjectId: worker.id,
          subjectDisplay: `${data.firstName} ${data.lastName}`,
          initiatorId: resolvedInitiatorId,
          status: 'IN_PROGRESS',
          effectiveDate: new Date(data.hireDate),
          transactionData: JSON.stringify({
            ...data,
            workerId: worker.id,
            workerIdDisplay: workerId,
          }),
        }
      })

      // 4. Create BP transaction steps
      for (const step of hireBP!.steps) {
        const dueDate = step.dueInDays 
          ? new Date(Date.now() + step.dueInDays * 24 * 60 * 60 * 1000)
          : null

        // First step (initiation) is auto-completed
        const isFirstStep = step.stepOrder === 1

        await tx.bPTransactionStep.create({
          data: {
            transactionId: transaction.id,
            stepId: step.id,
            assigneeId: isFirstStep ? resolvedInitiatorId : null,
            status: isFirstStep ? 'COMPLETE' : 'PENDING',
            completedById: isFirstStep ? resolvedInitiatorId : null,
            completedAt: isFirstStep ? new Date() : null,
            dueDate,
          }
        })
      }

      return { worker, transaction }
    })

    // Route next pending step to the correct assignee
    await assignNextPendingStep(result.transaction.id, 1, resolvedInitiatorId)

    // Revalidate relevant pages
    revalidatePath('/workers')
    revalidatePath('/staffing/positions')
    revalidatePath('/')

    return {
      success: true,
      data: {
        workerId: result.worker.workerId,
        transactionId: result.transaction.transactionId,
      }
    }
  } catch (error) {
    console.error('Hire employee error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

// =============================================================================
// CREATE POSITION
// =============================================================================

export async function createPosition(
  input: CreatePositionInput,
  initiatorId?: string
): Promise<ActionResult<{ positionId: string; transactionId: string }>> {
  try {
    const resolvedInitiatorId = initiatorId || (await getCurrentWorkerId())

    // Validate input
    const validationResult = CreatePositionSchema.safeParse(input)
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const data = validationResult.data

    // Generate IDs
    const positionId = await generatePositionId()
    const transactionId = await generateTransactionId()

    // Get or create Create Position BP
    let createPosBP = await prisma.bPDefinition.findFirst({
      where: {
        OR: [{ code: 'BP-CREATE-POS' }, { code: 'BP-CREATE-POSITION' }],
        isActive: true,
      },
      include: { steps: { orderBy: { stepOrder: 'asc' } } }
    })

    if (!createPosBP) {
      createPosBP = await prisma.bPDefinition.create({
        data: {
          code: 'BP-CREATE-POS',
          name: 'Create Position',
          description: 'Create a new position for staffing',
          category: 'STAFFING',
          isActive: true,
          steps: {
            create: [
              {
                stepOrder: 1,
                name: 'Initiation',
                stepType: 'INITIATION',
                assigneeType: 'INITIATOR',
                isRequired: true,
              },
              {
                stepOrder: 2,
                name: 'HR Approval',
                stepType: 'APPROVAL',
                assigneeType: 'HR_PARTNER',
                isRequired: true,
                dueInDays: 5,
              },
            ]
          }
        },
        include: { steps: { orderBy: { stepOrder: 'asc' } } }
      })
    }

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create position
      const position = await tx.position.create({
        data: {
          positionId,
          title: data.title,
          jobProfileId: data.jobProfileId,
          supervisoryOrgId: data.supervisoryOrgId,
          locationId: data.locationId,
          costCenterId: data.costCenterId || null,
          status: data.availableForHire ? 'OPEN' : 'FROZEN',
          ftePercentage: data.ftePercentage,
          isManagement: data.isManagement,
          isCritical: data.isCritical,
          earliestHireDate: data.earliestHireDate ? new Date(data.earliestHireDate) : null,
          latestHireDate: data.latestHireDate ? new Date(data.latestHireDate) : null,
        }
      })

      // 2. Create BP transaction
      const transaction = await tx.bPTransaction.create({
        data: {
          transactionId,
          definitionId: createPosBP!.id,
          subjectType: 'Position',
          subjectId: position.id,
          subjectDisplay: data.title,
          initiatorId: resolvedInitiatorId,
          status: 'IN_PROGRESS',
          transactionData: JSON.stringify({
            ...data,
            positionId: position.id,
            positionIdDisplay: positionId,
          }),
        }
      })

      // 3. Create BP transaction steps
      for (const step of createPosBP!.steps) {
        const isFirstStep = step.stepOrder === 1
        const dueDate = step.dueInDays 
          ? new Date(Date.now() + step.dueInDays * 24 * 60 * 60 * 1000)
          : null

        await tx.bPTransactionStep.create({
          data: {
            transactionId: transaction.id,
            stepId: step.id,
            assigneeId: isFirstStep ? resolvedInitiatorId : null,
            status: isFirstStep ? 'COMPLETE' : 'PENDING',
            completedById: isFirstStep ? resolvedInitiatorId : null,
            completedAt: isFirstStep ? new Date() : null,
            dueDate,
          }
        })
      }

      return { position, transaction }
    })

    await assignNextPendingStep(result.transaction.id, 1, resolvedInitiatorId)

    revalidatePath('/staffing/positions')
    revalidatePath('/')

    return {
      success: true,
      data: {
        positionId: result.position.positionId,
        transactionId: result.transaction.transactionId,
      }
    }
  } catch (error) {
    console.error('Create position error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

// =============================================================================
// TERMINATE EMPLOYEE
// =============================================================================

export async function terminateEmployee(
  input: TerminateEmployeeInput,
  initiatorId?: string
): Promise<ActionResult<{ transactionId: string }>> {
  try {
    const resolvedInitiatorId = initiatorId || (await getCurrentWorkerId())

    // Validate input
    const validationResult = TerminateEmployeeSchema.safeParse(input)
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const data = validationResult.data

    // Verify worker exists and is active
    const worker = await prisma.worker.findUnique({
      where: { id: data.workerId },
      include: { position: true }
    })

    if (!worker) {
      return { success: false, error: 'Worker not found' }
    }

    if (worker.employmentStatus !== 'ACTIVE') {
      return { success: false, error: 'Worker is not currently active' }
    }

    const transactionId = await generateTransactionId()

    // Get or create Terminate BP
    let terminateBP = await prisma.bPDefinition.findFirst({
      where: { code: 'BP-TERMINATE', isActive: true },
      include: { steps: { orderBy: { stepOrder: 'asc' } } }
    })

    if (!terminateBP) {
      terminateBP = await prisma.bPDefinition.create({
        data: {
          code: 'BP-TERMINATE',
          name: 'Terminate Employee',
          description: 'Employee termination business process',
          category: 'STAFFING',
          isActive: true,
          steps: {
            create: [
              {
                stepOrder: 1,
                name: 'Initiation',
                stepType: 'INITIATION',
                assigneeType: 'INITIATOR',
                isRequired: true,
              },
              {
                stepOrder: 2,
                name: 'HR Review',
                stepType: 'APPROVAL',
                assigneeType: 'HR_PARTNER',
                isRequired: true,
                dueInDays: 1,
              },
              {
                stepOrder: 3,
                name: 'IT Access Revocation',
                stepType: 'TO_DO',
                assigneeType: 'SECURITY_GROUP',
                isRequired: true,
                dueInDays: 1,
              },
            ]
          }
        },
        include: { steps: { orderBy: { stepOrder: 'asc' } } }
      })
    }

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create BP transaction (don't update worker yet - BP must complete first)
      const transaction = await tx.bPTransaction.create({
        data: {
          transactionId,
          definitionId: terminateBP!.id,
          subjectType: 'Worker',
          subjectId: worker.id,
          subjectDisplay: `${worker.firstName} ${worker.lastName}`,
          initiatorId: resolvedInitiatorId,
          status: 'IN_PROGRESS',
          effectiveDate: new Date(data.terminationDate),
          transactionData: JSON.stringify({
            ...data,
            workerName: `${worker.firstName} ${worker.lastName}`,
            workerId: worker.id,
            workerIdDisplay: worker.workerId,
          }),
        }
      })

      // 2. Create BP transaction steps
      for (const step of terminateBP!.steps) {
        const isFirstStep = step.stepOrder === 1
        const dueDate = step.dueInDays 
          ? new Date(Date.now() + step.dueInDays * 24 * 60 * 60 * 1000)
          : null

        await tx.bPTransactionStep.create({
          data: {
            transactionId: transaction.id,
            stepId: step.id,
            assigneeId: isFirstStep ? resolvedInitiatorId : null,
            status: isFirstStep ? 'COMPLETE' : 'PENDING',
            completedById: isFirstStep ? resolvedInitiatorId : null,
            completedAt: isFirstStep ? new Date() : null,
            dueDate,
          }
        })
      }

      return { transaction }
    })

    await assignNextPendingStep(result.transaction.id, 1, resolvedInitiatorId)

    revalidatePath('/workers')
    revalidatePath('/')

    return {
      success: true,
      data: {
        transactionId: result.transaction.transactionId,
      }
    }
  } catch (error) {
    console.error('Terminate employee error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
