# Requirements Document: Next.js Dashboard dengan Role-Based Views

## Introduction

Dashboard adalah halaman utama aplikasi MindWork yang menampilkan informasi dan metrik yang relevan berdasarkan peran pengguna (Employee, Manager, Admin). Setiap role memiliki views yang disesuaikan dengan kebutuhan bisnis mereka. Employee melihat produktivitas pribadi dan wellbeing, Manager melihat tim mereka, dan Admin melihat overview perusahaan.

## Glossary

- **Dashboard**: Halaman utama yang menampilkan informasi dan metrik berdasarkan role pengguna
- **Role**: Peran pengguna dalam sistem (Employee, Manager, Admin)
- **Employee**: Pengguna dengan role karyawan yang melihat data pribadi
- **Manager**: Pengguna dengan role manajer yang melihat data tim mereka
- **Admin**: Pengguna dengan role administrator yang melihat data seluruh perusahaan
- **Productivity_Score**: Skor produktivitas dihitung dengan formula: ((total_tasks_done * avg_difficulty) / (total_hours_worked + 0.01)) * 10, max 100
- **Streak**: Jumlah hari berturut-turut pengguna mengisi wellbeing_logs
- **Wellbeing_Check-in**: Pencatatan mood (1-5) dan stress level (1-10) harian
- **Mood**: Tingkat suasana hati pengguna pada skala 1-5
- **Stress_Level**: Tingkat stres pengguna pada skala 1-10
- **Burnout_Alert**: Kondisi ketika mood < 3 dan total jam kerja > 40 jam dalam 7 hari terakhir
- **Team_Productivity_Heatmap**: Visualisasi data produktivitas anggota tim
- **Team_Mood_Trend**: Grafik tren mood rata-rata tim selama 7 hari terakhir
- **Company_Overview**: Ringkasan metrik perusahaan (total karyawan, rata-rata score, total tasks)
- **Department_Breakdown**: Analisis data per departemen
- **CSV_Export**: File data yang dapat diunduh dalam format CSV
- **Loading_Skeleton**: Placeholder visual saat data sedang dimuat
- **Error_Handling**: Mekanisme penanganan error dengan pesan ramah dan tombol retry

---

## Requirements

### Requirement 1: Employee Dashboard Header

**User Story:** Sebagai seorang karyawan, saya ingin melihat header dengan informasi profil saya, sehingga saya dapat dengan mudah mengidentifikasi akun saya dan logout.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan header dengan nama pengguna, avatar (inisial), dan tombol logout
2. THE Avatar SHALL menampilkan dua huruf pertama dari nama pengguna dalam format uppercase
3. WHEN pengguna mengklik tombol logout, THE System SHALL menghapus session dan redirect ke halaman login
4. THE Header SHALL responsif dan terlihat baik di semua ukuran layar (mobile, tablet, desktop)

---

### Requirement 2: Productivity Score Card

**User Story:** Sebagai seorang karyawan, saya ingin melihat skor produktivitas saya untuk 7 hari terakhir, sehingga saya dapat melacak performa kerja saya.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Productivity_Score_Card dengan skor dihitung dari 7 hari terakhir
2. THE Productivity_Score SHALL dihitung menggunakan formula: ((total_tasks_done * avg_difficulty) / (total_hours_worked + 0.01)) * 10, dengan maksimum 100
3. THE Card SHALL menampilkan warna merah jika score < 40, kuning jika 40-70, dan hijau jika > 70
4. THE Card SHALL menampilkan score dalam format angka dan persentase visual (progress bar)
5. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Productivity_Score_Card
6. IF terjadi error saat mengambil data, THE Dashboard SHALL menampilkan pesan error dengan tombol retry

---

### Requirement 3: Streak Card

**User Story:** Sebagai seorang karyawan, saya ingin melihat streak hari berturut-turut saya mengisi wellbeing check-in, sehingga saya termotivasi untuk konsisten.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Streak_Card dengan emoji 🔥 dan jumlah hari berturut-turut
2. THE Streak SHALL dihitung berdasarkan jumlah hari berturut-turut pengguna mengisi wellbeing_logs tanpa ada hari yang terlewat
3. IF pengguna tidak mengisi wellbeing check-in hari ini, THE Streak SHALL direset ke 0
4. THE Card SHALL menampilkan streak dalam format visual yang menarik dengan emoji
5. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Streak_Card

---

### Requirement 4: Daily Wellbeing Check-in

**User Story:** Sebagai seorang karyawan, saya ingin mengisi mood dan stress level saya setiap hari, sehingga saya dapat melacak kesejahteraan mental saya.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Daily_Wellbeing_Check-in form dengan input mood (1-5) dan stress level (1-10)
2. THE Mood_Input SHALL menampilkan 5 emoji atau angka yang dapat dipilih (1=😢, 2=😕, 3=😐, 4=🙂, 5=😄)
3. THE Stress_Input SHALL menampilkan slider dari 1-10 dengan label visual
4. WHEN pengguna sudah mengisi check-in hari ini, THE System SHALL mencegah double entry dan menampilkan pesan "Anda sudah mengisi check-in hari ini"
5. WHEN pengguna mengklik tombol submit, THE System SHALL menyimpan data ke wellbeing_logs dan menampilkan pesan sukses
6. IF terjadi error saat menyimpan, THE System SHALL menampilkan pesan error dengan tombol retry
7. WHILE data sedang disimpan, THE Submit_Button SHALL menampilkan loading state

---

### Requirement 5: Recent Tasks Table

**User Story:** Sebagai seorang karyawan, saya ingin melihat 5 task terbaru saya, sehingga saya dapat dengan cepat melihat pekerjaan apa yang sedang saya kerjakan.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Recent_Tasks_Table dengan 5 tasks terbaru
2. THE Table SHALL menampilkan kolom: title, status, dan difficulty
3. THE Status SHALL ditampilkan sebagai badge dengan warna berbeda (todo=gray, in_progress=blue, done=green)
4. THE Difficulty SHALL ditampilkan sebagai angka 1-5 dengan visual indicator (bintang atau bar)
5. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Recent_Tasks_Table
6. IF tidak ada tasks, THE Table SHALL menampilkan pesan "Tidak ada tasks"

---

### Requirement 6: Quick Task Add

**User Story:** Sebagai seorang karyawan, saya ingin menambahkan task baru dengan cepat dari dashboard, sehingga saya dapat langsung mencatat pekerjaan baru.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Quick_Task_Add form dengan input title dan difficulty
2. THE Title_Input SHALL menerima teks dengan validasi minimal 3 karakter
3. THE Difficulty_Input SHALL menampilkan dropdown atau radio buttons dengan pilihan 1-5
4. THE Status SHALL default ke "todo" dan tidak dapat diubah di form ini
5. WHEN pengguna mengklik tombol submit, THE System SHALL menyimpan task ke database dan menampilkan pesan sukses
6. WHEN task berhasil ditambahkan, THE Recent_Tasks_Table SHALL di-refresh untuk menampilkan task baru
7. IF terjadi error saat menyimpan, THE System SHALL menampilkan pesan error dengan tombol retry
8. WHILE data sedang disimpan, THE Submit_Button SHALL menampilkan loading state

---

### Requirement 7: Manager Dashboard Header

**User Story:** Sebagai seorang manajer, saya ingin melihat header dengan informasi profil saya dan badge "Manager", sehingga saya dapat dengan mudah mengidentifikasi role saya.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan header dengan nama pengguna, avatar, badge "Manager", dan tombol logout
2. THE Badge SHALL menampilkan teks "Manager" dengan styling yang jelas
3. WHEN pengguna mengklik tombol logout, THE System SHALL menghapus session dan redirect ke halaman login
4. THE Header SHALL responsif dan terlihat baik di semua ukuran layar

---

### Requirement 8: Team Productivity Heatmap

**User Story:** Sebagai seorang manajer, saya ingin melihat produktivitas anggota tim saya dalam satu tampilan, sehingga saya dapat mengidentifikasi siapa yang perlu dukungan.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Team_Productivity_Heatmap dengan daftar anggota tim
2. THE Heatmap SHALL menampilkan kolom: nama, rata-rata score, total tugas selesai, rata-rata mood
3. THE Rata-rata_Score SHALL dihitung dari Productivity_Score 7 hari terakhir
4. THE Total_Tugas_Selesai SHALL menampilkan jumlah tasks dengan status "done" dalam 7 hari terakhir
5. THE Rata-rata_Mood SHALL dihitung dari wellbeing_logs 7 hari terakhir
6. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Team_Productivity_Heatmap
7. IF tidak ada anggota tim, THE Heatmap SHALL menampilkan pesan "Tidak ada anggota tim"

---

### Requirement 9: Burnout Alert List

**User Story:** Sebagai seorang manajer, saya ingin melihat anggota tim yang berisiko burnout, sehingga saya dapat memberikan dukungan proaktif.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Burnout_Alert_List dengan anggota tim yang memenuhi kriteria Burnout_Alert
2. THE Burnout_Alert_List SHALL menampilkan anggota dengan mood < 3 DAN total jam kerja > 40 jam dalam 7 hari terakhir
3. THE List SHALL menampilkan nama, mood saat ini, total jam kerja, dan tombol "Lihat Detail"
4. THE List SHALL diurutkan berdasarkan tingkat risiko (mood terendah terlebih dahulu)
5. IF tidak ada anggota yang berisiko burnout, THE List SHALL menampilkan pesan "Tidak ada alert burnout"
6. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Burnout_Alert_List

---

### Requirement 10: Team Mood Trend Chart

**User Story:** Sebagai seorang manajer, saya ingin melihat tren mood tim selama 7 hari terakhir, sehingga saya dapat memahami kesejahteraan tim secara keseluruhan.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Team_Mood_Trend chart dengan line chart menggunakan recharts
2. THE Chart SHALL menampilkan rata-rata mood tim per hari untuk 7 hari terakhir
3. THE X-axis SHALL menampilkan tanggal (format: DD/MM)
4. THE Y-axis SHALL menampilkan skala mood 1-5
5. THE Chart SHALL responsif dan menyesuaikan ukuran dengan container
6. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Team_Mood_Trend_Chart

---

### Requirement 11: Manager View Detail Button

**User Story:** Sebagai seorang manajer, saya ingin melihat detail lengkap anggota tim, sehingga saya dapat memahami performa dan kesejahteraan mereka lebih dalam.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Lihat Detail" di Team_Productivity_Heatmap atau Burnout_Alert_List, THE System SHALL navigate ke halaman `/dashboard/team/[id]` dengan `[id]` adalah UUID anggota tim.
2. THE Detail_Page SHALL menampilkan informasi lengkap: nama, role, department, rata-rata productivity score (7 hari), total tasks selesai (7 hari), mood trend chart (line chart, 7 hari), stress trend chart (line chart, 7 hari), dan 5 tasks terbaru milik anggota tersebut.
3. THE Detail_Page SHALL memiliki tombol "Kembali ke Dashboard" yang mengarah ke `/dashboard`.
4. WHILE data sedang dimuat, THE Detail_Page SHALL menampilkan loading skeleton untuk setiap section.
5. IF terjadi error, tampilkan pesan error dan tombol retry.

---

### Requirement 12: Admin Dashboard Header

**User Story:** Sebagai seorang admin, saya ingin melihat header dengan informasi profil saya dan badge "Admin", sehingga saya dapat dengan mudah mengidentifikasi role saya.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan header dengan nama pengguna, avatar, badge "Admin", dan tombol logout
2. THE Badge SHALL menampilkan teks "Admin" dengan styling yang jelas
3. WHEN pengguna mengklik tombol logout, THE System SHALL menghapus session dan redirect ke halaman login
4. THE Header SHALL responsif dan terlihat baik di semua ukuran layar

---

### Requirement 13: Company Overview

**User Story:** Sebagai seorang admin, saya ingin melihat overview perusahaan dengan metrik utama, sehingga saya dapat memahami kesehatan organisasi secara keseluruhan.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Company_Overview dengan 3 metrik utama: total karyawan, rata-rata productivity score, total tasks selesai hari ini
2. THE Total_Karyawan SHALL menghitung jumlah pengguna dengan role "employee" atau "manager"
3. THE Rata-rata_Productivity_Score SHALL dihitung dari semua pengguna untuk 7 hari terakhir
4. THE Total_Tasks_Selesai_Hari_Ini SHALL menghitung jumlah tasks dengan status "done" yang dibuat hari ini
5. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Company_Overview

---

### Requirement 14: Department Breakdown

**User Story:** Sebagai seorang admin, saya ingin melihat breakdown data per departemen, sehingga saya dapat mengidentifikasi departemen mana yang perlu perhatian.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE Dashboard SHALL menampilkan Department_Breakdown dengan daftar departemen
2. THE Breakdown SHALL menampilkan kolom: nama departemen, jumlah karyawan, rata-rata mood
3. THE Jumlah_Karyawan SHALL menghitung pengguna yang memiliki department field sesuai dengan departemen tersebut
4. THE Rata-rata_Mood SHALL dihitung dari wellbeing_logs 7 hari terakhir untuk semua pengguna di departemen
5. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk Department_Breakdown
6. IF tidak ada departemen, THE Breakdown SHALL menampilkan pesan "Tidak ada departemen"

---

### Requirement 15: CSV Export

**User Story:** Sebagai seorang admin dan manager, saya ingin mengekspor data summary ke CSV, sehingga saya dapat menganalisis data lebih lanjut di tools lain.

#### Acceptance Criteria

**Untuk Admin:**
- Admin SHALL memiliki tombol "Export CSV (Perusahaan)" di bagian Company Overview.
- File CSV berisi: Company Overview (total karyawan, rata-rata score, total tasks hari ini), Department Breakdown (nama departemen, jumlah karyawan, rata-rata mood), Team Productivity Heatmap (nama, departemen, rata-rata score, total tasks, rata-rata mood) untuk semua karyawan.
- Nama file: `mindwork_export_YYYY-MM-DD.csv`

**Untuk Manager:**
- Manager SHALL memiliki tombol "Export CSV (Tim)" di bagian Team Productivity Heatmap.
- File CSV berisi data tim bawahannya: nama, departemen, rata-rata score, total tasks selesai (7 hari), rata-rata mood, total jam kerja (7 hari).
- Nama file: `mindwork_team_export_YYYY-MM-DD.csv`

**Ketentuan teknis export (untuk kedua role):**
- CSV di-generate client-side (manual atau dengan library seperti `papaparse`).
- File langsung diunduh, encoding UTF-8.
- Header dalam bahasa Indonesia.

---

### Requirement 16: Admin Dashboard Features

**User Story:** Sebagai seorang admin, saya ingin memiliki akses ke semua fitur manager, sehingga saya dapat melihat data tim jika diperlukan.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat dengan role admin, THE Dashboard SHALL menampilkan semua fitur manager (Team_Productivity_Heatmap, Burnout_Alert_List, Team_Mood_Trend_Chart)
2. THE Admin_Dashboard SHALL menampilkan fitur admin di atas fitur manager
3. THE Admin_Dashboard SHALL memiliki tab atau section yang jelas untuk membedakan fitur admin dan manager

---

### Requirement 17: Role Detection

**User Story:** Sebagai sistem, saya ingin mendeteksi role pengguna dari database, sehingga saya dapat menampilkan dashboard yang sesuai.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman dashboard, THE System SHALL mengambil role dari tabel profiles berdasarkan user ID
2. THE System SHALL conditional render dashboard berdasarkan role (employee, manager, admin)
3. IF role tidak ditemukan atau invalid, THE System SHALL menampilkan pesan error dan redirect ke halaman login
4. THE Role_Detection SHALL terjadi saat halaman dimuat (server-side atau client-side dengan useEffect)

---

### Requirement 18: Data Fetching dan State Management

**User Story:** Sebagai sistem, saya ingin mengambil data dari Supabase dengan efisien, sehingga dashboard dapat menampilkan informasi terkini.

#### Acceptance Criteria

1. WHEN halaman dashboard dimuat, THE System SHALL menggunakan useEffect dan useState untuk mengambil data dari Supabase
2. THE System SHALL menampilkan Loading_Skeleton saat data sedang dimuat
3. THE System SHALL cache data untuk mengurangi request yang tidak perlu
4. IF terjadi error saat mengambil data, THE System SHALL menampilkan pesan error dengan tombol retry
5. WHEN pengguna mengklik tombol retry, THE System SHALL mengambil data ulang dari Supabase

---

### Requirement 19: Loading Skeleton

**User Story:** Sebagai pengguna, saya ingin melihat placeholder visual saat data sedang dimuat, sehingga saya tahu bahwa aplikasi sedang memproses.

#### Acceptance Criteria

1. WHILE data sedang dimuat, THE Dashboard SHALL menampilkan Loading_Skeleton untuk setiap section
2. THE Loading_Skeleton SHALL memiliki animasi yang smooth dan menarik
3. THE Loading_Skeleton SHALL memiliki ukuran dan bentuk yang mirip dengan konten asli
4. THE Loading_Skeleton SHALL menggunakan Tailwind CSS untuk styling

---

### Requirement 20: Error Handling

**User Story:** Sebagai pengguna, saya ingin melihat pesan error yang ramah dan jelas, sehingga saya tahu apa yang salah dan bagaimana cara memperbaikinya.

#### Acceptance Criteria

1. IF terjadi error saat mengambil data, THE System SHALL menampilkan pesan error dalam bahasa Indonesia yang ramah
2. THE Error_Message SHALL menjelaskan apa yang salah dan saran untuk memperbaikinya
3. THE Error_Message SHALL menampilkan tombol retry untuk mencoba lagi
4. IF error terjadi berkali-kali, THE System SHALL menampilkan pesan "Silakan refresh halaman atau hubungi support"
5. THE Error_Handling SHALL tidak menampilkan technical error messages kepada pengguna

---

### Requirement 21: Component Structure

**User Story:** Sebagai developer, saya ingin komponen dashboard terstruktur dengan baik, sehingga saya dapat dengan mudah maintain dan scale aplikasi.

#### Acceptance Criteria

1. THE Dashboard_Components SHALL terletak di src/components/dashboard/role/ dengan subfolder: employee, manager, admin
2. THE Reusable_Components SHALL terletak di src/components/dashboard/shared/ (ProductivityScore, StreakCard, WellbeingCheckin, dll)
3. THE Main_Dashboard_Page SHALL hanya melakukan conditional rendering berdasarkan role
4. EACH Component SHALL memiliki TypeScript types yang jelas
5. EACH Component SHALL memiliki prop validation menggunakan TypeScript interfaces

---

### Requirement 22: Responsive Design

**User Story:** Sebagai pengguna, saya ingin dashboard terlihat baik di semua ukuran layar, sehingga saya dapat mengakses dari perangkat apa pun.

#### Acceptance Criteria

1. THE Dashboard SHALL responsif di mobile (320px), tablet (768px), dan desktop (1024px+)
2. THE Dashboard SHALL menggunakan Tailwind CSS responsive classes (sm:, md:, lg:, xl:)
3. THE Charts SHALL menyesuaikan ukuran dengan container
4. THE Tables SHALL scrollable horizontally di mobile
5. THE Buttons_dan_Inputs SHALL memiliki ukuran yang cukup untuk touch di mobile (minimal 44px)

---

### Requirement 23: Chart Responsiveness

**User Story:** Sebagai pengguna, saya ingin chart terlihat baik di semua ukuran layar, sehingga saya dapat membaca data dengan jelas.

#### Acceptance Criteria

1. THE Charts SHALL menggunakan recharts library
2. THE Charts SHALL responsif dan menyesuaikan ukuran dengan container
3. THE Charts SHALL menampilkan tooltip saat hover
4. THE Charts SHALL memiliki legend yang jelas
5. THE Charts SHALL menggunakan warna yang konsisten dengan design system

---

### Requirement 24: CSV Export Format

**User Story:** Sebagai admin, saya ingin file CSV yang diexport memiliki format yang rapi dan mudah dibaca, sehingga saya dapat menganalisis data dengan mudah.

#### Acceptance Criteria

1. THE CSV_File SHALL memiliki header yang jelas dan deskriptif
2. THE CSV_File SHALL memiliki data yang terstruktur dengan baik
3. THE CSV_File SHALL menggunakan encoding UTF-8 untuk mendukung karakter Indonesia
4. THE CSV_File SHALL dapat dibuka di Excel, Google Sheets, atau tools lain
5. THE CSV_File SHALL memiliki format tanggal yang konsisten (YYYY-MM-DD)

---

### Requirement 25: Design System Compliance

**User Story:** Sebagai developer, saya ingin dashboard mengikuti design system yang sudah ada, sehingga aplikasi terlihat konsisten.

#### Acceptance Criteria

1. THE Dashboard SHALL menggunakan font Montserrat sebagai primary font
2. THE Dashboard SHALL menggunakan warna teal sebagai primary color
3. THE Dashboard SHALL menggunakan komponen shadcn/ui yang sudah tersedia
4. THE Dashboard SHALL menggunakan Tailwind CSS untuk styling
5. THE Dashboard SHALL mengikuti spacing dan sizing conventions yang sudah ada

---

### Requirement 26: TypeScript Compliance

**User Story:** Sebagai developer, saya ingin semua kode menggunakan TypeScript dengan type safety yang ketat, sehingga saya dapat menghindari bugs.

#### Acceptance Criteria

1. ALL Components SHALL ditulis dalam TypeScript
2. ALL Props SHALL memiliki TypeScript interfaces atau types
3. ALL Functions SHALL memiliki return types yang jelas
4. ALL Data_dari_Supabase SHALL memiliki types yang didefinisikan
5. THE tsconfig.json SHALL menggunakan strict mode

---

### Requirement 27: Accessibility Compliance

**User Story:** Sebagai pengguna dengan kebutuhan aksesibilitas, saya ingin dashboard dapat diakses dengan screen reader dan keyboard, sehingga saya dapat menggunakan aplikasi dengan nyaman.

#### Acceptance Criteria

1. ALL Interactive_Elements SHALL memiliki proper ARIA labels
2. ALL Buttons_dan_Links SHALL dapat diakses dengan keyboard (Tab, Enter)
3. ALL Form_Inputs SHALL memiliki associated labels
4. ALL Images_dan_Icons SHALL memiliki alt text atau aria-label
5. THE Color_Contrast SHALL memenuhi WCAG AA standards (minimal 4.5:1 untuk text)

---

### Requirement 28: Performance Optimization

**User Story:** Sebagai pengguna, saya ingin dashboard memuat dengan cepat, sehingga saya dapat langsung melihat informasi yang saya butuhkan.

#### Acceptance Criteria

1. THE Dashboard SHALL menggunakan React.memo untuk komponen yang tidak perlu re-render
2. THE Dashboard SHALL menggunakan useMemo untuk expensive calculations
3. THE Dashboard SHALL menggunakan useCallback untuk event handlers
4. THE Data_Fetching SHALL menggunakan pagination atau limit untuk mengurangi data yang diambil
5. THE Images SHALL dioptimasi menggunakan Next.js Image component

---

## Technical Constraints

- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase
- **Database**: Tabel profiles, tasks, wellbeing_logs sudah tersedia
- **Auth**: Middleware dan Supabase client sudah tersedia
- **Font**: Montserrat (primary)
- **Primary Color**: Teal
- **Data Fetching**: useEffect + useState (client-side)
- **Charts**: recharts library
- **Component Structure**: src/components/dashboard/role/ dan src/components/dashboard/shared/
- **Styling**: Tailwind CSS + shadcn/ui
- **Export**: CSV format dengan encoding UTF-8
- **Responsiveness**: Mobile-first approach dengan Tailwind responsive classes
- **Accessibility**: WCAG AA compliance
- **Performance**: React optimization hooks (memo, useMemo, useCallback)

---

## Glossary Definitions

### Data Calculations

**Productivity Score Formula:**
```
score = ((total_tasks_done * avg_difficulty) / (total_hours_worked + 0.01)) * 10
max_score = 100
```

**Streak Calculation:**
- Hitung jumlah hari berturut-turut pengguna mengisi wellbeing_logs
- Jika ada hari yang terlewat, reset ke 0
- Hitung dari tanggal terbaru ke belakang

**Burnout Alert Criteria:**
- mood < 3 (dari wellbeing_logs 7 hari terakhir)
- total_hours_worked > 40 jam dalam 7 hari terakhir

**Team Metrics:**
- Rata-rata score: average dari Productivity_Score semua anggota tim
- Total tasks selesai: count tasks dengan status "done" dalam periode tertentu
- Rata-rata mood: average dari mood di wellbeing_logs

### Color Coding

**Productivity Score Colors:**
- Red: score < 40
- Yellow: score 40-70
- Green: score > 70

**Status Badge Colors:**
- Gray: todo
- Blue: in_progress
- Green: done

**Mood Emoji:**
- 1: 😢 (very sad)
- 2: 😕 (sad)
- 3: 😐 (neutral)
- 4: 🙂 (happy)
- 5: 😄 (very happy)
