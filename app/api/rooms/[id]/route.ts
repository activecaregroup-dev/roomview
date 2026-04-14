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
    const { patient_name, welcome_message } = body
    await snowflakeQuery(`
      UPDATE ROOMS SET is_occupied = TRUE, current_patient_name = ?, admitted_at = CURRENT_TIMESTAMP()
      WHERE id = ? AND site_id = ?
    `, [patient_name, params.id, session.siteId])

    const existingAdmit = await snowflakeQuery<{ room_id: string }>(`SELECT room_id FROM SCREENS WHERE room_id = ?`, [params.id])
    if (existingAdmit.length > 0) {
      await snowflakeQuery(`UPDATE SCREENS SET welcome_message = ?, last_updated_at = CURRENT_TIMESTAMP() WHERE room_id = ?`, [welcome_message || '', params.id])
    } else {
      await snowflakeQuery(`INSERT INTO SCREENS (room_id, welcome_message) VALUES (?, ?)`, [params.id, welcome_message || ''])
    }

    return NextResponse.json({ ok: true })
  }

  if (action === 'discharge') {
    await snowflakeQuery(`
      UPDATE ROOMS SET is_occupied = FALSE, current_patient_name = NULL, admitted_at = NULL
      WHERE id = ? AND site_id = ?
    `, [params.id, session.siteId])

    const existingDischarge = await snowflakeQuery<{ room_id: string }>(`SELECT room_id FROM SCREENS WHERE room_id = ?`, [params.id])
    if (existingDischarge.length > 0) {
      await snowflakeQuery(`UPDATE SCREENS SET welcome_message = NULL, last_updated_at = CURRENT_TIMESTAMP() WHERE room_id = ?`, [params.id])
    } else {
      await snowflakeQuery(`INSERT INTO SCREENS (room_id, welcome_message) VALUES (?, NULL)`, [params.id])
    }

    return NextResponse.json({ ok: true })
  }

  if (action === 'edit') {
    const { room_number, location, notes, pin, welcome_message } = body
    await snowflakeQuery(`
      UPDATE ROOMS SET room_number = ?, location = ?, notes = ?, pin = ?
      WHERE id = ? AND site_id = ?
    `, [room_number ?? '', location ?? '', notes ?? '', pin ?? '', params.id, session.siteId])

    // Only update SCREENS if welcome_message was explicitly sent (dashboard EditRoomModal)
    if ('welcome_message' in body) {
      const existing = await snowflakeQuery<{ room_id: string }>(`SELECT room_id FROM SCREENS WHERE room_id = ?`, [params.id])
      if (existing.length > 0) {
        await snowflakeQuery(`UPDATE SCREENS SET welcome_message = ?, last_updated_at = CURRENT_TIMESTAMP() WHERE room_id = ?`, [welcome_message ?? '', params.id])
      } else {
        await snowflakeQuery(`INSERT INTO SCREENS (room_id, welcome_message) VALUES (?, ?)`, [params.id, welcome_message ?? ''])
      }
    }

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
