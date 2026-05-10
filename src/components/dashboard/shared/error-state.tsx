import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  message: string
  onRetry: () => void
  className?: string
  compact?: boolean
}

export function ErrorState({ message, onRetry, className, compact = false }: ErrorStateProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3', className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <p className="text-sm">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Coba lagi"
        >
          <RefreshCw className="size-3.5 mr-1" />
          Coba lagi
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8 text-center',
        className
      )}
      role="alert"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Terjadi Kesalahan</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="gap-2"
        aria-label="Coba muat ulang data"
      >
        <RefreshCw className="size-3.5" />
        Coba Lagi
      </Button>
    </div>
  )
}
