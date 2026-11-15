'use server'

/**
 * Business Process Engine
 *
 * Shared routing and completion helpers used by staffing mutations
 * and approval actions.
 */

import prisma from '@/lib/db'

export async function determineAssignee(
  assigneeType: string,
  assigneeGroupId: string | null,
  transactionId: string,
  initiatorId: string
): Promise<string | null> {
  switch (assigneeType) {
    case 'INITIATOR': {
      const transaction = await prisma.bPTransaction.findUnique({
        where: { id: transactionId },
        select: { initiatorId: true },
      })
      return transaction?.initiatorId || initiatorId || null
    }

    case 'MANAGER': {
      const txn = await prisma.bPTransaction.findUnique({
        where: { id: transactionId },
        select: { subjectType: true, subjectId: true },
      })
      if (txn?.subjectType === 'Worker') {
        const worker = await prisma.worker.findUnique({
          where: { id: txn.subjectId },
          select: { managerId: true },
        })
        return worker?.managerId || null
      }
      return null
    }

    case 'SECURITY_GROUP': {
      if (assigneeGroupId) {
        const member = await prisma.securityGroupMember.findFirst({
          where: {
            groupId: assigneeGroupId,
            OR: [
              { expirationDate: null },
              { expirationDate: { gt: new Date() } },
            ],
          },
          select: { workerId: true },
        })
        return member?.workerId || null
      }
      return null
    }

    case 'HR_PARTNER': {
      const hrGroup = await prisma.securityGroup.findFirst({
        where: {
          OR: [
            { code: 'SG-HR-PARTNER' },
            { code: 'HR_PARTNER' },
            { roleType: 'HR Partner' },
          ],
        },
        include: {
          members: {
            take: 1,
            where: {
              OR: [
                { expirationDate: null },
                { expirationDate: { gt: new Date() } },
              ],
            },
          },
        },
      })
      return hrGroup?.members[0]?.workerId || null
    }

    case 'SPECIFIC_USER':
      return null

    default:
      return null
  }
}

export async function getNextPendingStep(
  transactionId: string,
  currentStepOrder: number
) {
  return prisma.bPTransactionStep.findFirst({
    where: {
      transactionId,
      step: {
        stepOrder: { gt: currentStepOrder },
      },
      status: 'PENDING',
    },
    include: {
      step: true,
    },
    orderBy: {
      step: {
        stepOrder: 'asc',
      },
    },
  })
}

/**
 * Assign the first pending step after initiation (or after an approval).
 */
export async function assignNextPendingStep(
  transactionId: string,
  currentStepOrder: number,
  initiatorId: string
): Promise<string | null> {
  const nextStep = await getNextPendingStep(transactionId, currentStepOrder)
  if (!nextStep) return null

  const assigneeId = await determineAssignee(
    nextStep.step.assigneeType,
    nextStep.step.assigneeGroupId,
    transactionId,
    initiatorId
  )

  await prisma.bPTransactionStep.update({
    where: { id: nextStep.id },
    data: {
      assigneeId,
      dueDate: nextStep.step.dueInDays
        ? new Date(Date.now() + nextStep.step.dueInDays * 24 * 60 * 60 * 1000)
        : null,
    },
  })

  return nextStep.id
}

/**
 * Apply final state changes when a BP transaction completes.
 */
export async function handleTransactionCompletion(transactionId: string) {
  const transaction = await prisma.bPTransaction.findUnique({
    where: { id: transactionId },
    include: {
      definition: true,
    },
  })

  if (!transaction || !transaction.transactionData) return

  const data = JSON.parse(transaction.transactionData)
  const bpCode = transaction.definition.code

  try {
    switch (bpCode) {
      case 'BP-HIRE':
      case 'HIRE_EMPLOYEE': {
        if (data.workerId) {
          await prisma.worker.update({
            where: { id: data.workerId },
            data: { employmentStatus: 'ACTIVE' },
          })

          if (data.positionId) {
            await prisma.position.update({
              where: { id: data.positionId },
              data: {
                status: 'FILLED',
                workerId: data.workerId,
              },
            })
          }
        }
        break
      }

      case 'BP-CREATE-POS':
      case 'BP-CREATE-POSITION':
      case 'CREATE_POSITION': {
        if (data.positionId) {
          await prisma.position.update({
            where: { id: data.positionId },
            data: {
              status: data.availableForHire === false ? 'FROZEN' : 'OPEN',
            },
          })
        }
        break
      }

      case 'BP-TERMINATE':
      case 'TERMINATE_EMPLOYEE': {
        if (data.workerId) {
          const worker = await prisma.worker.findUnique({
            where: { id: data.workerId },
            include: { position: true },
          })

          await prisma.worker.update({
            where: { id: data.workerId },
            data: {
              employmentStatus: 'TERMINATED',
              terminationDate: data.terminationDate
                ? new Date(data.terminationDate)
                : new Date(),
            },
          })

          if (worker?.position) {
            await prisma.position.update({
              where: { id: worker.position.id },
              data: {
                status: 'OPEN',
                workerId: null,
              },
            })
          }
        }
        break
      }

      case 'BP-CHANGE-COMP':
      case 'CHANGE_COMPENSATION': {
        if (data.workerId && data.proposedSalary) {
          await prisma.worker.update({
            where: { id: data.workerId },
            data: { annualSalary: data.proposedSalary },
          })
        }
        break
      }

      default:
        console.log(`No completion handler for BP type: ${bpCode}`)
    }
  } catch (error) {
    console.error(`Error in transaction completion handler for ${bpCode}:`, error)
  }
}
