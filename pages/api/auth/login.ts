import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' })
  }

  // Cari user berdasarkan username
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, password, name, role')
    .eq('username', username)
    .single()

  if (!user) {
    return res.status(401).json({ error: 'Username atau password salah' })
  }

  // Cek password
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ error: 'Username atau password salah' })
  }

  // Jangan kirim password ke client
  const { password: _, ...userData } = user
  return res.status(200).json({ user: userData })
} 