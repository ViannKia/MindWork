'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSkeleton } from '../shared/loading-skeleton'
import { ErrorState } from '../shared/error-state'
import { supabase } from '@/lib/supabase'
import { fetchTeamMembers, fetchTeamTasks } from '@/lib/dashboard/queries'
import { calculateProductivityScore, getScoreColor } from '@/lib/dashboard/calculations'
import type { Profile, Task } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface TeamLeaderboardProps {
  managerId: string
  isAdmin?: boolean
}

interface LeaderboardEntry {
  rank: number
  profile: Profile
  score: number
  color: 'red' | 'yellow' | 'green'
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉']

export function TeamLeaderboard({ managerId, isAdmin = false }: TeamLeaderboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true)
        setError(null)

        // Fetch team members
        let members: Profile[] = []
        
        if (isAdmin) {
          // Admin: fetch all employees
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, role, department, manager_id, avatar_url')
            .eq('role', 'employee')

          if (profileError) throw new Error(profileError.message)
          members = (data ?? []) as Profile[]
        } else {
          // Manager: fetch team members
          members = await fetchTeamMembers(managerId)
        }

        if (members.length === 0) {
          setEntries([])
          return
        }

        // Fetch tasks for all team members (last 7 days)
        const memberIds = members.map((m) => m.id)
        const tasks = await fetchTeamTasks(memberIds, 7)

        // Calculate productivity score for each member
        const leaderboardData = members.map((member) => {
          const memberTasks = tasks.filter((t) => t.user_id === member.id)
          const { score, color } = calculateProductivityScore(memberTasks, 7)

          return {
            profile: member,
            score,
            color,
          }
        })

        // Sort by score (highest first)
        leaderboardData.sort((a, b) => b.score - a.score)

        // Add rank
        const rankedData: LeaderboardEntry[] = leaderboardData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

        setEntries(rankedData)
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
        setError(err instanceof Error ? err.message : 'Gagal memuat leaderboard')
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [managerId, isAdmin])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            Leaderboard Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton variant="table" rows={5} />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            Leaderboard Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message={error} />
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            Leaderboard Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            {isAdmin ? 'Belum ada data karyawan.' : 'Belum ada anggota tim.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5" />
          Leaderboard Tim
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top performers berdasarkan Productivity Score (7 hari terakhir)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.profile.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                entry.rank <= 3 && 'bg-muted/50'
              )}
            >
              {/* Rank / Medal */}
              <div className="flex items-center justify-center w-10 h-10 shrink-0">
                {entry.rank <= 3 ? (
                  <span className="text-2xl" role="img" aria-label={`Rank ${entry.rank}`}>
                    {MEDAL_EMOJIS[entry.rank - 1]}
                  </span>
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Name & Department */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.profile.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {entry.profile.department || 'Tidak ada departemen'}
                </p>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <div
                  className={cn(
                    'text-lg font-bold',
                    entry.color === 'green' && 'text-green-600 dark:text-green-400',
                    entry.color === 'yellow' && 'text-yellow-600 dark:text-yellow-400',
                    entry.color === 'red' && 'text-red-600 dark:text-red-400'
                  )}
                >
                  {entry.score.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Kategori Score:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Tinggi (&gt;70)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Sedang (40-70)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Rendah (&lt;40)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
