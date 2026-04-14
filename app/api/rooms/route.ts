export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { snowflakeQuery } from '@/lib/snowflake'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await snowflakeQuery(`
    SELECT r.id, r.room_number, r.location, r.notes, r.is_occupied,
           r.current_patient_name, r.admitted_at, r.pin,
           s.welcome_message, s.concierge_message, s.activities, s.last_updated_at
    FROM ROOMS r
    LEFT JOIN SCREENS s ON s.room_id = r.id
    WHERE r.site_id = ?
    ORDER BY TRY_TO_NUMBER(r.room_number), r.room_number
  `, [session.siteId])

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { room_number, location, notes, pin } = await req.json()
  const finalPin = pin || String(Math.floor(1000 + Math.random() * 9000))

  await snowflakeQuery(`
    INSERT INTO ROOMS (site_id, room_number, location, notes, pin)
    VALUES (?, ?, ?, ?, ?)
  `, [session.siteId, room_number, location || '', notes || '', finalPin])

  // Create a blank screen record for this room
  const [newRoom] = await snowflakeQuery<{ id: string }>(`
    SELECT id FROM ROOMS WHERE site_id = ? AND room_number = ? ORDER BY created_at DESC LIMIT 1
  `, [session.siteId, room_number])

  if (newRoom?.id) {
    // Get site defaults
    const [broadcast] = await snowflakeQuery<{ concierge_message: string; activities: string }>(`
      SELECT concierge_message, activities FROM SITE_BROADCAST
      WHERE site_id = ? ORDER BY pushed_at DESC LIMIT 1
    `, [session.siteId])

    await snowflakeQuery(`
      INSERT INTO SCREENS (room_id, concierge_message, activities)
      VALUES (?, ?, ?)
    `, [newRoom.id, broadcast?.concierge_message || '', broadcast?.activities || ''])
  }

  return NextResponse.json({ ok: true })
}
