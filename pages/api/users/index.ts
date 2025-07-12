import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // Ambil semua user dari tabel users (public)
  const { data, error } = await supabase
    .from('users')
    .select('id, username, name, role, email, phone')
    .order('name', { ascending: true })
  if (error) {
    return res.status(500).json({ error: 'Gagal mengambil data user' })
  }
  res.status(200).json(data || [])
} 