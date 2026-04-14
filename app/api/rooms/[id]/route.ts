export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { snowflakeQuery } from '@/lib/snowflake'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  if (action === 'admit') {
    const { patient_name, welcome_message, activities } = body
    await snowflakeQuery(`
      UPDATE ROOMS SET is_occupied = TRUE, current_patient_name = ?, admitted_at = CURRENT_TIMESTAMP()
      WHERE id = ? AND site_id = ?
    `, [patient_name, params.id, session.siteId])

    // Get site defaults for anything not overridden
    const [broadcast] = await snowflakeQuery<{ concierge_message: string; activities: string }>(`
      SELECT concierge_message, activities FROM SITE_BROADCAST
      WHERE site_id = ? ORDER BY pushed_at DESC LIMIT 1
    `, [session.siteId])

    await snowflakeQuery(`
      UPDATE SCREENS SET
        welcome_message = ?,
        activities = ?,
        last_updated_at = CURRENT_TIMESTAMP()
      WHERE room_id = ?
    `, [
      welcome_message || '',
      activities || broadcast?.activities || '',
      params.id,
    ])
    return NextResponse.json({ ok: true })
  }

  if (action === 'discharge') {
    await snowflakeQuery(`
      UPDATE ROOMS SET is_occupied = FALSE, current_patient_name = NULL, admitted_at = NULL
      WHERE id = ? AND site_id = ?
    `, [params.id, session.siteId])

    // Reset screen to site defaults
    const [broadcast] = await snowflakeQuery<{ concierge_message: string; activities: string }>(`
      SELECT concierge_message, activities FROM SITE_BROADCAST
      WHERE site_id = ? ORDER BY pushed_at DESC LIMIT 1
    `, [session.siteId])

    await snowflakeQuery(`
      UPDATE SCREENS SET
        welcome_message = NULL,
        concierge_message = ?,
        activities = ?,
        last_updated_at = CURRENT_TIMESTAMP()
      WHERE room_id = ?
    `, [broadcast?.concierge_message || '', broadcast?.activities || '', params.id])

    return NextResponse.json({ ok: true })
  }

  if (action === 'edit') {
    const { room_number, location, notes, pin, welcome_message } = body
    await snowflakeQuery(`
      UPDATE ROOMS SET room_number = ?, location = ?, notes = ?, pin = ?
      WHERE id = ? AND site_id = ?
    `, [room_number, location, notes, pin, params.id, session.siteId])

    await snowflakeQuery(`
      UPDATE SCREENS SET welcome_message = ?, last_updated_at = CURRENT_TIMESTAMP()
      WHERE room_id = ?
    `, [welcome_message, params.id])

    return NextResponse.json({ ok: true })
  }

  if (action === 'refresh') {
    await snowflakeQuery(`
      UPDATE SCREENS SET last_updated_at = CURRENT_TIMESTAMP() WHERE room_id = ?
    `, [params.id])
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await snowflakeQuery(`DELETE FROM SCREENS WHERE room_id = ?`, [params.id])
  await snowflakeQuery(`DELETE FROM ROOMS WHERE id = ? AND site_id = ?`, [params.id, session.siteId])
  return NextResponse.json({ ok: true })
}
