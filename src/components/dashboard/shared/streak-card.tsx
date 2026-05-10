'use client'

import { useEffect, useCallback, useState } from 'react'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSkeleton } from './loading-skeleton'
import { ErrorState } from './error-state'
import { calculateStreak } from '@/lib/dashboard/calculations'
import { fetchUserWellbeingLogs } from '@/lib/dashboard/queries'
import type { AsyncState } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface StreakCardProps {
  userId: string
}

export function StreakCard({ userId }: StreakCardProps) {
  const [state, setState] = useState<AsyncState<number>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      // Fetch up to 60 days to calculate long streaks
      const logs = await fetchUserWellbeingLogs(userId, 60)
      const streak = calculateStreak(logs)
      setState({ data: streak, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat data streak.',
      })
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (state.loading) return <LoadingSkeleton variant="card" />
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const streak = state.data ?? 0
  const isActive = streak > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Flame className="size-4" aria-hidden="true" />
          Streak Check-in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-4xl transition-all',
              isActive ? 'opacity-100' : 'opacity-30 grayscale'
            )}
            aria-hidden="true"
          >
            🔥
          </span>
          <div>
            <p
              className="text-4xl font-bold tabular-nums"
              aria-label={`Streak: ${streak} hari`}
            >
              {streak}
            </p>
            <p className="text-xs text-muted-foreground">
              {streak === 1 ? 'hari' : 'hari berturut-turut'}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {isActive
            ? `Pertahankan streak-mu! Isi check-in hari ini agar tidak terputus.`
            : 'Belum ada streak. Mulai isi wellbeing check-in hari ini!'}
        </p>

        {/* Visual streak dots — last 7 days */}
        <StreakDots userId={userId} streak={streak} />
      </CardContent>
    </Card>
  )
}

// Mini component: shows last 7 days as filled/empty dots
function StreakDots({ streak }: { userId: string; streak: number }) {
  return (
    <div className="flex gap-1.5" aria-label="Aktivitas 7 hari terakhir">
      {Array.from({ length: 7 }).map((_, i) => {
        const dayIndex = 6 - i // 0 = today, 6 = 7 days ago
        const filled = dayIndex < streak
        return (
          <div
            key={i}
            className={cn(
              'size-3 rounded-full transition-colors',
              filled ? 'bg-foreground' : 'bg-muted'
            )}
            aria-label={filled ? 'Hari aktif' : 'Hari tidak aktif'}
          />
        )
      })}
    </div>
  )
}
