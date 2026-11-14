'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Phone, 
  UserCircle,
  MapPin,
  Mail,
  Building2,
  Calendar,
  Clock,
  History,
  Shield,
  TrendingUp,
  FileText,
  ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * Workday Worker Profile Blue Ribbon Menu
 * 
 * Based on authentic Workday profile tabs:
 * - Summary: Employment location, job details, public contact info
 * - Job: Employee ID, position, hire date, worker history
 * - Compensation: Base pay, frequency, grade, plan assignments
 * - Contact: Addresses, phones, emails, emergency contacts
 * - Personal: Legal name, preferred name, IDs
 * - Performance: Reviews, goals
 * - Career: Skills, certifications
 */

interface WorkerProfileTabsProps {
  worker: any
  workerHistory: any[]
  yearsOfService: number
  monthsOfService: number
}

const TABS = [
  { id: 'summary', label: 'Summary', icon: User },
  { id: 'job', label: 'Job', icon: Briefcase },
  { id: 'compensation', label: 'Compensation', icon: DollarSign },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'personal', label: 'Personal', icon: UserCircle },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'career', label: 'Career', icon: FileText },
]

export function WorkerProfileTabs({ worker, workerHistory, yearsOfService, monthsOfService }: WorkerProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('summary')

  return (
    <div>
      {/* Tab Navigation - Blue Ribbon Menu */}
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`workday-profile-tab flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0875E1] border-[#0875E1]'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'summary' && (
          <SummaryTab worker={worker} yearsOfService={yearsOfService} monthsOfService={monthsOfService} />
        )}
        {activeTab === 'job' && (
          <JobTab worker={worker} workerHistory={workerHistory} yearsOfService={yearsOfService} monthsOfService={monthsOfService} />
        )}
        {activeTab === 'compensation' && (
          <CompensationTab worker={worker} />
        )}
        {activeTab === 'contact' && (
          <ContactTab worker={worker} />
        )}
        {activeTab === 'personal' && (
          <PersonalTab worker={worker} />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab worker={worker} />
        )}
        {activeTab === 'career' && (
          <CareerTab worker={worker} />
        )}
      </div>
    </div>
  )
}

// Summary Tab Component
function SummaryTab({ worker, yearsOfService, monthsOfService }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Job Details Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="workday-card bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <FieldDisplay label="Employee ID" value={worker.workerId} />
            <FieldDisplay label="Position" value={worker.positions?.[0]?.title || 'N/A'} />
            <FieldDisplay label="Business Title" value={worker.businessTitle} />
            <FieldDisplay label="Job Profile" value={worker.jobProfile?.title} />
            <FieldDisplay label="Job Family" value={worker.jobProfile?.jobFamily?.name} />
            <FieldDisplay label="Employee Type" value={worker.workerType} />
            <FieldDisplay label="Time Type" value="Full Time" />
            <FieldDisplay label="FTE" value="1.0" />
            <FieldDisplay label="Location" value={worker.location?.name} />
            <FieldDisplay label="Hire Date" value={format(new Date(worker.hireDate), 'MMM d, yyyy')} />
            <FieldDisplay label="Length of Service" value={`${yearsOfService} years, ${monthsOfService} months`} />
            <FieldDisplay label="Supervisory Organization" value={worker.supervisoryOrg?.name} />
          </div>
        </div>

        {/* Manager Info */}
        {worker.manager && (
          <div className="workday-card bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager</h2>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#0875E1] flex items-center justify-center text-white font-medium">
                {worker.manager.firstName[0]}{worker.manager.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {worker.manager.firstName} {worker.manager.lastName}
                </p>
                <p className="text-sm text-gray-500">{worker.manager.businessTitle}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Work Contact Information */}
        <div className="workday-card bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Contact</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-[#0875E1]">{worker.email}</span>
            </div>
            {worker.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{worker.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{worker.location?.name || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Direct Reports */}
        {worker.directReports && worker.directReports.length > 0 && (
          <div className="workday-card bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Direct Reports ({worker.directReports.length})
            </h2>
            <div className="space-y-3">
              {worker.directReports.slice(0, 5).map((report: any) => (
                <div key={report.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                    {report.firstName[0]}{report.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {report.firstName} {report.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{report.businessTitle}</p>
                  </div>
                </div>
              ))}
              {worker.directReports.length > 5 && (
                <button className="text-sm text-[#0875E1] hover:underline">
                  View all {worker.directReports.length} reports
                </button>
              )}
            </div>
          </div>
        )}

        {/* Company */}
        <div className="workday-card bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company</h2>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-700">{worker.company?.name || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Job Tab Component
function JobTab({ worker, workerHistory, yearsOfService, monthsOfService }: any) {
  return (
    <div className="space-y-6">
      {/* Job Details */}
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <FieldDisplay label="Employee ID" value={worker.workerId} />
          <FieldDisplay label="Supervisory Organization" value={worker.supervisoryOrg?.name} />
          <FieldDisplay label="Position" value={worker.positions?.[0]?.title || 'N/A'} />
          <FieldDisplay label="Business Title" value={worker.businessTitle} />
          <FieldDisplay label="Job Profile" value={worker.jobProfile?.title} />
          <FieldDisplay label="Job Family" value={worker.jobProfile?.jobFamily?.name} />
          <FieldDisplay label="Employee Type" value={worker.workerType} />
          <FieldDisplay label="Time Type" value="Full Time" />
          <FieldDisplay label="FTE" value="1.0" />
          <FieldDisplay label="Location" value={worker.location?.name} />
          <FieldDisplay label="Hire Date" value={format(new Date(worker.hireDate), 'MMM d, yyyy')} />
          <FieldDisplay label="Original Hire Date" value={format(new Date(worker.hireDate), 'MMM d, yyyy')} />
          <FieldDisplay label="Continuous Service Date" value={format(new Date(worker.hireDate), 'MMM d, yyyy')} />
          <FieldDisplay label="Length of Service" value={`${yearsOfService} years, ${monthsOfService} months`} />
          <FieldDisplay label="Time in Position" value={`${yearsOfService} years, ${monthsOfService} months`} />
        </div>
      </div>

      {/* Worker History */}
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Worker History</h2>
        {workerHistory.length > 0 ? (
          <div className="space-y-4">
            {workerHistory.map((event: any) => (
              <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#0875E1]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.definition.name}</p>
                  <p className="text-sm text-gray-500">{event.subjectDisplay}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(event.initiatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge variant={event.status === 'COMPLETED' ? 'default' : 'secondary'}>
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No worker history available</p>
        )}
      </div>
    </div>
  )
}

// Compensation Tab Component
function CompensationTab({ worker }: any) {
  const salary = worker.annualSalary ? Number(worker.annualSalary) : null
  const hourlyRate = worker.hourlyRate ? Number(worker.hourlyRate) : null
  
  return (
    <div className="space-y-6">
      {/* Compensation Summary */}
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compensation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <FieldDisplay 
            label="Total Base Pay" 
            value={salary ? `$${salary.toLocaleString()}` : (hourlyRate ? `$${hourlyRate}/hr` : 'N/A')} 
          />
          <FieldDisplay label="Currency" value={worker.currency || 'USD'} />
          <FieldDisplay label="Frequency" value={worker.payFrequency || 'Annual'} />
          <FieldDisplay label="Compensation Grade" value={worker.jobProfile?.compensationGrade || 'N/A'} />
          <FieldDisplay label="Company" value={worker.company?.name} />
        </div>
      </div>

      {/* Plan Assignments */}
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Assignments</h2>
        <table className="workday-table w-full">
          <thead>
            <tr>
              <th>Plan Type</th>
              <th>Plan</th>
              <th>Effective Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salary</td>
              <td>Annual Salary Plan</td>
              <td>{format(new Date(worker.hireDate), 'MMM d, yyyy')}</td>
              <td>{salary ? `$${salary.toLocaleString()}` : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pay Change History */}
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Change History</h2>
        <table className="workday-table w-full">
          <thead>
            <tr>
              <th>Effective Date</th>
              <th>Compensation Action</th>
              <th>Reason</th>
              <th>Total Base Pay</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{format(new Date(worker.hireDate), 'MMM d, yyyy')}</td>
              <td>Hire</td>
              <td>New Hire</td>
              <td>{salary ? `$${salary.toLocaleString()}` : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Contact Tab Component
function ContactTab({ worker }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Work Contact Information */}
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Contact Information</h2>
        <div className="space-y-4">
          <div>
            <p className="workday-field-label">Work Email</p>
            <p className="text-[#0875E1]">{worker.email}</p>
          </div>
          {worker.phone && (
            <div>
              <p className="workday-field-label">Work Phone</p>
              <p className="workday-field-value">{worker.phone}</p>
            </div>
          )}
          <div>
            <p className="workday-field-label">Work Address</p>
            <p className="workday-field-value">{worker.location?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Home Contact Information */}
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Home Contact Information</h2>
        <div className="space-y-4">
          <div>
            <p className="workday-field-label">Home Address</p>
            <p className="workday-field-value text-gray-500">Not provided</p>
          </div>
          <div>
            <p className="workday-field-label">Personal Email</p>
            <p className="workday-field-value text-gray-500">Not provided</p>
          </div>
          <div>
            <p className="workday-field-label">Personal Phone</p>
            <p className="workday-field-value text-gray-500">Not provided</p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="workday-card bg-white rounded-lg border p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
        <p className="text-gray-500 text-center py-8">No emergency contacts on file</p>
      </div>
    </div>
  )
}

// Personal Tab Component
function PersonalTab({ worker }: any) {
  return (
    <div className="space-y-6">
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <FieldDisplay label="Legal First Name" value={worker.firstName} />
          <FieldDisplay label="Legal Middle Name" value={worker.middleName || 'N/A'} />
          <FieldDisplay label="Legal Last Name" value={worker.lastName} />
          <FieldDisplay label="Preferred Name" value={worker.preferredName || 'N/A'} />
          <FieldDisplay label="Date of Birth" value="Not provided" />
          <FieldDisplay label="Gender" value="Not provided" />
        </div>
      </div>

      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">IDs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <FieldDisplay label="Employee ID" value={worker.workerId} />
          <FieldDisplay label="National ID" value="***-**-****" />
        </div>
      </div>
    </div>
  )
}

// Performance Tab Component
function PerformanceTab({ worker }: any) {
  return (
    <div className="space-y-6">
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Reviews</h2>
        <p className="text-gray-500 text-center py-8">No performance reviews on file</p>
      </div>

      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals</h2>
        <p className="text-gray-500 text-center py-8">No goals defined</p>
      </div>
    </div>
  )
}

// Career Tab Component
function CareerTab({ worker }: any) {
  return (
    <div className="space-y-6">
      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
        <p className="text-gray-500 text-center py-8">No skills added</p>
      </div>

      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
        <p className="text-gray-500 text-center py-8">No certifications on file</p>
      </div>

      <div className="workday-card bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
        <p className="text-gray-500 text-center py-8">No education history on file</p>
      </div>
    </div>
  )
}

// Reusable Field Display Component
function FieldDisplay({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="workday-field-label">{label}</p>
      <p className="workday-field-value">{value || 'N/A'}</p>
    </div>
  )
}
