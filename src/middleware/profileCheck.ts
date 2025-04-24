import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { admin } from '@/lib/firebase-admin'
import { doc, getDoc } from 'firebase-admin/firestore'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('__session')?.value
  const pathname = req.nextUrl.pathname

  if (!token) return NextResponse.next()

  try {
    const decoded = await getAuth(admin).verifyIdToken(token)
    const ref = doc(admin.firestore(), 'users', decoded.uid)
    const snap = await getDoc(ref)

    if (!snap.exists() && pathname !== '/dashboard/settings') {
      const url = new URL('/dashboard/settings', req.url)
      return NextResponse.redirect(url)
    }
  } catch (e) {
    console.error(e)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
