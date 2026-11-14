import { notFound } from 'next/navigation'
import Link from 'next/link'
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
  ChevronRight,
  MoreHorizontal,
  Edit,
  TrendingUp,
  FileText,
  Shield
} from 'lucide-react'
import prisma from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { WorkerProfileTabs } from '@/components/workers/worker-profile-tabs'
import { RelatedActionsMenu } from '@/components/workers/related-actions-menu'

// Disable instant prerendering
export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

async function getWorker(id: string) {
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      jobProfile: {
        include: {
          jobFamily: true,
        },
      },
      supervisoryOrg: true,
      manager: true,
      company: true,
      location: true,
      costCenter: true,
      directReports: {
        include: {
          jobProfile: true,
        },
      },
      positions: {
        where: { status: 'FILLED' },
        include: {
          jobProfile: true,
        },
      },
    },
  })
  
  return worker
}

async function getWorkerHistory(workerId: string) {
  return prisma.bPTransaction.findMany({
    where: {
      OR: [
        { subjectId: workerId },
        { initiatorId: workerId },
      ],
    },
    orderBy: { initiatedAt: 'desc' },
    take: 10,
    include: {
      definition: true,
    },
  })
}

export default async function WorkerProfilePage({ params }: PageProps) {
  const { id } = await params
  const worker = await getWorker(id)
  
  if (!worker) {
    notFound()
  }

  const workerHistory = await getWorkerHistory(id)
  
  // Calculate tenure
  const hireDate = new Date(worker.hireDate)
  const now = new Date()
  const yearsOfService = Math.floor((now.getTime() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  const monthsOfService = Math.floor(((now.getTime() - hireDate.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))

  return (
    <div className="min-h-full bg-[#F7F7F7]">
      {/* Worker Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={worker.photoUrl || ''} />
              <AvatarFallback className="bg-[#0875E1] text-white text-2xl font-medium">
                {worker.firstName[0]}{worker.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            {/* Worker Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {worker.preferredName || worker.firstName} {worker.lastName}
                </h1>
                <Badge 
                  variant={worker.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}
                  className={worker.employmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : ''}
                >
                  {worker.employmentStatus}
                </Badge>
              </div>
              
              <p className="text-lg text-gray-600 mt-1">
                {worker.businessTitle || worker.jobProfile?.title}
              </p>
              
              <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {worker.supervisoryOrg?.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {worker.location?.name || 'No location'}
                </span>
                {worker.manager && (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Reports to: {worker.manager.firstName} {worker.manager.lastName}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Button */}
            <RelatedActionsMenu workerId={worker.id} workerName={`${worker.firstName} ${worker.lastName}`} />
          </div>
        </div>
      </div>

      {/* Blue Ribbon Menu - Profile Tabs */}
      <WorkerProfileTabs 
        worker={worker} 
        workerHistory={workerHistory}
        yearsOfService={yearsOfService}
        monthsOfService={monthsOfService}
      />
    </div>
  )
}
