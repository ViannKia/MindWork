import { supabase } from '@/lib/supabase'
import type { Profile, Task, WellbeingLog } from '@/types/dashboard'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNDaysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── Profile Queries ──────────────────────────────────────────────────────────

/**
 * Fetches the profile for the currently authenticated user.
 */
export async function fetchCurrentProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, department, manager_id, avatar_url')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profil tidak ditemukan.')
  return data as Profile
}

/**
 * Fetches the profile with email for the currently authenticated user.
 */
export async function fetchCurrentProfileWithEmail(
  userId: string
): Promise<Profile & { email: string }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, department, manager_id, avatar_url')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profil tidak ditemukan.')

  // Get email from auth.users
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? ''

  return { ...data, email } as Profile & { email: string }
}

/**
 * Updates the current user's profile.
 */
export async function updateProfile(
  userId: string,
  updates: { full_name: string; department: string }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

/**
 * Updates the current user's avatar URL.
 */
export async function updateAvatarUrl(
  userId: string,
  avatarUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

/**
 * Fetches a single profile by ID (for team member detail page).
 */
export async function fetchProfileById(id: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, department, manager_id')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profil tidak ditemukan.')
  return data as Profile
}

/**
 * Fetches all direct reports (employees) of a manager.
 */
export async function fetchTeamMembers(managerId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, department, manager_id')
    .eq('manager_id', managerId)

  if (error) throw new Error(error.message)
  return (data ?? []) as Profile[]
}

/**
 * Fetches all employees (role === 'employee' only, for admin view).
 */
export async function fetchAllEmployees(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, department, manager_id, avatar_url')
    .eq('role', 'employee')

  if (error) throw new Error(error.message)
  return (data ?? []) as Profile[]
}

// ─── Task Queries ─────────────────────────────────────────────────────────────

/**
 * Fetches tasks for a single user within the last N days.
 */
export async function fetchUserTasks(userId: string, days: number): Promise<Task[]> {
  const since = getNDaysAgoISO(days)

  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, status, difficulty, total_duration, started_at, completed_at, created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

/**
 * Fetches the 5 most recent tasks for a user (for Recent Tasks Table).
 */
export async function fetchRecentTasks(userId: string, limit = 5): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, status, difficulty, total_duration, started_at, completed_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

/**
 * Fetches tasks for multiple users within the last N days.
 */
export async function fetchTeamTasks(userIds: string[], days: number): Promise<Task[]> {
  if (userIds.length === 0) return []
  const since = getNDaysAgoISO(days)

  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, status, difficulty, total_duration, started_at, completed_at, created_at')
    .in('user_id', userIds)
    .gte('created_at', since)

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

/**
 * Fetches tasks completed today (for Company Overview).
 */
export async function fetchTasksCompletedToday(): Promise<Task[]> {
  const today = getTodayDateString()

  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, status, difficulty, total_duration, started_at, completed_at, created_at')
    .eq('status', 'done')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lte('created_at', `${today}T23:59:59.999Z`)

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

/**
 * Inserts a new task for the current user.
 */
export async function insertTask(
  task: Omit<Task, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('tasks').insert(task)
  if (error) throw new Error(error.message)
}

/**
 * Updates a task's status and related timestamps.
 */
export async function updateTaskStatus(
  taskId: string,
  status: Task['status'],
  currentTask: Task
): Promise<void> {
  const updates: Partial<Task> = { status }

  // If changing to "doing" and no started_at yet, set it
  if (status === 'doing' && !currentTask.started_at) {
    updates.started_at = new Date().toISOString()
  }

  // If changing to "done" and no completed_at yet, set it and calculate duration
  if (status === 'done' && !currentTask.completed_at) {
    const completedAt = new Date()
    updates.completed_at = completedAt.toISOString()

    // Calculate total_duration in minutes if started_at exists
    if (currentTask.started_at) {
      const startedAt = new Date(currentTask.started_at)
      const durationMs = completedAt.getTime() - startedAt.getTime()
      updates.total_duration = Math.round(durationMs / 60000) // Convert to minutes
    }
  }

  // If changing to "blocked" or "cancelled", don't update timestamps
  // These statuses don't affect time tracking

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) throw new Error(error.message)
}

/**
 * Starts a task (changes status to "doing" and sets started_at).
 */
export async function startTask(taskId: string, currentTask: Task): Promise<void> {
  const updates: Partial<Task> = {
    status: 'doing',
  }

  // Only set started_at if it doesn't exist yet
  if (!currentTask.started_at) {
    updates.started_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) throw new Error(error.message)
}

/**
 * Stops a task (changes status to "done", sets completed_at, and calculates duration).
 */
export async function stopTask(taskId: string, currentTask: Task): Promise<void> {
  const now = new Date()
  const updates: Partial<Task> = {
    status: 'done',
    completed_at: now.toISOString(),
  }

  // If no started_at, set it to now (fallback)
  const startedAt = currentTask.started_at
    ? new Date(currentTask.started_at)
    : now

  if (!currentTask.started_at) {
    updates.started_at = now.toISOString()
  }

  // Calculate duration in minutes
  const durationMs = now.getTime() - startedAt.getTime()
  updates.total_duration = Math.round(durationMs / 60000)

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) throw new Error(error.message)
}

/**
 * Cancels a task (changes status to "cancelled").
 * Cancelled tasks are not counted in productivity score.
 */
export async function cancelTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'cancelled' })
    .eq('id', taskId)

  if (error) throw new Error(error.message)
}

// ─── Wellbeing Log Queries ────────────────────────────────────────────────────

/**
 * Fetches wellbeing logs for a single user within the last N days.
 */
export async function fetchUserWellbeingLogs(
  userId: string,
  days: number
): Promise<WellbeingLog[]> {
  const since = getNDaysAgoISO(days)

  const { data, error } = await supabase
    .from('wellbeing_logs')
    .select('id, user_id, mood_score, stress_level, notes, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.slice(0, 10)) // date comparison
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as WellbeingLog[]
}

/**
 * Fetches wellbeing logs for multiple users within the last N days.
 */
export async function fetchTeamWellbeingLogs(
  userIds: string[],
  days: number
): Promise<WellbeingLog[]> {
  if (userIds.length === 0) return []
  const since = getNDaysAgoISO(days)

  const { data, error } = await supabase
    .from('wellbeing_logs')
    .select('id, user_id, mood_score, stress_level, notes, created_at')
    .in('user_id', userIds)
    .gte('created_at', since.slice(0, 10))

  if (error) throw new Error(error.message)
  return (data ?? []) as WellbeingLog[]
}

/**
 * Checks if the user has already submitted a wellbeing check-in today.
 */
export async function fetchTodayWellbeingLog(
  userId: string
): Promise<WellbeingLog | null> {
  const today = getTodayDateString()

  const { data, error } = await supabase
    .from('wellbeing_logs')
    .select('id, user_id, mood_score, stress_level, notes, created_at')
    .eq('user_id', userId)
    .eq('created_at', today)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as WellbeingLog | null
}

/**
 * Inserts a new wellbeing log entry.
 */
export async function insertWellbeingLog(
  log: Omit<WellbeingLog, 'id'>
): Promise<void> {
  const { error } = await supabase.from('wellbeing_logs').insert(log)
  if (error) throw new Error(error.message)
}
