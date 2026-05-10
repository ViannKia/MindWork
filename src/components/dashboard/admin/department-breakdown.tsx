'use client'

import { useEffect, useCallback, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSkeleton } from '../shared/loading-skeleton'
import { ErrorState } from '../shared/error-state'
import { aggregateByDepartment } from '@/lib/dashboard/calculations'
import {
  fetchAllEmployees,
  fetchTeamWellbeingLogs,
} from '@/lib/dashboard/queries'
import type { AsyncState, DepartmentStats } from '@/types/dashboard'

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

function getMoodEmoji(avgMood: number): string {
  if (avgMood === 0) return '—'
  const rounded = Math.round(avgMood) as 1 | 2 | 3 | 4 | 5
  return MOOD_EMOJI[rounded] ?? '😐'
}

export function DepartmentBreakdown() {
  const [state, setState] = useState<AsyncState<DepartmentStats[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const employees = await fetchAllEmployees()
      if (employees.length === 0) {
        setState({ data: [], loading: false, error: null })
        return
      }

      const userIds = employees.map((e) => e.id)
      const logs = await fetchTeamWellbeingLogs(userIds, 7)
      const departments = aggregateByDepartment(employees, logs)
      setState({ data: departments, loading: false, error: null })
    } catch {
      setState({
        data: null,
        loading: false,
        error: 'Gagal memuat data departemen.',
      })
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (state.loading) return <LoadingSkeleton variant="table" rows={4} />
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />

  const departments = state.data ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <LayoutGrid className="size-4" aria-hidden="true" />
          Breakdown Departemen
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <LayoutGrid className="size-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Tidak ada data departemen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Departemen</TableHead>
                  <TableHead className="text-center">Karyawan</TableHead>
                  <TableHead className="text-center">Avg Mood (7 Hari)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.department}>
                    <TableCell className="text-center font-medium">{dept.department}</TableCell>
                    <TableCell className="text-center tabular-nums">
                      {dept.employeeCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="tabular-nums">
                        {dept.avgMood > 0 ? (
                          <>
                            {getMoodEmoji(dept.avgMood)}{' '}
                            <span className="text-xs text-muted-foreground">
                              {dept.avgMood}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
