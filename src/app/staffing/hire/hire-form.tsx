'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserPlus, 
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  User,
  Briefcase,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { hireEmployee, type HireEmployeeInput } from '@/actions'

/**
 * Hire Employee Form - Client Component
 * 
 * Receives dropdown data from server component,
 * handles form state and validation,
 * submits via server action.
 */

// Props types based on query return types
interface SupervisoryOrg {
  id: string
  code: string
  name: string
  manager?: { firstName: string; lastName: string } | null
}

interface Location {
  id: string
  code: string
  name: string
  city?: string | null
  state?: string | null
}

interface CostCenter {
  id: string
  code: string
  name: string
}

interface Company {
  id: string
  code: string
  name: string
  currency: string
}

interface JobProfile {
  id: string
  code: string
  title: string
  jobLevel: number
  managementLevel?: string | null
  minSalary?: number | null
  midSalary?: number | null
  maxSalary?: number | null
}

interface OpenPosition {
  id: string
  positionId: string
  title: string
  jobProfile?: { id: string; title: string; code: string } | null
  supervisoryOrg?: { id: string; name: string } | null
  location?: { id: string; name: string } | null
}

interface HireEmployeeFormProps {
  supervisoryOrgs: SupervisoryOrg[]
  locations: Location[]
  costCenters: CostCenter[]
  companies: Company[]
  jobProfiles: JobProfile[]
  openPositions: OpenPosition[]
}

const STEPS = [
  { id: 'prehire', label: 'Pre-Hire', icon: User },
  { id: 'job', label: 'Job Details', icon: Briefcase },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'compensation', label: 'Compensation', icon: DollarSign },
  { id: 'review', label: 'Review & Submit', icon: Check },
]

const HIRE_REASONS = [
  { id: 'new_hire', label: 'New Hire' },
  { id: 'rehire', label: 'Rehire' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'acquisition', label: 'Acquisition' },
]

export function HireEmployeeForm({
  supervisoryOrgs,
  locations,
  costCenters,
  companies,
  jobProfiles,
  openPositions,
}: HireEmployeeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  
  const [formData, setFormData] = useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    hireDate: string
    hireReason: string
    supervisoryOrgId: string
    positionId: string
    jobProfileId: string
    businessTitle: string
    employeeType: 'EMPLOYEE' | 'CONTINGENT_WORKER'
    timeType: 'FULL_TIME' | 'PART_TIME'
    locationId: string
    scheduledHours: number
    companyId: string
    costCenterId: string
    compensationType: 'SALARY' | 'HOURLY'
    amount: number
    currency: string
    frequency: 'ANNUAL' | 'MONTHLY' | 'HOURLY'
  }>({
    // Pre-Hire
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Job Details
    hireDate: '',
    hireReason: '',
    supervisoryOrgId: '',
    positionId: '',
    jobProfileId: '',
    businessTitle: '',
    employeeType: 'EMPLOYEE',
    timeType: 'FULL_TIME',
    locationId: '',
    scheduledHours: 40,
    
    // Organization
    companyId: companies[0]?.id || '',
    costCenterId: '',
    
    // Compensation
    compensationType: 'SALARY',
    amount: 0,
    currency: 'USD',
    frequency: 'ANNUAL',
  })

  const updateField = <K extends keyof typeof formData>(
    field: K, 
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setError(null)
    setFieldErrors({})

    startTransition(async () => {
      // TODO: Get actual initiator ID from auth context
      // For now, we'll use a placeholder - in production this would come from session
      const initiatorId = 'demo-user-id'

      const input: HireEmployeeInput = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        hireDate: formData.hireDate,
        hireReason: formData.hireReason,
        supervisoryOrgId: formData.supervisoryOrgId,
        positionId: formData.positionId || undefined,
        jobProfileId: formData.jobProfileId,
        businessTitle: formData.businessTitle || undefined,
        employeeType: formData.employeeType,
        timeType: formData.timeType,
        locationId: formData.locationId,
        scheduledHours: formData.scheduledHours,
        companyId: formData.companyId,
        costCenterId: formData.costCenterId || undefined,
        compensationType: formData.compensationType,
        amount: formData.amount,
        currency: formData.currency,
        frequency: formData.frequency,
      }

      const result = await hireEmployee(input, initiatorId)

      if (result.success) {
        // Show success message and redirect
        router.push(`/workers?hired=${result.data.workerId}`)
      } else {
        setError(result.error)
        if (result.details) {
          setFieldErrors(result.details)
        }
      }
    })
  }

  // Get selected entities for display
  const selectedPosition = openPositions.find(p => p.id === formData.positionId)
  const selectedJobProfile = jobProfiles.find(j => j.id === formData.jobProfileId)
  const selectedLocation = locations.find(l => l.id === formData.locationId)
  const selectedOrg = supervisoryOrgs.find(o => o.id === formData.supervisoryOrgId)
  const selectedCompany = companies.find(c => c.id === formData.companyId)
  const selectedCostCenter = costCenters.find(c => c.id === formData.costCenterId)

  return (
    <div className="min-h-full bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0875E1]">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Hire Employee</h1>
              <p className="text-sm text-gray-500">Initiate a new hire business process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-[#0875E1]' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep 
                      ? 'bg-[#0875E1] text-white' 
                      : index === currentStep 
                        ? 'bg-[#0875E1] text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-[#0875E1]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="workday-card bg-white rounded-lg border p-6">
          {/* Step 1: Pre-Hire Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Pre-Hire Information</h2>
                <p className="text-sm text-gray-500">Enter the new hire's personal information</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">First Name *</label>
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className={fieldErrors.firstName ? 'border-red-500' : ''}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName[0]}</p>
                  )}
                </div>
                <div>
                  <label className="workday-field-label">Last Name *</label>
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className={fieldErrors.lastName ? 'border-red-500' : ''}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName[0]}</p>
                  )}
                </div>
                <div>
                  <label className="workday-field-label">Email Address *</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="email@company.com"
                    className={fieldErrors.email ? 'border-red-500' : ''}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>
                <div>
                  <label className="workday-field-label">Phone Number</label>
                  <Input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Pre-Hire Record</p>
                    <p className="text-sm text-blue-700 mt-1">
                      If this person has been hired before, search for their existing pre-hire record to prevent duplicates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Job Details</h2>
                <p className="text-sm text-gray-500">Configure the position and job information</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">Hire Date *</label>
                  <Input 
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => updateField('hireDate', e.target.value)}
                    className={fieldErrors.hireDate ? 'border-red-500' : ''}
                  />
                </div>
                <div>
                  <label className="workday-field-label">Hire Reason *</label>
                  <select 
                    className={`w-full h-10 px-3 rounded-md border bg-background ${
                      fieldErrors.hireReason ? 'border-red-500' : 'border-input'
                    }`}
                    value={formData.hireReason}
                    onChange={(e) => updateField('hireReason', e.target.value)}
                  >
                    <option value="">Select reason...</option>
                    {HIRE_REASONS.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Supervisory Organization *</label>
                  <select 
                    className={`w-full h-10 px-3 rounded-md border bg-background ${
                      fieldErrors.supervisoryOrgId ? 'border-red-500' : 'border-input'
                    }`}
                    value={formData.supervisoryOrgId}
                    onChange={(e) => updateField('supervisoryOrgId', e.target.value)}
                  >
                    <option value="">Select organization...</option>
                    {supervisoryOrgs.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code})
                        {org.manager && ` - ${org.manager.firstName} ${org.manager.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Position (Optional)</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.positionId}
                    onChange={(e) => updateField('positionId', e.target.value)}
                  >
                    <option value="">Select open position...</option>
                    {openPositions.map(pos => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title} - {pos.supervisoryOrg?.name || 'No Org'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to hire without a position</p>
                </div>
                <div>
                  <label className="workday-field-label">Job Profile *</label>
                  <select 
                    className={`w-full h-10 px-3 rounded-md border bg-background ${
                      fieldErrors.jobProfileId ? 'border-red-500' : 'border-input'
                    }`}
                    value={formData.jobProfileId}
                    onChange={(e) => updateField('jobProfileId', e.target.value)}
                  >
                    <option value="">Select job profile...</option>
                    {jobProfiles.map(jp => (
                      <option key={jp.id} value={jp.id}>
                        {jp.title} ({jp.code}) - Level {jp.jobLevel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Business Title</label>
                  <Input 
                    value={formData.businessTitle}
                    onChange={(e) => updateField('businessTitle', e.target.value)}
                    placeholder="Optional custom title"
                  />
                </div>
                <div>
                  <label className="workday-field-label">Employee Type *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.employeeType}
                    onChange={(e) => updateField('employeeType', e.target.value as 'EMPLOYEE' | 'CONTINGENT_WORKER')}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CONTINGENT_WORKER">Contingent Worker</option>
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Time Type *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.timeType}
                    onChange={(e) => updateField('timeType', e.target.value as 'FULL_TIME' | 'PART_TIME')}
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Location *</label>
                  <select 
                    className={`w-full h-10 px-3 rounded-md border bg-background ${
                      fieldErrors.locationId ? 'border-red-500' : 'border-input'
                    }`}
                    value={formData.locationId}
                    onChange={(e) => updateField('locationId', e.target.value)}
                  >
                    <option value="">Select location...</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}{loc.city && `, ${loc.city}`}{loc.state && `, ${loc.state}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Scheduled Weekly Hours *</label>
                  <Input 
                    type="number"
                    value={formData.scheduledHours}
                    onChange={(e) => updateField('scheduledHours', Number(e.target.value))}
                    min={1}
                    max={80}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Organization Assignments */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Organization Assignments</h2>
                <p className="text-sm text-gray-500">Configure company and cost center assignments</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">Company *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.companyId}
                    onChange={(e) => updateField('companyId', e.target.value)}
                  >
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name} ({company.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Cost Center</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.costCenterId}
                    onChange={(e) => updateField('costCenterId', e.target.value)}
                  >
                    <option value="">Select cost center...</option>
                    {costCenters.map(cc => (
                      <option key={cc.id} value={cc.id}>
                        {cc.name} ({cc.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Organization Assignment</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Cost center assignment determines budget allocation and reporting hierarchy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Compensation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Propose Compensation</h2>
                <p className="text-sm text-gray-500">Configure base pay and compensation details</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">Compensation Type *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.compensationType}
                    onChange={(e) => updateField('compensationType', e.target.value as 'SALARY' | 'HOURLY')}
                  >
                    <option value="SALARY">Salary</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">
                    {formData.compensationType === 'SALARY' ? 'Annual Salary' : 'Hourly Rate'} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number"
                      className={`pl-7 ${fieldErrors.amount ? 'border-red-500' : ''}`}
                      value={formData.amount || ''}
                      onChange={(e) => updateField('amount', Number(e.target.value))}
                      placeholder={formData.compensationType === 'SALARY' ? '100000' : '50'}
                    />
                  </div>
                  {selectedJobProfile?.minSalary && selectedJobProfile?.maxSalary && (
                    <p className="text-xs text-gray-500 mt-1">
                      Range: ${selectedJobProfile.minSalary.toLocaleString()} - ${selectedJobProfile.maxSalary.toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <label className="workday-field-label">Currency *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Frequency *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.frequency}
                    onChange={(e) => updateField('frequency', e.target.value as 'ANNUAL' | 'MONTHLY' | 'HOURLY')}
                  >
                    <option value="ANNUAL">Annual</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Compensation Guidelines</p>
                    <p className="text-sm text-green-700 mt-1">
                      Ensure the proposed compensation aligns with the job profile's compensation grade and market data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Review & Submit</h2>
                <p className="text-sm text-gray-500">Review all information before submitting</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Pre-Hire Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Name:</span> {formData.firstName} {formData.lastName}</div>
                    <div><span className="text-gray-500">Email:</span> {formData.email}</div>
                    {formData.phone && <div><span className="text-gray-500">Phone:</span> {formData.phone}</div>}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Job Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Hire Date:</span> {formData.hireDate}</div>
                    <div><span className="text-gray-500">Organization:</span> {selectedOrg?.name || 'N/A'}</div>
                    {selectedPosition && (
                      <div><span className="text-gray-500">Position:</span> {selectedPosition.title}</div>
                    )}
                    <div><span className="text-gray-500">Job Profile:</span> {selectedJobProfile?.title || 'N/A'}</div>
                    <div><span className="text-gray-500">Location:</span> {selectedLocation?.name || 'N/A'}</div>
                    <div><span className="text-gray-500">Hours:</span> {formData.scheduledHours}/week</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Organization</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Company:</span> {selectedCompany?.name || 'N/A'}</div>
                    {selectedCostCenter && (
                      <div><span className="text-gray-500">Cost Center:</span> {selectedCostCenter.name}</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Compensation</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Type:</span> {formData.compensationType}</div>
                    <div>
                      <span className="text-gray-500">Amount:</span> ${formData.amount.toLocaleString()} {formData.currency}
                      {formData.compensationType === 'SALARY' ? '/year' : '/hour'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">What happens next?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      After submission, this hire request will route through the approval workflow. 
                      You will receive inbox tasks for any additional actions required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0 || isPending}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
