'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { 
  UserMinus, 
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Calendar,
  FileText,
  Shield,
  AlertCircle,
  Search,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { terminateEmployee, type TerminateEmployeeInput } from '@/actions'

/**
 * Terminate Employee Form - Client Component
 * 
 * Receives workers from server component,
 * handles form state and validation,
 * submits via server action.
 */

interface Worker {
  id: string
  workerId: string
  firstName: string
  lastName: string
  businessTitle: string | null
  email: string
  supervisoryOrg?: { id: string; name: string } | null
  jobProfile?: { id: string; title: string } | null
}

interface TerminateEmployeeFormProps {
  workers: Worker[]
  preselectedWorkerId?: string
}

const STEPS = [
  { id: 'worker', label: 'Select Worker', icon: Search },
  { id: 'details', label: 'Termination Details', icon: FileText },
  { id: 'finalpay', label: 'Final Pay', icon: Calendar },
  { id: 'offboarding', label: 'Offboarding', icon: Shield },
  { id: 'review', label: 'Review & Submit', icon: Check },
]

const TERMINATION_REASONS_VOLUNTARY = [
  { id: 'resignation', label: 'Resignation' },
  { id: 'retirement', label: 'Retirement' },
  { id: 'relocation', label: 'Relocation' },
  { id: 'career_change', label: 'Career Change' },
  { id: 'return_to_school', label: 'Return to School' },
  { id: 'personal_reasons', label: 'Personal Reasons' },
]

const TERMINATION_REASONS_INVOLUNTARY = [
  { id: 'position_elimination', label: 'Position Elimination' },
  { id: 'reduction_in_force', label: 'Reduction in Force' },
  { id: 'performance', label: 'Performance' },
  { id: 'conduct', label: 'Conduct/Policy Violation' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'end_of_contract', label: 'End of Contract' },
]

function TerminateFormContent({ workers, preselectedWorkerId }: TerminateEmployeeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(preselectedWorkerId ? 1 : 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  
  const [formData, setFormData] = useState<{
    workerId: string
    terminationType: 'VOLUNTARY' | 'INVOLUNTARY' | ''
    terminationReason: string
    terminationDate: string
    noticeDate: string
    lastDayWorked: string
    payThroughDate: string
    regrettable: boolean
    payoutVacation: boolean
    vacationHours: number
    returnEquipment: boolean
    exitInterview: boolean
    revokeAccess: boolean
  }>({
    workerId: preselectedWorkerId || '',
    terminationType: '',
    terminationReason: '',
    terminationDate: '',
    noticeDate: '',
    lastDayWorked: '',
    payThroughDate: '',
    regrettable: false,
    payoutVacation: true,
    vacationHours: 80,
    returnEquipment: true,
    exitInterview: true,
    revokeAccess: true,
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
      const input: TerminateEmployeeInput = {
        workerId: formData.workerId,
        terminationType: formData.terminationType as 'VOLUNTARY' | 'INVOLUNTARY',
        terminationReason: formData.terminationReason,
        terminationDate: formData.terminationDate,
        noticeDate: formData.noticeDate || undefined,
        lastDayWorked: formData.lastDayWorked,
        payThroughDate: formData.payThroughDate,
        regrettable: formData.regrettable,
        payoutVacation: formData.payoutVacation,
        vacationHours: formData.payoutVacation ? formData.vacationHours : undefined,
        returnEquipment: formData.returnEquipment,
        exitInterview: formData.exitInterview,
        revokeAccess: formData.revokeAccess,
      }

      const result = await terminateEmployee(input)

      if (result.success) {
        router.push(`/?terminated=${result.data.transactionId}`)
      } else {
        setError(result.error)
        if (result.details) {
          setFieldErrors(result.details)
        }
      }
    })
  }

  const selectedWorker = workers.find(w => w.id === formData.workerId)
  const terminationReasons = formData.terminationType === 'VOLUNTARY' 
    ? TERMINATION_REASONS_VOLUNTARY 
    : TERMINATION_REASONS_INVOLUNTARY

  const filteredWorkers = workers.filter(w => 
    w.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.workerId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-full bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600">
              <UserMinus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Terminate Employee</h1>
              <p className="text-sm text-gray-500">Process an employee termination</p>
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
          
          {/* Step 1: Select Worker */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Worker</h2>
                <p className="text-sm text-gray-500">Search for the employee to terminate</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-9"
                  placeholder="Search by name or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredWorkers.map(worker => (
                  <button
                    key={worker.id}
                    onClick={() => updateField('workerId', worker.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      formData.workerId === worker.id 
                        ? 'border-[#0875E1] bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback>{worker.firstName[0]}{worker.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{worker.firstName} {worker.lastName}</p>
                      <p className="text-sm text-gray-500">
                        {worker.businessTitle || worker.jobProfile?.title || 'No Title'}
                        {worker.supervisoryOrg && ` • ${worker.supervisoryOrg.name}`}
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">{worker.workerId}</span>
                    {formData.workerId === worker.id && (
                      <Check className="h-5 w-5 text-[#0875E1]" />
                    )}
                  </button>
                ))}
                {filteredWorkers.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No workers found</p>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Important</p>
                    <p className="text-sm text-red-700 mt-1">
                      Terminating an employee will end their employment record and trigger 
                      offboarding tasks. This action cannot be easily undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Termination Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Termination Details</h2>
                <p className="text-sm text-gray-500">Enter the termination reason and dates</p>
              </div>

              {selectedWorker && (
                <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{selectedWorker.firstName[0]}{selectedWorker.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{selectedWorker.firstName} {selectedWorker.lastName}</p>
                    <p className="text-sm text-gray-500">{selectedWorker.businessTitle || selectedWorker.jobProfile?.title}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">Termination Type *</label>
                  <select 
                    className={`w-full h-10 px-3 rounded-md border bg-background ${
                      fieldErrors.terminationType ? 'border-red-500' : 'border-input'
                    }`}
                    value={formData.terminationType}
                    onChange={(e) => {
                      updateField('terminationType', e.target.value as 'VOLUNTARY' | 'INVOLUNTARY')
                      updateField('terminationReason', '')
                    }}
                  >
                    <option value="">Select type...</option>
                    <option value="VOLUNTARY">Voluntary</option>
                    <option value="INVOLUNTARY">Involuntary</option>
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Termination Reason *</label>
                  <select 
                    className={`w-full h-10 px-3 rounded-md border bg-background ${
                      fieldErrors.terminationReason ? 'border-red-500' : 'border-input'
                    }`}
                    value={formData.terminationReason}
                    onChange={(e) => updateField('terminationReason', e.target.value)}
                    disabled={!formData.terminationType}
                  >
                    <option value="">Select reason...</option>
                    {terminationReasons.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="workday-field-label">Termination Date *</label>
                  <Input 
                    type="date"
                    value={formData.terminationDate}
                    onChange={(e) => updateField('terminationDate', e.target.value)}
                    className={fieldErrors.terminationDate ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Last date of employment</p>
                </div>
                <div>
                  <label className="workday-field-label">Notice Date</label>
                  <Input 
                    type="date"
                    value={formData.noticeDate}
                    onChange={(e) => updateField('noticeDate', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Date notice was given</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input 
                  type="checkbox" 
                  id="regrettable"
                  checked={formData.regrettable}
                  onChange={(e) => updateField('regrettable', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="regrettable" className="text-sm text-gray-700">
                  Regrettable Termination (for reporting and analytics)
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Final Pay */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Final Pay</h2>
                <p className="text-sm text-gray-500">Configure final payment details</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="workday-field-label">Last Day Worked *</label>
                  <Input 
                    type="date"
                    value={formData.lastDayWorked}
                    onChange={(e) => updateField('lastDayWorked', e.target.value)}
                    className={fieldErrors.lastDayWorked ? 'border-red-500' : ''}
                  />
                </div>
                <div>
                  <label className="workday-field-label">Pay Through Date *</label>
                  <Input 
                    type="date"
                    value={formData.payThroughDate}
                    onChange={(e) => updateField('payThroughDate', e.target.value)}
                    className={fieldErrors.payThroughDate ? 'border-red-500' : ''}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900">PTO/Vacation Payout</h3>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="payoutVacation"
                    checked={formData.payoutVacation}
                    onChange={(e) => updateField('payoutVacation', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="payoutVacation" className="text-sm text-gray-700">
                    Payout unused vacation balance
                  </label>
                </div>
                {formData.payoutVacation && (
                  <div className="pl-7">
                    <label className="workday-field-label">Vacation Balance (hours)</label>
                    <Input 
                      type="number"
                      value={formData.vacationHours}
                      onChange={(e) => updateField('vacationHours', Number(e.target.value))}
                      className="max-w-32"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Offboarding */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Offboarding</h2>
                <p className="text-sm text-gray-500">Configure offboarding tasks</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="returnEquipment"
                      checked={formData.returnEquipment}
                      onChange={(e) => updateField('returnEquipment', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div>
                      <label htmlFor="returnEquipment" className="text-sm font-medium text-gray-900">
                        Equipment Return Required
                      </label>
                      <p className="text-xs text-gray-500">Laptop, badge, keys, etc.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="exitInterview"
                      checked={formData.exitInterview}
                      onChange={(e) => updateField('exitInterview', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div>
                      <label htmlFor="exitInterview" className="text-sm font-medium text-gray-900">
                        Schedule Exit Interview
                      </label>
                      <p className="text-xs text-gray-500">HR will reach out to schedule</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="revokeAccess"
                      checked={formData.revokeAccess}
                      onChange={(e) => updateField('revokeAccess', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div>
                      <label htmlFor="revokeAccess" className="text-sm font-medium text-gray-900">
                        Revoke System Access
                      </label>
                      <p className="text-xs text-gray-500">Disable all system accounts on termination date</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Compliance Note</p>
                    <p className="text-sm text-amber-700 mt-1">
                      IT will receive a task to revoke system access. Ensure all data handoff 
                      is complete before the termination date.
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
                <p className="text-sm text-gray-500">Review all termination details</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Employee</h3>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{selectedWorker?.firstName[0]}{selectedWorker?.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedWorker?.firstName} {selectedWorker?.lastName}</p>
                      <p className="text-sm text-gray-500">
                        {selectedWorker?.businessTitle} • {selectedWorker?.workerId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Termination Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Type:</span> {formData.terminationType}</div>
                    <div>
                      <span className="text-gray-500">Reason:</span>{' '}
                      {terminationReasons.find(r => r.id === formData.terminationReason)?.label}
                    </div>
                    <div><span className="text-gray-500">Termination Date:</span> {formData.terminationDate}</div>
                    <div><span className="text-gray-500">Regrettable:</span> {formData.regrettable ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Final Pay</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Last Day Worked:</span> {formData.lastDayWorked}</div>
                    <div><span className="text-gray-500">Pay Through:</span> {formData.payThroughDate}</div>
                    {formData.payoutVacation && (
                      <div><span className="text-gray-500">Vacation Payout:</span> {formData.vacationHours} hours</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Offboarding Tasks</h3>
                  <div className="space-y-2 text-sm">
                    {formData.returnEquipment && <div>• Equipment return required</div>}
                    {formData.exitInterview && <div>• Exit interview scheduled</div>}
                    {formData.revokeAccess && <div>• System access revocation</div>}
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Final Confirmation</p>
                    <p className="text-sm text-red-700 mt-1">
                      By submitting, you confirm that all information is accurate and the 
                      termination has been properly authorized. This action will create 
                      offboarding tasks and schedule access revocation.
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
              <Button 
                onClick={nextStep}
                disabled={currentStep === 0 && !formData.workerId}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="bg-red-600 hover:bg-red-700"
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
                    Submit Termination
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

export function TerminateEmployeeForm(props: TerminateEmployeeFormProps) {
  return (
    <Suspense fallback={
      <div className="min-h-full bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <TerminateFormContent {...props} />
    </Suspense>
  )
}
