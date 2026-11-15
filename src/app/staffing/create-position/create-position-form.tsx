'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Briefcase,
  Calendar,
  AlertCircle,
  Users,
  Clock,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPosition, type CreatePositionInput } from '@/actions'

/**
 * Create Position Form - Client Component
 * 
 * Receives dropdown data from server component,
 * handles form state and validation,
 * submits via server action.
 */

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
}

interface CreatePositionFormProps {
  supervisoryOrgs: SupervisoryOrg[]
  locations: Location[]
  costCenters: CostCenter[]
  companies: Company[]
  jobProfiles: JobProfile[]
}

const STEPS = [
  { id: 'basics', label: 'Position Basics', icon: Briefcase },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'location', label: 'Location & Schedule', icon: Clock },
  { id: 'restrictions', label: 'Hiring Restrictions', icon: Calendar },
  { id: 'review', label: 'Review & Submit', icon: Check },
]

export function CreatePositionForm({
  supervisoryOrgs,
  locations,
  costCenters,
  companies,
  jobProfiles,
}: CreatePositionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  
  const [formData, setFormData] = useState<{
    title: string
    jobProfileId: string
    workerType: 'EMPLOYEE' | 'CONTINGENT_WORKER'
    supervisoryOrgId: string
    costCenterId: string
    locationId: string
    timeType: 'FULL_TIME' | 'PART_TIME'
    scheduledHours: number
    ftePercentage: number
    isManagement: boolean
    isCritical: boolean
    earliestHireDate: string
    latestHireDate: string
    availableForHire: boolean
    jobPostingTitle: string
  }>({
    title: '',
    jobProfileId: '',
    workerType: 'EMPLOYEE',
    supervisoryOrgId: '',
    costCenterId: '',
    locationId: '',
    timeType: 'FULL_TIME',
    scheduledHours: 40,
    ftePercentage: 1,
    isManagement: false,
    isCritical: false,
    earliestHireDate: '',
    latestHireDate: '',
    availableForHire: true,
    jobPostingTitle: '',
  })

  const updateField = <K extends keyof typeof formData>(
    field: K, 
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      const input: CreatePositionInput = {
        title: formData.title,
        jobProfileId: formData.jobProfileId,
        supervisoryOrgId: formData.supervisoryOrgId,
        locationId: formData.locationId,
        costCenterId: formData.costCenterId || undefined,
        workerType: formData.workerType,
        timeType: formData.timeType,
        scheduledHours: formData.scheduledHours,
        ftePercentage: formData.ftePercentage,
        isManagement: formData.isManagement,
        isCritical: formData.isCritical,
        earliestHireDate: formData.earliestHireDate || undefined,
        latestHireDate: formData.latestHireDate || undefined,
        availableForHire: formData.availableForHire,
      }

      const result = await createPosition(input)

      if (result.success) {
        router.push(`/staffing/positions?created=${result.data.positionId}`)
      } else {
        setError(result.error)
        if (result.details) {
          setFieldErrors(result.details)
        }
      }
    })
  }

  const selectedJobProfile = jobProfiles.find(j => j.id === formData.jobProfileId)
  const selectedOrg = supervisoryOrgs.find(o => o.id === formData.supervisoryOrgId)
  const selectedLocation = locations.find(l => l.id === formData.locationId)
  const selectedCostCenter = costCenters.find(c => c.id === formData.costCenterId)

  return (
    <div className="min-h-full bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0875E1]">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create Position</h1>
              <p className="text-sm text-gray-500">Create a new position for staffing</p>
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
          
          {/* Step 1: Position Basics */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Position Basics</h2>
                <p className="text-sm text-gray-500">Define the position title and type</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="workday-field-label">Position Title *</label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Software Engineer - Platform"
                    className={fieldErrors.title ? 'border-red-500' : ''}
                  />
                  {fieldErrors.title && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.title[0]}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">This appears in reports and org charts</p>
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
                  <p className="text-xs text-gray-500 mt-1">Defines compensation grade and requirements</p>
                </div>
                <div>
                  <label className="workday-field-label">Worker Type *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.workerType}
                    onChange={(e) => updateField('workerType', e.target.value as 'EMPLOYEE' | 'CONTINGENT_WORKER')}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CONTINGENT_WORKER">Contingent Worker</option>
                  </select>
                </div>
              </div>

              {selectedJobProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Job Profile: {selectedJobProfile.title}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                    <div><span className="font-medium">Code:</span> {selectedJobProfile.code}</div>
                    <div><span className="font-medium">Level:</span> {selectedJobProfile.jobLevel}</div>
                    <div><span className="font-medium">Type:</span> {selectedJobProfile.managementLevel || 'Individual Contributor'}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Organization */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Organization Assignment</h2>
                <p className="text-sm text-gray-500">Assign the position to an organization</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
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

              {selectedOrg && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedOrg.name}</p>
                      {selectedOrg.manager && (
                        <p className="text-sm text-gray-500">
                          Manager: {selectedOrg.manager.firstName} {selectedOrg.manager.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location & Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Location & Schedule</h2>
                <p className="text-sm text-gray-500">Define work location and schedule</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">Work Location *</label>
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
                  <label className="workday-field-label">Scheduled Weekly Hours *</label>
                  <Input 
                    type="number"
                    value={formData.scheduledHours}
                    onChange={(e) => updateField('scheduledHours', Number(e.target.value))}
                    min={1}
                    max={80}
                  />
                </div>
                <div>
                  <label className="workday-field-label">FTE Percentage *</label>
                  <Input 
                    type="number"
                    value={formData.ftePercentage}
                    onChange={(e) => updateField('ftePercentage', Number(e.target.value))}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-xs text-gray-500 mt-1">1.0 = Full time, 0.5 = Half time</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isManagement"
                    checked={formData.isManagement}
                    onChange={(e) => updateField('isManagement', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="isManagement" className="text-sm text-gray-700">
                    Management Position
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isCritical"
                    checked={formData.isCritical}
                    onChange={(e) => updateField('isCritical', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="isCritical" className="text-sm text-gray-700">
                    Business Critical
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Hiring Restrictions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Hiring Restrictions</h2>
                <p className="text-sm text-gray-500">Configure when this position can be filled</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">Earliest Hire Date</label>
                  <Input 
                    type="date"
                    value={formData.earliestHireDate}
                    onChange={(e) => updateField('earliestHireDate', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Cannot hire before this date</p>
                </div>
                <div>
                  <label className="workday-field-label">Latest Hire Date</label>
                  <Input 
                    type="date"
                    value={formData.latestHireDate}
                    onChange={(e) => updateField('latestHireDate', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Position expires after this date</p>
                </div>
                <div className="col-span-2">
                  <label className="workday-field-label">Job Posting Title</label>
                  <Input 
                    value={formData.jobPostingTitle}
                    onChange={(e) => updateField('jobPostingTitle', e.target.value)}
                    placeholder="Title shown on external job postings"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input 
                  type="checkbox" 
                  id="availableForHire"
                  checked={formData.availableForHire}
                  onChange={(e) => updateField('availableForHire', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="availableForHire" className="text-sm text-gray-700">
                  Available for Hire (makes this position visible for hiring once approved)
                </label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Position Restrictions</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Hiring restrictions control when and how this position can be filled.
                      The position must be approved before it becomes available for hire.
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
                <p className="text-sm text-gray-500">Review all position details before submitting</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Position Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Title:</span> {formData.title}</div>
                    <div><span className="text-gray-500">Job Profile:</span> {selectedJobProfile?.title}</div>
                    <div><span className="text-gray-500">Worker Type:</span> {formData.workerType.replace('_', ' ')}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Organization</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Supervisory Org:</span> {selectedOrg?.name}</div>
                    {selectedCostCenter && (
                      <div><span className="text-gray-500">Cost Center:</span> {selectedCostCenter.name}</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Location & Schedule</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Location:</span> {selectedLocation?.name}</div>
                    <div><span className="text-gray-500">Time Type:</span> {formData.timeType.replace('_', ' ')}</div>
                    <div><span className="text-gray-500">Hours:</span> {formData.scheduledHours}/week</div>
                    <div><span className="text-gray-500">FTE:</span> {formData.ftePercentage}</div>
                  </div>
                </div>

                {(formData.earliestHireDate || formData.latestHireDate) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Hiring Restrictions</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {formData.earliestHireDate && (
                        <div><span className="text-gray-500">Earliest:</span> {formData.earliestHireDate}</div>
                      )}
                      {formData.latestHireDate && (
                        <div><span className="text-gray-500">Latest:</span> {formData.latestHireDate}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">What happens next?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This position will be submitted for approval. Once approved, 
                      it will be available for hiring through the Hire Employee process.
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
