import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { username, password, name } = req.body
  // Force role to 'user' for all public registration
  const role = 'user'
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Semua field wajib diisi' })
  }

  // Cek apakah username sudah ada
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  if (findError && findError.code !== 'PGRST116') {
    // PGRST116 = no rows found
    return res.status(500).json({ error: 'Gagal cek user' })
  }
  if (existingUser) {
    return res.status(409).json({ error: 'Username sudah terdaftar' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password: hashedPassword, name, role }])
    .select()
    .single()
  if (error) {
    return res.status(500).json({ error: 'Gagal registrasi user' })
  }
  return res.status(201).json({ user: { username: data.username, name: data.name, role: data.role } })
} 