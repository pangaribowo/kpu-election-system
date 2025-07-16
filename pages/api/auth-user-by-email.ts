import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query
  if (!email) return res.status(400).json({ error: 'Email wajib diisi' })

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email as string)}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    },
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    return res.status(500).json({ error: 'Gagal cek user', detail: err?.msg || response.statusText })
  }
  const data = await response.json()
  // data.users adalah array, ambil user pertama jika ada
  const user = data?.users?.[0] || {}
  // Pastikan identities selalu ada (array)
  const identities = user.identities || []
  // Provider utama (jika ada)
  const provider = user.app_metadata?.provider || null
  return res.status(200).json({
    ...user,
    identities,
    provider,
  })
} 