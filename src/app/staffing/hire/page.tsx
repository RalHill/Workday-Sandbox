'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  UserPlus, 
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

/**
 * Workday Hire Employee Business Process
 * 
 * Standard workflow based on research:
 * 1. Initiation - Select/Create Pre-Hire, enter basic info
 * 2. Job Details - Position, Job Profile, Location, Time Type
 * 3. Organization Assignments - Company, Cost Center, Fund
 * 4. Propose Compensation - Salary/Hourly, Frequency
 * 5. Review & Submit
 * 
 * After submission, routes through approvals and onboarding tasks.
 */

const STEPS = [
  { id: 'prehire', label: 'Pre-Hire', icon: User },
  { id: 'job', label: 'Job Details', icon: Briefcase },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'compensation', label: 'Compensation', icon: DollarSign },
  { id: 'review', label: 'Review & Submit', icon: Check },
]

// Mock data for dropdowns
const SUPERVISORY_ORGS = [
  { id: 'so1', name: 'Engineering', code: 'ENG' },
  { id: 'so2', name: 'Product Management', code: 'PM' },
  { id: 'so3', name: 'Human Resources', code: 'HR' },
  { id: 'so4', name: 'Finance', code: 'FIN' },
  { id: 'so5', name: 'Sales', code: 'SALES' },
]

const JOB_PROFILES = [
  { id: 'jp1', title: 'Software Engineer', code: 'SWE', grade: 'P3' },
  { id: 'jp2', title: 'Senior Software Engineer', code: 'SWE-SR', grade: 'P4' },
  { id: 'jp3', title: 'Product Manager', code: 'PM', grade: 'P4' },
  { id: 'jp4', title: 'HR Business Partner', code: 'HRBP', grade: 'P3' },
  { id: 'jp5', title: 'Financial Analyst', code: 'FA', grade: 'P2' },
]

const POSITIONS = [
  { id: 'pos1', title: 'Software Engineer - Platform', status: 'OPEN', org: 'Engineering' },
  { id: 'pos2', title: 'Senior Data Engineer', status: 'OPEN', org: 'Engineering' },
  { id: 'pos3', title: 'Product Manager - Growth', status: 'OPEN', org: 'Product Management' },
]

const LOCATIONS = [
  { id: 'loc1', name: 'San Francisco HQ' },
  { id: 'loc2', name: 'New York Office' },
  { id: 'loc3', name: 'Remote - US' },
]

const HIRE_REASONS = [
  { id: 'new', label: 'New Hire' },
  { id: 'rehire', label: 'Rehire' },
  { id: 'conversion', label: 'Conversion' },
]

export default function HireEmployeePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Pre-Hire
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Job Details
    hireDate: '',
    hireReason: '',
    supervisoryOrg: '',
    position: '',
    jobProfile: '',
    businessTitle: '',
    employeeType: 'EMPLOYEE',
    timeType: 'FULL_TIME',
    location: '',
    scheduledHours: '40',
    
    // Organization
    company: 'Global Tech Corp',
    costCenter: '',
    
    // Compensation
    compensationType: 'SALARY',
    amount: '',
    currency: 'USD',
    frequency: 'ANNUAL',
  })

  const updateField = (field: string, value: string) => {
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
    // In real app, this would call an API to create the hire transaction
    console.log('Submitting hire:', formData)
    alert('Hire Employee business process initiated successfully!\n\nThe request has been submitted and will route through the approval workflow.')
    router.push('/')
  }

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
                  />
                </div>
                <div>
                  <label className="workday-field-label">Last Name *</label>
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="workday-field-label">Email Address *</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="email@company.com"
                  />
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
                  />
                </div>
                <div>
                  <label className="workday-field-label">Hire Reason *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
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
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.supervisoryOrg}
                    onChange={(e) => updateField('supervisoryOrg', e.target.value)}
                  >
                    <option value="">Select organization...</option>
                    {SUPERVISORY_ORGS.map(org => (
                      <option key={org.id} value={org.id}>{org.name} ({org.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Position *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.position}
                    onChange={(e) => updateField('position', e.target.value)}
                  >
                    <option value="">Select open position...</option>
                    {POSITIONS.map(pos => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title} - {pos.org}
                      </option>
                    ))}
                  </select>
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
                      <option key={jp.id} value={jp.id}>{jp.title} ({jp.code})</option>
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
                    onChange={(e) => updateField('employeeType', e.target.value)}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CONTINGENT">Contingent Worker</option>
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
                  <label className="workday-field-label">Location *</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  >
                    <option value="">Select location...</option>
                    {LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
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
                  <Input 
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Defaults from supervisory organization</p>
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
                    onChange={(e) => updateField('compensationType', e.target.value)}
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
                      className="pl-7"
                      value={formData.amount}
                      onChange={(e) => updateField('amount', e.target.value)}
                      placeholder={formData.compensationType === 'SALARY' ? '100000' : '50'}
                    />
                  </div>
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
                    onChange={(e) => updateField('frequency', e.target.value)}
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

              {/* Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Pre-Hire Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Name:</span> {formData.firstName} {formData.lastName}</div>
                    <div><span className="text-gray-500">Email:</span> {formData.email}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Job Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Hire Date:</span> {formData.hireDate}</div>
                    <div><span className="text-gray-500">Position:</span> {POSITIONS.find(p => p.id === formData.position)?.title || 'N/A'}</div>
                    <div><span className="text-gray-500">Job Profile:</span> {JOB_PROFILES.find(j => j.id === formData.jobProfile)?.title || 'N/A'}</div>
                    <div><span className="text-gray-500">Location:</span> {LOCATIONS.find(l => l.id === formData.location)?.name || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Compensation</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Type:</span> {formData.compensationType}</div>
                    <div><span className="text-gray-500">Amount:</span> ${Number(formData.amount).toLocaleString()} {formData.currency}/{formData.frequency}</div>
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
