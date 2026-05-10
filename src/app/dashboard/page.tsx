'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchCurrentProfile } from '@/lib/dashboard/queries'
import { EmployeeDashboard } from '@/components/dashboard/employee/employee-dashboard'
import { ManagerDashboard } from '@/components/dashboard/manager/manager-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard'
import { ErrorState } from '@/components/dashboard/shared/error-state'
import { LoadingSkeleton } from '@/components/dashboard/shared/loading-skeleton'
import type { Profile } from '@/types/dashboard'

type PageState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: Profile }

export default function DashboardPage() {
  const router = useRouter()
  const [state, setState] = useState<PageState>({ status: 'loading' })

  const loadProfile = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const profile = await fetchCurrentProfile(user.id)

      if (!['employee', 'manager', 'admin'].includes(profile.role)) {
        setState({
          status: 'error',
          message: 'Role pengguna tidak valid. Mengarahkan ke halaman login...',
        })
        setTimeout(() => router.push('/login'), 3000)
        return
      }

      setState({ status: 'ready', profile })
    } catch {
      setState({
        status: 'error',
        message: 'Gagal memuat profil pengguna. Periksa koneksi internet Anda.',
      })
    }
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSkeleton variant="header" />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </div>
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="table" rows={5} />
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state.status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <ErrorState
          message={state.message}
          onRetry={loadProfile}
          className="max-w-sm w-full"
        />
      </div>
    )
  }

  // ── Ready: conditional render by role ────────────────────────────────────────
  const { profile } = state

  if (profile.role === 'employee') {
    return <EmployeeDashboard profile={profile} />
  }

  if (profile.role === 'manager') {
    return <ManagerDashboard profile={profile} />
  }

  if (profile.role === 'admin') {
    return <AdminDashboard profile={profile} />
  }

  // Fallback (should never reach here due to validation above)
  return null
}
