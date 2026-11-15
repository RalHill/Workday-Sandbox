/**
 * End-to-end workflow smoke test (server-side).
 * Exercises Hire, Create Position, Terminate, Approve, and Search.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`ASSERT: ${message}`)
  console.log(`  OK: ${message}`)
}

async function main() {
  console.log('\n=== E2E Workflow Smoke Test ===\n')

  const initiator = await prisma.worker.findFirst({
    where: { workerId: 'EMP-001' },
  })
  if (!initiator) throw new Error('Seed worker EMP-001 not found')

  const org = await prisma.supervisoryOrganization.findFirst({ where: { isActive: true } })
  const job = await prisma.jobProfile.findFirst({ where: { isActive: true } })
  const location = await prisma.location.findFirst({ where: { isActive: true } })
  const company = await prisma.company.findFirst({ where: { isActive: true } })

  if (!org || !job || !location || !company) {
    throw new Error('Missing seed org/job/location/company')
  }

  // Dynamic import of server actions (they use 'use server' but work in tsx with prisma)
  const { hireEmployee, createPosition, terminateEmployee } = await import('../src/actions/staffing')
  const { approveStep } = await import('../src/actions/approvals')
  const { globalSearch } = await import('../src/actions/queries')

  // -------------------------------------------------------------------------
  // 1. Create Position
  // -------------------------------------------------------------------------
  console.log('1. Create Position')
  const posResult = await createPosition(
    {
      title: `E2E Test Position ${Date.now()}`,
      jobProfileId: job.id,
      supervisoryOrgId: org.id,
      locationId: location.id,
      workerType: 'EMPLOYEE',
      timeType: 'FULL_TIME',
      scheduledHours: 40,
      ftePercentage: 1,
      isManagement: false,
      isCritical: false,
      availableForHire: true,
    },
    initiator.id
  )
  await assert(posResult.success === true, 'Create Position succeeded')
  if (!posResult.success) throw new Error(posResult.error)

  const createdPos = await prisma.position.findFirst({
    where: { positionId: posResult.data.positionId },
  })
  await assert(!!createdPos, `Position ${posResult.data.positionId} exists in DB`)

  // -------------------------------------------------------------------------
  // 2. Hire Employee
  // -------------------------------------------------------------------------
  console.log('2. Hire Employee')
  const email = `e2e.${Date.now()}@globaltech.example`
  const hireResult = await hireEmployee(
    {
      firstName: 'E2E',
      lastName: 'HireTest',
      email,
      hireDate: new Date().toISOString().slice(0, 10),
      hireReason: 'new_hire',
      supervisoryOrgId: org.id,
      jobProfileId: job.id,
      employeeType: 'EMPLOYEE',
      timeType: 'FULL_TIME',
      locationId: location.id,
      scheduledHours: 40,
      companyId: company.id,
      compensationType: 'SALARY',
      amount: 95000,
      currency: 'USD',
      frequency: 'ANNUAL',
    },
    initiator.id
  )
  await assert(hireResult.success === true, 'Hire Employee succeeded')
  if (!hireResult.success) throw new Error(hireResult.error)

  const hired = await prisma.worker.findFirst({ where: { email } })
  await assert(!!hired, 'Hired worker exists')
  await assert(hired!.employmentStatus === 'PENDING_HIRE', 'Worker is PENDING_HIRE')

  // -------------------------------------------------------------------------
  // 3. Pending inbox tasks exist
  // -------------------------------------------------------------------------
  console.log('3. Inbox pending tasks')
  const pending = await prisma.bPTransactionStep.findMany({
    where: { status: 'PENDING', transaction: { transactionId: hireResult.data.transactionId } },
    include: { step: true, assignee: true },
  })
  await assert(pending.length > 0, `Hire has ${pending.length} pending step(s)`)
  await assert(!!pending[0].assigneeId, 'Next step has an assignee')

  // -------------------------------------------------------------------------
  // 4. Approve all remaining hire steps
  // -------------------------------------------------------------------------
  console.log('4. Approve hire workflow')
  let safety = 0
  while (safety < 10) {
    safety++
    const next = await prisma.bPTransactionStep.findFirst({
      where: {
        status: 'PENDING',
        transaction: { transactionId: hireResult.data.transactionId },
      },
      include: { step: true },
      orderBy: { createdAt: 'asc' },
    })
    if (!next) break

    const approve = await approveStep(
      { stepId: next.id, comments: 'E2E auto-approve' },
      initiator.id
    )
    await assert(approve.success === true, `Approved step "${next.step.name}"`)
  }

  const hireTxn = await prisma.bPTransaction.findFirst({
    where: { transactionId: hireResult.data.transactionId },
  })
  await assert(hireTxn?.status === 'COMPLETED', 'Hire transaction COMPLETED')

  const hiredAfter = await prisma.worker.findUnique({ where: { id: hired!.id } })
  await assert(hiredAfter?.employmentStatus === 'ACTIVE', 'Worker activated after hire BP complete')

  // -------------------------------------------------------------------------
  // 5. Terminate Employee
  // -------------------------------------------------------------------------
  console.log('5. Terminate Employee')
  const termResult = await terminateEmployee(
    {
      workerId: hired!.id,
      terminationType: 'VOLUNTARY',
      terminationReason: 'resignation',
      terminationDate: new Date().toISOString().slice(0, 10),
      lastDayWorked: new Date().toISOString().slice(0, 10),
      payThroughDate: new Date().toISOString().slice(0, 10),
      regrettable: false,
      payoutVacation: true,
      vacationHours: 40,
      returnEquipment: true,
      exitInterview: true,
      revokeAccess: true,
    },
    initiator.id
  )
  await assert(termResult.success === true, 'Terminate Employee succeeded')
  if (!termResult.success) throw new Error(termResult.error)

  // Approve terminate steps
  safety = 0
  while (safety < 10) {
    safety++
    const next = await prisma.bPTransactionStep.findFirst({
      where: {
        status: 'PENDING',
        transaction: { transactionId: termResult.data.transactionId },
      },
      include: { step: true },
    })
    if (!next) break
    const approve = await approveStep(
      { stepId: next.id, comments: 'E2E terminate approve' },
      initiator.id
    )
    await assert(approve.success === true, `Approved terminate step "${next.step.name}"`)
  }

  const termWorker = await prisma.worker.findUnique({ where: { id: hired!.id } })
  await assert(termWorker?.employmentStatus === 'TERMINATED', 'Worker TERMINATED after BP complete')

  // -------------------------------------------------------------------------
  // 6. Global Search
  // -------------------------------------------------------------------------
  console.log('6. Global Search')
  const search = await globalSearch('Chen', 5)
  await assert(search.workers.length > 0, `Search found ${search.workers.length} worker(s) for "Chen"`)

  console.log('\n=== ALL E2E CHECKS PASSED ===\n')
}

main()
  .catch((err) => {
    console.error('\nE2E FAILED:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
