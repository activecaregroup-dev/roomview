export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { login, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { slug, password } = await req.json()
  if (!slug || !password) {
    return NextResponse.json({ error: 'Site and password required' }, { status: 400 })
  }
  const token = await login(slug, password)
  if (!token) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }
  await setSessionCookie(token)
  return NextResponse.json({ ok: true })
}
