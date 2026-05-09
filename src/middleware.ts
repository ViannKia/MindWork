import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Ambil SEMUA cookie
  const allCookies = request.cookies.getAll()
  
  // Cari cookie yang mengandung 'sb-' (Supabase cookie)
  const supabaseCookie = allCookies.find(cookie => cookie.name.includes('sb-'))
  
  const isLoggedIn = !!supabaseCookie
  
  console.log('Middleware check:', {
    path: request.nextUrl.pathname,
    isLoggedIn,
    cookieNames: allCookies.map(c => c.name)
  })
  
  // Proteksi dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect ke dashboard jika sudah login
  if (request.nextUrl.pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}