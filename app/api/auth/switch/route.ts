export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession, switchSite, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await req.json()
  const token = slug && await switchSite(slug)
  if (!token) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  await setSessionCookie(token)
  return NextResponse.json({ ok: true })
}
