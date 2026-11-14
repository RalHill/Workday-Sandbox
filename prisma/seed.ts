// Workday Analyst Practice Sandbox - Seed Script
// Creates "Global Tech Corp" demo tenant with realistic data

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting seed process...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.labCompletion.deleteMany()
  await prisma.practiceLab.deleteMany()
  await prisma.tenantSnapshot.deleteMany()
  await prisma.calculatedField.deleteMany()
  await prisma.customReport.deleteMany()
  await prisma.bPTransactionStep.deleteMany()
  await prisma.bPTransaction.deleteMany()
  await prisma.conditionRule.deleteMany()
  await prisma.bPStep.deleteMany()
  await prisma.bPSecurityPolicy.deleteMany()
  await prisma.domainSecurityPolicy.deleteMany()
  await prisma.securityGroupMember.deleteMany()
  await prisma.securityGroup.deleteMany()
  await prisma.position.deleteMany()
  await prisma.worker.deleteMany()
  await prisma.jobProfile.deleteMany()
  await prisma.jobFamily.deleteMany()
  await prisma.supervisoryOrganization.deleteMany()
  await prisma.costCenter.deleteMany()
  await prisma.location.deleteMany()
  await prisma.company.deleteMany()

  // =============================================================================
  // COMPANY & LOCATIONS
  // =============================================================================
  console.log('🏢 Creating company and locations...')

  const company = await prisma.company.create({
    data: {
      code: 'GTC',
      name: 'Global Tech Corp',
      legalName: 'Global Technology Corporation',
      country: 'USA',
      currency: 'USD',
    },
  })

  const locations = await Promise.all([
    prisma.location.create({
      data: {
        code: 'HQ-NYC',
        name: 'New York Headquarters',
        address: '350 Fifth Avenue',
        city: 'New York',
        state: 'NY',
        postalCode: '10118',
        country: 'USA',
        timeZone: 'America/New_York',
        companyId: company.id,
      },
    }),
    prisma.location.create({
      data: {
        code: 'SF-OFFICE',
        name: 'San Francisco Office',
        address: '555 California Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94104',
        country: 'USA',
        timeZone: 'America/Los_Angeles',
        companyId: company.id,
      },
    }),
    prisma.location.create({
      data: {
        code: 'AUS-OFFICE',
        name: 'Austin Office',
        address: '500 W 2nd Street',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA',
        timeZone: 'America/Chicago',
        companyId: company.id,
      },
    }),
  ])

  const [hqLocation, sfLocation, austinLocation] = locations

  // =============================================================================
  // COST CENTERS
  // =============================================================================
  console.log('💰 Creating cost centers...')

  const costCenters = await Promise.all([
    prisma.costCenter.create({
      data: { code: 'CC-1000', name: 'Executive Office', companyId: company.id },
    }),
    prisma.costCenter.create({
      data: { code: 'CC-2000', name: 'Engineering', companyId: company.id },
    }),
    prisma.costCenter.create({
      data: { code: 'CC-3000', name: 'Human Resources', companyId: company.id },
    }),
    prisma.costCenter.create({
      data: { code: 'CC-4000', name: 'Finance', companyId: company.id },
    }),
    prisma.costCenter.create({
      data: { code: 'CC-5000', name: 'Sales', companyId: company.id },
    }),
  ])

  const [execCC, engCC, hrCC, finCC, salesCC] = costCenters

  // =============================================================================
  // JOB FAMILIES & JOB PROFILES
  // =============================================================================
  console.log('📋 Creating job families and profiles...')

  const jobFamilies = await Promise.all([
    prisma.jobFamily.create({
      data: {
        code: 'JF-EXEC',
        name: 'Executive Leadership',
        description: 'C-Suite and VP level positions',
      },
    }),
    prisma.jobFamily.create({
      data: {
        code: 'JF-ENG',
        name: 'Engineering',
        description: 'Software engineering and technical roles',
      },
    }),
    prisma.jobFamily.create({
      data: {
        code: 'JF-HR',
        name: 'Human Resources',
        description: 'HR operations, talent, and people roles',
      },
    }),
    prisma.jobFamily.create({
      data: {
        code: 'JF-FIN',
        name: 'Finance & Accounting',
        description: 'Financial planning, accounting, and analysis',
      },
    }),
    prisma.jobFamily.create({
      data: {
        code: 'JF-SALES',
        name: 'Sales & Business Development',
        description: 'Sales, account management, and BD roles',
      },
    }),
  ])

  const [execFamily, engFamily, hrFamily, finFamily, salesFamily] = jobFamilies

  // Job Profiles
  const jobProfiles = await Promise.all([
    // Executive
    prisma.jobProfile.create({
      data: {
        code: 'JP-CEO',
        title: 'Chief Executive Officer',
        summary: 'Leads the overall strategic direction of the company',
        jobFamilyId: execFamily.id,
        jobLevel: 10,
        managementLevel: 'Executive',
        isEligibleForBonus: true,
        isEligibleForStock: true,
        minSalary: 400000,
        midSalary: 500000,
        maxSalary: 750000,
      },
    }),
    prisma.jobProfile.create({
      data: {
        code: 'JP-VP',
        title: 'Vice President',
        summary: 'Leads a major functional area of the organization',
        jobFamilyId: execFamily.id,
        jobLevel: 9,
        managementLevel: 'Executive',
        isEligibleForBonus: true,
        isEligibleForStock: true,
        minSalary: 250000,
        midSalary: 325000,
        maxSalary: 400000,
      },
    }),
    prisma.jobProfile.create({
      data: {
        code: 'JP-DIR',
        title: 'Director',
        summary: 'Leads a department or functional team',
        jobFamilyId: execFamily.id,
        jobLevel: 8,
        managementLevel: 'Director',
        isEligibleForBonus: true,
        isEligibleForStock: true,
        minSalary: 175000,
        midSalary: 215000,
        maxSalary: 260000,
      },
    }),
    // Engineering
    prisma.jobProfile.create({
      data: {
        code: 'JP-ENG-SR',
        title: 'Senior Software Engineer',
        summary: 'Designs and develops complex software solutions',
        jobFamilyId: engFamily.id,
        jobLevel: 6,
        managementLevel: 'Individual Contributor',
        isEligibleForBonus: true,
        isEligibleForStock: true,
        minSalary: 150000,
        midSalary: 175000,
        maxSalary: 210000,
        requiredSkills: JSON.stringify(['TypeScript', 'React', 'Node.js', 'SQL']),
      },
    }),
    prisma.jobProfile.create({
      data: {
        code: 'JP-ENG',
        title: 'Software Engineer',
        summary: 'Develops and maintains software applications',
        jobFamilyId: engFamily.id,
        jobLevel: 5,
        managementLevel: 'Individual Contributor',
        isEligibleForBonus: true,
        isEligibleForStock: false,
        minSalary: 110000,
        midSalary: 130000,
        maxSalary: 155000,
        requiredSkills: JSON.stringify(['JavaScript', 'React', 'Git']),
      },
    }),
    prisma.jobProfile.create({
      data: {
        code: 'JP-ENG-MGR',
        title: 'Engineering Manager',
        summary: 'Manages a team of engineers',
        jobFamilyId: engFamily.id,
        jobLevel: 7,
        managementLevel: 'Manager',
        isEligibleForBonus: true,
        isEligibleForStock: true,
        minSalary: 180000,
        midSalary: 210000,
        maxSalary: 250000,
      },
    }),
    // HR
    prisma.jobProfile.create({
      data: {
        code: 'JP-HR-MGR',
        title: 'HR Manager',
        summary: 'Manages HR operations and team',
        jobFamilyId: hrFamily.id,
        jobLevel: 7,
        managementLevel: 'Manager',
        isEligibleForBonus: true,
        isEligibleForStock: false,
        minSalary: 95000,
        midSalary: 115000,
        maxSalary: 135000,
      },
    }),
    prisma.jobProfile.create({
      data: {
        code: 'JP-HR-SPEC',
        title: 'HR Specialist',
        summary: 'Handles HR operations and employee relations',
        jobFamilyId: hrFamily.id,
        jobLevel: 4,
        managementLevel: 'Individual Contributor',
        isEligibleForBonus: false,
        isEligibleForStock: false,
        minSalary: 55000,
        midSalary: 67000,
        maxSalary: 82000,
      },
    }),
    prisma.jobProfile.create({
      data: {
        code: 'JP-RECRUITER',
        title: 'Recruiter',
        summary: 'Sources and recruits candidates',
        jobFamilyId: hrFamily.id,
        jobLevel: 4,
        managementLevel: 'Individual Contributor',
        isEligibleForBonus: true,
        isEligibleForStock: false,
        minSalary: 60000,
        midSalary: 75000,
        maxSalary: 90000,
      },
    }),
    // Finance
    prisma.jobProfile.create({
      data: {
        code: 'JP-FIN-ANALYST',
        title: 'Financial Analyst',
        summary: 'Performs financial analysis and reporting',
        jobFamilyId: finFamily.id,
        jobLevel: 5,
        managementLevel: 'Individual Contributor',
        isEligibleForBonus: true,
        isEligibleForStock: false,
        minSalary: 75000,
        midSalary: 90000,
        maxSalary: 110000,
      },
    }),
  ])

  const [
    ceoProfile,
    vpProfile,
    dirProfile,
    srEngProfile,
    engProfile,
    engMgrProfile,
    hrMgrProfile,
    hrSpecProfile,
    recruiterProfile,
    finAnalystProfile,
  ] = jobProfiles

  // =============================================================================
  // SUPERVISORY ORGANIZATIONS
  // =============================================================================
  console.log('🏛️ Creating supervisory organizations...')

  // Root org
  const rootOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-GTC',
      name: 'Global Tech Corp',
      description: 'Root organization',
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  // Level 2: VP level orgs
  const engOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-ENG',
      name: 'Engineering',
      description: 'Engineering organization',
      parentId: rootOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  const hrOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-HR',
      name: 'Human Resources',
      description: 'Human Resources organization',
      parentId: rootOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  const finOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-FIN',
      name: 'Finance',
      description: 'Finance organization',
      parentId: rootOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  // Level 3: Director level orgs
  const platformEngOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-PLAT-ENG',
      name: 'Platform Engineering',
      description: 'Platform and infrastructure engineering',
      parentId: engOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  const productEngOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-PROD-ENG',
      name: 'Product Engineering',
      description: 'Product development engineering',
      parentId: engOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  const hrOpsOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-HR-OPS',
      name: 'HR Operations',
      description: 'HR operations and employee services',
      parentId: hrOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  const talentAcqOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-TA',
      name: 'Talent Acquisition',
      description: 'Recruiting and talent acquisition',
      parentId: hrOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  const fpaOrg = await prisma.supervisoryOrganization.create({
    data: {
      code: 'ORG-FPA',
      name: 'Financial Planning & Analysis',
      description: 'FP&A team',
      parentId: finOrg.id,
      staffingModel: 'POSITION_BASED',
      effectiveDate: new Date('2020-01-01'),
    },
  })

  // =============================================================================
  // WORKERS
  // =============================================================================
  console.log('👥 Creating workers...')

  // CEO
  const ceo = await prisma.worker.create({
    data: {
      workerId: 'EMP-001',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@globaltech.com',
      phone: '+1-212-555-0100',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2018-01-15'),
      jobProfileId: ceoProfile.id,
      businessTitle: 'Chief Executive Officer',
      supervisoryOrgId: rootOrg.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: execCC.id,
      annualSalary: 550000,
      currency: 'USD',
    },
  })

  // Update root org with CEO as manager
  await prisma.supervisoryOrganization.update({
    where: { id: rootOrg.id },
    data: { managerId: ceo.id },
  })

  // VPs (Level 2)
  const vpEng = await prisma.worker.create({
    data: {
      workerId: 'EMP-002',
      firstName: 'Michael',
      lastName: 'Torres',
      email: 'michael.torres@globaltech.com',
      phone: '+1-415-555-0102',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2019-03-01'),
      jobProfileId: vpProfile.id,
      businessTitle: 'VP of Engineering',
      supervisoryOrgId: engOrg.id,
      managerId: ceo.id,
      companyId: company.id,
      locationId: sfLocation.id,
      costCenterId: engCC.id,
      annualSalary: 350000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: engOrg.id },
    data: { managerId: vpEng.id },
  })

  const vpHR = await prisma.worker.create({
    data: {
      workerId: 'EMP-003',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@globaltech.com',
      phone: '+1-212-555-0103',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2019-06-15'),
      jobProfileId: vpProfile.id,
      businessTitle: 'VP of Human Resources',
      supervisoryOrgId: hrOrg.id,
      managerId: ceo.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: hrCC.id,
      annualSalary: 295000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: hrOrg.id },
    data: { managerId: vpHR.id },
  })

  const vpFin = await prisma.worker.create({
    data: {
      workerId: 'EMP-004',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jennifer.martinez@globaltech.com',
      phone: '+1-212-555-0104',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2019-09-01'),
      jobProfileId: vpProfile.id,
      businessTitle: 'VP of Finance',
      supervisoryOrgId: finOrg.id,
      managerId: ceo.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: finCC.id,
      annualSalary: 310000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: finOrg.id },
    data: { managerId: vpFin.id },
  })

  // Directors (Level 3)
  const dirPlatEng = await prisma.worker.create({
    data: {
      workerId: 'EMP-005',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@globaltech.com',
      phone: '+1-415-555-0105',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2020-02-01'),
      jobProfileId: dirProfile.id,
      businessTitle: 'Director of Platform Engineering',
      supervisoryOrgId: platformEngOrg.id,
      managerId: vpEng.id,
      companyId: company.id,
      locationId: sfLocation.id,
      costCenterId: engCC.id,
      annualSalary: 225000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: platformEngOrg.id },
    data: { managerId: dirPlatEng.id },
  })

  const dirProdEng = await prisma.worker.create({
    data: {
      workerId: 'EMP-006',
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@globaltech.com',
      phone: '+1-512-555-0106',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2020-04-15'),
      jobProfileId: dirProfile.id,
      businessTitle: 'Director of Product Engineering',
      supervisoryOrgId: productEngOrg.id,
      managerId: vpEng.id,
      companyId: company.id,
      locationId: austinLocation.id,
      costCenterId: engCC.id,
      annualSalary: 218000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: productEngOrg.id },
    data: { managerId: dirProdEng.id },
  })

  // HR Managers
  const mgrHROps = await prisma.worker.create({
    data: {
      workerId: 'EMP-007',
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@globaltech.com',
      phone: '+1-212-555-0107',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2020-08-01'),
      jobProfileId: hrMgrProfile.id,
      businessTitle: 'HR Operations Manager',
      supervisoryOrgId: hrOpsOrg.id,
      managerId: vpHR.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: hrCC.id,
      annualSalary: 118000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: hrOpsOrg.id },
    data: { managerId: mgrHROps.id },
  })

  const mgrTA = await prisma.worker.create({
    data: {
      workerId: 'EMP-008',
      firstName: 'Rachel',
      lastName: 'Green',
      email: 'rachel.green@globaltech.com',
      phone: '+1-212-555-0108',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-01-15'),
      jobProfileId: hrMgrProfile.id,
      businessTitle: 'Talent Acquisition Manager',
      supervisoryOrgId: talentAcqOrg.id,
      managerId: vpHR.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: hrCC.id,
      annualSalary: 112000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: talentAcqOrg.id },
    data: { managerId: mgrTA.id },
  })

  // Finance Director
  const dirFPA = await prisma.worker.create({
    data: {
      workerId: 'EMP-009',
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.taylor@globaltech.com',
      phone: '+1-212-555-0109',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2020-11-01'),
      jobProfileId: dirProfile.id,
      businessTitle: 'Director of FP&A',
      supervisoryOrgId: fpaOrg.id,
      managerId: vpFin.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: finCC.id,
      annualSalary: 195000,
      currency: 'USD',
    },
  })

  await prisma.supervisoryOrganization.update({
    where: { id: fpaOrg.id },
    data: { managerId: dirFPA.id },
  })

  // Individual Contributors
  // Platform Engineering team
  const srEng1 = await prisma.worker.create({
    data: {
      workerId: 'EMP-010',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-03-01'),
      jobProfileId: srEngProfile.id,
      businessTitle: 'Senior Platform Engineer',
      supervisoryOrgId: platformEngOrg.id,
      managerId: dirPlatEng.id,
      companyId: company.id,
      locationId: sfLocation.id,
      costCenterId: engCC.id,
      annualSalary: 185000,
      currency: 'USD',
    },
  })

  const srEng2 = await prisma.worker.create({
    data: {
      workerId: 'EMP-011',
      firstName: 'Maya',
      lastName: 'Johnson',
      email: 'maya.johnson@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-06-15'),
      jobProfileId: srEngProfile.id,
      businessTitle: 'Senior Infrastructure Engineer',
      supervisoryOrgId: platformEngOrg.id,
      managerId: dirPlatEng.id,
      companyId: company.id,
      locationId: sfLocation.id,
      costCenterId: engCC.id,
      annualSalary: 178000,
      currency: 'USD',
    },
  })

  const srEng3 = await prisma.worker.create({
    data: {
      workerId: 'EMP-012',
      firstName: 'Kevin',
      lastName: 'Zhang',
      email: 'kevin.zhang@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2022-01-10'),
      jobProfileId: srEngProfile.id,
      businessTitle: 'Senior DevOps Engineer',
      supervisoryOrgId: platformEngOrg.id,
      managerId: dirPlatEng.id,
      companyId: company.id,
      locationId: sfLocation.id,
      costCenterId: engCC.id,
      annualSalary: 182000,
      currency: 'USD',
    },
  })

  // Product Engineering team
  const eng1 = await prisma.worker.create({
    data: {
      workerId: 'EMP-013',
      firstName: 'Emily',
      lastName: 'Clark',
      email: 'emily.clark@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-09-01'),
      jobProfileId: engProfile.id,
      businessTitle: 'Software Engineer',
      supervisoryOrgId: productEngOrg.id,
      managerId: dirProdEng.id,
      companyId: company.id,
      locationId: austinLocation.id,
      costCenterId: engCC.id,
      annualSalary: 135000,
      currency: 'USD',
    },
  })

  const eng2 = await prisma.worker.create({
    data: {
      workerId: 'EMP-014',
      firstName: 'Daniel',
      lastName: 'Lee',
      email: 'daniel.lee@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2022-02-15'),
      jobProfileId: engProfile.id,
      businessTitle: 'Software Engineer',
      supervisoryOrgId: productEngOrg.id,
      managerId: dirProdEng.id,
      companyId: company.id,
      locationId: austinLocation.id,
      costCenterId: engCC.id,
      annualSalary: 128000,
      currency: 'USD',
    },
  })

  const eng3 = await prisma.worker.create({
    data: {
      workerId: 'EMP-015',
      firstName: 'Sofia',
      lastName: 'Garcia',
      email: 'sofia.garcia@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2022-05-01'),
      jobProfileId: engProfile.id,
      businessTitle: 'Frontend Engineer',
      supervisoryOrgId: productEngOrg.id,
      managerId: dirProdEng.id,
      companyId: company.id,
      locationId: austinLocation.id,
      costCenterId: engCC.id,
      annualSalary: 132000,
      currency: 'USD',
    },
  })

  const eng4 = await prisma.worker.create({
    data: {
      workerId: 'EMP-016',
      firstName: 'Brandon',
      lastName: 'Miller',
      email: 'brandon.miller@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2022-08-01'),
      jobProfileId: engProfile.id,
      businessTitle: 'Backend Engineer',
      supervisoryOrgId: productEngOrg.id,
      managerId: dirProdEng.id,
      companyId: company.id,
      locationId: austinLocation.id,
      costCenterId: engCC.id,
      annualSalary: 130000,
      currency: 'USD',
    },
  })

  // HR team
  const hrSpec1 = await prisma.worker.create({
    data: {
      workerId: 'EMP-017',
      firstName: 'Amanda',
      lastName: 'White',
      email: 'amanda.white@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-04-01'),
      jobProfileId: hrSpecProfile.id,
      businessTitle: 'HR Specialist',
      supervisoryOrgId: hrOpsOrg.id,
      managerId: mgrHROps.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: hrCC.id,
      annualSalary: 68000,
      currency: 'USD',
    },
  })

  const hrSpec2 = await prisma.worker.create({
    data: {
      workerId: 'EMP-018',
      firstName: 'Marcus',
      lastName: 'Brown',
      email: 'marcus.brown@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-10-15'),
      jobProfileId: hrSpecProfile.id,
      businessTitle: 'HR Specialist',
      supervisoryOrgId: hrOpsOrg.id,
      managerId: mgrHROps.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: hrCC.id,
      annualSalary: 65000,
      currency: 'USD',
    },
  })

  const recruiter1 = await prisma.worker.create({
    data: {
      workerId: 'EMP-019',
      firstName: 'Jessica',
      lastName: 'Adams',
      email: 'jessica.adams@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2022-01-03'),
      jobProfileId: recruiterProfile.id,
      businessTitle: 'Technical Recruiter',
      supervisoryOrgId: talentAcqOrg.id,
      managerId: mgrTA.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: hrCC.id,
      annualSalary: 78000,
      currency: 'USD',
    },
  })

  // Finance team
  const finAnalyst1 = await prisma.worker.create({
    data: {
      workerId: 'EMP-020',
      firstName: 'Christopher',
      lastName: 'Davis',
      email: 'christopher.davis@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-07-01'),
      jobProfileId: finAnalystProfile.id,
      businessTitle: 'Senior Financial Analyst',
      supervisoryOrgId: fpaOrg.id,
      managerId: dirFPA.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: finCC.id,
      annualSalary: 98000,
      currency: 'USD',
    },
  })

  const finAnalyst2 = await prisma.worker.create({
    data: {
      workerId: 'EMP-021',
      firstName: 'Michelle',
      lastName: 'Thompson',
      email: 'michelle.thompson@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2022-03-15'),
      jobProfileId: finAnalystProfile.id,
      businessTitle: 'Financial Analyst',
      supervisoryOrgId: fpaOrg.id,
      managerId: dirFPA.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: finCC.id,
      annualSalary: 85000,
      currency: 'USD',
    },
  })

  const finAnalyst3 = await prisma.worker.create({
    data: {
      workerId: 'EMP-022',
      firstName: 'Andrew',
      lastName: 'Scott',
      email: 'andrew.scott@globaltech.com',
      workerType: 'EMPLOYEE',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2022-09-01'),
      jobProfileId: finAnalystProfile.id,
      businessTitle: 'Financial Analyst',
      supervisoryOrgId: fpaOrg.id,
      managerId: dirFPA.id,
      companyId: company.id,
      locationId: hqLocation.id,
      costCenterId: finCC.id,
      annualSalary: 82000,
      currency: 'USD',
    },
  })

  // =============================================================================
  // POSITIONS
  // =============================================================================
  console.log('💺 Creating positions...')

  // Create filled positions for all workers
  const workersWithPositions = [
    { worker: ceo, title: 'Chief Executive Officer', org: rootOrg, profile: ceoProfile, loc: hqLocation, cc: execCC },
    { worker: vpEng, title: 'VP of Engineering', org: engOrg, profile: vpProfile, loc: sfLocation, cc: engCC },
    { worker: vpHR, title: 'VP of Human Resources', org: hrOrg, profile: vpProfile, loc: hqLocation, cc: hrCC },
    { worker: vpFin, title: 'VP of Finance', org: finOrg, profile: vpProfile, loc: hqLocation, cc: finCC },
    { worker: dirPlatEng, title: 'Director of Platform Engineering', org: platformEngOrg, profile: dirProfile, loc: sfLocation, cc: engCC, isMgmt: true },
    { worker: dirProdEng, title: 'Director of Product Engineering', org: productEngOrg, profile: dirProfile, loc: austinLocation, cc: engCC, isMgmt: true },
    { worker: mgrHROps, title: 'HR Operations Manager', org: hrOpsOrg, profile: hrMgrProfile, loc: hqLocation, cc: hrCC, isMgmt: true },
    { worker: mgrTA, title: 'Talent Acquisition Manager', org: talentAcqOrg, profile: hrMgrProfile, loc: hqLocation, cc: hrCC, isMgmt: true },
    { worker: dirFPA, title: 'Director of FP&A', org: fpaOrg, profile: dirProfile, loc: hqLocation, cc: finCC, isMgmt: true },
    { worker: srEng1, title: 'Senior Platform Engineer', org: platformEngOrg, profile: srEngProfile, loc: sfLocation, cc: engCC },
    { worker: srEng2, title: 'Senior Infrastructure Engineer', org: platformEngOrg, profile: srEngProfile, loc: sfLocation, cc: engCC },
    { worker: srEng3, title: 'Senior DevOps Engineer', org: platformEngOrg, profile: srEngProfile, loc: sfLocation, cc: engCC },
    { worker: eng1, title: 'Software Engineer', org: productEngOrg, profile: engProfile, loc: austinLocation, cc: engCC },
    { worker: eng2, title: 'Software Engineer', org: productEngOrg, profile: engProfile, loc: austinLocation, cc: engCC },
    { worker: eng3, title: 'Frontend Engineer', org: productEngOrg, profile: engProfile, loc: austinLocation, cc: engCC },
    { worker: eng4, title: 'Backend Engineer', org: productEngOrg, profile: engProfile, loc: austinLocation, cc: engCC },
    { worker: hrSpec1, title: 'HR Specialist', org: hrOpsOrg, profile: hrSpecProfile, loc: hqLocation, cc: hrCC },
    { worker: hrSpec2, title: 'HR Specialist', org: hrOpsOrg, profile: hrSpecProfile, loc: hqLocation, cc: hrCC },
    { worker: recruiter1, title: 'Technical Recruiter', org: talentAcqOrg, profile: recruiterProfile, loc: hqLocation, cc: hrCC },
    { worker: finAnalyst1, title: 'Senior Financial Analyst', org: fpaOrg, profile: finAnalystProfile, loc: hqLocation, cc: finCC },
    { worker: finAnalyst2, title: 'Financial Analyst', org: fpaOrg, profile: finAnalystProfile, loc: hqLocation, cc: finCC },
    { worker: finAnalyst3, title: 'Financial Analyst', org: fpaOrg, profile: finAnalystProfile, loc: hqLocation, cc: finCC },
  ]

  let positionCounter = 1
  for (const wp of workersWithPositions) {
    await prisma.position.create({
      data: {
        positionId: `P-${String(positionCounter++).padStart(5, '0')}`,
        title: wp.title,
        jobProfileId: wp.profile.id,
        supervisoryOrgId: wp.org.id,
        locationId: wp.loc.id,
        costCenterId: wp.cc.id,
        status: 'FILLED',
        workerId: wp.worker.id,
        isManagement: wp.isMgmt ?? false,
        effectiveDate: wp.worker.hireDate,
      },
    })
  }

  // Create OPEN positions
  await prisma.position.create({
    data: {
      positionId: `P-${String(positionCounter++).padStart(5, '0')}`,
      title: 'Senior Platform Engineer',
      jobProfileId: srEngProfile.id,
      supervisoryOrgId: platformEngOrg.id,
      locationId: sfLocation.id,
      costCenterId: engCC.id,
      status: 'OPEN',
      effectiveDate: new Date('2023-01-01'),
    },
  })

  await prisma.position.create({
    data: {
      positionId: `P-${String(positionCounter++).padStart(5, '0')}`,
      title: 'Cloud Infrastructure Engineer',
      jobProfileId: srEngProfile.id,
      supervisoryOrgId: platformEngOrg.id,
      locationId: sfLocation.id,
      costCenterId: engCC.id,
      status: 'OPEN',
      effectiveDate: new Date('2023-06-01'),
    },
  })

  await prisma.position.create({
    data: {
      positionId: `P-${String(positionCounter++).padStart(5, '0')}`,
      title: 'Technical Recruiter',
      jobProfileId: recruiterProfile.id,
      supervisoryOrgId: talentAcqOrg.id,
      locationId: hqLocation.id,
      costCenterId: hrCC.id,
      status: 'OPEN',
      effectiveDate: new Date('2023-09-01'),
    },
  })

  // Create FROZEN position
  await prisma.position.create({
    data: {
      positionId: `P-${String(positionCounter++).padStart(5, '0')}`,
      title: 'Software Engineer',
      jobProfileId: engProfile.id,
      supervisoryOrgId: productEngOrg.id,
      locationId: austinLocation.id,
      costCenterId: engCC.id,
      status: 'FROZEN',
      effectiveDate: new Date('2023-03-01'),
    },
  })

  // =============================================================================
  // SECURITY GROUPS
  // =============================================================================
  console.log('🔐 Creating security groups...')

  const sgHRPartner = await prisma.securityGroup.create({
    data: {
      code: 'SG-HR-PARTNER',
      name: 'HR Partner',
      description: 'HR Partners with full HR domain access',
      groupType: 'ROLE_BASED',
      roleType: 'HR Partner',
    },
  })

  const sgManager = await prisma.securityGroup.create({
    data: {
      code: 'SG-MANAGER',
      name: 'Manager',
      description: 'People managers who can approve actions for direct reports',
      groupType: 'ROLE_BASED',
      roleType: 'Manager',
    },
  })

  const sgExecutive = await prisma.securityGroup.create({
    data: {
      code: 'SG-EXECUTIVE',
      name: 'Executive Team',
      description: 'VP and above with executive approval rights',
      groupType: 'USER_BASED',
    },
  })

  const sgITAdmin = await prisma.securityGroup.create({
    data: {
      code: 'SG-IT-ADMIN',
      name: 'IT Administrator',
      description: 'IT admins for system provisioning',
      groupType: 'ROLE_BASED',
      roleType: 'IT Administrator',
    },
  })

  const sgFinanceApprover = await prisma.securityGroup.create({
    data: {
      code: 'SG-FIN-APPROVER',
      name: 'Finance Approver',
      description: 'Finance team members who can approve financial transactions',
      groupType: 'ROLE_BASED',
      roleType: 'Finance Approver',
    },
  })

  const sgAllWorkers = await prisma.securityGroup.create({
    data: {
      code: 'SG-ALL-WORKERS',
      name: 'All Workers',
      description: 'All active workers in the organization',
      groupType: 'ROLE_BASED',
      roleType: 'Worker',
    },
  })

  // Add members to executive group
  await prisma.securityGroupMember.createMany({
    data: [
      { groupId: sgExecutive.id, workerId: ceo.id },
      { groupId: sgExecutive.id, workerId: vpEng.id },
      { groupId: sgExecutive.id, workerId: vpHR.id },
      { groupId: sgExecutive.id, workerId: vpFin.id },
    ],
  })

  // Add HR team to HR Partner group
  await prisma.securityGroupMember.createMany({
    data: [
      { groupId: sgHRPartner.id, workerId: vpHR.id },
      { groupId: sgHRPartner.id, workerId: mgrHROps.id },
      { groupId: sgHRPartner.id, workerId: mgrTA.id },
      { groupId: sgHRPartner.id, workerId: hrSpec1.id },
      { groupId: sgHRPartner.id, workerId: hrSpec2.id },
    ],
  })

  // Add Finance approvers
  await prisma.securityGroupMember.createMany({
    data: [
      { groupId: sgFinanceApprover.id, workerId: vpFin.id },
      { groupId: sgFinanceApprover.id, workerId: dirFPA.id },
    ],
  })

  // =============================================================================
  // BUSINESS PROCESS DEFINITIONS
  // =============================================================================
  console.log('⚙️ Creating business process definitions...')

  // 1. Hire Employee BP
  const bpHire = await prisma.bPDefinition.create({
    data: {
      code: 'BP-HIRE',
      name: 'Hire Employee',
      description: 'Process to hire a new employee into an open position',
      category: 'STAFFING',
    },
  })

  await prisma.bPStep.createMany({
    data: [
      {
        definitionId: bpHire.id,
        stepOrder: 1,
        name: 'Initiate Hire',
        stepType: 'INITIATION',
        assigneeType: 'HR_PARTNER',
        assigneeGroupId: sgHRPartner.id,
        isRequired: true,
      },
      {
        definitionId: bpHire.id,
        stepOrder: 2,
        name: 'HR Review',
        stepType: 'REVIEW',
        assigneeType: 'HR_PARTNER',
        assigneeGroupId: sgHRPartner.id,
        dueInDays: 2,
        isRequired: true,
      },
      {
        definitionId: bpHire.id,
        stepOrder: 3,
        name: 'Manager Approval',
        stepType: 'APPROVAL',
        assigneeType: 'MANAGER',
        dueInDays: 3,
        isRequired: true,
      },
      {
        definitionId: bpHire.id,
        stepOrder: 4,
        name: 'IT Setup',
        stepType: 'TO_DO',
        assigneeType: 'SECURITY_GROUP',
        assigneeGroupId: sgITAdmin.id,
        dueInDays: 5,
        isRequired: true,
      },
    ],
  })

  // 2. Create Position BP
  const bpCreatePos = await prisma.bPDefinition.create({
    data: {
      code: 'BP-CREATE-POS',
      name: 'Create Position',
      description: 'Process to create a new position in the organization',
      category: 'STAFFING',
    },
  })

  await prisma.bPStep.createMany({
    data: [
      {
        definitionId: bpCreatePos.id,
        stepOrder: 1,
        name: 'Request Position',
        stepType: 'INITIATION',
        assigneeType: 'MANAGER',
        isRequired: true,
      },
      {
        definitionId: bpCreatePos.id,
        stepOrder: 2,
        name: 'Finance Approval',
        stepType: 'APPROVAL',
        assigneeType: 'SECURITY_GROUP',
        assigneeGroupId: sgFinanceApprover.id,
        dueInDays: 5,
        isRequired: true,
      },
      {
        definitionId: bpCreatePos.id,
        stepOrder: 3,
        name: 'HR Review',
        stepType: 'REVIEW',
        assigneeType: 'HR_PARTNER',
        assigneeGroupId: sgHRPartner.id,
        dueInDays: 2,
        isRequired: true,
      },
    ],
  })

  // 3. Change Compensation BP (with condition rule)
  const bpChangeComp = await prisma.bPDefinition.create({
    data: {
      code: 'BP-CHANGE-COMP',
      name: 'Change Compensation',
      description: 'Process to change worker compensation',
      category: 'COMPENSATION',
    },
  })

  const compSteps = await prisma.bPStep.createMany({
    data: [
      {
        definitionId: bpChangeComp.id,
        stepOrder: 1,
        name: 'Request Compensation Change',
        stepType: 'INITIATION',
        assigneeType: 'MANAGER',
        isRequired: true,
      },
      {
        definitionId: bpChangeComp.id,
        stepOrder: 2,
        name: 'Manager Approval',
        stepType: 'APPROVAL',
        assigneeType: 'MANAGER',
        dueInDays: 3,
        isRequired: true,
      },
      {
        definitionId: bpChangeComp.id,
        stepOrder: 3,
        name: 'VP Approval (High Value)',
        description: 'Required when salary change exceeds 10%',
        stepType: 'APPROVAL',
        assigneeType: 'SECURITY_GROUP',
        assigneeGroupId: sgExecutive.id,
        dueInDays: 5,
        isRequired: false,
      },
      {
        definitionId: bpChangeComp.id,
        stepOrder: 4,
        name: 'HR Review',
        stepType: 'REVIEW',
        assigneeType: 'HR_PARTNER',
        assigneeGroupId: sgHRPartner.id,
        dueInDays: 2,
        isRequired: true,
      },
      {
        definitionId: bpChangeComp.id,
        stepOrder: 5,
        name: 'Finance Approval',
        stepType: 'APPROVAL',
        assigneeType: 'SECURITY_GROUP',
        assigneeGroupId: sgFinanceApprover.id,
        dueInDays: 3,
        isRequired: true,
      },
    ],
  })

  // Get the VP Approval step to add condition rule
  const vpApprovalStep = await prisma.bPStep.findFirst({
    where: { definitionId: bpChangeComp.id, stepOrder: 3 },
  })

  if (vpApprovalStep) {
    await prisma.conditionRule.create({
      data: {
        stepId: vpApprovalStep.id,
        name: 'High Salary Change Rule',
        description: 'Require VP approval when salary increase exceeds 10%',
        field: 'salaryChangePercent',
        operator: 'GREATER_THAN',
        value: '10',
        actionType: 'REQUIRE_APPROVAL',
        priority: 1,
      },
    })
  }

  // 4. Terminate Employee BP
  const bpTerminate = await prisma.bPDefinition.create({
    data: {
      code: 'BP-TERMINATE',
      name: 'Terminate Employee',
      description: 'Process to terminate an employee',
      category: 'STAFFING',
    },
  })

  await prisma.bPStep.createMany({
    data: [
      {
        definitionId: bpTerminate.id,
        stepOrder: 1,
        name: 'Initiate Termination',
        stepType: 'INITIATION',
        assigneeType: 'MANAGER',
        isRequired: true,
      },
      {
        definitionId: bpTerminate.id,
        stepOrder: 2,
        name: 'HR Review',
        stepType: 'REVIEW',
        assigneeType: 'HR_PARTNER',
        assigneeGroupId: sgHRPartner.id,
        dueInDays: 1,
        isRequired: true,
      },
      {
        definitionId: bpTerminate.id,
        stepOrder: 3,
        name: 'Exit Interview',
        stepType: 'TO_DO',
        assigneeType: 'HR_PARTNER',
        assigneeGroupId: sgHRPartner.id,
        dueInDays: 5,
        isRequired: false,
      },
      {
        definitionId: bpTerminate.id,
        stepOrder: 4,
        name: 'IT Deprovisioning',
        stepType: 'TO_DO',
        assigneeType: 'SECURITY_GROUP',
        assigneeGroupId: sgITAdmin.id,
        dueInDays: 1,
        isRequired: true,
      },
      {
        definitionId: bpTerminate.id,
        stepOrder: 5,
        name: 'Final Approval',
        stepType: 'APPROVAL',
        assigneeType: 'HR_PARTNER',
        assigneeGroupId: sgHRPartner.id,
        dueInDays: 1,
        isRequired: true,
      },
    ],
  })

  // =============================================================================
  // BP SECURITY POLICIES
  // =============================================================================
  console.log('🔒 Creating BP security policies...')

  await prisma.bPSecurityPolicy.createMany({
    data: [
      // Hire BP policies
      { definitionId: bpHire.id, securityGroupId: sgHRPartner.id, canInitiate: true, canApprove: true, canViewAll: true, canRescind: true, canCorrect: true },
      { definitionId: bpHire.id, securityGroupId: sgManager.id, canInitiate: false, canApprove: true, canViewAll: false, canRescind: false, canCorrect: false },
      // Create Position policies
      { definitionId: bpCreatePos.id, securityGroupId: sgHRPartner.id, canInitiate: true, canApprove: true, canViewAll: true, canRescind: true, canCorrect: true },
      { definitionId: bpCreatePos.id, securityGroupId: sgManager.id, canInitiate: true, canApprove: false, canViewAll: false, canRescind: false, canCorrect: false },
      { definitionId: bpCreatePos.id, securityGroupId: sgFinanceApprover.id, canInitiate: false, canApprove: true, canViewAll: true, canRescind: false, canCorrect: false },
      // Change Comp policies
      { definitionId: bpChangeComp.id, securityGroupId: sgHRPartner.id, canInitiate: true, canApprove: true, canViewAll: true, canRescind: true, canCorrect: true },
      { definitionId: bpChangeComp.id, securityGroupId: sgManager.id, canInitiate: true, canApprove: true, canViewAll: false, canRescind: false, canCorrect: false },
      { definitionId: bpChangeComp.id, securityGroupId: sgExecutive.id, canInitiate: true, canApprove: true, canViewAll: true, canRescind: true, canCorrect: false },
      { definitionId: bpChangeComp.id, securityGroupId: sgFinanceApprover.id, canInitiate: false, canApprove: true, canViewAll: true, canRescind: false, canCorrect: false },
      // Terminate policies
      { definitionId: bpTerminate.id, securityGroupId: sgHRPartner.id, canInitiate: true, canApprove: true, canViewAll: true, canRescind: true, canCorrect: true },
      { definitionId: bpTerminate.id, securityGroupId: sgManager.id, canInitiate: true, canApprove: false, canViewAll: false, canRescind: false, canCorrect: false },
    ],
  })

  // =============================================================================
  // DOMAIN SECURITY POLICIES
  // =============================================================================
  console.log('🛡️ Creating domain security policies...')

  await prisma.domainSecurityPolicy.createMany({
    data: [
      // Staffing domain
      { code: 'DSP-STAFFING-HR', name: 'Staffing - HR Access', functionalArea: 'Staffing', securityGroupId: sgHRPartner.id, canView: true, canModify: true, canReport: true },
      { code: 'DSP-STAFFING-MGR', name: 'Staffing - Manager Access', functionalArea: 'Staffing', securityGroupId: sgManager.id, canView: true, canModify: false, canReport: true },
      // Compensation domain
      { code: 'DSP-COMP-HR', name: 'Compensation - HR Access', functionalArea: 'Compensation', securityGroupId: sgHRPartner.id, canView: true, canModify: true, canReport: true },
      { code: 'DSP-COMP-MGR', name: 'Compensation - Manager Access', functionalArea: 'Compensation', securityGroupId: sgManager.id, canView: true, canModify: false, canReport: false },
      { code: 'DSP-COMP-FIN', name: 'Compensation - Finance Access', functionalArea: 'Compensation', securityGroupId: sgFinanceApprover.id, canView: true, canModify: false, canReport: true },
      // Organization domain
      { code: 'DSP-ORG-HR', name: 'Organization - HR Access', functionalArea: 'Organization', securityGroupId: sgHRPartner.id, canView: true, canModify: true, canReport: true },
      { code: 'DSP-ORG-EXEC', name: 'Organization - Executive Access', functionalArea: 'Organization', securityGroupId: sgExecutive.id, canView: true, canModify: true, canReport: true },
      // Worker Data domain
      { code: 'DSP-WORKER-HR', name: 'Worker Data - HR Access', functionalArea: 'Worker Data', securityGroupId: sgHRPartner.id, canView: true, canModify: true, canReport: true },
      { code: 'DSP-WORKER-MGR', name: 'Worker Data - Manager Access', functionalArea: 'Worker Data', securityGroupId: sgManager.id, canView: true, canModify: false, canReport: true },
      { code: 'DSP-WORKER-ALL', name: 'Worker Data - Self Service', functionalArea: 'Worker Data', securityGroupId: sgAllWorkers.id, canView: true, canModify: false, canReport: false },
    ],
  })

  // =============================================================================
  // SAMPLE BP TRANSACTIONS
  // =============================================================================
  console.log('📝 Creating sample BP transactions...')

  // Get steps for hire BP
  const hireSteps = await prisma.bPStep.findMany({
    where: { definitionId: bpHire.id },
    orderBy: { stepOrder: 'asc' },
  })

  // Transaction 1: Completed hire
  const txn1 = await prisma.bPTransaction.create({
    data: {
      transactionId: 'TXN-00001',
      definitionId: bpHire.id,
      subjectType: 'Worker',
      subjectId: eng4.id,
      subjectDisplay: `${eng4.firstName} ${eng4.lastName}`,
      initiatorId: mgrTA.id,
      status: 'COMPLETED',
      initiatedAt: new Date('2022-07-15'),
      completedAt: new Date('2022-07-25'),
      effectiveDate: new Date('2022-08-01'),
      transactionData: JSON.stringify({
        positionId: 'P-00016',
        jobProfile: 'Software Engineer',
        salary: 130000,
      }),
    },
  })

  for (const step of hireSteps) {
    await prisma.bPTransactionStep.create({
      data: {
        transactionId: txn1.id,
        stepId: step.id,
        assigneeId: step.stepOrder === 3 ? dirProdEng.id : hrSpec1.id,
        status: 'COMPLETE',
        completedById: step.stepOrder === 3 ? dirProdEng.id : hrSpec1.id,
        completedAt: new Date(`2022-07-${15 + step.stepOrder * 2}`),
      },
    })
  }

  // Transaction 2: In-progress compensation change
  const compStepsList = await prisma.bPStep.findMany({
    where: { definitionId: bpChangeComp.id },
    orderBy: { stepOrder: 'asc' },
  })

  const txn2 = await prisma.bPTransaction.create({
    data: {
      transactionId: 'TXN-00002',
      definitionId: bpChangeComp.id,
      subjectType: 'Worker',
      subjectId: srEng1.id,
      subjectDisplay: `${srEng1.firstName} ${srEng1.lastName}`,
      initiatorId: dirPlatEng.id,
      status: 'IN_PROGRESS',
      initiatedAt: new Date(),
      effectiveDate: new Date(),
      transactionData: JSON.stringify({
        currentSalary: 185000,
        proposedSalary: 205000,
        salaryChangePercent: 10.8,
        reason: 'Annual merit increase and promotion',
      }),
    },
  })

  // Create steps - first 2 complete, 3rd pending
  for (let i = 0; i < compStepsList.length; i++) {
    const step = compStepsList[i]
    await prisma.bPTransactionStep.create({
      data: {
        transactionId: txn2.id,
        stepId: step.id,
        assigneeId: i < 2 ? dirPlatEng.id : (i === 2 ? vpEng.id : hrSpec1.id),
        status: i < 2 ? 'COMPLETE' : (i === 2 ? 'PENDING' : 'PENDING'),
        completedById: i < 2 ? dirPlatEng.id : null,
        completedAt: i < 2 ? new Date() : null,
        dueDate: i >= 2 ? new Date(Date.now() + (step.dueInDays || 3) * 24 * 60 * 60 * 1000) : null,
      },
    })
  }

  // Transaction 3: Pending create position request
  const createPosSteps = await prisma.bPStep.findMany({
    where: { definitionId: bpCreatePos.id },
    orderBy: { stepOrder: 'asc' },
  })

  const txn3 = await prisma.bPTransaction.create({
    data: {
      transactionId: 'TXN-00003',
      definitionId: bpCreatePos.id,
      subjectType: 'Position',
      subjectId: 'NEW',
      subjectDisplay: 'Senior Data Engineer - Platform Engineering',
      initiatorId: dirPlatEng.id,
      status: 'IN_PROGRESS',
      initiatedAt: new Date(),
      effectiveDate: new Date(),
      transactionData: JSON.stringify({
        title: 'Senior Data Engineer',
        jobProfile: 'JP-ENG-SR',
        supervisoryOrg: 'ORG-PLAT-ENG',
        location: 'SF-OFFICE',
        costCenter: 'CC-2000',
        justification: 'Growing data infrastructure needs require additional senior talent',
      }),
    },
  })

  // First step complete, second pending
  for (let i = 0; i < createPosSteps.length; i++) {
    const step = createPosSteps[i]
    await prisma.bPTransactionStep.create({
      data: {
        transactionId: txn3.id,
        stepId: step.id,
        assigneeId: i === 0 ? dirPlatEng.id : (i === 1 ? vpFin.id : hrSpec1.id),
        status: i === 0 ? 'COMPLETE' : 'PENDING',
        completedById: i === 0 ? dirPlatEng.id : null,
        completedAt: i === 0 ? new Date() : null,
        dueDate: i > 0 ? new Date(Date.now() + (step.dueInDays || 3) * 24 * 60 * 60 * 1000) : null,
      },
    })
  }

  // =============================================================================
  // PRACTICE LABS
  // =============================================================================
  console.log('🧪 Creating practice labs...')

  await prisma.practiceLab.createMany({
    data: [
      {
        code: 'LAB-001',
        name: 'Create a New Position',
        description: 'Learn how to create a new position in the organization structure',
        category: 'Staffing',
        difficulty: 'BEGINNER',
        instructions: `# Create a New Position

## Objective
Create a new Software Engineer position in the Product Engineering organization.

## Steps
1. Navigate to the Command Search (Cmd+K)
2. Search for "Create Position"
3. Fill in the required fields:
   - Title: "Junior Software Engineer"
   - Job Profile: Software Engineer (JP-ENG)
   - Supervisory Organization: Product Engineering
   - Location: Austin Office
   - Cost Center: Engineering (CC-2000)
4. Submit the request

## Success Criteria
- Position is created with status "OPEN"
- Position appears in the Product Engineering org
`,
        verificationQuery: JSON.stringify({
          table: 'Position',
          conditions: {
            title: 'Junior Software Engineer',
            status: 'OPEN',
          },
        }),
        estimatedMinutes: 15,
        sortOrder: 1,
      },
      {
        code: 'LAB-002',
        name: 'Configure a Business Process Step',
        description: 'Add a new approval step to an existing business process',
        category: 'Business Process',
        difficulty: 'INTERMEDIATE',
        instructions: `# Configure a Business Process Step

## Objective
Add a Legal Review step to the Hire Employee business process.

## Steps
1. Navigate to Business Process Definitions
2. Edit the "Hire Employee" process
3. Add a new step after "HR Review":
   - Name: "Legal Review"
   - Type: Review
   - Assignee Type: Security Group
   - Due in Days: 3
4. Save the changes

## Success Criteria
- New step appears in the BP definition
- Step order is correct (after HR Review)
`,
        verificationQuery: JSON.stringify({
          table: 'BPStep',
          conditions: {
            name: 'Legal Review',
            stepType: 'REVIEW',
          },
        }),
        estimatedMinutes: 20,
        sortOrder: 2,
      },
      {
        code: 'LAB-003',
        name: 'Create a Condition Rule',
        description: 'Add a routing condition to a business process based on salary thresholds',
        category: 'Business Process',
        difficulty: 'INTERMEDIATE',
        instructions: `# Create a Condition Rule

## Objective
Create a condition rule that requires CEO approval for salary changes above $200,000.

## Steps
1. Navigate to the Change Compensation business process
2. Edit the VP Approval step
3. Add a new condition rule:
   - Field: proposedSalary
   - Operator: Greater Than
   - Value: 200000
   - Action: Add Approver (CEO)
4. Save the rule

## Success Criteria
- Condition rule is active
- Rule triggers for salaries > $200,000
`,
        verificationQuery: JSON.stringify({
          table: 'ConditionRule',
          conditions: {
            field: 'proposedSalary',
            value: '200000',
            operator: 'GREATER_THAN',
          },
        }),
        estimatedMinutes: 25,
        sortOrder: 3,
      },
      {
        code: 'LAB-004',
        name: 'Create a Security Group',
        description: 'Create a new role-based security group for Finance Partners',
        category: 'Security',
        difficulty: 'BEGINNER',
        instructions: `# Create a Security Group

## Objective
Create a new security group for Finance Partners.

## Steps
1. Navigate to Security Groups
2. Create a new group:
   - Code: SG-FIN-PARTNER
   - Name: Finance Partner
   - Type: Role-Based
   - Role Type: Finance Partner
3. Add members from the Finance team
4. Save the group

## Success Criteria
- Security group is created
- At least 2 members are assigned
`,
        verificationQuery: JSON.stringify({
          table: 'SecurityGroup',
          conditions: {
            code: 'SG-FIN-PARTNER',
            groupType: 'ROLE_BASED',
          },
        }),
        estimatedMinutes: 15,
        sortOrder: 4,
      },
      {
        code: 'LAB-005',
        name: 'Reorganize a Supervisory Organization',
        description: 'Move workers between supervisory organizations',
        category: 'Staffing',
        difficulty: 'ADVANCED',
        instructions: `# Reorganize a Supervisory Organization

## Objective
Create a new "Data Engineering" sub-org under Platform Engineering and move relevant workers.

## Steps
1. Create new supervisory organization:
   - Code: ORG-DATA-ENG
   - Name: Data Engineering
   - Parent: Platform Engineering
2. Create 2 new positions in Data Engineering
3. Transfer 1 existing worker to the new org
4. Update reporting relationships

## Success Criteria
- New org exists with correct hierarchy
- At least 1 worker assigned to new org
- Manager relationship is correct
`,
        verificationQuery: JSON.stringify({
          table: 'SupervisoryOrganization',
          conditions: {
            code: 'ORG-DATA-ENG',
          },
        }),
        estimatedMinutes: 45,
        sortOrder: 5,
      },
      {
        code: 'LAB-006',
        name: 'Build a Custom Report',
        description: 'Create a headcount report by department and location',
        category: 'Reports',
        difficulty: 'INTERMEDIATE',
        instructions: `# Build a Custom Report

## Objective
Create a matrix report showing headcount by department and location.

## Steps
1. Navigate to Custom Reports
2. Create a new Matrix report:
   - Name: Headcount by Department and Location
   - Data Source: Workers
   - Rows: Supervisory Organization
   - Columns: Location
   - Values: Count of Workers
3. Add filters for Active workers only
4. Save and run the report

## Success Criteria
- Report is created and runnable
- Shows correct headcount data
- Filters work correctly
`,
        verificationQuery: JSON.stringify({
          table: 'CustomReport',
          conditions: {
            name: 'Headcount by Department and Location',
            reportType: 'MATRIX',
          },
        }),
        estimatedMinutes: 30,
        sortOrder: 6,
      },
    ],
  })

  // =============================================================================
  // CALCULATED FIELDS
  // =============================================================================
  console.log('🔢 Creating calculated fields...')

  await prisma.calculatedField.createMany({
    data: [
      {
        code: 'CF-TENURE-YEARS',
        name: 'Tenure in Years',
        description: 'Calculates years of service from hire date',
        fieldType: 'NUMBER',
        expression: 'DATEDIFF(YEAR, hireDate, CURRENT_DATE)',
        contextType: 'Worker',
      },
      {
        code: 'CF-FTE-COUNT',
        name: 'FTE Count',
        description: 'Calculates FTE based on position percentage',
        fieldType: 'NUMBER',
        expression: 'SUM(position.ftePercentage)',
        contextType: 'Organization',
      },
      {
        code: 'CF-COMPA-RATIO',
        name: 'Compa-Ratio',
        description: 'Salary compared to midpoint of pay range',
        fieldType: 'NUMBER',
        expression: 'worker.annualSalary / jobProfile.midSalary * 100',
        contextType: 'Worker',
      },
      {
        code: 'CF-OPEN-POS-COUNT',
        name: 'Open Position Count',
        description: 'Count of open positions in org',
        fieldType: 'NUMBER',
        expression: 'COUNT(positions WHERE status = "OPEN")',
        contextType: 'Organization',
      },
    ],
  })

  // =============================================================================
  // SUMMARY
  // =============================================================================
  const workerCount = await prisma.worker.count()
  const positionCount = await prisma.position.count()
  const orgCount = await prisma.supervisoryOrganization.count()
  const bpCount = await prisma.bPDefinition.count()
  const sgCount = await prisma.securityGroup.count()
  const labCount = await prisma.practiceLab.count()

  console.log('\n✅ Seed completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Summary:`)
  console.log(`   🏢 Company: Global Tech Corp`)
  console.log(`   👥 Workers: ${workerCount}`)
  console.log(`   💺 Positions: ${positionCount}`)
  console.log(`   🏛️  Supervisory Orgs: ${orgCount}`)
  console.log(`   ⚙️  Business Processes: ${bpCount}`)
  console.log(`   🔐 Security Groups: ${sgCount}`)
  console.log(`   🧪 Practice Labs: ${labCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
