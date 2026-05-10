import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/dashboard'

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  todo: {
    label: 'Todo',
    className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  },
  doing: {
    label: 'Doing',
    className: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-600 text-white dark:bg-gray-500 dark:text-gray-100',
  },
  done: {
    label: 'Done',
    className: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export function getStatusConfig(status: TaskStatus) {
  return statusConfig[status]
}
