'use client'

import { useState } from 'react'
import { Plus, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { insertTask } from '@/lib/dashboard/queries'
import type { QuickTaskInput } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface QuickTaskAddProps {
  userId: string
  onSuccess?: () => void
}

const DIFFICULTY_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
]

export function QuickTaskAdd({ userId, onSuccess }: QuickTaskAddProps) {
  const [form, setForm] = useState<QuickTaskInput>({ title: '', difficulty: 3 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const titleError =
    form.title.trim().length > 0 && form.title.trim().length < 3
      ? 'Judul minimal 3 karakter'
      : null

  const isValid = form.title.trim().length >= 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await insertTask({
        user_id: userId,
        title: form.title.trim(),
        status: 'todo',
        difficulty: form.difficulty,
        total_duration: 0,
        started_at: null,
        completed_at: null,
      })
      setSuccessMsg(`Task "${form.title.trim()}" berhasil ditambahkan!`)
      setForm({ title: '', difficulty: 3 })
      onSuccess?.()
    } catch {
      setError('Gagal menambahkan task. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Plus className="size-4" aria-hidden="true" />
          Tambah Task Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Judul Task</Label>
            <Input
              id="task-title"
              placeholder="Contoh: Review laporan bulanan"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }))
                setSuccessMsg(null)
              }}
              disabled={submitting}
              aria-describedby={titleError ? 'task-title-error' : undefined}
              aria-invalid={!!titleError}
              maxLength={200}
            />
            {titleError && (
              <p id="task-title-error" className="text-xs text-destructive" role="alert">
                {titleError}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              Tingkat Kesulitan
            </legend>
            <div className="flex gap-2" role="group" aria-label="Pilih tingkat kesulitan">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, difficulty: opt.value }))}
                  disabled={submitting}
                  className={cn(
                    'flex flex-1 items-center justify-center rounded-lg border py-2 text-sm font-medium transition-all',
                    form.difficulty === opt.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                  )}
                  aria-pressed={form.difficulty === opt.value}
                  aria-label={`Kesulitan ${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Status info */}
          <p className="text-xs text-muted-foreground">
            Status default: <span className="font-medium">Todo</span>
          </p>

          {/* Feedback */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              {successMsg}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !isValid}
            aria-label="Tambah task baru"
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {submitting ? 'Menyimpan...' : 'Tambah Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
