export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { snowflakeQuery } from '@/lib/snowflake'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [latest] = await snowflakeQuery<{
    concierge_message: string; activities: string; pushed_at: string;
  }>(`
    SELECT concierge_message, activities, pushed_at FROM SITE_BROADCAST
    WHERE site_id = ? ORDER BY pushed_at DESC LIMIT 1
  `, [session.siteId])

  return NextResponse.json(latest || { concierge_message: '', activities: '', pushed_at: null })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { concierge_message, activities, room_ids } = await req.json()

  // Log this broadcast
  await snowflakeQuery(`
    INSERT INTO SITE_BROADCAST (site_id, concierge_message, activities)
    VALUES (?, ?, ?)
  `, [session.siteId, concierge_message || '', activities || ''])

  if (room_ids && Array.isArray(room_ids) && room_ids.length > 0) {
    // Push to selected rooms only
    for (const roomId of room_ids) {
      await snowflakeQuery(`
        UPDATE SCREENS SET
          concierge_message = ?,
          activities = ?,
          last_updated_at = CURRENT_TIMESTAMP()
        WHERE room_id = ?
      `, [concierge_message || '', activities || '', roomId])
    }
  } else {
    // Push to all rooms for this site
    await snowflakeQuery(`
      UPDATE SCREENS SET
        concierge_message = ?,
        activities = ?,
        last_updated_at = CURRENT_TIMESTAMP()
      WHERE room_id IN (SELECT id FROM ROOMS WHERE site_id = ?)
    `, [concierge_message || '', activities || '', session.siteId])
  }

  return NextResponse.json({ ok: true })
}
