'use client'

import { useEffect, useCallback, useState } from 'react'
import { ClipboardList, Play, Square, X, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { LoadingSkeleton } from './loading-skeleton'
import { ErrorState } from './error-state'
import { StatusBadge, getStatusConfig } from './status-badge'
import { supabase } from '@/lib/supabase'
import { fetchRecentTasks, updateTaskStatus, startTask, stopTask, cancelTask } from '@/lib/dashboard/queries'
import type { AsyncState, Task, TaskStatus } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface RecentTasksTableProps {
  userId: string
  refreshTrigger?: number
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Kesulitan: ${level} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'size-2 rounded-full',
            i < level ? 'bg-foreground' : 'bg-muted'
          )}
        />
      ))}
    </div>
  )
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} jam`
  }
  return `${hours} jam ${remainingMinutes} menit`
}

export function RecentTasksTable({ userId, refreshTrigger }: RecentTasksTableProps) {
  const [state, setState] = useState<AsyncState<Task[]>>({
    data: null,
    loading: true,
    error: null,
  })
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [taskToCancel, setTaskToCancel] = useState<Task | null>(null)
  const [stopDialogOpen, setStopDialogOpen] = useState(false)
  const [taskToStop, setTaskToStop] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const tasks = await fetchRecentTasks(userId, 5)
      setState({ data: tasks, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat daftar task.',
      })
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshTrigger])

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return

    setUpdatingTaskId(task.id)
    try {
      await updateTaskStatus(task.id, newStatus, task)
      // Refresh data after successful update
      await fetchData()
    } catch (error) {
      console.error('Failed to update task status:', error)
      // Optionally show error to user
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleStart = async (task: Task) => {
    setUpdatingTaskId(task.id)
    try {
      await startTask(task.id, task)
      await fetchData()
    } catch (error) {
      console.error('Failed to start task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleStopClick = (task: Task) => {
    setTaskToStop(task)
    setStopDialogOpen(true)
  }

  const handleStopConfirm = async () => {
    if (!taskToStop) return

    setUpdatingTaskId(taskToStop.id)
    try {
      await stopTask(taskToStop.id, taskToStop)
      await fetchData()
      setStopDialogOpen(false)
      setTaskToStop(null)
    } catch (error) {
      console.error('Failed to stop task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleStopDialogClose = () => {
    setStopDialogOpen(false)
    setTaskToStop(null)
  }

  const handleCancelClick = (task: Task) => {
    setTaskToCancel(task)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!taskToCancel) return

    setUpdatingTaskId(taskToCancel.id)
    try {
      await cancelTask(taskToCancel.id)
      await fetchData()
      setCancelDialogOpen(false)
      setTaskToCancel(null)
    } catch (error) {
      console.error('Failed to cancel task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false)
    setTaskToCancel(null)
  }

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return

    setUpdatingTaskId(taskToDelete.id)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id)

      if (error) throw new Error(error.message)

      await fetchData()
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false)
    setTaskToDelete(null)
  }

  if (state.loading) return <LoadingSkeleton variant="table" rows={5} />
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const tasks = state.data ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ClipboardList className="size-4" aria-hidden="true" />
          Task Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <ClipboardList className="size-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Belum ada task</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Judul</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Kesulitan</TableHead>
                  <TableHead className="text-center">Durasi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const statusConfig = getStatusConfig(task.status)
                  const isUpdating = updatingTaskId === task.id

                  return (
                    <TableRow key={task.id}>
                      <TableCell className="text-center font-medium max-w-[200px] truncate">
                        <span className={cn(task.status === 'cancelled' && 'line-through text-muted-foreground')}>
                          {task.title}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {(task.status === 'cancelled' || task.status === 'done') ? (
                            // Cancelled or Done tasks: show badge only (no dropdown)
                            <StatusBadge status={task.status} />
                          ) : (
                            // Active tasks: show dropdown
                            <Select
                              value={task.status}
                              onValueChange={(value) =>
                                handleStatusChange(task, value as TaskStatus)
                              }
                              disabled={isUpdating}
                            >
                              <SelectTrigger
                                size="sm"
                                className={cn(
                                  'w-[110px] border-0 font-medium',
                                  isUpdating && 'opacity-50 cursor-wait'
                                )}
                              >
                                <SelectValue>
                                  <StatusBadge status={task.status} />
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">
                                  <StatusBadge status="todo" />
                                </SelectItem>
                                <SelectItem value="doing">
                                  <StatusBadge status="doing" />
                                </SelectItem>
                                <SelectItem value="blocked">
                                  <StatusBadge status="blocked" />
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  <StatusBadge status="cancelled" />
                                </SelectItem>
                                <SelectItem value="done">
                                  <StatusBadge status="done" />
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <DifficultyDots level={task.difficulty} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {task.status === 'done' && task.total_duration > 0
                          ? formatDuration(task.total_duration)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {(task.status === 'todo' || task.status === 'blocked') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStart(task)}
                                disabled={isUpdating}
                                className="bg-green-600 text-white hover:bg-green-700"
                                aria-label="Mulai task"
                              >
                                <Play className="size-3.5" aria-hidden="true" />
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelClick(task)}
                                disabled={isUpdating}
                                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label="Batalkan task"
                              >
                                <X className="size-3.5" aria-hidden="true" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {task.status === 'doing' && (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStopClick(task)}
                                disabled={isUpdating}
                                aria-label="Selesaikan task"
                              >
                                <Square className="size-3.5" aria-hidden="true" />
                                Stop
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelClick(task)}
                                disabled={isUpdating}
                                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label="Batalkan task"
                              >
                                <X className="size-3.5" aria-hidden="true" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {(task.status === 'done' || task.status === 'cancelled') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(task)}
                              disabled={isUpdating}
                              className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                              aria-label="Hapus task"
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Stop Confirmation Dialog */}
      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menyelesaikan task <strong>&quot;{taskToStop?.title}&quot;</strong>?
              <br />
              <br />
              Task yang selesai akan dihitung dalam productivity score Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStopDialogClose}>
              Tidak
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStopConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Ya, Selesaikan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin membatalkan task <strong>&quot;{taskToCancel?.title}&quot;</strong>?
              <br />
              <br />
              Task yang dibatalkan tidak akan dihitung dalam productivity score.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDialogClose}>
              Tidak
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus task <strong>&quot;{taskToDelete?.title}&quot;</strong>?
              <br />
              <br />
              <span className="text-red-600 font-semibold">
                Task yang dihapus tidak bisa dikembalikan!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteDialogClose}>
              Tidak
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
