'use client'

import { useEffect, useCallback, useState } from 'react'
import { AlertTriangle, Eye, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSkeleton } from '../shared/loading-skeleton'
import { ErrorState } from '../shared/error-state'
import {
  calculateProductivityScore,
  getBurnoutAlerts,
} from '@/lib/dashboard/calculations'
import {
  fetchTeamMembers,
  fetchAllEmployees,
  fetchTeamTasks,
  fetchTeamWellbeingLogs,
} from '@/lib/dashboard/queries'
import type { AsyncState, BurnoutAlert, TeamMember } from '@/types/dashboard'

interface BurnoutAlertListProps {
  managerId: string
  isAdmin?: boolean
  onViewDetail?: (memberId: string) => void
}

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export function BurnoutAlertList({ managerId, isAdmin = false, onViewDetail }: BurnoutAlertListProps) {
  const [state, setState] = useState<AsyncState<BurnoutAlert[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      // Admin: fetch all employees, Manager: fetch team members
      const members = isAdmin
        ? await fetchAllEmployees()
        : await fetchTeamMembers(managerId)

      if (members.length === 0) {
        setState({ data: [], loading: false, error: null })
        return
      }

      const userIds = members.map((m) => m.id)
      const [tasks, logs] = await Promise.all([
        fetchTeamTasks(userIds, 7),
        fetchTeamWellbeingLogs(userIds, 7),
      ])

      const teamMembers: TeamMember[] = members.map((profile) => {
        const userTasks = tasks.filter((t) => t.user_id === profile.id)
        const userLogs = logs.filter((l) => l.user_id === profile.id)
        const score = calculateProductivityScore(userTasks, 7)
        const avgMood =
          userLogs.length > 0
            ? userLogs.reduce((sum, l) => sum + l.mood_score, 0) / userLogs.length
            : 0
        const totalMinutes = userTasks.reduce((sum, t) => sum + (t.total_duration ?? 0), 0)

        return {
          profile,
          avgScore: score.score,
          tasksCompleted: score.tasksCompleted,
          avgMood: Math.round(avgMood * 10) / 10,
          totalHoursWorked: Math.round((totalMinutes / 60) * 10) / 10,
        }
      })

      const alerts = getBurnoutAlerts(teamMembers)
      setState({ data: alerts, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat data burnout alert.',
      })
    }
  }, [managerId, isAdmin])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (state.loading) return <LoadingSkeleton variant="card" />
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const alerts = state.data ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertTriangle className="size-4" aria-hidden="true" />
          Burnout Alert
          {alerts.length > 0 && (
            <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {alerts.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ShieldCheck className="size-8 text-green-600" aria-hidden="true" />
            <p className="text-sm font-medium text-green-700">
              {isAdmin ? 'Semua karyawan dalam kondisi baik' : 'Tim dalam kondisi baik'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAdmin
                ? 'Tidak ada karyawan yang berisiko burnout saat ini.'
                : 'Tidak ada anggota tim yang berisiko burnout saat ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Daftar anggota berisiko burnout">
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="size-4" aria-hidden="true" />
              <AlertDescription className="text-xs">
                {alerts.length} {isAdmin ? 'karyawan' : 'anggota tim'} memerlukan perhatian segera (mood rendah + jam kerja tinggi).
              </AlertDescription>
            </Alert>

            {alerts.map((alert) => {
              const moodRounded = Math.round(alert.currentMood)
              const emoji = MOOD_EMOJI[moodRounded] ?? '😐'

              return (
                <div
                  key={alert.profile.id}
                  role="listitem"
                  className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{alert.profile.full_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span aria-label={`Mood rata-rata: ${alert.currentMood}`}>
                        {emoji} Mood: {alert.currentMood}
                      </span>
                      <span aria-label={`Total jam kerja: ${alert.totalHoursWorked} jam`}>
                        ⏱ {alert.totalHoursWorked}j / 7 hari
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetail?.(alert.profile.id)}
                    className="gap-1.5 shrink-0"
                    aria-label={`Lihat detail ${alert.profile.full_name}`}
                  >
                    <Eye className="size-3.5" aria-hidden="true" />
                    Detail
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
