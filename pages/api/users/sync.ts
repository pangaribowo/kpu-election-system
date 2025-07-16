import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan service role agar bisa insert/update
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { email, phone, username } = req.query
    if (email) {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, name, phone, role')
        .eq('email', email as string)
        .maybeSingle()
      if (error) return res.status(500).json({ error: 'Gagal cek user' })
      return res.status(200).json(data || {})
    }
    if (username) {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, name, phone, role')
        .eq('username', username as string)
        .maybeSingle()
      if (error) return res.status(500).json({ error: 'Gagal cek user' })
      return res.status(200).json(data || {})
    }
    if (phone) {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone as string)
        .maybeSingle()
      if (error) return res.status(500).json({ error: 'Gagal cek phone' })
      return res.status(200).json({ exists: !!data })
    }
    return res.status(400).json({ error: 'Parameter email, username, atau phone wajib diisi' })
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { email, phone, name, username, role, provider } = req.body
  if (!email || !name || !username) {
    return res.status(400).json({ error: 'Data tidak lengkap' })
  }
  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid' })
  }
  // Validasi & normalisasi format phone HANYA jika phone diisi dan bukan '-' atau kosong/null
  let normPhone = phone;
  if (phone && phone !== '-' && phone.trim() !== '') {
    let raw = phone.trim();
    // Jika diawali 0, hapus 0
    if (raw.startsWith('0')) raw = raw.slice(1);
    // Jika tidak diawali +62, tambahkan
    if (!raw.startsWith('+62')) raw = '+62' + raw.replace(/^\+?62?/, '');
    // Pastikan setelah +62 hanya angka
    const after62 = raw.replace('+62', '');
    if (!/^[0-9]{9,13}$/.test(after62)) {
      return res.status(400).json({ error: 'Nomor HP hanya boleh berisi angka setelah +62 dan panjang 9-13 digit' });
    }
    normPhone = '+62' + after62;
  }
  if (normPhone && normPhone !== '-' && normPhone.trim() !== '') {
    const phoneRegex = /^\+62[0-9]{9,13}$/;
    if (!phoneRegex.test(normPhone)) {
      return res.status(400).json({ error: 'Format nomor HP harus +62 diikuti 9-13 digit angka, contoh: +6281234567890' })
    }
  }
  // Upsert user dengan update field provider
  const { data, error } = await supabase
    .from('users')
    .upsert([
      { email, phone, name, username, role, provider: provider || 'email' }
    ], { onConflict: 'email' })
    .select()
  if (error) return res.status(500).json({ error: 'Gagal upsert user' })
  return res.status(200).json(data && data[0] ? data[0] : {})
} 