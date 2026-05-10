import { supabase } from './supabase'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BUCKET_NAME = 'Avatar'

export interface UploadAvatarResult {
  success: boolean
  avatarUrl?: string
  error?: string
}

/**
 * Validates the uploaded file.
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Ukuran file terlalu besar. Maksimal 2MB.',
    }
  }

  return { valid: true }
}

/**
 * Gets the file extension from a file.
 */
function getFileExtension(file: File): string {
  const parts = file.name.split('.')
  return parts[parts.length - 1].toLowerCase()
}

/**
 * Uploads an avatar to Supabase Storage.
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns Upload result with avatar URL or error
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<UploadAvatarResult> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    const timestamp = Date.now()
    const extension = getFileExtension(file)
    const fileName = `${timestamp}.${extension}`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Gagal mengupload foto. Silakan coba lagi.' }
    }

    // Return the storage path (not the full URL)
    return {
      success: true,
      avatarUrl: filePath,
    }
  } catch (error) {
    console.error('Unexpected error during upload:', error)
    return { success: false, error: 'Terjadi kesalahan saat mengupload foto.' }
  }
}

/**
 * Gets the public URL for an avatar.
 * @param avatarPath - The storage path (e.g., "userId/timestamp.jpg")
 * @returns The public URL or null
 */
export function getAvatarUrl(avatarPath: string | null): string | null {
  if (!avatarPath) return null

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(avatarPath)
  return data.publicUrl
}

/**
 * Deletes old avatars for a user (cleanup).
 * @param userId - The user's ID
 * @param keepFileName - The filename to keep (optional)
 */
export async function deleteOldAvatars(
  userId: string,
  keepFileName?: string
): Promise<void> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId)

    if (listError || !files) return

    const filesToDelete = files
      .filter((file) => file.name !== keepFileName)
      .map((file) => `${userId}/${file.name}`)

    if (filesToDelete.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(filesToDelete)
    }
  } catch (error) {
    console.error('Error deleting old avatars:', error)
  }
}
