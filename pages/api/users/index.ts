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
  // Ambil query limit, offset, dan search
  const limit = parseInt(req.query.limit as string) || 15
  const offset = parseInt(req.query.offset as string) || 0
  const search = (req.query.search as string)?.trim() || ''

  // Cek role dari header (x-user-auth), jika bukan admin, filter role user saja
  let roleFilter = undefined
  if (req.headers['x-user-role'] !== 'admin') {
    roleFilter = 'user'
  }

  // Hitung total user
  let total = 0
  if (!search) {
    const { count: totalCount, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq(roleFilter ? 'role' : '', roleFilter || undefined)
    if (countError) {
      return res.status(500).json({ error: 'Gagal menghitung total user' })
    }
    total = totalCount || 0
  }

  // Ambil user + status voting dengan pagination atau search
  let query = supabase
    .from('users')
    .select('id, username, name, role, email, phone, voting:voting!user_id(id)')
    .order('name', { ascending: true })
  if (roleFilter) query = query.eq('role', roleFilter)
  if (search) {
    query = query.ilike('name', search)
  } else {
    query = query.range(offset, offset + limit - 1)
  }
  const { data, error } = await query
  if (error) {
    return res.status(500).json({ error: 'Gagal mengambil data user' })
  }
  const usersWithVote = (data || []).map(u => ({
    ...u,
    hasVoted: !!u.voting
  }))
  res.status(200).json({ users: usersWithVote, total: search ? usersWithVote.length : (total || 0) })
} 