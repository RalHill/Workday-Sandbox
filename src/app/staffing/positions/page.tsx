import Link from 'next/link'
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Building2,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

async function getPositions() {
  return prisma.position.findMany({
    include: {
      jobProfile: true,
      supervisoryOrg: true,
      worker: true,
      location: true,
    },
    orderBy: { title: 'asc' },
  })
}

type PositionWithRelations = Awaited<ReturnType<typeof getPositions>>[number]

function getStatusBadge(status: string, worker: PositionWithRelations['worker']) {
  if (worker) {
    return <Badge variant="default" className="bg-green-600">Filled</Badge>
  }
  
  switch (status) {
    case 'OPEN':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Open</Badge>
    case 'FROZEN':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Frozen</Badge>
    case 'CLOSED':
      return <Badge variant="outline">Closed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function PositionsPage() {
  const positions = await getPositions()

  const openPositions = positions.filter(p => p.status === 'OPEN' && !p.worker)
  const filledPositions = positions.filter(p => p.worker)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Positions
          </h1>
          <p className="text-muted-foreground">
            {positions.length} positions • {openPositions.length} open • {filledPositions.length} filled
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Link href="/staffing/create-position">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Position
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{positions.length}</p>
                <p className="text-sm text-gray-500">Total Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filledPositions.length}</p>
                <p className="text-sm text-gray-500">Filled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openPositions.length}</p>
                <p className="text-sm text-gray-500">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {positions.filter(p => p.status === 'FROZEN').length}
                </p>
                <p className="text-sm text-gray-500">Frozen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search positions..." 
                className="pl-9"
              />
            </div>
            <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">All Organizations</option>
              <option value="eng">Engineering</option>
              <option value="pm">Product Management</option>
              <option value="hr">Human Resources</option>
            </select>
            <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="filled">Filled</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Position</TableHead>
                <TableHead>Job Profile</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Incumbent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>
                    <div>
                      <Link 
                        href={`/staffing/positions/${position.id}`}
                        className="font-medium hover:underline"
                      >
                        {position.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {position.positionId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {position.jobProfile?.title || '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {position.supervisoryOrg?.name || '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {position.location?.name || '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {position.worker ? (
                      <Link 
                        href={`/workers/${position.worker.id}`}
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        {position.worker.firstName} {position.worker.lastName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-sm">Vacant</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(position.status, position.worker)}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Position</DropdownMenuItem>
                        {!position.worker && position.status === 'OPEN' && (
                          <DropdownMenuItem>
                            <Link href={`/staffing/hire?position=${position.id}`}>
                              Hire Into Position
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {position.status === 'OPEN' ? (
                          <DropdownMenuItem className="text-amber-600">
                            Freeze Position
                          </DropdownMenuItem>
                        ) : position.status === 'FROZEN' ? (
                          <DropdownMenuItem className="text-blue-600">
                            Unfreeze Position
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-destructive">
                          Close Position
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
