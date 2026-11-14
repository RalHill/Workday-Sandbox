'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  DollarSign,
  ArrowRightLeft,
  TrendingUp,
  FileText,
  Shield,
  Calendar,
  Clock,
  Edit,
  Eye,
  Building2,
  Briefcase,
  ChevronRight
} from 'lucide-react'

/**
 * Workday Related Actions Menu
 * 
 * The Related Actions icon is a navigation tool in Workday.
 * From the related actions menu, you can perform an action related to that object.
 * Menu items vary depending on permissions.
 */

interface RelatedActionsMenuProps {
  workerId: string
  workerName: string
}

const ACTION_GROUPS = [
  {
    label: 'Frequently Used',
    actions: [
      { id: 'view-profile', label: 'View Profile', icon: Eye, href: (id: string) => `/workers/${id}` },
      { id: 'edit-position', label: 'Edit Position', icon: Edit, href: (id: string) => `/workers/${id}/edit-position` },
    ],
  },
  {
    label: 'Job Change',
    actions: [
      { id: 'transfer', label: 'Transfer Employee', icon: ArrowRightLeft, href: (id: string) => `/staffing/transfer?worker=${id}` },
      { id: 'promote', label: 'Promote Employee', icon: TrendingUp, href: (id: string) => `/staffing/promote?worker=${id}` },
      { id: 'demote', label: 'Demote Employee', icon: TrendingUp, href: (id: string) => `/staffing/demote?worker=${id}` },
      { id: 'terminate', label: 'Terminate Employee', icon: UserMinus, href: (id: string) => `/staffing/terminate?worker=${id}` },
    ],
  },
  {
    label: 'Compensation',
    actions: [
      { id: 'change-comp', label: 'Request Compensation Change', icon: DollarSign, href: (id: string) => `/compensation/change?worker=${id}` },
      { id: 'one-time-payment', label: 'Request One-Time Payment', icon: DollarSign, href: (id: string) => `/compensation/one-time?worker=${id}` },
    ],
  },
  {
    label: 'Time and Leave',
    actions: [
      { id: 'time-off', label: 'Request Time Off', icon: Calendar, href: (id: string) => `/time-off/request?worker=${id}` },
      { id: 'view-time-off', label: 'View Time Off Balances', icon: Clock, href: (id: string) => `/time-off/balances?worker=${id}` },
    ],
  },
  {
    label: 'Organization',
    actions: [
      { id: 'view-org', label: 'View Supervisory Organization', icon: Building2, href: (id: string) => `/organizations` },
      { id: 'view-org-chart', label: 'View Org Chart', icon: Building2, href: (id: string) => `/reports/org-chart` },
    ],
  },
  {
    label: 'Reports',
    actions: [
      { id: 'worker-history', label: 'View Worker History', icon: FileText, href: (id: string) => `/workers/${id}?tab=job` },
      { id: 'compensation-history', label: 'View Compensation History', icon: FileText, href: (id: string) => `/workers/${id}?tab=compensation` },
    ],
  },
  {
    label: 'Security',
    actions: [
      { id: 'security-profile', label: 'View Security Profile', icon: Shield, href: (id: string) => `/security/profile?worker=${id}` },
      { id: 'assign-roles', label: 'Assign Roles', icon: Shield, href: (id: string) => `/security/assign-roles?worker=${id}` },
    ],
  },
]

export function RelatedActionsMenu({ workerId, workerName }: RelatedActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)

  return (
    <div className="relative">
      {/* Actions Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="workday-related-actions flex items-center gap-2 px-4 py-2 rounded-full border border-[#0875E1] text-[#0875E1] hover:bg-blue-50 transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="font-medium">Actions</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-3 border-b">
              <p className="text-sm font-medium text-gray-900">{workerName}</p>
              <p className="text-xs text-gray-500">Related Actions</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {ACTION_GROUPS.map((group) => (
                <div 
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => setHoveredGroup(group.label)}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <span>{group.label}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {/* Submenu */}
                  {hoveredGroup === group.label && (
                    <div className="absolute left-full top-0 w-64 bg-white rounded-lg shadow-xl border ml-1 z-50">
                      {group.actions.map((action) => (
                        <Link
                          key={action.id}
                          href={action.href(workerId)}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <action.icon className="h-4 w-4 text-gray-400" />
                          <span>{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
