import Link from 'next/link'

export const instant = false
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus,
  MoreHorizontal,
  Mail,
  Building2,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import prisma from '@/lib/db'

async function getWorkers() {
  return prisma.worker.findMany({
    include: {
      jobProfile: true,
      supervisoryOrg: true,
      manager: true,
      location: true,
      position: true,
    },
    orderBy: { lastName: 'asc' },
  })
}

function formatCurrency(amount: number | null) {
  if (!amount) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function WorkersPage() {
  const workers = await getWorkers()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Workers
          </h1>
          <p className="text-muted-foreground">
            {workers.length} workers in the organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Hire Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search workers..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Worker</TableHead>
                <TableHead>Job Profile</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Salary</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={worker.photoUrl || ''} />
                        <AvatarFallback className="text-xs">
                          {worker.firstName[0]}{worker.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          href={`/workers/${worker.id}`}
                          className="font-medium hover:underline"
                        >
                          {worker.firstName} {worker.lastName}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{worker.workerId}</span>
                          <Badge 
                            variant={worker.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-[10px] px-1 py-0"
                          >
                            {worker.employmentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {worker.businessTitle || worker.jobProfile?.title || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {worker.jobProfile?.code || '—'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {worker.supervisoryOrg?.name || '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {worker.manager ? (
                      <Link 
                        href={`/workers/${worker.manager.id}`}
                        className="text-sm hover:underline"
                      >
                        {worker.manager.firstName} {worker.manager.lastName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {worker.location?.name || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(worker.annualSalary)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Briefcase className="h-4 w-4 mr-2" />
                          Change Job
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Terminate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
