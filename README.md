# 🧠 MindWork

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-2.x-000000?logo=shadcnui)
![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-7.x-EC5990?logo=reacthookform)
![Zod](https://img.shields.io/badge/Zod-3.x-3068B7?logo=zod)
![Lucide](https://img.shields.io/badge/Lucide-0.x-F56565?logo=lucide)

## 📋 Tentang Project

**MindWork** adalah platform produktivitas & wellbeing untuk tim modern yang membantu perusahaan dalam:

- 📊 **Monitoring produktivitas karyawan** dengan Productivity Score
- ❤️ **Tracking kesehatan mental** melalui daily wellbeing check-in
- 👥 **Manajemen tim** dengan role-based dashboard (Employee, Manager, Admin)
- 🚨 **Deteksi burnout dini** berbasis data (mood + jam kerja)
- 📈 **Analytics & Reporting** untuk pengambilan keputusan

## ✨ Fitur Utama

### 🔐 Autentikasi Multi-Role
- Login/Register dengan Supabase Auth
- Role : Employee, Manager, Admin
- Proteksi route dengan middleware

### 📋 Task Management
- 5 status task : Todo, Doing, Blocked, Cancelled, Done
- Start/Stop timer untuk tracking durasi
- Quick task add dari dashboard
- Task deadline, reminder & comment (soon)

### 📊 Dashboard Role-Based
- **Employee** : Productivity Score, Streak, Wellbeing Check-in, Recent Tasks
- **Manager** : Team Productivity Heatmap, Burnout Alert, Mood Trend Chart, Leaderboard
- **Admin** : Company Overview, Department Breakdown, Export CSV/PDF

### 🧠 Wellbeing Tracking
- Daily mood (1-5) dengan emoji
- Stress level (1-10) dengan slider
- Streak chart (hari berturut-turut)
- Burnout alert system

### 📈 Analytics
- Productivity Score formula
- Team Leaderboard
- Export CSV report

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Charts** | Recharts |
| **Form** | React Hook Form, Zod |
| **Icons** | Lucide React |

## 🚀 Cara Menjalankan

```bash
# Clone repository
git clone https://github.com/ViannKia/MindWork.git

# Masuk ke folder project
cd MindWork

# Install dependensi
npm install

# Copy file environment
cp .env.example .env.local

# Setup Supabase
# 1. Buat project di Supabase
# 2. Jalankan migration di SQL Editor
# 3. Isi .env.local dengan:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Jalankan development server
npm run dev

# Build production
npm run build
npm start
```
## 📊 Database Structure

### Tabel `profiles`

| Kolom | Tipe | Keterangan |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `full_name` | TEXT | Nama lengkap |
| `role` | ENUM | `employee` / `manager` / `admin` |
| `department` | TEXT | Departemen |
| `manager_id` | UUID | Foreign key ke `profiles.id` |
| `avatar_url` | TEXT | Foto profil |
| `created_at` | TIMESTAMP | Waktu dibuat |

### Tabel `tasks`

| Kolom | Tipe | Keterangan |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key ke `profiles.id` |
| `title` | TEXT | Judul task |
| `status` | ENUM | `todo` / `doing` / `blocked` / `cancelled` / `done` |
| `difficulty` | INT | 1-5 |
| `total_duration` | INT | Total menit |
| `started_at` | TIMESTAMP | Waktu mulai |
| `completed_at` | TIMESTAMP | Waktu selesai |
| `created_at` | TIMESTAMP | Waktu dibuat |

### Tabel `wellbeing_logs`

| Kolom | Tipe | Keterangan |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key ke `profiles.id` |
| `mood_score` | INT | 1-5 |
| `stress_level` | INT | 1-10 |
| `notes` | TEXT | Catatan |
| `created_at` | DATE | Tanggal check-in |

## 👨‍💻 Author

**Adrianus Vianto Eban Kia**

- GitHub: [@ViannKia](https://github.com/ViannKia)
- LinkedIn: [@ViannKia](https://linkedin.com/in/viannkia)

## 📄 License

MIT License - Copyright (c) 2026 Adrianus Vianto Eban Kia
