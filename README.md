# Sistem Voting KPU Digital

Aplikasi web modern untuk pemilihan umum, organisasi, atau internal institusi. Dirancang dengan keamanan, transparansi, dan kemudahan penggunaan sebagai prioritas utama. Menggunakan Next.js, Supabase, dan Tailwind CSS.

---

## ✨ Fitur Utama

- **Autentikasi Aman**: Login/register via email (dengan verifikasi), OTP (opsional), dan role-based access (admin/user).
- **Voting Online**: Satu user satu suara, validasi backend, proteksi double vote.
- **Quick Count Real-time**: Hasil suara terupdate otomatis (polling/Realtime Supabase).
- **Panel Admin**: CRUD user, kandidat, reset data, ekspor hasil.
- **Manual & Dokumentasi**: Halaman manual, FAQ, dan dokumentasi teknis.
- **Notifikasi Global**: Feedback aksi user di seluruh halaman.
- **UI Modern & Responsif**: Dark mode, mobile friendly, UX 2025.
- **Keamanan**: Hash password, validasi input, proteksi route, audit keamanan.

---

## 🏗️ Arsitektur & Teknologi

- **Frontend & Backend**: Next.js (TypeScript, API routes)
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **UI/UX**: Tailwind CSS, React Icons
- **State Management**: React Context (VotingContext)
- **Dokumentasi & Checklist**: Markdown di folder `law/` dan `rules/`

### Skema Database (Inti)
- **users**: id, username, name, email, phone, role, created_at
- **kandidat**: id, nama, visi, misi, foto_url, color, created_at
- **voting**: id, user_id, kandidat_id, waktu (UNIQUE user_id)

---

## 🔄 Alur Kerja Sistem

1. **Register/Login**: User daftar/login, verifikasi email/OTP.
2. **Voting**: User login, pilih kandidat, submit suara (1x saja).
3. **Quick Count**: Hasil suara tampil real-time di dashboard.
4. **Panel Admin**: Admin kelola user, kandidat, hasil voting.
5. **Manual & Dokumentasi**: User/admin akses panduan & FAQ.

---

## 🚀 Instalasi & Setup

1. **Prasyarat**:
   - Node.js >= 18
   - npm
   - Akun Supabase (https://supabase.com/)
2. **Clone repo**:
   ```bash
   git clone https://github.com/pangaribowo/kpu-election-system.git
   cd kpu-election-system
   ```
3. **Install dependensi**:
   ```bash
   npm install
   ```
4. **Konfigurasi environment**:
   - Copy `.env.example` ke `.env.local` (jika tersedia)
   - Isi variabel Supabase (lihat dokumentasi Supabase)
5. **Jalankan aplikasi**:
   ```bash
   npm run dev
   ```
6. **Akses**: Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Folder

```
kpu-election-system/
  components/      # Komponen UI (VotingPanel, QuickCount, Sidebar, dsb)
  interfaces/      # Tipe TypeScript
  lib/             # Supabase client & helper
  pages/           # Next.js pages & API routes
  rules/           # SQL schema, seed, panduan dev
  law/             # Checklist, dokumentasi, manual
  styles/          # Tailwind & global CSS
  utils/           # Helper utilitas
  README.md        # Dokumentasi utama
```

---

## 🛡️ Best Practice & Standar Pengembangan

- Ikuti checklist di `law/checklist.mdc` dan `rules/DEVELOPMENT_GUIDE.md`.
- Setiap fitur baru wajib update checklist & dokumentasi.
- Register hanya untuk user, admin hanya bisa dibuat oleh admin.
- Validasi input ketat (email, phone, password, dsb).
- Proteksi API & route sesuai role.
- Audit keamanan register/login secara berkala.
- Testing E2E setiap flow utama (register, login, voting, quick count, CRUD).
- Dokumentasikan setiap perubahan besar.

---

## 🤝 Kontribusi

1. Fork repo, buat branch baru, lakukan perubahan.
2. Ikuti standar di `rules/DEVELOPMENT_GUIDE.md`.
3. Pull request dengan deskripsi jelas.
4. Update checklist & dokumentasi jika menambah/mengubah fitur.

---

## ❓ FAQ & Troubleshooting

- **Lupa password?** Hubungi admin untuk reset password.
- **Tidak bisa voting?** Pastikan sudah login & belum pernah voting.
- **Bagaimana menambah kandidat?** Login sebagai admin, akses panel admin.
- **Apakah bisa diakses di mobile?** Ya, UI responsif & mobile friendly.
- **Bagaimana ekspor hasil?** Fitur ekspor tersedia di panel admin.
- **Data aman?** Data disimpan di Supabase/PostgreSQL, gunakan HTTPS.
- **Error lain?** Lihat notifikasi di aplikasi atau hubungi admin/IT.

---

## 📄 Lisensi

MIT License. Bebas digunakan, dimodifikasi, dan didistribusikan.

---

## 📚 Referensi & Dokumentasi Internal

- [Panduan Pengembangan](rules/DEVELOPMENT_GUIDE.md)
- [Checklist Fitur & Audit](law/checklist.mdc)
- [Skema Database & Seed](rules/SCHEMA_USER_KANDIDAT.sql, rules/SEED_AKUN_DEMO.sql)
- [Manual & FAQ](pages/manual.tsx, components/ManualSection.tsx)
- [Dokumentasi Teknis](pages/documentation.tsx)

---

> **Catatan:**
> Selalu update checklist & dokumentasi setiap ada perubahan besar. Selesaikan satu tahap penuh sebelum lanjut ke tahap berikutnya agar workflow tetap on-track dan maintainable.

---

### Saran Langkah Selanjutnya
- Lakukan audit checklist & testing E2E setiap flow utama.
- Lanjutkan pengembangan fitur sesuai prioritas di checklist.
- Update dokumentasi & checklist secara berkala.
- Terapkan best practice dari open source & komunitas.
