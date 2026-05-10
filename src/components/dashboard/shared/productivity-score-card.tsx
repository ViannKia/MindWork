'use client'

import { useEffect, useCallback, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSkeleton } from './loading-skeleton'
import { ErrorState } from './error-state'
import { calculateProductivityScore } from '@/lib/dashboard/calculations'
import { fetchUserTasks } from '@/lib/dashboard/queries'
import type { AsyncState, ProductivityScore } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface ProductivityScoreCardProps {
  userId: string
}

const scoreColorMap = {
  red: {
    bar: 'bg-destructive',
    text: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  yellow: {
    bar: 'bg-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  green: {
    bar: 'bg-green-600',
    text: 'text-green-700',
    bg: 'bg-green-50',
  },
} as const

export function ProductivityScoreCard({ userId }: ProductivityScoreCardProps) {
  const [state, setState] = useState<AsyncState<ProductivityScore>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const tasks = await fetchUserTasks(userId, 7)
      const score = calculateProductivityScore(tasks, 7)
      setState({ data: score, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat skor produktivitas. Periksa koneksi internet Anda.',
      })
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (state.loading) return <LoadingSkeleton variant="card" />
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const { score, color, tasksCompleted, avgDifficulty, hoursWorked } = state.data!
  const colors = scoreColorMap[color]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="size-4" aria-hidden="true" />
          Produktivitas (7 Hari)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score display */}
        <div className="flex items-end gap-2">
          <span
            className={cn('text-4xl font-bold tabular-nums', colors.text)}
            aria-label={`Skor produktivitas: ${score}`}
          >
            {score}
          </span>
          <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
        </div>

        {/* Progress bar */}
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress skor: ${score}%`}
        >
          <div
            className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={cn('rounded-md p-2', colors.bg)}>
            <p className="text-xs text-muted-foreground">Tasks Selesai</p>
            <p className="text-sm font-semibold">{tasksCompleted}</p>
          </div>
          <div className={cn('rounded-md p-2', colors.bg)}>
            <p className="text-xs text-muted-foreground">Avg Kesulitan</p>
            <p className="text-sm font-semibold">{avgDifficulty}</p>
          </div>
          <div className={cn('rounded-md p-2', colors.bg)}>
            <p className="text-xs text-muted-foreground">Jam Kerja</p>
            <p className="text-sm font-semibold">{hoursWorked}j</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
