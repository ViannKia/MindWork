# Design Document: Next.js Dashboard dengan Role-Based Views

## Overview

Dashboard MindWork adalah halaman utama aplikasi yang menampilkan metrik produktivitas dan wellbeing berdasarkan peran pengguna. Tiga role yang didukung — **Employee**, **Manager**, dan **Admin** — masing-masing mendapatkan tampilan yang disesuaikan dengan kebutuhan mereka.

Arsitektur utama: satu route `/dashboard` yang melakukan conditional rendering berdasarkan role yang diambil dari tabel `profiles` Supabase. Semua data fetching dilakukan client-side menggunakan `useEffect` + `useState` sesuai constraint teknis proyek.

Halaman detail anggota tim tersedia di `/dashboard/team/[id]` untuk Manager dan Admin.

### Tujuan Desain

- **Separation of concerns**: Komponen per-role terisolasi di folder masing-masing; logika bisnis (kalkulasi skor, streak, burnout) dipisahkan ke utility functions yang murni (pure functions) agar mudah diuji.
- **Konsistensi UX**: Loading skeleton, error state dengan retry, dan teal sebagai primary color diterapkan secara seragam di semua komponen.
- **Performa**: `React.memo`, `useMemo`, `useCallback` digunakan secara selektif; recharts di-lazy-load dengan `next/dynamic` + `ssr: false` karena bergantung pada browser APIs.

---

## Architecture

### Routing

```
src/app/
├── dashboard/
│   ├── page.tsx                    # Entry point — role detection + conditional render
│   └── team/
│       └── [id]/
│           └── page.tsx            # Detail anggota tim (Manager/Admin)
```

`page.tsx` di `/dashboard` adalah **Client Component** (`"use client"`). Ia mengambil profil pengguna dari Supabase, lalu merender salah satu dari tiga dashboard berdasarkan role.

Halaman `/dashboard/team/[id]` juga Client Component. Karena ini adalah dynamic route di Client Component, `params` diakses menggunakan React's `use()` API sesuai konvensi Next.js 16:

```tsx
'use client'
import { use } from 'react'

export default function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // ...
}
```

### Component Tree

```
DashboardPage (page.tsx)
├── [loading] → DashboardSkeleton
├── [error]   → ErrorState
├── role === 'employee' → EmployeeDashboard
├── role === 'manager'  → ManagerDashboard
└── role === 'admin'    → AdminDashboard

EmployeeDashboard
├── DashboardHeader (shared)
├── ProductivityScoreCard (shared)
├── StreakCard (shared)
├── WellbeingCheckin (employee)
├── RecentTasksTable (shared)
└── QuickTaskAdd (employee)

ManagerDashboard
├── DashboardHeader (shared, badge="Manager")
├── TeamProductivityTable (manager)
├── BurnoutAlertList (manager)
├── TeamMoodTrendChart (manager)
└── ExportCSVButton (shared, scope="team")

AdminDashboard
├── DashboardHeader (shared, badge="Admin")
├── CompanyOverview (admin)
│   └── ExportCSVButton (shared, scope="company")
├── DepartmentBreakdown (admin)
├── TeamProductivityTable (manager — reused)
├── BurnoutAlertList (manager — reused)
└── TeamMoodTrendChart (manager — reused)
```

### Data Flow

Setiap komponen bertanggung jawab atas data fetchingnya sendiri menggunakan `useEffect` + `useState`. Ini menghindari prop drilling yang dalam dan memungkinkan loading state per-section yang independen.

```
Component mounts
  → useEffect fires
  → supabase query
  → setState({ data, loading: false }) atau setState({ error, loading: false })
  → render data / skeleton / error
```

---

## Components and Interfaces

### Shared Components (`src/components/dashboard/shared/`)

#### `DashboardHeader`

```tsx
interface DashboardHeaderProps {
  profile: Profile
  badge?: 'Manager' | 'Admin'
  onLogout: () => void
}
```

Menampilkan nama, avatar (2 inisial uppercase), badge opsional, dan tombol logout. Responsif dengan Tailwind.

#### `ProductivityScoreCard`

```tsx
interface ProductivityScoreCardProps {
  userId: string
}
```

Mengambil tasks 7 hari terakhir secara internal, menghitung skor, menampilkan progress bar berwarna.

#### `StreakCard`

```tsx
interface StreakCardProps {
  userId: string
}
```

Mengambil `wellbeing_logs` secara internal, menghitung streak.

#### `RecentTasksTable`

```tsx
interface RecentTasksTableProps {
  userId: string
  refreshTrigger?: number  // increment untuk trigger refresh
}
```

Menampilkan 5 task terbaru. `refreshTrigger` digunakan oleh `QuickTaskAdd` untuk memicu re-fetch.

#### `LoadingSkeleton`

```tsx
interface LoadingSkeletonProps {
  variant: 'card' | 'table' | 'chart' | 'header'
  rows?: number
}
```

Skeleton generik dengan animasi `animate-pulse` Tailwind.

#### `ErrorState`

```tsx
interface ErrorStateProps {
  message: string
  onRetry: () => void
}
```

Menampilkan pesan error dalam bahasa Indonesia dan tombol retry.

#### `ExportCSVButton`

```tsx
interface ExportCSVButtonProps {
  scope: 'team' | 'company'
  managerId?: string  // untuk scope 'team'
}
```

Mengambil data yang diperlukan, generate CSV client-side, trigger download.

### Employee Components (`src/components/dashboard/employee/`)

#### `WellbeingCheckin`

```tsx
interface WellbeingCheckinProps {
  userId: string
  onSuccess?: () => void
}
```

Form dengan mood picker (5 emoji) dan stress slider (1-10). Cek apakah sudah check-in hari ini sebelum menampilkan form.

#### `QuickTaskAdd`

```tsx
interface QuickTaskAddProps {
  userId: string
  onSuccess?: () => void  // dipanggil setelah task berhasil ditambahkan
}
```

Form dengan title input (min 3 karakter) dan difficulty selector (1-5). Status default "todo".

### Manager Components (`src/components/dashboard/manager/`)

#### `TeamProductivityTable`

```tsx
interface TeamProductivityTableProps {
  managerId: string
  onViewDetail?: (memberId: string) => void
}
```

Tabel anggota tim dengan kolom: nama, rata-rata score, total tasks selesai, rata-rata mood. Tombol "Lihat Detail" per baris.

#### `BurnoutAlertList`

```tsx
interface BurnoutAlertListProps {
  managerId: string
  onViewDetail?: (memberId: string) => void
}
```

Daftar anggota dengan mood < 3 DAN jam kerja > 40 jam/7 hari, diurutkan mood ascending.

#### `TeamMoodTrendChart`

```tsx
interface TeamMoodTrendChartProps {
  managerId: string
}
```

Line chart recharts, responsif dengan `ResponsiveContainer`. Di-lazy-load dengan `next/dynamic({ ssr: false })`.

### Admin Components (`src/components/dashboard/admin/`)

#### `CompanyOverview`

```tsx
interface CompanyOverviewProps {
  // no props — fetches all company data internally
}
```

3 metric cards: total karyawan (role employee/manager), rata-rata productivity score, total tasks selesai hari ini.

#### `DepartmentBreakdown`

```tsx
interface DepartmentBreakdownProps {
  // no props — fetches all department data internally
}
```

Tabel per departemen: nama, jumlah karyawan, rata-rata mood 7 hari.

---

## Data Models

### TypeScript Types (`src/types/dashboard.ts`)

```typescript
// Database row types
export interface Profile {
  id: string
  full_name: string
  role: 'employee' | 'manager' | 'admin'
  department: string | null
  manager_id: string | null
}

export interface Task {
  id: string
  user_id: string
  title: string
  status: 'todo' | 'doing' | 'done'
  difficulty: 1 | 2 | 3 | 4 | 5
  total_duration: number  // menit
  completed_at: string | null
  created_at: string
}

export interface WellbeingLog {
  id: string
  user_id: string
  mood_score: 1 | 2 | 3 | 4 | 5
  stress_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  notes: string | null
  created_at: string  // date string YYYY-MM-DD
}

// Computed/aggregated types
export interface ProductivityScore {
  score: number  // 0-100
  color: 'red' | 'yellow' | 'green'
  tasksCompleted: number
  avgDifficulty: number
  hoursWorked: number
}

export interface TeamMember {
  profile: Profile
  avgScore: number
  tasksCompleted: number
  avgMood: number
  totalHoursWorked: number
}

export interface BurnoutAlert {
  profile: Profile
  currentMood: number
  totalHoursWorked: number
}

export interface MoodTrendPoint {
  date: string  // DD/MM
  avgMood: number
}

export interface DepartmentStats {
  department: string
  employeeCount: number
  avgMood: number
}

export interface CompanyStats {
  totalEmployees: number
  avgProductivityScore: number
  tasksCompletedToday: number
}

// Component state types
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}
```

### Utility Functions (`src/lib/dashboard/`)

Semua fungsi kalkulasi dipisahkan ke `src/lib/dashboard/calculations.ts` sebagai pure functions:

```typescript
// src/lib/dashboard/calculations.ts

export function calculateProductivityScore(
  tasks: Task[],
  periodDays: number = 7
): ProductivityScore

export function calculateStreak(logs: WellbeingLog[]): number

export function getScoreColor(score: number): 'red' | 'yellow' | 'green'

export function getInitials(fullName: string): string

export function isBurnoutRisk(member: TeamMember): boolean

export function aggregateMoodByDay(
  logs: WellbeingLog[],
  days: number = 7
): MoodTrendPoint[]

export function aggregateByDepartment(
  profiles: Profile[],
  logs: WellbeingLog[]
): DepartmentStats[]

export function generateTeamCSV(members: TeamMember[]): string

export function generateCompanyCSV(
  stats: CompanyStats,
  departments: DepartmentStats[],
  members: TeamMember[]
): string

export function downloadCSV(content: string, filename: string): void
```

### Supabase Queries (`src/lib/dashboard/queries.ts`)

Query functions yang menggunakan `supabase` client:

```typescript
// Mengambil profil pengguna saat ini
export async function fetchCurrentProfile(userId: string): Promise<Profile>

// Mengambil tasks user dalam N hari terakhir
export async function fetchUserTasks(userId: string, days: number): Promise<Task[]>

// Mengambil wellbeing logs user dalam N hari terakhir
export async function fetchUserWellbeingLogs(userId: string, days: number): Promise<WellbeingLog[]>

// Mengambil semua anggota tim (direct reports) seorang manager
export async function fetchTeamMembers(managerId: string): Promise<Profile[]>

// Mengambil semua karyawan (untuk admin)
export async function fetchAllEmployees(): Promise<Profile[]>

// Mengambil wellbeing logs untuk array user IDs
export async function fetchTeamWellbeingLogs(userIds: string[], days: number): Promise<WellbeingLog[]>

// Mengambil tasks untuk array user IDs
export async function fetchTeamTasks(userIds: string[], days: number): Promise<Task[]>

// Insert wellbeing log baru
export async function insertWellbeingLog(log: Omit<WellbeingLog, 'id'>): Promise<void>

// Insert task baru
export async function insertTask(task: Omit<Task, 'id' | 'created_at'>): Promise<void>
```

### CSS Variables Update (`src/app/globals.css`)

Dashboard mengikuti tema yang sudah didefinisikan di `src/app/globals.css`. Tidak ada perubahan baru pada CSS variables.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Productivity Score Bounds

*For any* valid set of completed tasks (varying count, difficulty 1-5, duration in minutes), the calculated productivity score SHALL always be a number in the range [0, 100].

**Validates: Requirements 2.2**

### Property 2: Score Color Classification

*For any* numeric score in [0, 100], the `getScoreColor` function SHALL return exactly one of: `'red'` when score < 40, `'yellow'` when 40 ≤ score ≤ 70, `'green'` when score > 70. No score value shall produce an unclassified result.

**Validates: Requirements 2.3**

### Property 3: Initials Extraction

*For any* non-empty `full_name` string, `getInitials` SHALL return a string of exactly 2 characters, both uppercase.

**Validates: Requirements 1.2**

### Property 4: Streak Calculation Correctness

*For any* array of `wellbeing_log` dates, `calculateStreak` SHALL return the count of the longest consecutive-day sequence ending on or before today. If today's date is absent from the logs, the streak SHALL be 0.

**Validates: Requirements 3.2, 3.3**

### Property 5: Burnout Filter Correctness

*For any* array of `TeamMember` objects with varying mood and hours values, the burnout filter SHALL include a member if and only if their `currentMood < 3` AND `totalHoursWorked > 40`. No member outside these criteria shall appear in the result.

**Validates: Requirements 9.1, 9.2**

### Property 6: Burnout List Sort Order

*For any* non-empty list of burnout alerts, the sorted result SHALL have mood values in non-decreasing order (lowest mood first).

**Validates: Requirements 9.4**

### Property 7: Mood Trend Aggregation

*For any* array of `wellbeing_log` entries spanning up to 7 days, `aggregateMoodByDay` SHALL return at most 7 data points, each with a unique date key, and each `avgMood` value SHALL equal the arithmetic mean of all mood scores for that date.

**Validates: Requirements 10.2**

### Property 8: Employee Count Accuracy

*For any* array of `Profile` objects with varying roles, the company employee count SHALL equal the number of profiles where `role === 'employee' || role === 'manager'`. Profiles with `role === 'admin'` SHALL NOT be counted.

**Validates: Requirements 13.2**

### Property 9: Task Title Validation

*For any* string input to the Quick Task Add form, the validation SHALL accept the input if and only if the trimmed string length is ≥ 3. Strings of length < 3 (including whitespace-only strings) SHALL be rejected.

**Validates: Requirements 6.2**

### Property 10: Role-Based Dashboard Rendering

*For any* valid role value in `{'employee', 'manager', 'admin'}`, the dashboard page SHALL render exactly the component corresponding to that role and SHALL NOT render components belonging to other roles.

**Validates: Requirements 17.2**

### Property 11: CSV Export Completeness

*For any* valid team export dataset, the generated CSV string SHALL contain all required headers (Nama, Departemen, Rata-rata Score, Total Tasks, Rata-rata Mood, Total Jam Kerja) and SHALL have exactly one data row per team member.

**Validates: Requirements 15**

---

## Error Handling

### Strategy

Setiap komponen yang melakukan data fetching menggunakan pola `AsyncState<T>`:

```typescript
const [state, setState] = useState<AsyncState<T>>({
  data: null,
  loading: true,
  error: null,
})
```

### Error Messages (Bahasa Indonesia)

| Kondisi | Pesan |
|---|---|
| Network error | "Gagal memuat data. Periksa koneksi internet Anda." |
| Supabase auth error | "Sesi Anda telah berakhir. Silakan login kembali." |
| Data not found | "Data tidak ditemukan." |
| Insert failed | "Gagal menyimpan data. Silakan coba lagi." |
| Role not found | "Role pengguna tidak ditemukan. Mengarahkan ke halaman login..." |
| Repeated errors | "Terjadi kesalahan berulang. Silakan refresh halaman atau hubungi support." |

### Retry Logic

Setiap komponen menyimpan fungsi fetch-nya dalam `useCallback` sehingga dapat dipanggil ulang dari tombol retry:

```typescript
const fetchData = useCallback(async () => {
  setState(prev => ({ ...prev, loading: true, error: null }))
  try {
    const data = await queryFunction()
    setState({ data, loading: false, error: null })
  } catch (err) {
    setState({ data: null, loading: false, error: getErrorMessage(err) })
  }
}, [dependencies])

useEffect(() => { fetchData() }, [fetchData])
```

### Role Detection Error

Jika role tidak ditemukan atau invalid di `profiles`, `DashboardPage` menampilkan `ErrorState` dengan pesan dan memanggil `router.push('/login')` setelah 3 detik.

---

## Testing Strategy

### Unit Tests (Vitest)

Fokus pada pure functions di `src/lib/dashboard/calculations.ts`:

- `calculateProductivityScore` — formula correctness, boundary values
- `calculateStreak` — consecutive days, gap detection, today-absent case
- `getScoreColor` — boundary values (39, 40, 70, 71)
- `getInitials` — single word, two words, more than two words
- `isBurnoutRisk` — all four combinations of mood/hours criteria
- `aggregateMoodByDay` — grouping, averaging, 7-day limit
- `aggregateByDepartment` — grouping, counting, averaging
- `generateTeamCSV` / `generateCompanyCSV` — header presence, row count

### Property-Based Tests (fast-check)

Library: **fast-check** (TypeScript-native, tidak perlu setup tambahan).

Setiap property test dikonfigurasi minimum **100 iterasi** (default fast-check).

Tag format: `// Feature: nextjs-dashboard-rbac, Property N: <property_text>`

```typescript
// Contoh: Property 1
import fc from 'fast-check'
import { calculateProductivityScore } from '@/lib/dashboard/calculations'

// Feature: nextjs-dashboard-rbac, Property 1: Productivity Score Bounds
test('productivity score always in [0, 100]', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          status: fc.constant('done'),
          difficulty: fc.integer({ min: 1, max: 5 }),
          total_duration: fc.integer({ min: 0, max: 480 }),
        })
      ),
      (tasks) => {
        const result = calculateProductivityScore(tasks as Task[])
        return result.score >= 0 && result.score <= 100
      }
    )
  )
})
```

Properties yang diimplementasikan sebagai property-based tests:
- Property 1: Productivity Score Bounds
- Property 2: Score Color Classification
- Property 3: Initials Extraction
- Property 4: Streak Calculation Correctness
- Property 5: Burnout Filter Correctness
- Property 6: Burnout List Sort Order
- Property 7: Mood Trend Aggregation
- Property 8: Employee Count Accuracy
- Property 9: Task Title Validation
- Property 10: Role-Based Dashboard Rendering
- Property 11: CSV Export Completeness

### Integration Tests

- Supabase query functions dengan Supabase local dev atau mock client
- Logout flow: `signOut` dipanggil → redirect ke `/login`
- Wellbeing check-in insert: data tersimpan dengan benar
- Quick task add insert: task tersimpan dengan status "todo"

### Component Tests (React Testing Library)

- Loading skeleton muncul saat `loading: true`
- Error state + retry button muncul saat `error` tidak null
- Mood emoji picker menampilkan 5 opsi
- Status badge menampilkan warna yang benar per status
- Double check-in prevention: form disabled jika sudah check-in hari ini

### Accessibility

- Semua interactive elements memiliki ARIA labels
- Color contrast diverifikasi manual (WCAG AA, minimal 4.5:1)
- Keyboard navigation diuji manual

### Responsive Design

Diuji manual di:
- Mobile: 320px
- Tablet: 768px
- Desktop: 1024px+
