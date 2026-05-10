'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/dashboard/calculations'
import { getAvatarUrl } from '@/lib/upload-avatar'
import type { Profile } from '@/types/dashboard'

interface DashboardHeaderProps {
  profile: Profile
  badge?: 'Manager' | 'Admin'
  onLogout: () => void
}

export function DashboardHeader({ profile, badge, onLogout }: DashboardHeaderProps) {
  const router = useRouter()
  const initials = getInitials(profile.full_name)
  const avatarUrl = profile.avatar_url ? getAvatarUrl(profile.avatar_url) : null

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: logo + app name */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
            <span className="text-sm font-bold text-background">M</span>
          </div>
          <span className="hidden text-sm font-semibold sm:block">MindWork</span>
        </div>

        {/* Right: user info + actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
          >
            {avatarUrl ? (
              <div className="relative size-8 overflow-hidden rounded-full border border-border">
                <Image
                  src={avatarUrl}
                  alt={profile.full_name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : (
              <Avatar className="size-8 border border-border">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium leading-none">{profile.full_name}</span>
                {badge && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0"
                    aria-label={`Role: ${badge}`}
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              {profile.department && (
                <p className="mt-0.5 text-xs text-muted-foreground">{profile.department}</p>
              )}
            </div>
          </button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push('/profile')}
            className="sm:hidden"
            aria-label="Buka profil"
          >
            <User className="size-4" aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-1.5"
            aria-label="Logout dari aplikasi"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
