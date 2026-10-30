'use client'

import { useEffect, useState } from 'react'
import type { SessionPayload } from '@/lib/auth'

interface Site { name: string; slug: string }

// Shown in place of the site name for admin sessions
export default function SiteSwitcher({ session, className }: { session: SessionPayload; className: string }) {
  const [sites, setSites] = useState<Site[]>([])
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    if (!session.isAdmin) return
    fetch('/api/sites').then(r => r.json()).then((d: Site[]) => setSites(d.filter(s => s.slug !== 'admin')))
  }, [session.isAdmin])

  if (!session.isAdmin) return <span className={className}>{session.siteName}</span>

  async function handleChange(slug: string) {
    setSwitching(true)
    const res = await fetch('/api/auth/switch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (res.ok) window.location.reload()
    else setSwitching(false)
  }

  return (
    <select
      value={session.siteSlug}
      disabled={switching}
      onChange={e => handleChange(e.target.value)}
      className="text-white text-sm rounded-lg px-3 py-1.5 cursor-pointer outline-none"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      {!sites.length && <option value={session.siteSlug}>{session.siteName}</option>}
      {sites.map(s => (
        <option key={s.slug} value={s.slug} style={{ background: '#0D1525' }}>{s.name}</option>
      ))}
    </select>
  )
}
