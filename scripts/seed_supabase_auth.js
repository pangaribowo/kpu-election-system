
// npm install node-fetch -    node seed_supabase_auth.js
import fetch from 'node-fetch';
import 'dotenv/config';
import fs from 'fs';
import dotenv from 'dotenv';
// Cek apakah .env.local ada, jika ya pakai itu, jika tidak pakai .env
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: envPath });
console.log(`[seed] Menggunakan ENV file: ${envPath}`);

// BEST PRACTICE 2025:
// - Selalu log proses seed (mulai, selesai, jumlah user, error global)
// - Jika array user dummy kosong, tampilkan warning dan exit
// - Gunakan try-catch global agar error tidak silent
// - Log setiap langkah penting agar mudah debug
// - Jangan hardcode credential, baca dari ENV
// - Hapus user dummy lama sebelum create ulang
// - Sinkronisasi ke tabel users setelah create di Auth

// Baca credential dari .env
// Untuk script Node.js, gunakan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env
// Jika SUPABASE_URL tidak ada, fallback ke NEXT_PUBLIC_SUPABASE_URL (kompatibilitas lama)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

// Baca password dari ENV, fallback ke default jika tidak ada
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin160';
const USER_PASSWORD = process.env.USER_PASSWORD || 'user160';

const users = [
  { email: 'admin1@example.com', password: ADMIN_PASSWORD, role: 'admin', name: 'Admin Satu', phone: '+628000000001' },
  { email: 'admin2@example.com', password: ADMIN_PASSWORD, role: 'admin', name: 'Admin Dua', phone: '+628000000002' },
  { email: 'admin3@example.com', password: ADMIN_PASSWORD, role: 'admin', name: 'Admin Tiga', phone: '+628000000003' },
  { email: 'admin4@example.com', password: ADMIN_PASSWORD, role: 'admin', name: 'Admin Empat', phone: '+628000000004' },
  { email: 'admin5@example.com', password: ADMIN_PASSWORD, role: 'admin', name: 'Admin Lima', phone: '+628000000005' },
  { email: 'user1@example.com', password: USER_PASSWORD, role: 'user', name: 'User Satu', phone: '+628100000001' },
  { email: 'user2@example.com', password: USER_PASSWORD, role: 'user', name: 'User Dua', phone: '+628100000002' },
  { email: 'user3@example.com', password: USER_PASSWORD, role: 'user', name: 'User Tiga', phone: '+628100000003' },
  { email: 'user4@example.com', password: USER_PASSWORD, role: 'user', name: 'User Empat', phone: '+628100000004' },
  { email: 'user5@example.com', password: USER_PASSWORD, role: 'user', name: 'User Lima', phone: '+628100000005' },
  { email: 'user6@example.com', password: USER_PASSWORD, role: 'user', name: 'User Enam', phone: '+628100000006' },
  { email: 'user7@example.com', password: USER_PASSWORD, role: 'user', name: 'User Tujuh', phone: '+628100000007' },
  { email: 'user8@example.com', password: USER_PASSWORD, role: 'user', name: 'User Delapan', phone: '+628100000008' },
  { email: 'user9@example.com', password: USER_PASSWORD, role: 'user', name: 'User Sembilan', phone: '+628100000009' },
  { email: 'user10@example.com', password: USER_PASSWORD, role: 'user', name: 'User Sepuluh', phone: '+628100000010' },
];

// Fungsi untuk mencari user berdasarkan email
async function getUserByEmail(email) {
  const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  console.log(`[getUserByEmail] Email: ${email} | Status: ${res.status} | Response: ${JSON.stringify(data)}`);
  if (res.ok && data.users && Array.isArray(data.users) && data.users.length > 0) {
    // Filter manual: hanya return user jika email persis sama
    const found = data.users.find(u => u.email === email);
    if (found) return found;
  }
  return null;
}

// Fungsi untuk menghapus user berdasarkan id
async function deleteUser(user_id) {
  const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users/${user_id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  if (res.ok) {
    console.log(`🗑️  User deleted: ${user_id}`);
  } else {
    const data = await res.json();
    console.log(`❌ Gagal hapus user: ${user_id} | ${JSON.stringify(data)}`);
  }
}

// Fungsi polling untuk memastikan user sudah benar-benar terhapus
async function waitUntilUserDeleted(email, maxTries = 10, delayMs = 2000) {
  for (let i = 0; i < maxTries; i++) {
    const user = await getUserByEmail(email);
    if (!user) {
      return true;
    }
    console.log(`⏳ Menunggu user ${email} benar-benar terhapus... percobaan ke-${i + 1}`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
}

// Fungsi hapus user dummy di tabel users via Supabase REST API
async function deleteUserFromSQL(email) {
  try {
    const res = await fetch(`${PROJECT_URL}/rest/v1/users?email=eq.${email}`, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    if (res.ok) {
      console.log(`🗑️  User di tabel users dihapus: ${email}`);
    } else {
      const data = await res.json();
      console.log(`❌ Gagal hapus user di tabel users: ${email} | ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Error hapus user di tabel users: ${email} | ${err}`);
  }
}

// Update deleteAllDummyUsers agar juga hapus user di tabel users
async function deleteAllDummyUsers(users) {
  for (const user of users) {
    // Hapus di Auth
    const existingUser = await getUserByEmail(user.email);
    if (existingUser) {
      console.log(`🔎 User ditemukan: ${user.email} (id: ${existingUser.id})`);
      const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users/${existingUser.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        console.log(`🗑️  User deleted: ${user.email}`);
      } else {
        const data = await res.json();
        console.log(`❌ Gagal hapus user: ${user.email} | ${JSON.stringify(data)}`);
      }
      const deleted = await waitUntilUserDeleted(user.email, 10, 2000);
      if (!deleted) {
        console.log(`❌ User ${user.email} masih belum terhapus setelah polling.`);
      }
    } else {
      console.log(`✅ User ${user.email} sudah tidak ada.`);
    }
    // Hapus di tabel users
    await deleteUserFromSQL(user.email);
  }
}

// Pada bagian insertUserToSQLDirect dan syncUserToSQL, update payload agar phone hanya diisi jika valid
function buildUserPayload(user) {
  const payload = {
    email: user.email,
    name: user.name,
    username: user.email,
    role: user.role,
  };
  // Hanya isi phone jika ada dan bukan '-'
  if (user.phone && user.phone !== '-') {
    payload.phone = user.phone;
  } else {
    console.log(`⚠️  Phone untuk ${user.email} di-skip (kosong atau placeholder)`);
  }
  return payload;
}

// Tambahkan fungsi fallback insert langsung ke tabel users via Supabase REST API
async function insertUserToSQLDirect(user) {
  try {
    const res = await fetch(`${PROJECT_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(buildUserPayload(user))
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Fallback insert ke tabel users sukses: ${user.email}`);
    } else {
      console.log(`❌ Fallback insert ke tabel users gagal: ${user.email} | ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Error fallback insert ke tabel users: ${user.email} | ${err}`);
  }
}

// Tambahkan fungsi cek user di tabel users via REST API
async function checkUserInSQL(email) {
  try {
    const res = await fetch(`${PROJECT_URL}/rest/v1/users?email=eq.${email}`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data) && data.length > 0) {
      return true;
    }
    return false;
  } catch (err) {
    console.log(`❌ Error cek user di tabel users: ${email} | ${err}`);
    return false;
  }
}

// Update syncUserToSQL agar cek manual ke tabel users setelah sync
async function syncUserToSQL(user) {
  try {
    const URL_API = process.env.API_SYNC_URL || 'http://localhost:3000/api/users/sync';
    const res = await fetch(URL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildUserPayload(user))
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Sync user ${user.email} ke tabel users sukses.`);
    } else {
      console.log(`❌ Sync user ${user.email} ke tabel users gagal: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Error sync user ${user.email} ke tabel users: ${err}`);
  }
}

// Fungsi untuk konfirmasi email user dummy setelah create
async function confirmUserEmail(userId) {
  try {
    const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email_confirm: true })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Email user dikonfirmasi: ${userId}`);
    } else {
      console.log(`❌ Gagal konfirmasi email user: ${userId} | ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Error konfirmasi email user: ${userId} | ${err}`);
  }
}

// ====== KANDIDAT DUMMY ======
const candidates = [
  {
    nama: 'Ahmad Rizki Pratama',
    visi: 'Membangun organisasi yang inovatif dan berkelanjutan dengan fokus pada pengembangan SDM dan teknologi digital.',
    misi: '1. Mengadakan pelatihan rutin untuk anggota. 2. Meningkatkan kolaborasi dengan pihak eksternal. 3. Mengadopsi teknologi digital dalam setiap lini organisasi.',
    color: 'blue'
  },
  {
    nama: 'Sari Indah Permata',
    visi: 'Menciptakan lingkungan kerja yang kolaboratif dan inklusif untuk mencapai visi bersama organisasi.',
    misi: '1. Menyelenggarakan program pemberdayaan anggota. 2. Mendorong keterlibatan aktif seluruh anggota. 3. Menyediakan ruang diskusi terbuka setiap bulan.',
    color: 'green'
  },
  {
    nama: 'Budi Santoso Wijaya',
    visi: 'Mengoptimalkan potensi setiap anggota melalui program pelatihan dan pengembangan karir yang berkelanjutan.',
    misi: '1. Membuka akses pelatihan karir. 2. Menyusun roadmap pengembangan anggota. 3. Menjalin kemitraan dengan institusi pendidikan.',
    color: 'orange'
  },
];

// Fungsi upsert kandidat (insert or update jika sudah ada)
async function upsertCandidate(candidate) {
  try {
    const res = await fetch(`${PROJECT_URL}/rest/v1/kandidat`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(candidate)
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Kandidat di-upsert: ${candidate.nama}`);
    } else {
      console.log(`❌ Gagal upsert kandidat: ${candidate.nama} | ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Error upsert kandidat: ${candidate.nama} | ${err}`);
  }
}

// Fungsi hapus kandidat berdasarkan nama
async function deleteCandidateByName(nama) {
  const res = await fetch(`${PROJECT_URL}/rest/v1/kandidat?nama=eq.${encodeURIComponent(nama)}`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });
  if (res.ok) {
    console.log(`🗑️  Kandidat dihapus (jika ada): ${nama}`);
  } else {
    const data = await res.json();
    console.log(`❌ Gagal hapus kandidat: ${nama} | ${JSON.stringify(data)}`);
  }
}

// Upsert semua kandidat dummy: hapus dulu jika ada, lalu upsert
async function upsertAllCandidates() {
  for (const candidate of candidates) {
    await deleteCandidateByName(candidate.nama);
    await upsertCandidate(candidate);
  }
}

// Fungsi reset voting
async function resetVoting() {
  try {
    const res = await fetch(`${PROJECT_URL}/rest/v1/voting`, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    if (res.ok) {
      console.log('🗑️  Semua data voting dihapus.');
    } else {
      const data = await res.json();
      console.log(`❌ Gagal reset voting: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Error reset voting: ${err}`);
  }
}

// Fungsi edit kandidat (opsional)
async function editCandidate(id, updateObj) {
  try {
    const res = await fetch(`${PROJECT_URL}/rest/v1/kandidat?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateObj)
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✏️  Kandidat diupdate: ${id}`);
    } else {
      console.log(`❌ Gagal update kandidat: ${id} | ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Error update kandidat: ${id} | ${err}`);
  }
}

// Fungsi cek eksistensi kandidat berdasarkan nama
async function candidateExists(nama) {
  const res = await fetch(`${PROJECT_URL}/rest/v1/kandidat?nama=eq.${encodeURIComponent(nama)}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

// Insert kandidat dummy dengan pengecekan eksistensi
async function insertAllCandidates() {
  for (const candidate of candidates) {
    if (await candidateExists(candidate.nama)) {
      console.log(`ℹ️  Kandidat sudah ada: ${candidate.nama} (skip)`);
      continue;
    }
    await insertCandidate(candidate);
  }
}

// Tambahkan log isi array users sebelum proses create
console.log('[SEED] Data users yang akan diproses:', users);

// Update fungsi createAllDummyUsers agar admin insert langsung ke tabel users
async function createAllDummyUsers(users) {
  console.log('[SEED] Memulai createAllDummyUsers...');
  if (!users || users.length === 0) {
    console.warn('[SEED] ⚠️  Array users kosong! Tidak ada user yang akan diproses.');
    return;
  }
  let successCount = 0;
  let failCount = 0;
  for (const user of users) {
    try {
      console.log(`[SEED] Proses create user: ${user.email}`);
      const existingUser = await getUserByEmail(user.email);
      if (existingUser) {
        console.log(`[SEED] ⚠️  User ${user.email} sudah ada, skip create.`);
        continue;
      }
      let attempt = 0;
      let maxAttempts = 3;
      let success = false;
      let lastError = null;
      let createdUserId = null;
      while (attempt < maxAttempts && !success) {
        const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              role: user.role,
              name: user.name
            }
          })
        });
        const data = await res.json();
        if (res.ok) {
          console.log(`[SEED] ✅ User created: ${user.email} (${user.role})`);
          success = true;
          successCount++;
          createdUserId = data.id || (data.user && data.user.id);
          // Konfirmasi email user dummy (jaga-jaga jika belum terkonfirmasi)
          if (createdUserId) {
            await confirmUserEmail(createdUserId);
          }
          // Sinkronisasi ke tabel users setelah berhasil create di Auth
          if (user.role === 'admin') {
            await insertUserToSQLDirect(user);
          } else {
            await syncUserToSQL(user);
          }
        } else {
          lastError = data;
          if (data.error_code === 'email_exists') {
            console.log(`[SEED] ⏳ Retry: ${user.email} masih dianggap ada, tunggu 2 detik lalu coba lagi... (percobaan ${attempt + 1})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log(`[SEED] ❌ Failed: ${user.email} | ${JSON.stringify(data)}`);
            break;
          }
        }
        attempt++;
      }
      if (!success && lastError) {
        console.log(`[SEED] ❌ Gagal total: ${user.email} | ${JSON.stringify(lastError)}`);
        failCount++;
      }
      // Tambahkan delay 1 detik antar create user
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`[SEED] ❌ Error create user ${user.email}:`, err);
      failCount++;
    }
  }
  console.log(`[SEED] Selesai createAllDummyUsers. Sukses: ${successCount}, Gagal: ${failCount}`);
}

// Integrasi ke main seed
(async () => {
  try {
    console.log('==============================');
    console.log('Mulai proses seed user dummy...');
    if (!users || users.length === 0) {
      console.warn('⚠️  Array users kosong! Tidak ada user yang akan diproses.');
      return;
    }
    console.log(`Jumlah user yang akan diproses: ${users.length}`);
    console.log('--- Hapus semua user dummy ---');
    await deleteAllDummyUsers(users);
    // Reset voting setelah hapus user
    await resetVoting();
    console.log('--- Buat ulang semua user dummy ---');
    await createAllDummyUsers(users);
    // Seed kandidat dummy
    console.log('--- Tambah kandidat dummy ---');
    await upsertAllCandidates();
    // Contoh edit kandidat (opsional, bisa dihapus jika tidak perlu)
    // await editCandidate('<id-kandidat>', { visi: 'Visi baru', color: 'purple' });
    console.log('Selesai proses seed user & kandidat dummy.');
    console.log('==============================');
  } catch (err) {
    console.error('❌ Error global:', err);
  }
})();