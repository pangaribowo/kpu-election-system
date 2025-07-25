import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { id, name, phone } = req.body
  if (!id || typeof id !== 'string' || id.length !== 36 || !id.includes('-')) {
    return res.status(400).json({ error: 'ID user tidak valid (UUID wajib)' })
  }
  // Validasi phone
  if (phone) {
    const phoneRegex = /^\+\d{10,}$/
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Format nomor HP harus internasional (misal: +6281234567890)' })
    }
    // Cek unik
    const { data: existing, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .neq('id', id)
      .maybeSingle()
    if (findError) return res.status(500).json({ error: 'Gagal cek nomor HP' })
    if (existing) return res.status(409).json({ error: 'Nomor HP sudah terdaftar' })
  }
  // Update nama & phone
  const updateObj: any = {}
  if (name) updateObj.name = name
  if (phone) updateObj.phone = phone
  if (Object.keys(updateObj).length > 0) {
    const { error: updateError } = await supabase
      .from('users')
      .update(updateObj)
      .eq('id', id)
    if (updateError) return res.status(500).json({ error: 'Gagal update data' })
  }
  // Return data user terbaru
  const { data: updated, error: getError } = await supabase
    .from('users')
    .select('id, username, name, email, phone, role')
    .eq('id', id)
    .maybeSingle()
  if (getError || !updated) return res.status(404).json({ error: 'User tidak ditemukan' })
  return res.status(200).json({ user: updated })
} 