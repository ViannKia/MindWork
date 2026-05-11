import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  variant: 'card' | 'table' | 'chart' | 'header' | 'stat'
  rows?: number
  className?: string
}

interface SkeletonBoxProps {
  className?: string
  style?: React.CSSProperties
}

function SkeletonBox({ className, style }: SkeletonBoxProps) {
  return (
    <div className={cn('animate-pulse rounded bg-muted', className)} style={style} />
  )
}

export function LoadingSkeleton({ variant, rows = 3, className }: LoadingSkeletonProps) {
  if (variant === 'header') {
    return (
      <div className={cn('flex items-center justify-between p-4', className)}>
        <div className="flex items-center gap-3">
          <SkeletonBox className="size-10 rounded-full" />
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-3 w-20" />
          </div>
        </div>
        <SkeletonBox className="h-8 w-20" />
      </div>
    )
  }

  if (variant === 'stat') {
    return (
      <div className={cn('rounded-lg border border-border bg-card p-5 space-y-3', className)}>
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-8 w-16" />
        <SkeletonBox className="h-2 w-full" />
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-lg border border-border bg-card p-5 space-y-4', className)}>
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        <SkeletonBox className="h-12 w-24" />
        <SkeletonBox className="h-2 w-full" />
        <div className="flex gap-4">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-3 w-20" />
        </div>
      </div>
    )
  }

  if (variant === 'chart') {
    // Generate random heights once, not on every render
    const heights = Array.from({ length: 7 }, () => `${30 + Math.random() * 70}%`)
    
    return (
      <div className={cn('rounded-lg border border-border bg-card p-5 space-y-4', className)}>
        <SkeletonBox className="h-4 w-40" />
        <div className="flex items-end gap-2 h-40">
          {heights.map((height, i) => (
            <SkeletonBox
              key={i}
              className="flex-1"
              style={{ height }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
    )
  }

  // table
  return (
    <div className={cn('rounded-lg border border-border bg-card overflow-hidden', className)}>
      {/* header row */}
      <div className="flex gap-4 px-4 py-3 border-b border-border">
        <SkeletonBox className="h-3 w-1/3" />
        <SkeletonBox className="h-3 w-1/4" />
        <SkeletonBox className="h-3 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-0">
          <SkeletonBox className="h-4 w-1/3" />
          <SkeletonBox className="h-4 w-1/4" />
          <SkeletonBox className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
}
