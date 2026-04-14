export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { snowflakeQuery } from '@/lib/snowflake'

// Public endpoint — no auth — used by screen view
export async function GET(req: NextRequest, { params }: { params: { room_id: string } }) {
  const rows = await snowflakeQuery<{
    id: string; room_number: string; location: string;
    is_occupied: string; current_patient_name: string; admitted_at: string;
    welcome_message: string; concierge_message: string; activities: string;
    last_updated_at: string; pin: string; site_name: string;
  }>(`
    SELECT r.id, r.room_number, r.location, r.is_occupied,
           r.current_patient_name, r.admitted_at, r.pin,
           s.welcome_message, s.concierge_message, s.activities, s.last_updated_at,
           si.name as site_name
    FROM ROOMS r
    LEFT JOIN SCREENS s ON s.room_id = r.id
    LEFT JOIN SITES si ON si.id = r.site_id
    WHERE r.id = ?
  `, [params.room_id])

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Strip PIN from response — only used for verification
  const { pin, ...rest } = rows[0]
  void pin
  return NextResponse.json(rest)
}

export async function POST(req: NextRequest, { params }: { params: { room_id: string } }) {
  const { pin } = await req.json()
  const rows = await snowflakeQuery<{ pin: string }>(`
    SELECT pin FROM ROOMS WHERE id = ?
  `, [params.room_id])

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (rows[0].pin !== pin) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
  return NextResponse.json({ ok: true })
}
