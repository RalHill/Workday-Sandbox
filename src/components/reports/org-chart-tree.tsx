'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronRight,
  ChevronDown,
  User,
  MapPin,
  Briefcase,
  Mail,
  MoreHorizontal
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Workday Org Chart Tree Node
 * 
 * Renders an expandable tree node for the organization chart.
 * Each node shows:
 * - Worker avatar and name
 * - Job title
 * - Location
 * - Number of direct reports
 * - Expandable children
 */

interface Worker {
  id: string
  firstName: string
  lastName: string
  businessTitle: string | null
  photoUrl: string | null
  jobProfile?: {
    title: string
  } | null
  location?: {
    name: string
  } | null
  directReports?: Worker[]
}

interface OrgChartTreeProps {
  manager: Worker
  level: number
}

export function OrgChartTree({ manager, level }: OrgChartTreeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasDirectReports = manager.directReports && manager.directReports.length > 0
  const reportCount = manager.directReports?.length || 0

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      {/* Worker Node */}
      <div className="workday-org-node group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            hasDirectReports ? 'visible' : 'invisible'
          }`}
          disabled={!hasDirectReports}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {/* Avatar */}
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage src={manager.photoUrl || ''} />
          <AvatarFallback className="bg-[#0875E1] text-white font-medium">
            {manager.firstName[0]}{manager.lastName[0]}
          </AvatarFallback>
        </Avatar>

        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <Link 
            href={`/workers/${manager.id}`}
            className="font-medium text-gray-900 hover:text-[#0875E1] hover:underline"
          >
            {manager.firstName} {manager.lastName}
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {manager.businessTitle || manager.jobProfile?.title || 'No Title'}
            </span>
            {manager.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {manager.location.name}
              </span>
            )}
          </div>
        </div>

        {/* Direct Reports Badge */}
        {hasDirectReports && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span>{reportCount} direct report{reportCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/workers/${manager.id}`}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Direct Reports (Children) */}
      {hasDirectReports && isExpanded && (
        <div className="mt-1 space-y-1">
          {manager.directReports!.map(report => (
            <OrgChartTree 
              key={report.id} 
              manager={report} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
