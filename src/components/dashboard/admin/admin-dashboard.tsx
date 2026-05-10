'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DashboardHeader } from '../shared/dashboard-header'
import { CompanyOverview } from './company-overview'
import { DepartmentBreakdown } from './department-breakdown'
import { TeamProductivityTable } from '../manager/team-productivity-table'
import { BurnoutAlertList } from '../manager/burnout-alert-list'
import { TeamMoodTrendChart } from '../manager/team-mood-trend-chart'
import { TeamLeaderboard } from '../manager/team-leaderboard'
import type { Profile } from '@/types/dashboard'

interface AdminDashboardProps {
  profile: Profile
}

export function AdminDashboard({ profile }: AdminDashboardProps) {
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  const handleViewDetail = useCallback(
    (memberId: string) => {
      router.push(`/dashboard/team/${memberId}`)
    },
    [router]
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} badge="Admin" onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold">
            Dashboard Admin — {profile.full_name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau kesehatan organisasi secara menyeluruh.
          </p>
        </div>

        {/* ── Admin-only section ── */}
        <section aria-labelledby="admin-section-heading" className="mb-8 space-y-4">
          <h2
            id="admin-section-heading"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Ringkasan Perusahaan
          </h2>
          <CompanyOverview />
          <DepartmentBreakdown />
        </section>

        {/* ── Manager section (reused) ── */}
        <section aria-labelledby="manager-section-heading" className="space-y-4">
          <h2
            id="manager-section-heading"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Data Karyawan
          </h2>

          <TeamProductivityTable
            managerId={profile.id}
            isAdmin={true}
            onViewDetail={handleViewDetail}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <TeamLeaderboard managerId={profile.id} isAdmin={true} />
            <TeamMoodTrendChart managerId={profile.id} isAdmin={true} />
          </div>

          <BurnoutAlertList
            managerId={profile.id}
            isAdmin={true}
            onViewDetail={handleViewDetail}
          />
        </section>
      </main>
    </div>
  )
}
