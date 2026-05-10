'use client'

import { useState, useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  calculateProductivityScore,
  aggregateMoodByDay,
  aggregateByDepartment,
  countEmployees,
  generateTeamCSV,
  generateCompanyCSV,
  downloadCSV,
  getTodayString,
} from '@/lib/dashboard/calculations'
import {
  fetchTeamMembers,
  fetchTeamTasks,
  fetchTeamWellbeingLogs,
  fetchAllEmployees,
  fetchTasksCompletedToday,
} from '@/lib/dashboard/queries'
import type { CSVScope, TeamMember, CompanyStats } from '@/types/dashboard'

interface ExportCSVButtonProps {
  scope: CSVScope
  managerId?: string
}

export function ExportCSVButton({ scope, managerId }: ExportCSVButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (scope === 'team' && managerId) {
        await exportTeamCSV(managerId)
      } else if (scope === 'company') {
        await exportCompanyCSV()
      }
    } catch {
      setError('Gagal mengekspor data. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [scope, managerId])

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={loading}
        className="gap-2"
        aria-label={scope === 'team' ? 'Export data tim ke CSV' : 'Export data perusahaan ke CSV'}
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="size-3.5" aria-hidden="true" />
        )}
        {loading
          ? 'Mengekspor...'
          : scope === 'team'
          ? 'Export CSV (Tim)'
          : 'Export CSV (Perusahaan)'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── Export Helpers ───────────────────────────────────────────────────────────

async function exportTeamCSV(managerId: string): Promise<void> {
  const members = await fetchTeamMembers(managerId)
  if (members.length === 0) return

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

  const csv = generateTeamCSV(teamMembers)
  downloadCSV(csv, `mindwork_team_export_${getTodayString()}.csv`)
}

async function exportCompanyCSV(): Promise<void> {
  const [allEmployees, todayTasks] = await Promise.all([
    fetchAllEmployees(),
    fetchTasksCompletedToday(),
  ])

  const userIds = allEmployees.map((e) => e.id)
  const [allTasks, allLogs] = await Promise.all([
    fetchTeamTasks(userIds, 7),
    fetchTeamWellbeingLogs(userIds, 7),
  ])

  // Build team members array
  const teamMembers: TeamMember[] = allEmployees.map((profile) => {
    const userTasks = allTasks.filter((t) => t.user_id === profile.id)
    const userLogs = allLogs.filter((l) => l.user_id === profile.id)
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

  const avgScore =
    teamMembers.length > 0
      ? Math.round(
          (teamMembers.reduce((sum, m) => sum + m.avgScore, 0) / teamMembers.length) * 10
        ) / 10
      : 0

  const stats: CompanyStats = {
    totalEmployees: countEmployees(allEmployees),
    avgProductivityScore: avgScore,
    tasksCompletedToday: todayTasks.length,
  }

  const departments = aggregateByDepartment(allEmployees, allLogs)
  const csv = generateCompanyCSV(stats, departments, teamMembers)
  downloadCSV(csv, `mindwork_export_${getTodayString()}.csv`)
}
