'use client'

import { useEffect, useCallback, useState } from 'react'
import { Building2, Users, TrendingUp, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSkeleton } from '../shared/loading-skeleton'
import { ErrorState } from '../shared/error-state'
import { ExportCSVButton } from '../shared/export-csv-button'
import {
  calculateProductivityScore,
  countEmployees,
} from '@/lib/dashboard/calculations'
import {
  fetchAllEmployees,
  fetchTeamTasks,
  fetchTasksCompletedToday,
} from '@/lib/dashboard/queries'
import type { AsyncState, CompanyStats } from '@/types/dashboard'

export function CompanyOverview() {
  const [state, setState] = useState<AsyncState<CompanyStats>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const [employees, todayTasks] = await Promise.all([
        fetchAllEmployees(),
        fetchTasksCompletedToday(),
      ])

      const userIds = employees.map((e) => e.id)
      const allTasks = userIds.length > 0 ? await fetchTeamTasks(userIds, 7) : []

      // Calculate avg productivity score across all employees
      const scores = employees.map((profile) => {
        const userTasks = allTasks.filter((t) => t.user_id === profile.id)
        return calculateProductivityScore(userTasks, 7).score
      })

      const avgScore =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : 0

      setState({
        data: {
          totalEmployees: countEmployees(employees),
          avgProductivityScore: avgScore,
          tasksCompletedToday: todayTasks.length,
        },
        loading: false,
        error: null,
      })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat data overview perusahaan.',
      })
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (state.loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <LoadingSkeleton variant="stat" />
        <LoadingSkeleton variant="stat" />
        <LoadingSkeleton variant="stat" />
      </div>
    )
  }
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const stats = state.data!

  const metrics = [
    {
      label: 'Total Karyawan',
      value: stats.totalEmployees,
      icon: Users,
      suffix: 'orang',
    },
    {
      label: 'Avg Productivity Score',
      value: stats.avgProductivityScore,
      icon: TrendingUp,
      suffix: '/ 100',
    },
    {
      label: 'Tasks Selesai Hari Ini',
      value: stats.tasksCompletedToday,
      icon: CheckSquare,
      suffix: 'tasks',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Building2 className="size-4" aria-hidden="true" />
          Overview Perusahaan
        </div>
        <ExportCSVButton scope="company" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <metric.icon className="size-3.5" aria-hidden="true" />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-3xl font-bold tabular-nums"
                aria-label={`${metric.label}: ${metric.value} ${metric.suffix}`}
              >
                {metric.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{metric.suffix}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
