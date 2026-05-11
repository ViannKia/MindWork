import type {
  Task,
  WellbeingLog,
  Profile,
  ProductivityScore,
  TeamMember,
  BurnoutAlert,
  MoodTrendPoint,
  DepartmentStats,
  CompanyStats,
} from '@/types/dashboard'

// ─── Score Helpers ────────────────────────────────────────────────────────────

/**
 * Returns the color classification for a productivity score.
 * red < 40, yellow 40–70, green > 70
 */
export function getScoreColor(score: number): 'red' | 'yellow' | 'green' {
  if (score < 40) return 'red'
  if (score <= 70) return 'yellow'
  return 'green'
}

/**
 * Calculates the productivity score for a user based on their tasks.
 * Formula: ((total_tasks_done * avg_difficulty) / (total_hours_worked + 0.01)) * 10
 * Capped at 100.
 */
export function calculateProductivityScore(
  tasks: Task[],
  periodDays: number = 7
): ProductivityScore {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays)
  cutoff.setHours(0, 0, 0, 0)

  const periodTasks = tasks.filter((t) => new Date(t.created_at) >= cutoff)
  const doneTasks = periodTasks.filter((t) => t.status === 'done')

  const totalTasksDone = doneTasks.length
  const avgDifficulty =
    totalTasksDone > 0
      ? doneTasks.reduce((sum, t) => sum + t.difficulty, 0) / totalTasksDone
      : 0

  // total_duration is in minutes; convert to hours
  const totalMinutes = periodTasks.reduce((sum, t) => sum + (t.total_duration ?? 0), 0)
  const totalHoursWorked = totalMinutes / 60

  const rawScore =
    ((totalTasksDone * avgDifficulty) / (totalHoursWorked + 0.01)) * 10
  const score = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10))

  return {
    score,
    color: getScoreColor(score),
    tasksCompleted: totalTasksDone,
    avgDifficulty: Math.round(avgDifficulty * 10) / 10,
    hoursWorked: Math.round(totalHoursWorked * 10) / 10,
  }
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/**
 * Calculates the current streak (consecutive days with a wellbeing log entry).
 * If today has no entry, streak is 0.
 */
export function calculateStreak(logs: WellbeingLog[]): number {
  if (logs.length === 0) return 0

  // Ambil semua tanggal unik, urutkan descending (terbaru di depan)
  const dates = [...new Set(logs.map((l) => l.created_at.slice(0, 10)))].sort().reverse()

  let streak = 1
  let currentDate = new Date(dates[0])
  currentDate.setHours(0, 0, 0, 0)

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i])
    prevDate.setHours(0, 0, 0, 0)

    const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      streak++
      currentDate = prevDate
    } else {
      break
    }
  }

  return streak
}

// ─── Initials ─────────────────────────────────────────────────────────────────

/**
 * Returns exactly 2 uppercase initials from a full name.
 * "John Doe" → "JD", "Alice" → "AL", "John Michael Doe" → "JM"
 */
export function getInitials(fullName: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) return 'XX'

  const words = trimmed.split(/\s+/)
  if (words.length === 1) {
    const w = words[0].toUpperCase()
    return w.length >= 2 ? w.slice(0, 2) : (w + 'X').slice(0, 2)
  }
  return (words[0][0] + words[1][0]).toUpperCase()
}

// ─── Burnout ──────────────────────────────────────────────────────────────────

/**
 * Returns true if a team member is at burnout risk:
 * avgMood < 3 AND totalHoursWorked > 40
 */
export function isBurnoutRisk(member: TeamMember): boolean {
  return member.avgMood < 3 && member.totalHoursWorked > 40
}

/**
 * Filters and sorts team members at burnout risk (lowest mood first).
 */
export function getBurnoutAlerts(members: TeamMember[]): BurnoutAlert[] {
  return members
    .filter(isBurnoutRisk)
    .sort((a, b) => a.avgMood - b.avgMood)
    .map((m) => ({
      profile: m.profile,
      currentMood: m.avgMood,
      totalHoursWorked: m.totalHoursWorked,
    }))
}

// ─── Mood Trend ───────────────────────────────────────────────────────────────

/**
 * Aggregates wellbeing logs into daily average mood points for the last N days.
 * Returns at most `days` data points, each with a unique date key (DD/MM).
 */
export function aggregateMoodByDay(
  logs: WellbeingLog[],
  days: number = 7
): MoodTrendPoint[] {
  const result: MoodTrendPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)

    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    const dayLogs = logs.filter((l) => l.created_at.slice(0, 10) === key)

    const avgMood =
      dayLogs.length > 0
        ? dayLogs.reduce((sum, l) => sum + l.mood_score, 0) / dayLogs.length
        : 0

    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')

    result.push({ date: `${dd}/${mm}`, avgMood: Math.round(avgMood * 10) / 10 })
  }

  return result
}

// ─── Department Aggregation ───────────────────────────────────────────────────

/**
 * Groups profiles by department and calculates employee count + avg mood.
 */
export function aggregateByDepartment(
  profiles: Profile[],
  logs: WellbeingLog[]
): DepartmentStats[] {
  const deptMap = new Map<string, { ids: string[] }>()

  for (const p of profiles) {
    const dept = p.department ?? 'Tidak Ada Departemen'
    if (!deptMap.has(dept)) deptMap.set(dept, { ids: [] })
    deptMap.get(dept)!.ids.push(p.id)
  }

  const result: DepartmentStats[] = []

  for (const [department, { ids }] of deptMap) {
    const deptLogs = logs.filter((l) => ids.includes(l.user_id))
    const avgMood =
      deptLogs.length > 0
        ? deptLogs.reduce((sum, l) => sum + l.mood_score, 0) / deptLogs.length
        : 0

    result.push({
      department,
      employeeCount: ids.length,
      avgMood: Math.round(avgMood * 10) / 10,
    })
  }

  return result.sort((a, b) => a.department.localeCompare(b.department))
}

/**
 * Counts employees (role === 'employee' only).
 * Managers and admins are excluded.
 */
export function countEmployees(profiles: Profile[]): number {
  return profiles.filter((p) => p.role === 'employee').length
}

// ─── CSV Generation ───────────────────────────────────────────────────────────

function escapeCsvField(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Generates a CSV string for team export (Manager scope).
 * Headers: Nama, Departemen, Rata-rata Score, Total Tasks, Rata-rata Mood, Total Jam Kerja
 */
export function generateTeamCSV(members: TeamMember[]): string {
  const headers = [
    'Nama',
    'Departemen',
    'Rata-rata Score',
    'Total Tasks Selesai',
    'Rata-rata Mood',
    'Total Jam Kerja',
  ]

  const rows = members.map((m) => [
    escapeCsvField(m.profile.full_name),
    escapeCsvField(m.profile.department ?? '-'),
    escapeCsvField(m.avgScore),
    escapeCsvField(m.tasksCompleted),
    escapeCsvField(m.avgMood),
    escapeCsvField(m.totalHoursWorked),
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

/**
 * Generates a CSV string for company export (Admin scope).
 * Includes Company Overview, Department Breakdown, and all employee data.
 */
export function generateCompanyCSV(
  stats: CompanyStats,
  departments: DepartmentStats[],
  members: TeamMember[]
): string {
  const today = new Date().toISOString().slice(0, 10)

  const sections: string[] = []

  // Section 1: Company Overview
  sections.push('=== RINGKASAN PERUSAHAAN ===')
  sections.push(`Tanggal Export,${today}`)
  sections.push(`Total Karyawan,${stats.totalEmployees}`)
  sections.push(`Rata-rata Productivity Score,${stats.avgProductivityScore}`)
  sections.push(`Total Tasks Selesai Hari Ini,${stats.tasksCompletedToday}`)
  sections.push('')

  // Section 2: Department Breakdown
  sections.push('=== BREAKDOWN DEPARTEMEN ===')
  sections.push('Departemen,Jumlah Karyawan,Rata-rata Mood')
  for (const d of departments) {
    sections.push(
      [
        escapeCsvField(d.department),
        escapeCsvField(d.employeeCount),
        escapeCsvField(d.avgMood),
      ].join(',')
    )
  }
  sections.push('')

  // Section 3: All Employees
  sections.push('=== DATA KARYAWAN ===')
  sections.push(
    'Nama,Departemen,Rata-rata Score,Total Tasks Selesai,Rata-rata Mood,Total Jam Kerja'
  )
  for (const m of members) {
    sections.push(
      [
        escapeCsvField(m.profile.full_name),
        escapeCsvField(m.profile.department ?? '-'),
        escapeCsvField(m.avgScore),
        escapeCsvField(m.tasksCompleted),
        escapeCsvField(m.avgMood),
        escapeCsvField(m.totalHoursWorked),
      ].join(',')
    )
  }

  return sections.join('\n')
}

/**
 * Triggers a CSV file download in the browser.
 */
export function downloadCSV(content: string, filename: string): void {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Formats today's date as YYYY-MM-DD for use in filenames.
 */
export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}
