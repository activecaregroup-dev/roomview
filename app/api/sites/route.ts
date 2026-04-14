export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSites } from '@/lib/auth'

export async function GET() {
  const sites = await getSites()
  return NextResponse.json(sites)
}
