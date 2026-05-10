# Implementation Tasks: Next.js Dashboard dengan Role-Based Views

## Tasks

- [x] 1. Setup foundation — types, utilities, dan queries
  - [x] 1.1 Buat `src/types/dashboard.ts` dengan semua TypeScript interfaces
  - [x] 1.2 Buat `src/lib/dashboard/calculations.ts` dengan pure functions kalkulasi
  - [x] 1.3 Buat `src/lib/dashboard/queries.ts` dengan Supabase query functions

- [x] 2. Shared components
  - [x] 2.1 Buat `src/components/dashboard/shared/loading-skeleton.tsx`
  - [x] 2.2 Buat `src/components/dashboard/shared/error-state.tsx`
  - [x] 2.3 Buat `src/components/dashboard/shared/dashboard-header.tsx`
  - [x] 2.4 Buat `src/components/dashboard/shared/productivity-score-card.tsx`
  - [x] 2.5 Buat `src/components/dashboard/shared/streak-card.tsx`
  - [x] 2.6 Buat `src/components/dashboard/shared/recent-tasks-table.tsx`
  - [x] 2.7 Buat `src/components/dashboard/shared/export-csv-button.tsx`

- [x] 3. Employee components
  - [x] 3.1 Buat `src/components/dashboard/employee/wellbeing-checkin.tsx`
  - [x] 3.2 Buat `src/components/dashboard/employee/quick-task-add.tsx`
  - [x] 3.3 Buat `src/components/dashboard/employee/employee-dashboard.tsx`

- [x] 4. Manager components
  - [x] 4.1 Buat `src/components/dashboard/manager/team-productivity-table.tsx`
  - [x] 4.2 Buat `src/components/dashboard/manager/burnout-alert-list.tsx`
  - [x] 4.3 Buat `src/components/dashboard/manager/team-mood-trend-chart.tsx`
  - [x] 4.4 Buat `src/components/dashboard/manager/manager-dashboard.tsx`

- [x] 5. Admin components
  - [x] 5.1 Buat `src/components/dashboard/admin/company-overview.tsx`
  - [x] 5.2 Buat `src/components/dashboard/admin/department-breakdown.tsx`
  - [x] 5.3 Buat `src/components/dashboard/admin/admin-dashboard.tsx`

- [x] 6. Dashboard pages
  - [x] 6.1 Update `src/app/dashboard/page.tsx` dengan role detection dan conditional rendering
  - [x] 6.2 Buat `src/app/dashboard/team/[id]/page.tsx` untuk halaman detail anggota tim
