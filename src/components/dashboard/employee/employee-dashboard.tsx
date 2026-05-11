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
import { ProductivityScoreCard } from '../shared/productivity-score-card'
import { StreakCard } from '../shared/streak-card'
import { RecentTasksTable } from '../shared/recent-tasks-table'
import { WellbeingCheckin } from './wellbeing-checkin'
import { QuickTaskAdd } from './quick-task-add'
import type { Profile } from '@/types/dashboard'

interface EmployeeDashboardProps {
  profile: Profile
}

export function EmployeeDashboard({ profile }: EmployeeDashboardProps) {
  const router = useRouter()
  // refreshTrigger increments each time a task is added, causing RecentTasksTable to re-fetch
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogoutClick = useCallback(() => {
    setLogoutDialogOpen(true)
  }, [])

  const handleLogoutConfirm = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  const handleTaskAdded = useCallback(() => {
    setRefreshTrigger((n) => n + 1)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} onLogout={handleLogoutClick} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold">
            Selamat datang, {profile.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Berikut ringkasan produktivitas dan wellbeing kamu hari ini.
          </p>
        </div>

        {/* Top row: Productivity + Streak */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <ProductivityScoreCard userId={profile.id} />
          <StreakCard userId={profile.id} />
        </div>

        {/* Middle: Wellbeing Check-in */}
        <div className="mb-4">
          <WellbeingCheckin userId={profile.id} />
        </div>

        {/* Bottom row: Recent Tasks + Quick Add */}
        <div className="grid gap-4 lg:grid-cols-2">
          <RecentTasksTable userId={profile.id} refreshTrigger={refreshTrigger} />
          <QuickTaskAdd userId={profile.id} onSuccess={handleTaskAdded} />
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
