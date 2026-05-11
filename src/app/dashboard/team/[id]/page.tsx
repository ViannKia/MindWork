'use client'

import { use, useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSkeleton } from '@/components/dashboard/shared/loading-skeleton'
import { ErrorState } from '@/components/dashboard/shared/error-state'
import { RecentTasksTable } from '@/components/dashboard/shared/recent-tasks-table'
import { ProductivityScoreCard } from '@/components/dashboard/shared/productivity-score-card'
import {
  getInitials,
  aggregateMoodByDay,
} from '@/lib/dashboard/calculations'
import {
  fetchProfileById,
  fetchUserWellbeingLogs,
} from '@/lib/dashboard/queries'
import { getAvatarUrl } from '@/lib/upload-avatar'
import type { AsyncState, Profile, MoodTrendPoint } from '@/types/dashboard'

// Lazy-load recharts
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

interface PageProps {
  params: Promise<{ id: string }>
}

interface MemberData {
  profile: Profile
  moodTrend: MoodTrendPoint[]
  stressTrend: { date: string; avgStress: number | null }[]
}

export default function TeamMemberPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [state, setState] = useState<AsyncState<MemberData>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const [profile, logs] = await Promise.all([
        fetchProfileById(id),
        fetchUserWellbeingLogs(id, 7),
      ])

      const moodTrend = aggregateMoodByDay(logs, 7)

      // Build stress trend (same structure as mood trend)
      const stressTrend = moodTrend.map((point, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const key = d.toISOString().slice(0, 10)
        const dayLogs = logs.filter((l) => l.created_at.slice(0, 10) === key)
        const avgStress =
          dayLogs.length > 0
            ? Math.round(
                (dayLogs.reduce((sum, l) => sum + l.stress_level, 0) / dayLogs.length) * 10
              ) / 10
            : null
        return { date: point.date, avgStress }
      })

      setState({ data: { profile, moodTrend, stressTrend }, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat data anggota tim.',
      })
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header with back button */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push('/dashboard')}
            aria-label="Kembali ke dashboard"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="text-sm font-medium">Detail Anggota Tim</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {state.loading && (
          <div className="space-y-4">
            <LoadingSkeleton variant="card" />
            <div className="grid gap-4 sm:grid-cols-2">
              <LoadingSkeleton variant="chart" />
              <LoadingSkeleton variant="chart" />
            </div>
            <LoadingSkeleton variant="table" rows={5} />
          </div>
        )}

        {state.error && (
          <ErrorState message={state.error} onRetry={fetchData} className="max-w-sm mx-auto" />
        )}

        {state.data && (
          <div className="space-y-6">
            {/* Profile card */}
            <ProfileCard profile={state.data.profile} />

            {/* Productivity score */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ProductivityScoreCard userId={id} />

              {/* Mood trend */}
              <TrendChart
                title="Tren Mood (7 Hari)"
                data={state.data.moodTrend.map((d) => ({
                  date: d.date,
                  value: d.avgMood === 0 ? null : d.avgMood,
                }))}
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                label="Avg Mood"
              />
            </div>

            {/* Stress trend */}
            <TrendChart
              title="Tren Stres (7 Hari)"
              data={state.data.stressTrend.map((d) => ({
                date: d.date,
                value: d.avgStress,
              }))}
              domain={[1, 10]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              label="Avg Stres"
            />

            {/* Recent tasks */}
            <RecentTasksTable userId={id} />
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: Profile }) {
  const initials = getInitials(profile.full_name)
  const roleLabel =
    profile.role === 'manager' ? 'Manager' : profile.role === 'admin' ? 'Admin' : 'Employee'
  const avatarUrl = getAvatarUrl(profile.avatar_url)

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <Avatar className="size-14 border border-border">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={`Foto profil ${profile.full_name}`} />
          ) : null}
          <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{profile.full_name}</h2>
            <Badge variant="secondary" className="text-xs">
              {roleLabel}
            </Badge>
          </div>
          {profile.department && (
            <p className="mt-0.5 text-sm text-muted-foreground">{profile.department}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface TrendChartProps {
  title: string
  data: { date: string; value: number | null }[]
  domain: [number, number]
  ticks: number[]
  label: string
}

function TrendChart({ title, data, domain, ticks, label }: TrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="size-4" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-40 w-full"
          role="img"
          aria-label={`Grafik ${title}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
                domain={domain}
                ticks={ticks}
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
                  return [numValue ?? '—', label]
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--foreground))', r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
