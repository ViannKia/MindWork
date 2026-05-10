'use client'

import { useEffect, useCallback, useState } from 'react'
import { Users, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSkeleton } from '../shared/loading-skeleton'
import { ErrorState } from '../shared/error-state'
import { ExportCSVButton } from '../shared/export-csv-button'
import {
  calculateProductivityScore,
  getScoreColor,
} from '@/lib/dashboard/calculations'
import {
  fetchTeamMembers,
  fetchAllEmployees,
  fetchTeamTasks,
  fetchTeamWellbeingLogs,
} from '@/lib/dashboard/queries'
import type { AsyncState, TeamMember } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface TeamProductivityTableProps {
  managerId: string
  isAdmin?: boolean
  onViewDetail?: (memberId: string) => void
}

const scoreColorClass = {
  red: 'text-destructive',
  yellow: 'text-yellow-600',
  green: 'text-green-700',
} as const

export function TeamProductivityTable({
  managerId,
  isAdmin = false,
  onViewDetail,
}: TeamProductivityTableProps) {
  const [state, setState] = useState<AsyncState<TeamMember[]>>({
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

      setState({ data: teamMembers, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat data produktivitas tim.',
      })
    }
  }, [managerId, isAdmin])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (state.loading) return <LoadingSkeleton variant="table" rows={4} />
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const members = state.data ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="size-4" aria-hidden="true" />
            {isAdmin ? 'Produktivitas Semua Karyawan (7 Hari)' : 'Produktivitas Tim (7 Hari)'}
          </CardTitle>
          <ExportCSVButton scope={isAdmin ? 'company' : 'team'} managerId={managerId} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Users className="size-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'Tidak ada karyawan' : 'Tidak ada anggota tim'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Nama</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-center">Tasks Selesai</TableHead>
                  <TableHead className="text-center">Avg Mood</TableHead>
                  <TableHead className="text-center">Jam Kerja</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const color = getScoreColor(member.avgScore)
                  return (
                    <TableRow key={member.profile.id}>
                      <TableCell className="text-center">
                        <div className="inline-block text-left">
                          <p className="font-medium text-center">{member.profile.full_name}</p>
                          {member.profile.department && (
                            <p className="text-xs text-muted-foreground text-center">
                              {member.profile.department}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn('font-semibold tabular-nums', scoreColorClass[color])}
                        >
                          {member.avgScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {member.tasksCompleted}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {member.avgMood > 0 ? member.avgMood : '—'}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {member.totalHoursWorked}j
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onViewDetail?.(member.profile.id)}
                          aria-label={`Lihat detail ${member.profile.full_name}`}
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
