'use server'

/**
 * Server Actions - Query Functions
 * 
 * These provide type-safe, cached data fetching for UI components.
 * Used to populate dropdowns, search results, and dynamic lists.
 */

import prisma from '@/lib/db'
import { unstable_cache } from 'next/cache'

// =============================================================================
// ORGANIZATION QUERIES
// =============================================================================

/**
 * Get all active supervisory organizations for dropdowns
 */
export async function getSupervisoryOrgs() {
  return prisma.supervisoryOrganization.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      managerId: true,
      staffingModel: true,
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

/**
 * Get all active locations for dropdowns
 */
export async function getLocations() {
  return prisma.location.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      city: true,
      state: true,
      country: true,
    },
    orderBy: { name: 'asc' }
  })
}

/**
 * Get all active cost centers for dropdowns
 */
export async function getCostCenters() {
  return prisma.costCenter.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: { name: 'asc' }
  })
}

/**
 * Get all companies
 */
export async function getCompanies() {
  return prisma.company.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      currency: true,
    },
    orderBy: { name: 'asc' }
  })
}

// =============================================================================
// JOB CATALOG QUERIES
// =============================================================================

/**
 * Get all active job profiles for dropdowns
 */
export async function getJobProfiles() {
  return prisma.jobProfile.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      title: true,
      jobLevel: true,
      managementLevel: true,
      minSalary: true,
      midSalary: true,
      maxSalary: true,
      jobFamily: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: { title: 'asc' }
  })
}

/**
 * Get all job families for filtering
 */
export async function getJobFamilies() {
  return prisma.jobFamily.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: { name: 'asc' }
  })
}

// =============================================================================
// POSITION QUERIES
// =============================================================================

/**
 * Get open positions for hire dropdown
 */
export async function getOpenPositions() {
  return prisma.position.findMany({
    where: { 
      status: 'OPEN',
      workerId: null 
    },
    select: {
      id: true,
      positionId: true,
      title: true,
      status: true,
      jobProfile: {
        select: {
          id: true,
          title: true,
          code: true,
        }
      },
      supervisoryOrg: {
        select: {
          id: true,
          name: true,
        }
      },
      location: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: { title: 'asc' }
  })
}

/**
 * Get position by ID with full details
 */
export async function getPositionById(id: string) {
  return prisma.position.findUnique({
    where: { id },
    include: {
      jobProfile: true,
      supervisoryOrg: true,
      location: true,
      costCenter: true,
      worker: true,
    }
  })
}

// =============================================================================
// WORKER QUERIES
// =============================================================================

/**
 * Get active workers for selection (e.g., manager selection, termination)
 */
export async function getActiveWorkers() {
  return prisma.worker.findMany({
    where: { employmentStatus: 'ACTIVE' },
    select: {
      id: true,
      workerId: true,
      firstName: true,
      lastName: true,
      businessTitle: true,
      email: true,
      supervisoryOrg: {
        select: {
          id: true,
          name: true,
        }
      },
      jobProfile: {
        select: {
          id: true,
          title: true,
        }
      }
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
  })
}

/**
 * Search workers by name or ID
 */
export async function searchWorkers(query: string, limit = 10) {
  if (!query || query.length < 2) return []
  
  return prisma.worker.findMany({
    where: {
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { workerId: { contains: query } },
        { email: { contains: query } },
      ],
      employmentStatus: 'ACTIVE'
    },
    select: {
      id: true,
      workerId: true,
      firstName: true,
      lastName: true,
      businessTitle: true,
      supervisoryOrg: {
        select: { name: true }
      }
    },
    take: limit,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
  })
}

/**
 * Get worker by ID with full details
 */
export async function getWorkerById(id: string) {
  return prisma.worker.findUnique({
    where: { id },
    include: {
      position: true,
      jobProfile: true,
      supervisoryOrg: true,
      manager: true,
      directReports: true,
      company: true,
      location: true,
      costCenter: true,
    }
  })
}

// =============================================================================
// SECURITY GROUP QUERIES
// =============================================================================

/**
 * Get security groups for assignment
 */
export async function getSecurityGroups() {
  return prisma.securityGroup.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      groupType: true,
      description: true,
      _count: {
        select: { members: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

// =============================================================================
// BUSINESS PROCESS QUERIES
// =============================================================================

/**
 * Get BP definition by process type (e.g., 'HIRE', 'TERMINATE')
 */
export async function getBPDefinitionByType(processType: string) {
  return prisma.bPDefinition.findFirst({
    where: { 
      code: { contains: processType },
      isActive: true 
    },
    include: {
      steps: {
        orderBy: { stepOrder: 'asc' },
        include: {
          assigneeGroup: true,
          conditionRules: true,
        }
      }
    }
  })
}

/**
 * Get pending tasks for a worker (inbox items)
 */
export async function getPendingTasksForWorker(workerId: string) {
  return prisma.bPTransactionStep.findMany({
    where: {
      assigneeId: workerId,
      status: 'PENDING'
    },
    include: {
      transaction: {
        include: {
          definition: true,
          initiator: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        }
      },
      step: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Get tasks for security group members
 */
export async function getPendingTasksForSecurityGroup(groupId: string) {
  return prisma.bPTransactionStep.findMany({
    where: {
      step: {
        assigneeGroupId: groupId
      },
      status: 'PENDING',
      assigneeId: null // Unassigned group tasks
    },
    include: {
      transaction: {
        include: {
          definition: true,
          initiator: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        }
      },
      step: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

// =============================================================================
// GLOBAL SEARCH
// =============================================================================

/**
 * Global search across workers, positions, organizations
 */
export async function globalSearch(query: string, limit = 5) {
  if (!query || query.length < 2) {
    return { workers: [], positions: [], organizations: [] }
  }

  const [workers, positions, organizations] = await Promise.all([
    prisma.worker.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { workerId: { contains: query } },
        ],
        employmentStatus: 'ACTIVE'
      },
      select: {
        id: true,
        workerId: true,
        firstName: true,
        lastName: true,
        businessTitle: true,
      },
      take: limit,
    }),
    prisma.position.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { positionId: { contains: query } },
        ]
      },
      select: {
        id: true,
        positionId: true,
        title: true,
        status: true,
      },
      take: limit,
    }),
    prisma.supervisoryOrganization.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
        ],
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
      take: limit,
    }),
  ])

  return { workers, positions, organizations }
}
