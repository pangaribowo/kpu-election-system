# Panduan Pengembangan: Integrasi Database & API

Panduan ini berisi langkah-langkah dan kebutuhan untuk mengembangkan website agar data dapat disimpan di database serta logika API yang diperlukan.

---

## 1. Investigasi Data & Fitur

- [ ] Identifikasi data yang perlu disimpan:
  - [ ] Data pengguna (user)
  - [ ] Data kandidat
  - [ ] Data suara/voting
  - [ ] Data hasil quick count
  - [ ] Data manual/panduan
  - [ ] Data notifikasi/log aktivitas (opsional)
- [ ] Identifikasi fitur yang membutuhkan database/API:
  - [ ] Login & autentikasi
  - [ ] CRUD user & kandidat
  - [ ] Proses voting
  - [ ] Quick count
  - [ ] Manual/panduan
  - [ ] Notifikasi

## 2. Investigasi Kode & Komponen

- [ ] Cek komponen frontend yang terkait data (LoginForm, VotingPanel, QuickCount, List, AdminPanel, dsb)
- [ ] Cek apakah data masih statis atau sudah fetch ke API
- [ ] Cek apakah sudah ada API/backend (Next.js API routes atau Supabase)
- [ ] Cek koneksi ke database (misal: lib/supabaseClient.ts)

## 3. Kebutuhan Pengembangan

### a. Database
- [ ] Pilih database (misal: Supabase/PostgreSQL)
- [ ] Buat tabel sesuai kebutuhan data
- [ ] Siapkan koneksi & environment variable (.env)

### b. API/Backend
- [ ] Buat/lengkapi endpoint API untuk:
  - [ ] Autentikasi (login, register, logout)
  - [ ] CRUD user
  - [ ] CRUD kandidat
  - [ ] Proses voting (POST suara)
  - [ ] Fetch hasil quick count
  - [ ] Fetch manual/panduan
  - [ ] Notifikasi (opsional)
- [ ] Pastikan API terhubung ke database

### c. Frontend
- [ ] Ubah pengambilan data dari statis menjadi fetch ke API
- [ ] Update form agar submit ke API
- [ ] Tampilkan data dari API

### d. Keamanan & Validasi
- [ ] Hash password user
- [ ] Validasi input (frontend & backend)
- [ ] Proteksi route (hanya admin bisa akses admin panel, dsb)

### e. Testing
- [ ] Unit test untuk API
- [ ] Integration test untuk alur utama (login, voting, dsb)

---

## 4. Strategi & Workflow Voting (Core)

### a. Skema Tabel Voting
- [x] Tabel voting sudah dibuat di `rules/SCHEMA_USER_KANDIDAT.sql`:
  - Kolom: id, user_id, kandidat_id, waktu, UNIQUE(user_id)
  - Satu user hanya bisa voting satu kali (UNIQUE constraint)

### b. Checklist Implementasi Voting
- [ ] Implementasi API voting (POST suara):
  - [ ] Endpoint menerima user_id (dari session) dan kandidat_id
  - [ ] Validasi: user hanya bisa voting satu kali (cek di tabel voting)
  - [ ] Simpan suara ke tabel voting
  - [ ] Handle error jika user sudah voting
- [ ] Integrasi form voting di frontend:
  - [ ] Form voting submit ke API
  - [ ] Tampilkan notifikasi sukses/gagal
- [ ] Proteksi: hanya user login yang bisa voting
- [ ] Testing end-to-end fitur voting

### c. Best Practice
- [ ] Validasi di backend dan frontend
- [ ] Jangan expose user_id di frontend, ambil dari session
- [ ] Audit endpoint voting secara berkala

---

## 5. Integrasi Realtime Voting & Quick Count

- [x] Quick count dan state voting kini update otomatis (realtime) menggunakan Supabase Realtime (bukan polling interval).
- [x] Semua panel (dashboard, voting, quickcount) konsisten data karena subscribe ke perubahan tabel voting.
- [x] Pengujian: lakukan voting dari beberapa akun/user, pastikan quick count dan hasil voting update otomatis di semua device tanpa reload.

---

> **Catatan:**
> Checklist ini dapat dikembangkan sesuai kebutuhan proyek. Setiap langkah sebaiknya didokumentasikan dan diuji secara bertahap. 