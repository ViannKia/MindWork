// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  role: 'employee' | 'manager' | 'admin'
  department: string | null
  manager_id: string | null
  avatar_url: string | null
}

export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'cancelled' | 'done'

export interface Task {
  id: string
  user_id: string
  title: string
  status: TaskStatus
  difficulty: 1 | 2 | 3 | 4 | 5
  total_duration: number // menit
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface WellbeingLog {
  id: string
  user_id: string
  mood_score: 1 | 2 | 3 | 4 | 5
  stress_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  notes: string | null
  created_at: string // date string YYYY-MM-DD
}

// ─── Computed / Aggregated Types ──────────────────────────────────────────────

export interface ProductivityScore {
  score: number // 0–100
  color: 'red' | 'yellow' | 'green'
  tasksCompleted: number
  avgDifficulty: number
  hoursWorked: number
}

export interface TeamMember {
  profile: Profile
  avgScore: number
  tasksCompleted: number
  avgMood: number
  totalHoursWorked: number
}

export interface BurnoutAlert {
  profile: Profile
  currentMood: number
  totalHoursWorked: number
}

export interface MoodTrendPoint {
  date: string // DD/MM
  avgMood: number
}

export interface DepartmentStats {
  department: string
  employeeCount: number
  avgMood: number
}

export interface CompanyStats {
  totalEmployees: number
  avgProductivityScore: number
  tasksCompletedToday: number
}

// ─── Component State Types ────────────────────────────────────────────────────

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// ─── Form Input Types ─────────────────────────────────────────────────────────

export interface WellbeingCheckinInput {
  mood_score: 1 | 2 | 3 | 4 | 5
  stress_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  notes?: string
}

export interface QuickTaskInput {
  title: string
  difficulty: 1 | 2 | 3 | 4 | 5
}

// ─── CSV Export Types ─────────────────────────────────────────────────────────

export type CSVScope = 'team' | 'company'
