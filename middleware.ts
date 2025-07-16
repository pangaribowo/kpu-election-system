import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Daftar path yang butuh autentikasi (bisa diatur sesuai kebutuhan)
const protectedPaths = ['/', '/admin', '/users', '/quickcount', '/profile']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Jangan proteksi halaman login
  if (pathname === '/login' || pathname.startsWith('/login')) return NextResponse.next()
  // Cek apakah path butuh proteksi
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))
  if (!isProtected) return NextResponse.next()

  // Cek token Supabase (atau token lain) di cookie
  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) {
    // Redirect ke /login jika belum login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }
  // Jika sudah login, lanjutkan
  return NextResponse.next()
}

// Aktifkan middleware hanya untuk path yang relevan (TIDAK termasuk /login)
export const config = {
  matcher: ['/', '/admin', '/users', '/quickcount', '/profile'],
} 