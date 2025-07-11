import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan service role agar bisa insert/update
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { email, phone } = req.query
    if (email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email as string)
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
    return res.status(400).json({ error: 'Parameter email atau phone wajib diisi' })
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { email, phone, name, username, role } = req.body
  if (!email || !phone || !name || !username || !role) {
    return res.status(400).json({ error: 'Data tidak lengkap' })
  }
  // Validasi format email dan phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\+\d{10,}$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid' })
  }
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Format nomor HP harus internasional (misal: +6281234567890)' })
  }
  // Cek apakah user sudah ada (berdasarkan email/phone)
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .maybeSingle()
  if (findError) {
    return res.status(500).json({ error: 'Gagal cek user' })
  }
  if (existing) {
    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({ name, username, role, email, phone })
      .eq('id', existing.id)
    if (updateError) {
      return res.status(500).json({ error: 'Gagal update user' })
    }
    return res.status(200).json({ message: 'User diupdate' })
  } else {
    // Insert user
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ name, username, role, email, phone, password: '-' }]) // password dummy, tidak dipakai
    if (insertError) {
      return res.status(500).json({ error: 'Gagal insert user' })
    }
    return res.status(201).json({ message: 'User ditambahkan' })
  }
} 