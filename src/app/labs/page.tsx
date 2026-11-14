import Link from 'next/link'

export const instant = false
import { 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  Play, 
  BarChart3,
  Workflow,
  Shield,
  FileText,
  Users,
  Award
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import prisma from '@/lib/db'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Staffing': Users,
  'Business Process': Workflow,
  'Security': Shield,
  'Reports': FileText,
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'BEGINNER': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'INTERMEDIATE': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'ADVANCED': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

async function getLabs() {
  const labs = await prisma.practiceLab.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      completions: true,
    },
  })

  return labs.map(lab => ({
    ...lab,
    isCompleted: lab.completions.some(c => c.isComplete),
    bestScore: lab.completions.reduce((max, c) => Math.max(max, c.score || 0), 0),
  }))
}

async function getStats() {
  const labs = await prisma.practiceLab.findMany({
    where: { isActive: true },
    include: { completions: true },
  })

  const totalLabs = labs.length
  const completedLabs = labs.filter(l => l.completions.some(c => c.isComplete)).length

  return {
    totalLabs,
    completedLabs,
    progressPercent: totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0,
  }
}

export default async function LabsPage() {
  const [labs, stats] = await Promise.all([getLabs(), getStats()])

  const labsByCategory = labs.reduce((acc, lab) => {
    if (!acc[lab.category]) acc[lab.category] = []
    acc[lab.category].push(lab)
    return acc
  }, {} as Record<string, typeof labs>)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6" />
            Practice Labs
          </h1>
          <p className="text-muted-foreground">
            Hands-on exercises to master Workday configuration
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900">
                <Award className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold">Your Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.completedLabs} of {stats.totalLabs} labs completed
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
              {stats.progressPercent}%
            </div>
          </div>
          <Progress value={stats.progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Labs by Category */}
      {Object.entries(labsByCategory).map(([category, categoryLabs]) => {
        const CategoryIcon = CATEGORY_ICONS[category] || FlaskConical

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{category}</h2>
              <Badge variant="outline" className="ml-2">
                {categoryLabs.length} lab{categoryLabs.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryLabs.map((lab) => (
                <Card key={lab.id} className={lab.isCompleted ? 'border-green-200 dark:border-green-800' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={DIFFICULTY_COLORS[lab.difficulty]}>
                        {lab.difficulty}
                      </Badge>
                      {lab.isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{lab.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {lab.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{lab.estimatedMinutes} min</span>
                      </div>
                      {lab.bestScore > 0 && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          <span>Best: {lab.bestScore}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" variant={lab.isCompleted ? 'outline' : 'default'} asChild>
                      <Link href={`/labs/${lab.code}`}>
                        <Play className="h-4 w-4 mr-2" />
                        {lab.isCompleted ? 'Retry Lab' : 'Start Lab'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
