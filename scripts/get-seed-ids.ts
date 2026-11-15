import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function main() {
  const w = await p.worker.findFirst({
    where: { employmentStatus: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, workerId: true },
  })
  const hr = await p.securityGroup.findFirst({
    where: { code: 'SG-HR-PARTNER' },
    include: { members: { take: 1, include: { worker: { select: { id: true, firstName: true, lastName: true } } } } },
  })
  const bpCodes = await p.bPDefinition.findMany({ select: { code: true, name: true } })
  console.log(JSON.stringify({ w, hr, bpCodes }, null, 2))
}

main()
  .finally(() => p.$disconnect())
