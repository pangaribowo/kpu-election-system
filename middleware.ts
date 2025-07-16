import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const protectedPaths = ['/', '/admin', '/users', '/quickcount', '/profile']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Jangan proteksi halaman login
  if (pathname === '/login' || pathname.startsWith('/login')) return NextResponse.next()
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))
  if (!isProtected) return NextResponse.next()

  // Gunakan helper Supabase untuk cek session
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return res
}

export const config = {
  matcher: ['/', '/admin', '/users', '/quickcount', '/profile'],
} 