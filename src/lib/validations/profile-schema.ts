import { z } from 'zod'

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'HR',
  'Finance',
  'Operations',
] as const

export const profileSchema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter'),
  department: z.enum(DEPARTMENTS, {
    errorMap: () => ({ message: 'Pilih department yang valid' }),
  }),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru dan konfirmasi tidak cocok',
    path: ['confirmPassword'],
  })

export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
