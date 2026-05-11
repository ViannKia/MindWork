# Debug Streak Check-in

## Masalah
User sudah check-in 2 kali tapi streak masih 1.

## Kemungkinan Penyebab

### 1. **Check-in tidak dilakukan di hari yang berurutan**
Streak hanya bertambah jika check-in dilakukan **setiap hari berturut-turut** tanpa terputus.

**Contoh:**
- ✅ Senin check-in → Selasa check-in → **Streak = 2**
- ❌ Senin check-in → Rabu check-in (skip Selasa) → **Streak = 1** (hanya hari ini)

### 2. **Check-in dilakukan di hari yang sama**
Jika user check-in 2 kali di hari yang sama, hanya dihitung 1 hari.

**Contoh:**
- ❌ Senin pagi check-in → Senin sore check-in lagi → **Streak = 1**

### 3. **Data wellbeing_logs tidak tersimpan dengan benar**
Kolom `created_at` harus berformat `YYYY-MM-DD` (date only, bukan timestamp).

---

## Cara Verifikasi

### 1. Cek Data di Supabase SQL Editor

```sql
-- Lihat semua wellbeing logs untuk user tertentu
SELECT 
  id,
  user_id,
  mood_score,
  stress_level,
  created_at,
  TO_CHAR(created_at::date, 'YYYY-MM-DD') as date_only
FROM wellbeing_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

**Yang harus dicek:**
- Apakah ada 2 baris dengan `created_at` yang berbeda?
- Apakah tanggalnya berurutan (contoh: 2026-05-11, 2026-05-10)?

### 2. Cek Logic Streak

Logic streak di `src/lib/dashboard/calculations.ts`:

```typescript
export function calculateStreak(logs: WellbeingLog[]): number {
  if (logs.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Collect unique dates as YYYY-MM-DD strings
  const dateSet = new Set(logs.map((l) => l.created_at.slice(0, 10)))

  const toKey = (d: Date) => d.toISOString().slice(0, 10)

  // If today has no entry, streak is 0
  if (!dateSet.has(toKey(today))) return 0

  let streak = 0
  const cursor = new Date(today)

  while (dateSet.has(toKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
```

**Cara kerja:**
1. Ambil semua tanggal unik dari logs (YYYY-MM-DD)
2. Cek apakah hari ini ada check-in → jika tidak, streak = 0
3. Hitung mundur dari hari ini, tambah streak selama tanggal ada di set
4. Berhenti saat menemukan tanggal yang tidak ada check-in

---

## Contoh Perhitungan

### Skenario 1: Check-in Berurutan ✅
```
Logs:
- 2026-05-11 (hari ini)
- 2026-05-10 (kemarin)

Perhitungan:
- Hari ini (11 Mei) ada? ✅ → streak = 1
- Kemarin (10 Mei) ada? ✅ → streak = 2
- 2 hari lalu (9 Mei) ada? ❌ → STOP

Hasil: Streak = 2 ✅
```

### Skenario 2: Check-in Tidak Berurutan ❌
```
Logs:
- 2026-05-11 (hari ini)
- 2026-05-09 (2 hari lalu, skip 10 Mei)

Perhitungan:
- Hari ini (11 Mei) ada? ✅ → streak = 1
- Kemarin (10 Mei) ada? ❌ → STOP

Hasil: Streak = 1 ❌
```

### Skenario 3: Check-in 2x di Hari yang Sama ❌
```
Logs:
- 2026-05-11 (hari ini, pagi)
- 2026-05-11 (hari ini, sore)

Unique dates: { "2026-05-11" }

Perhitungan:
- Hari ini (11 Mei) ada? ✅ → streak = 1
- Kemarin (10 Mei) ada? ❌ → STOP

Hasil: Streak = 1 ❌
```

---

## Solusi

### Jika Check-in Tidak Berurutan
User harus check-in **setiap hari** tanpa skip untuk meningkatkan streak.

**Contoh:**
- Hari 1: Check-in → Streak = 1
- Hari 2: Check-in → Streak = 2
- Hari 3: Skip (tidak check-in) → Streak = 0
- Hari 4: Check-in → Streak = 1 (mulai dari awal)

### Jika Data Tidak Tersimpan
Pastikan kolom `created_at` di tabel `wellbeing_logs` bertipe **DATE** (bukan TIMESTAMP).

```sql
-- Cek tipe data kolom created_at
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wellbeing_logs' 
AND column_name = 'created_at';

-- Jika tipe data salah, ubah ke DATE
-- ALTER TABLE wellbeing_logs ALTER COLUMN created_at TYPE DATE;
```

---

## Testing

### Test Case 1: Check-in Hari Pertama
1. User belum pernah check-in
2. User check-in hari ini
3. ✅ Streak = 1

### Test Case 2: Check-in 2 Hari Berturut-turut
1. User check-in kemarin
2. User check-in hari ini
3. ✅ Streak = 2

### Test Case 3: Check-in Skip 1 Hari
1. User check-in 2 hari lalu
2. User skip kemarin (tidak check-in)
3. User check-in hari ini
4. ✅ Streak = 1 (reset karena skip)

### Test Case 4: Check-in 2x di Hari yang Sama
1. User check-in pagi hari ini
2. User check-in sore hari ini (seharusnya ditolak)
3. ✅ Streak = 1 (tidak bertambah)

---

## Kesimpulan

**Streak hanya bertambah jika user check-in setiap hari berturut-turut tanpa skip.**

Jika user sudah check-in 2 kali tapi streak masih 1, kemungkinan besar:
1. ❌ Check-in tidak dilakukan di hari yang berurutan (ada skip)
2. ❌ Check-in dilakukan 2x di hari yang sama

Untuk memastikan, cek data di Supabase dengan query SQL di atas.
