import { redirect, notFound } from 'next/navigation'
import { snowflakeQuery } from '@/lib/snowflake'

export default async function ShortUrlPage({
  params,
}: {
  params: { site: string; room: string }
}) {
  // Look up the room ID by site slug prefix + room number
  const rows = await snowflakeQuery<{ id: string }>(`
    SELECT r.id
    FROM ROOMS r
    JOIN SITES s ON s.id = r.site_id
    WHERE LOWER(s.slug) LIKE LOWER(?) || '%'
      AND LOWER(r.room_number) = LOWER(?)
    LIMIT 1
  `, [params.site, params.room])

  if (!rows.length) notFound()

  redirect(`/screen/${rows[0].id}`)
}
