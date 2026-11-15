'use server'

import prisma from '@/lib/db'

/**
 * Demo session helpers for the practice sandbox.
 * In production this would come from auth (Clerk/NextAuth/etc).
 *
 * Defaults to Sarah Chen (EMP-001 / CEO) as the acting analyst.
 */
export async function getCurrentWorkerId(): Promise<string> {
  const worker =
    (await prisma.worker.findFirst({
      where: { workerId: 'EMP-001', employmentStatus: 'ACTIVE' },
      select: { id: true },
    })) ||
    (await prisma.worker.findFirst({
      where: { employmentStatus: 'ACTIVE' },
      select: { id: true },
    }))

  if (!worker) {
    throw new Error('No active workers found. Run the seed script first.')
  }

  return worker.id
}

export async function getCurrentWorker() {
  const id = await getCurrentWorkerId()
  return prisma.worker.findUnique({
    where: { id },
    select: {
      id: true,
      workerId: true,
      firstName: true,
      lastName: true,
      businessTitle: true,
      email: true,
    },
  })
}
