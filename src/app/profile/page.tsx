'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Lock, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { supabase } from '@/lib/supabase'
import {
  fetchCurrentProfile,
  updateProfile,
  updateAvatarUrl,
} from '@/lib/dashboard/queries'
import { uploadAvatar, getAvatarUrl, deleteOldAvatars } from '@/lib/upload-avatar'
import { getInitials } from '@/lib/dashboard/calculations'
import {
  profileSchema,
  changePasswordSchema,
  DEPARTMENTS,
  type ProfileInput,
  type ChangePasswordInput,
} from '@/lib/validations/profile-schema'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    setValue: setProfileValue,
    watch: watchProfile,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const selectedDepartment = watchProfile('department')

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)
        // Get email from auth session (not from database)
        setEmail(user.email || '')

        // Fetch profile from database
        const profile = await fetchCurrentProfile(user.id)

        setFullName(profile.full_name)
        setProfileValue('full_name', profile.full_name)
        setProfileValue('department', (profile.department || 'Engineering') as typeof DEPARTMENTS[number])

        // Set avatar URL
        if (profile.avatar_url) {
          const publicUrl = getAvatarUrl(profile.avatar_url)
          setAvatarUrl(publicUrl)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        toast.error('Gagal memuat profil')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, setProfileValue])

  const handleAvatarUpload = async (file: File) => {
    if (!userId) return

    try {
      const result = await uploadAvatar(userId, file)

      if (!result.success) {
        toast.error(result.error || 'Gagal mengupload foto')
        return
      }

      // Update avatar_url in database
      await updateAvatarUrl(userId, result.avatarUrl!)

      // Update local state
      const publicUrl = getAvatarUrl(result.avatarUrl!)
      setAvatarUrl(publicUrl)

      // Delete old avatars (cleanup)
      const fileName = result.avatarUrl!.split('/')[1]
      await deleteOldAvatars(userId, fileName)

      toast.success('Foto profil berhasil diupload!')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toast.error('Gagal mengupload foto profil')
    }
  }

  const onSubmitProfile = async (data: ProfileInput) => {
    if (!userId) return

    try {
      await updateProfile(userId, {
        full_name: data.full_name,
        department: data.department,
      })
      setFullName(data.full_name)
      toast.success('Profil berhasil diperbarui!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Gagal memperbarui profil')
    }
  }

  const onSubmitPassword = async (data: ChangePasswordInput) => {
    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: data.currentPassword,
      })

      if (signInError) {
        toast.error('Password lama tidak sesuai')
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        toast.error('Gagal mengganti password')
        return
      }

      toast.success('Password berhasil diubah!')
      resetPasswordForm()
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Gagal mengganti password')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const initials = getInitials(fullName)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Kembali ke Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda</p>
        </div>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <AvatarUpload
                  avatarUrl={avatarUrl}
                  initials={initials}
                  onUpload={handleAvatarUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Informasi Profil
              </CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                {/* Email (readonly) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email tidak dapat diubah
                  </p>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input
                    id="full_name"
                    placeholder="Masukkan nama lengkap"
                    disabled={isSubmittingProfile}
                    aria-invalid={!!profileErrors.full_name}
                    {...registerProfile('full_name')}
                  />
                  {profileErrors.full_name && (
                    <p className="text-xs text-destructive">
                      {profileErrors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={(value) => setProfileValue('department', value as typeof DEPARTMENTS[number])}
                    disabled={isSubmittingProfile}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Pilih department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {profileErrors.department && (
                    <p className="text-xs text-destructive">
                      {profileErrors.department.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmittingProfile}
                >
                  {isSubmittingProfile && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Simpan Perubahan
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5" />
                Ganti Password
              </CardTitle>
              <CardDescription>
                Perbarui password Anda untuk keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Lama</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Masukkan password lama"
                    disabled={isSubmittingPassword}
                    aria-invalid={!!passwordErrors.currentPassword}
                    {...registerPassword('currentPassword')}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Masukkan password baru (min 6 karakter)"
                    disabled={isSubmittingPassword}
                    aria-invalid={!!passwordErrors.newPassword}
                    {...registerPassword('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Konfirmasi password baru"
                    disabled={isSubmittingPassword}
                    aria-invalid={!!passwordErrors.confirmPassword}
                    {...registerPassword('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    Password baru harus minimal 6 karakter dan berbeda dari password lama
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmittingPassword}
                >
                  {isSubmittingPassword && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Ganti Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
