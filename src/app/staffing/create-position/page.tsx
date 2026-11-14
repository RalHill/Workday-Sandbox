'use client'

import { useState } from 'react'
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
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * Workday Create Position Business Process
 * 
 * Position Management is one of Workday's staffing models:
 * - Positions must be created before hiring
 * - Each position has a Job Profile defining requirements
 * - Positions have hiring restrictions (job requisition-like features)
 * - Headcount is tracked at the position level
 * 
 * Steps:
 * 1. Position Basics - Title, Job Profile, Type
 * 2. Organization - Supervisory Org, Company, Cost Center
 * 3. Location & Schedule - Work location, time type
 * 4. Hiring Restrictions - Earliest/Latest hire dates, worker type
 * 5. Review & Submit
 */

const STEPS = [
  { id: 'basics', label: 'Position Basics', icon: Briefcase },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'location', label: 'Location & Schedule', icon: Clock },
  { id: 'restrictions', label: 'Hiring Restrictions', icon: Calendar },
  { id: 'review', label: 'Review & Submit', icon: Check },
]

const JOB_PROFILES = [
  { id: 'jp1', title: 'Software Engineer', code: 'SWE', grade: 'P3' },
  { id: 'jp2', title: 'Senior Software Engineer', code: 'SWE-SR', grade: 'P4' },
  { id: 'jp3', title: 'Staff Software Engineer', code: 'SWE-ST', grade: 'P5' },
  { id: 'jp4', title: 'Product Manager', code: 'PM', grade: 'P4' },
  { id: 'jp5', title: 'Senior Product Manager', code: 'PM-SR', grade: 'P5' },
  { id: 'jp6', title: 'HR Business Partner', code: 'HRBP', grade: 'P3' },
  { id: 'jp7', title: 'Financial Analyst', code: 'FA', grade: 'P2' },
  { id: 'jp8', title: 'Sales Representative', code: 'SR', grade: 'P3' },
]

const SUPERVISORY_ORGS = [
  { id: 'so1', name: 'Engineering', code: 'ENG', manager: 'Jordan Lee' },
  { id: 'so2', name: 'Platform Team', code: 'PLAT', manager: 'Sarah Chen' },
  { id: 'so3', name: 'Product Management', code: 'PM', manager: 'Marcus Williams' },
  { id: 'so4', name: 'Human Resources', code: 'HR', manager: 'Taylor Johnson' },
  { id: 'so5', name: 'Finance', code: 'FIN', manager: 'Chris Anderson' },
]

const LOCATIONS = [
  { id: 'loc1', name: 'San Francisco HQ', type: 'Office' },
  { id: 'loc2', name: 'New York Office', type: 'Office' },
  { id: 'loc3', name: 'Remote - US', type: 'Remote' },
  { id: 'loc4', name: 'London Office', type: 'Office' },
]

export default function CreatePositionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Position Basics
    positionTitle: '',
    jobProfile: '',
    workerType: 'EMPLOYEE',
    
    // Organization
    supervisoryOrg: '',
    company: 'Global Tech Corp',
    costCenter: '',
    
    // Location & Schedule
    location: '',
    timeType: 'FULL_TIME',
    scheduledHours: '40',
    
    // Hiring Restrictions
    earliestHireDate: '',
    latestHireDate: '',
    availableForHire: true,
    jobPostingTitle: '',
  })

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    console.log('Creating position:', formData)
    alert('Create Position business process initiated successfully!\n\nThe position will be available for hire once approved.')
    router.push('/staffing/positions')
  }

  const selectedJobProfile = JOB_PROFILES.find(j => j.id === formData.jobProfile)
  const selectedOrg = SUPERVISORY_ORGS.find(o => o.id === formData.supervisoryOrg)

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
                    value={formData.positionTitle}
                    onChange={(e) => updateField('positionTitle', e.target.value)}
                    placeholder="e.g., Software Engineer - Platform"
                  />
                  <p className="text-xs text-gray-500 mt-1">This appears in reports and org charts</p>
                </div>
                <div>
                  <label className="workday-field-label">Job Profile *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.jobProfile}
                    onChange={(e) => updateField('jobProfile', e.target.value)}
                  >
                    <option value="">Select job profile...</option>
                    {JOB_PROFILES.map(jp => (
                      <option key={jp.id} value={jp.id}>
                        {jp.title} ({jp.code}) - Grade {jp.grade}
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
                    onChange={(e) => updateField('workerType', e.target.value)}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CONTINGENT">Contingent Worker</option>
                  </select>
                </div>
              </div>

              {selectedJobProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Job Profile: {selectedJobProfile.title}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                    <div><span className="font-medium">Code:</span> {selectedJobProfile.code}</div>
                    <div><span className="font-medium">Grade:</span> {selectedJobProfile.grade}</div>
                    <div><span className="font-medium">Type:</span> Professional</div>
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
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.supervisoryOrg}
                    onChange={(e) => updateField('supervisoryOrg', e.target.value)}
                  >
                    <option value="">Select organization...</option>
                    {SUPERVISORY_ORGS.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Company *</label>
                  <Input 
                    value={formData.company}
                    disabled
                  />
                </div>
                <div>
                  <label className="workday-field-label">Cost Center *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.costCenter}
                    onChange={(e) => updateField('costCenter', e.target.value)}
                  >
                    <option value="">Select cost center...</option>
                    <option value="cc1">CC-1001 - Engineering</option>
                    <option value="cc2">CC-1002 - Product</option>
                    <option value="cc3">CC-1003 - Sales</option>
                    <option value="cc4">CC-1004 - G&A</option>
                  </select>
                </div>
              </div>

              {selectedOrg && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedOrg.name}</p>
                      <p className="text-sm text-gray-500">Manager: {selectedOrg.manager}</p>
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
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  >
                    <option value="">Select location...</option>
                    {LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Time Type *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.timeType}
                    onChange={(e) => updateField('timeType', e.target.value)}
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
                    onChange={(e) => updateField('scheduledHours', e.target.value)}
                  />
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
                  checked={formData.availableForHire as boolean}
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
                    <div><span className="text-gray-500">Title:</span> {formData.positionTitle}</div>
                    <div><span className="text-gray-500">Job Profile:</span> {selectedJobProfile?.title}</div>
                    <div><span className="text-gray-500">Worker Type:</span> {formData.workerType}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Organization</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Supervisory Org:</span> {selectedOrg?.name}</div>
                    <div><span className="text-gray-500">Company:</span> {formData.company}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Location & Schedule</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Location:</span> {LOCATIONS.find(l => l.id === formData.location)?.name}</div>
                    <div><span className="text-gray-500">Time Type:</span> {formData.timeType.replace('_', ' ')}</div>
                    <div><span className="text-gray-500">Hours:</span> {formData.scheduledHours}/week</div>
                  </div>
                </div>
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
              disabled={currentStep === 0}
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
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
