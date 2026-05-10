'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  avatarUrl: string | null
  initials: string
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
}

export function AvatarUpload({
  avatarUrl,
  initials,
  onUpload,
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    try {
      await onUpload(file)
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const displayUrl = previewUrl || avatarUrl

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={cn(
            'group relative size-[100px] overflow-hidden rounded-full border-2 border-border transition-all',
            !disabled && !isUploading && 'hover:border-primary cursor-pointer',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Upload foto profil"
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Avatar"
              fill
              className="object-cover"
              sizes="100px"
              priority
            />
          ) : (
            <Avatar className="size-full border-0">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Overlay */}
          {!disabled && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex flex-col items-center gap-1 text-white">
                <Camera className="size-6" />
                <span className="text-xs font-medium">Upload</span>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">Foto Profil</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, atau WebP (max 2MB)
        </p>
      </div>
    </div>
  )
}
