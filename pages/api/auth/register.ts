import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password, name, role } = req.body
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'Semua field wajib diisi' })
  }

  // Cek apakah username sudah ada
<<<<<<< Updated upstream
  const { data: existingUser, error: findError } = await supabase
=======
  const { data: existingUser } = await supabase
>>>>>>> Stashed changes
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (existingUser) {
    return res.status(409).json({ error: 'Username sudah terdaftar' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Simpan user baru
  const { data, error } = await supabase
    .from('users')
    .insert([
      { username, password: hashedPassword, name, role }
    ])
    .select('id, username, name, role')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json({ user: data })
} 