// Re-export Prisma types for convenience
export type {
  Company,
  Location,
  CostCenter,
  SupervisoryOrganization,
  JobFamily,
  JobProfile,
  Position,
  Worker,
  BPDefinition,
  BPStep,
  ConditionRule,
  BPTransaction,
  BPTransactionStep,
  SecurityGroup,
  SecurityGroupMember,
  DomainSecurityPolicy,
  BPSecurityPolicy,
  CustomReport,
  CalculatedField,
  PracticeLab,
  LabCompletion,
  AuditLog,
  TenantSnapshot,
} from '@prisma/client'

// Enums
export {
  StaffingModel,
  PositionStatus,
  WorkerType,
  EmploymentStatus,
  BPCategory,
  BPStepType,
  AssigneeType,
  ConditionOperator,
  ConditionAction,
  TransactionStatus,
  StepStatus,
  SecurityGroupType,
} from '@prisma/client'

// Extended types with relations
import type { Prisma } from '@prisma/client'

export type WorkerWithRelations = Prisma.WorkerGetPayload<{
  include: {
    position: true
    jobProfile: true
    supervisoryOrg: true
    manager: true
    directReports: true
    company: true
    location: true
    costCenter: true
  }
}>

export type PositionWithRelations = Prisma.PositionGetPayload<{
  include: {
    worker: true
    jobProfile: true
    supervisoryOrg: true
    location: true
    costCenter: true
  }
}>

export type SupervisoryOrgWithRelations = Prisma.SupervisoryOrganizationGetPayload<{
  include: {
    parent: true
    children: true
    manager: true
    positions: true
    workers: true
  }
}>

export type BPDefinitionWithSteps = Prisma.BPDefinitionGetPayload<{
  include: {
    steps: {
      include: {
        conditionRules: true
        assigneeGroup: true
      }
    }
    securityPolicies: {
      include: {
        securityGroup: true
      }
    }
  }
}>

export type BPTransactionWithDetails = Prisma.BPTransactionGetPayload<{
  include: {
    definition: true
    initiator: true
    steps: {
      include: {
        step: true
        assignee: true
        completedBy: true
      }
    }
  }
}>

export type SecurityGroupWithMembers = Prisma.SecurityGroupGetPayload<{
  include: {
    members: {
      include: {
        worker: true
      }
    }
    domainPolicies: true
    bpPolicies: true
  }
}>

// UI-specific types
export interface TaskItem {
  id: string
  transactionId: string
  type: 'APPROVAL' | 'REVIEW' | 'TO_DO'
  title: string
  subject: string
  initiator: string
  dueDate: Date | null
  status: 'PENDING' | 'OVERDUE'
  businessProcess: string
}

export interface CommandItem {
  id: string
  name: string
  description?: string
  category: 'Task' | 'Report' | 'Setup' | 'Search'
  icon?: string
  action: string
  keywords?: string[]
}

export interface OrgTreeNode {
  id: string
  code: string
  name: string
  managerId?: string
  managerName?: string
  workerCount: number
  positionCount: number
  openPositions: number
  children: OrgTreeNode[]
}
