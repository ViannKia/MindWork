'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DashboardHeader } from '../shared/dashboard-header'
import { TeamProductivityTable } from './team-productivity-table'
import { BurnoutAlertList } from './burnout-alert-list'
import { TeamMoodTrendChart } from './team-mood-trend-chart'
import { TeamLeaderboard } from './team-leaderboard'
import type { Profile } from '@/types/dashboard'

interface ManagerDashboardProps {
  profile: Profile
}

export function ManagerDashboard({ profile }: ManagerDashboardProps) {
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogoutClick = useCallback(() => {
    setLogoutDialogOpen(true)
  }, [])

  const handleLogoutConfirm = useCallback(async () => {
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
      <DashboardHeader profile={profile} badge="Manager" onLogout={handleLogoutClick} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold">
            Dashboard Manager — {profile.full_name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau produktivitas dan wellbeing tim Anda.
          </p>
        </div>

        {/* Team Productivity Table */}
        <div className="mb-4">
          <TeamProductivityTable
            managerId={profile.id}
            onViewDetail={handleViewDetail}
          />
        </div>

        {/* Leaderboard + Mood Trend */}
        <div className="grid gap-4 lg:grid-cols-2 mb-4">
          <TeamLeaderboard managerId={profile.id} />
          <TeamMoodTrendChart managerId={profile.id} />
        </div>

        {/* Burnout Alert */}
        <div>
          <BurnoutAlertList
            managerId={profile.id}
            onViewDetail={handleViewDetail}
          />
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout dari MindWork?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin keluar dari aplikasi? Anda harus login kembali untuk mengakses dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
