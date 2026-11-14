# Workday HCM Domain Reference

This document provides a comprehensive reference for the Workday HCM domain model as implemented in the Practice Sandbox.

## Table of Contents

1. [Organizational Hierarchy](#organizational-hierarchy)
2. [Staffing Models](#staffing-models)
3. [Job Catalog](#job-catalog)
4. [Positions & Workers](#positions--workers)
5. [Business Process Engine](#business-process-engine)
6. [Security Framework](#security-framework)
7. [Calculated Fields](#calculated-fields)
8. [Custom Reports](#custom-reports)

---

## Organizational Hierarchy

### Supervisory Organizations

Supervisory Organizations are the primary organizational unit in Workday. They form a hierarchical tree structure representing your company's reporting relationships.

**Key Properties:**
- `code` - Unique identifier (e.g., "ORG-ENG")
- `name` - Display name (e.g., "Engineering")
- `parentId` - Reference to parent organization (null for root)
- `managerId` - The worker who manages this org
- `staffingModel` - Either `POSITION_BASED` or `JOB_BASED`

**Hierarchy Example:**
```
Global Tech Corp (CEO)
├── Engineering (VP Engineering)
│   ├── Platform Engineering (Director)
│   └── Product Engineering (Director)
├── Human Resources (VP HR)
│   ├── HR Operations (Manager)
│   └── Talent Acquisition (Manager)
└── Finance (VP Finance)
    └── FP&A (Director)
```

### Company

The legal entity for payroll, benefits, and compliance purposes.

**Key Properties:**
- `code` - Short code (e.g., "GTC")
- `name` - Company name
- `legalName` - Official legal name
- `country` - Primary country of operation
- `currency` - Default currency

### Location

Physical work locations where workers are assigned.

**Key Properties:**
- `code` - Location code (e.g., "HQ-NYC")
- `name` - Location name
- `address`, `city`, `state`, `postalCode`, `country`
- `timeZone` - IANA timezone identifier
- `companyId` - Parent company

### Cost Center

Financial tracking units for budgeting and expense allocation.

**Key Properties:**
- `code` - Cost center code (e.g., "CC-2000")
- `name` - Cost center name
- `companyId` - Parent company

---

## Staffing Models

Workday supports two staffing models:

### Position-Based Staffing (Recommended)

In position-based staffing, you create "seats" (positions) in your organization before hiring workers to fill them.

**Flow:**
1. Create Position → Position status = `OPEN`
2. Hire Worker into Position → Position status = `FILLED`
3. Worker leaves → Position status = `OPEN` or `CLOSED`

**Position Statuses:**
- `OPEN` - Available for hire
- `FILLED` - Occupied by a worker
- `FROZEN` - Temporarily unavailable (budget freeze, etc.)
- `CLOSED` - Permanently removed from org

**Benefits:**
- Clear headcount planning
- Position history tracking
- Budget control per seat
- Hiring restrictions per position

### Job-Based Staffing

In job-based staffing, workers are hired directly into job profiles without a position intermediary. Simpler but less control.

---

## Job Catalog

### Job Family

Groupings of related job profiles.

**Examples:**
- Engineering
- Human Resources
- Finance & Accounting
- Sales & Business Development

### Job Profile

Templates defining job roles including:

**Key Properties:**
- `code` - Unique job code (e.g., "JP-ENG-SR")
- `title` - Job title
- `jobFamilyId` - Parent job family
- `jobLevel` - Numeric level (1-10)
- `managementLevel` - Executive / Director / Manager / Individual Contributor
- Compensation eligibility flags (`isEligibleForBonus`, `isEligibleForStock`)
- Salary range (`minSalary`, `midSalary`, `maxSalary`)
- Required skills and certifications (JSON arrays)

### Job Level Mapping

| Level | Management Level | Typical Titles |
|-------|------------------|----------------|
| 10 | Executive | CEO, President |
| 9 | Executive | VP, SVP, EVP |
| 8 | Director | Director, Sr. Director |
| 7 | Manager | Manager, Sr. Manager |
| 6 | Individual Contributor | Senior IC |
| 5 | Individual Contributor | IC |
| 4 | Individual Contributor | Associate |
| 3 | Individual Contributor | Entry Level |

---

## Positions & Workers

### Position

A "seat" in the organization that can be filled by a worker.

**Key Properties:**
- `positionId` - System ID (e.g., "P-00001")
- `title` - Position title (may differ from job profile)
- `jobProfileId` - Link to job template
- `supervisoryOrgId` - Owning organization
- `status` - Current status
- `workerId` - Assigned worker (when filled)
- `ftePercentage` - Full-time equivalent (0.0 - 1.0)
- `isManagement` - Whether this is a management position
- `isCritical` - Business-critical designation

### Worker

An employee or contingent worker.

**Key Properties:**
- `workerId` - System ID (e.g., "EMP-001")
- Personal info: `firstName`, `lastName`, `email`, `phone`
- `workerType` - `EMPLOYEE` or `CONTINGENT_WORKER`
- `employmentStatus` - `ACTIVE`, `TERMINATED`, `ON_LEAVE`, `PENDING_HIRE`
- `hireDate`, `terminationDate`
- `businessTitle` - Display title (can differ from job profile)
- `managerId` - Direct manager
- Compensation: `annualSalary`, `hourlyRate`, `currency`

---

## Business Process Engine

### BP Definition

A template defining a workflow for HR transactions.

**Categories:**
- `STAFFING` - Hire, Terminate, Create Position, Change Job
- `COMPENSATION` - Change Compensation, Bonus, Stock
- `TALENT` - Performance Reviews, Goals, Development
- `RECRUITING` - Job Requisition, Offer, Onboarding
- `ORGANIZATION` - Org Changes, Reorganizations
- `SECURITY` - Security Group Changes

### BP Step

Individual steps within a business process.

**Step Types:**
- `INITIATION` - Starting step (always first)
- `APPROVAL` - Requires approve/deny decision
- `REVIEW` - Informational review, always auto-completes
- `TO_DO` - Action item that must be manually completed
- `NOTIFICATION` - Sends notification only

**Assignee Types:**
- `SECURITY_GROUP` - Assigned to members of a security group
- `MANAGER` - Assigned to the subject's manager
- `HR_PARTNER` - Assigned to the HR partner
- `INITIATOR` - Returns to the person who started the process
- `SPECIFIC_USER` - Assigned to a specific named user

### Condition Rule

If/then routing logic on BP steps.

**Operators:**
- `EQUALS` / `NOT_EQUALS`
- `GREATER_THAN` / `LESS_THAN`
- `GREATER_THAN_OR_EQUALS` / `LESS_THAN_OR_EQUALS`
- `CONTAINS`
- `IN_LIST`

**Actions:**
- `ROUTE_TO_STEP` - Skip to a specific step
- `SKIP_STEP` - Skip this step entirely
- `ADD_APPROVER` - Add an additional approver
- `REQUIRE_APPROVAL` - Make optional step required

**Example Rule:**
```
Field: salaryChangePercent
Operator: GREATER_THAN
Value: 10
Action: REQUIRE_APPROVAL (VP step)
```

### BP Transaction

A live instance of a business process.

**Transaction Statuses:**
- `IN_PROGRESS` - Currently being processed
- `COMPLETED` - Successfully finished
- `CANCELLED` - Rescinded by authorized user
- `DENIED` - Rejected during approval

### BP Transaction Step

Individual step instance within a transaction.

**Step Statuses:**
- `PENDING` - Awaiting action
- `APPROVED` - Approved (for approval steps)
- `DENIED` - Denied (for approval steps)
- `SENT_BACK` - Returned for correction
- `COMPLETE` - Finished
- `SKIPPED` - Skipped due to condition rule

---

## Security Framework

### Security Group

A collection of workers who share access permissions.

**Group Types:**
- `USER_BASED` - Explicitly assigned members
- `ROLE_BASED` - Membership based on role (Manager, HR Partner, etc.)
- `SEGMENT_BASED` - Membership based on data segments (org, location, etc.)

**Standard Security Groups:**
| Code | Name | Type | Description |
|------|------|------|-------------|
| SG-HR-PARTNER | HR Partner | Role-Based | Full HR access |
| SG-MANAGER | Manager | Role-Based | Manager of others |
| SG-EXECUTIVE | Executive Team | User-Based | VP and above |
| SG-IT-ADMIN | IT Administrator | Role-Based | System provisioning |
| SG-FIN-APPROVER | Finance Approver | Role-Based | Budget approvals |
| SG-ALL-WORKERS | All Workers | Role-Based | All active workers |

### Domain Security Policy

Controls access to functional areas (Staffing, Compensation, etc.).

**Permissions:**
- `canView` - Read access
- `canModify` - Write access
- `canReport` - Create reports on this data

### BP Security Policy

Controls participation in business processes.

**Permissions:**
- `canInitiate` - Can start this business process
- `canApprove` - Can approve steps
- `canViewAll` - Can see all transactions
- `canRescind` - Can cancel in-progress transactions
- `canCorrect` - Can make corrections after completion

---

## Calculated Fields

Custom fields computed from other data.

**Field Types:**
- `TEXT` - String result
- `NUMBER` - Numeric result
- `DATE` - Date result
- `BOOLEAN` - True/false result

**Context Types:**
- `Worker` - Calculated per worker
- `Position` - Calculated per position
- `Organization` - Calculated per org

**Example Calculated Fields:**

| Code | Name | Expression | Description |
|------|------|------------|-------------|
| CF-TENURE-YEARS | Tenure in Years | `DATEDIFF(YEAR, hireDate, CURRENT_DATE)` | Years since hire |
| CF-COMPA-RATIO | Compa-Ratio | `worker.annualSalary / jobProfile.midSalary * 100` | Salary vs midpoint |
| CF-FTE-COUNT | FTE Count | `SUM(position.ftePercentage)` | Total FTE in org |
| CF-OPEN-POS-COUNT | Open Position Count | `COUNT(positions WHERE status = "OPEN")` | Open positions |

---

## Custom Reports

### Report Types

- `SIMPLE` - Single data source, list output
- `ADVANCED` - Multiple data sources, filters, grouping
- `MATRIX` - Cross-tabulation (rows × columns)

### Report Components

**Data Sources:**
- Workers for HCM Reporting
- Positions
- Organizations
- Business Process Transactions
- Compensation

**Filters:**
- Active status
- Date ranges
- Organization hierarchy
- Job family/profile
- Location

**Output Options:**
- On-screen display
- CSV export
- Scheduled delivery

---

## Practice Lab Scenarios

The sandbox includes practice labs for common analyst tasks:

1. **Create a New Position** - Learn position management
2. **Configure a Business Process Step** - Add approval steps
3. **Create a Condition Rule** - Set up routing logic
4. **Create a Security Group** - Manage access control
5. **Reorganize a Supervisory Organization** - Move workers
6. **Build a Custom Report** - Create headcount reports

Each lab includes:
- Step-by-step instructions
- Success criteria
- Automated verification query
- Estimated completion time

---

## Glossary

| Term | Definition |
|------|------------|
| **BP** | Business Process |
| **FTE** | Full-Time Equivalent |
| **IC** | Individual Contributor |
| **Sup Org** | Supervisory Organization |
| **Compa-Ratio** | Salary compared to pay range midpoint |
| **Headcount** | Number of filled positions/workers |
| **Staffing Model** | Method of tracking organizational seats |
| **Security Group** | Collection of users with shared permissions |
| **Domain** | Functional area (Staffing, Compensation, etc.) |
| **Initiator** | Person who starts a business process |
| **Assignee** | Person responsible for completing a BP step |
