'use client'

import { useEffect, useCallback, useState } from 'react'
import { CheckCircle2, Loader2, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSkeleton } from '../shared/loading-skeleton'
import { ErrorState } from '../shared/error-state'
import { fetchTodayWellbeingLog, insertWellbeingLog } from '@/lib/dashboard/queries'
import type { WellbeingLog, WellbeingCheckinInput } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface WellbeingCheckinProps {
  userId: string
  onSuccess?: () => void
}

const MOOD_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: '😢', label: 'Sangat Sedih' },
  { value: 2, emoji: '😕', label: 'Sedih' },
  { value: 3, emoji: '😐', label: 'Biasa' },
  { value: 4, emoji: '🙂', label: 'Senang' },
  { value: 5, emoji: '😄', label: 'Sangat Senang' },
]

export function WellbeingCheckin({ userId, onSuccess }: WellbeingCheckinProps) {
  const [checkState, setCheckState] = useState<{
    loading: boolean
    alreadyCheckedIn: boolean
    todayLog: WellbeingLog | null
    error: string | null
  }>({ loading: true, alreadyCheckedIn: false, todayLog: null, error: null })

  const [form, setForm] = useState<WellbeingCheckinInput>({
    mood_score: 3,
    stress_level: 5,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const checkTodayEntry = useCallback(async () => {
    setCheckState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const log = await fetchTodayWellbeingLog(userId)
      setCheckState({
        loading: false,
        alreadyCheckedIn: log !== null,
        todayLog: log,
        error: null,
      })
    } catch {
      setCheckState({
        loading: false,
        alreadyCheckedIn: false,
        todayLog: null,
        error: 'Gagal memeriksa data check-in hari ini.',
      })
    }
  }, [userId])

  useEffect(() => {
    checkTodayEntry()
  }, [checkTodayEntry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      const today = new Date().toISOString().slice(0, 10)
      await insertWellbeingLog({
        user_id: userId,
        mood_score: form.mood_score,
        stress_level: form.stress_level,
        notes: null,
        created_at: today,
      })
      setSubmitSuccess(true)
      setCheckState((prev) => ({ ...prev, alreadyCheckedIn: true }))
      onSuccess?.()
    } catch {
      setSubmitError('Gagal menyimpan check-in. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checkState.loading) return <LoadingSkeleton variant="card" />
  if (checkState.error)
    return <ErrorState message={checkState.error} onRetry={checkTodayEntry} />

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Heart className="size-4" aria-hidden="true" />
          Wellbeing Check-in Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checkState.alreadyCheckedIn || submitSuccess ? (
          <AlreadyCheckedIn log={checkState.todayLog} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mood Picker */}
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Bagaimana perasaanmu hari ini?
              </legend>
              <div className="flex gap-2" role="group" aria-label="Pilih mood">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, mood_score: opt.value }))}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all',
                      form.mood_score === opt.value
                        ? 'border-foreground bg-secondary'
                        : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                    )}
                    aria-pressed={form.mood_score === opt.value}
                    aria-label={opt.label}
                  >
                    <span className="text-xl" aria-hidden="true">{opt.emoji}</span>
                    <span className="text-xs text-muted-foreground">{opt.value}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Stress Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="stress-slider" className="text-sm font-medium">
                  Tingkat Stres
                </Label>
                <span
                  className="text-sm font-semibold tabular-nums"
                  aria-live="polite"
                  aria-label={`Tingkat stres: ${form.stress_level} dari 10`}
                >
                  {form.stress_level} / 10
                </span>
              </div>
              <Slider
                id="stress-slider"
                min={1}
                max={10}
                step={1}
                value={[form.stress_level]}
                onValueChange={([v]) =>
                  setForm((f) => ({ ...f, stress_level: v as WellbeingCheckinInput['stress_level'] }))
                }
                aria-label="Slider tingkat stres"
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={form.stress_level}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Santai</span>
                <span>Sangat Stres</span>
              </div>
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
              aria-label="Simpan wellbeing check-in"
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Menyimpan...' : 'Simpan Check-in'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function AlreadyCheckedIn({ log }: { log: WellbeingLog | null }) {
  const mood = log ? MOOD_OPTIONS.find((o) => o.value === log.mood_score) : null

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <CheckCircle2 className="size-10 text-green-600" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">Check-in hari ini sudah diisi!</p>
        {mood && (
          <p className="mt-1 text-sm text-muted-foreground">
            Mood: {mood.emoji} {mood.label}
            {log && ` · Stres: ${log.stress_level}/10`}
          </p>
        )}
      </div>
    </div>
  )
}
