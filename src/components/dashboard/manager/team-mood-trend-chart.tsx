'use client'

import { useEffect, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSkeleton } from '../shared/loading-skeleton'
import { ErrorState } from '../shared/error-state'
import { aggregateMoodByDay } from '@/lib/dashboard/calculations'
import { fetchTeamMembers, fetchAllEmployees, fetchTeamWellbeingLogs } from '@/lib/dashboard/queries'
import type { AsyncState, MoodTrendPoint } from '@/types/dashboard'

// Lazy-load recharts — it uses browser APIs not available in SSR
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
)
const LineChart = dynamic(
  () => import('recharts').then((m) => m.LineChart),
  { ssr: false }
)
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false })

interface TeamMoodTrendChartProps {
  managerId: string
  isAdmin?: boolean
}

export function TeamMoodTrendChart({ managerId, isAdmin = false }: TeamMoodTrendChartProps) {
  const [state, setState] = useState<AsyncState<MoodTrendPoint[]>>({
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
      const logs = await fetchTeamWellbeingLogs(userIds, 7)
      const trend = aggregateMoodByDay(logs, 7)
      setState({ data: trend, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat data tren mood tim.',
      })
    }
  }, [managerId, isAdmin])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (state.loading) return <LoadingSkeleton variant="chart" />
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const data = state.data ?? []
  // Filter out days with no data (avgMood === 0) for cleaner chart
  const chartData = data.map((d) => ({
    ...d,
    avgMood: d.avgMood === 0 ? null : d.avgMood,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="size-4" aria-hidden="true" />
          {isAdmin ? 'Tren Mood Semua Karyawan (7 Hari)' : 'Tren Mood Tim (7 Hari)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'Belum ada data mood karyawan' : 'Belum ada data mood tim'}
            </p>
          </div>
        ) : (
          <div
            className="h-48 w-full"
            role="img"
            aria-label={`Grafik tren rata-rata mood ${isAdmin ? 'semua karyawan' : 'tim'} selama 7 hari terakhir`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => {
                    const numValue = typeof value === 'number' ? value : null
                    return [numValue ? numValue.toFixed(1) : '—', 'Avg Mood']
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgMood"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--foreground))', r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
