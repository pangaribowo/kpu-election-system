import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

// Helper: dapatkan user dari session (dummy, nanti bisa pakai session asli)
function getUser(req: NextApiRequest) {
  // Untuk demo, ambil username dari body (nanti ganti session)
  return req.body?.username || null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Submit suara
    const { kandidat_id, username } = req.body
    if (!kandidat_id || !username) {
      return res.status(400).json({ error: 'Kandidat dan user wajib diisi' })
    }
    // Cari user_id dari username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()
    if (!user) {
      return res.status(401).json({ error: 'User tidak ditemukan' })
    }
    // Cek apakah user sudah voting
    const { data: existingVote } = await supabase
      .from('voting')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (existingVote) {
      return res.status(409).json({ error: 'User sudah voting' })
    }
    // Simpan suara
    const { error: voteError } = await supabase
      .from('voting')
      .insert([{ user_id: user.id, kandidat_id }])
    if (voteError) {
      return res.status(500).json({ error: 'Gagal simpan suara' })
    }
    return res.status(201).json({ message: 'Voting berhasil' })
  } else if (req.method === 'GET') {
    // Jika ada query username, cek status voting user
    const { username } = req.query
    if (username) {
      // Cari user_id dari username
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()
      if (!user) {
        return res.status(200).json({ hasVoted: false })
      }
      // Cek apakah user sudah voting
      const { data: existingVote } = await supabase
        .from('voting')
        .select('id')
        .eq('user_id', user.id)
        .single()
      return res.status(200).json({ hasVoted: !!existingVote })
    }
    // Quick count: hasil suara per kandidat
    const { data: hasil, error } = await supabase
      .from('kandidat')
      .select('id, nama, visi, misi, foto_url, voting:voting(count)')
    if (error) {
      return res.status(500).json({ error: 'Gagal ambil hasil quick count' })
    }
    // Format hasil: jumlah suara per kandidat
    const result = hasil.map(k => ({
      id: k.id,
      nama: k.nama,
      visi: k.visi,
      misi: k.misi,
      foto_url: k.foto_url,
      suara: k.voting && k.voting[0] && typeof k.voting[0].count === 'number' ? k.voting[0].count : 0
    }))
    // Ambil total pemilih (role 'pemilih')
    const { count: totalVoters } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
    // Ambil jumlah user unik yang sudah voting
    const { count: totalVoted } = await supabase
      .from('voting')
      .select('user_id', { count: 'exact', head: true })
    return res.status(200).json({ hasil: result, totalVoters, totalVoted })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
} 