import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service key, hanya di server!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query
  if (!email) return res.status(400).json({ error: 'Email wajib diisi' })
  // Query ke schema auth.users
  const { data, error } = await supabase
    .from('auth.users')
    .select('id, email, app_metadata')
    .eq('email', email as string)
    .maybeSingle()
  if (error) return res.status(500).json({ error: 'Gagal cek user', detail: error.message })
  return res.status(200).json(data || {})
} 