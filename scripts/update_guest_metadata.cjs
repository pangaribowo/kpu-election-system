// scripts/update_guest_metadata.cjs
require('dotenv').config({ path: require('fs').existsSync('.env.local') ? '.env.local' : '.env' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus di-set di .env atau .env.local!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function updateGuestMetadata() {
  // Ganti dengan user UID guest Anda
  const userId = '777dcbe0-ab06-4289-8987-f8b4abf77c87';
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      role: 'guest',
      name: 'Guest'
    }
  });
  if (error) {
    console.error('Gagal update metadata:', error);
  } else {
    console.log('Berhasil update metadata:', data);
  }
}

updateGuestMetadata(); 