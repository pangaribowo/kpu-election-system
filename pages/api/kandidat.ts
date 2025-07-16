import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

const SUPPORTED_COLORS = ['blue', 'green', 'orange', 'purple', 'red', 'indigo'];
function getValidColor(color) {
  return SUPPORTED_COLORS.includes((color || '').toLowerCase()) ? color.toLowerCase() : 'blue';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cek role admin (sementara dari body, bisa diimprove pakai session)
  const role = req.body?.role || req.query?.role || req.headers['x-user-role']
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang boleh mengakses endpoint ini.' })
  }

  if (req.method === 'POST') {
    const { name, vision, color } = req.body
    if (!name || !vision || !color) {
      return res.status(400).json({ error: 'Nama, visi, dan warna wajib diisi.' })
    }
    const validColor = getValidColor(color);
    const { error } = await supabase
      .from('kandidat')
      .insert([{ nama: name, visi: vision, color: validColor }])
    if (error) {
      return res.status(500).json({ error: 'Gagal menambah kandidat', detail: error.message })
    }
    return res.status(201).json({ message: 'Kandidat berhasil ditambahkan' })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: 'ID kandidat wajib diisi.' })
    }
    const { error } = await supabase
      .from('kandidat')
      .delete()
      .eq('id', id)
    if (error) {
      return res.status(500).json({ error: 'Gagal menghapus kandidat', detail: error.message })
    }
    return res.status(200).json({ message: 'Kandidat berhasil dihapus' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
} 