'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import RoomCard from '@/components/RoomCard'
// import BroadcastPanel from '@/components/BroadcastPanel'
import type { SessionPayload } from '@/lib/auth'

interface Room {
  id: string; room_number: string; location: string; notes: string;
  is_occupied: string; current_patient_name: string; admitted_at: string;
  pin: string; welcome_message: string; last_updated_at: string;
}

export default function DashboardClient({ session }: { session: SessionPayload }) {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRooms = useCallback(async () => {
    const res = await fetch('/api/rooms')
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    setRooms(data)
    setLoading(false)
  }, [router])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const occupiedCount = rooms.filter(r => r.is_occupied === 'true' || r.is_occupied === true as unknown as string).length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0A0F1A 0%, #0D1525 50%, #0A0F1A 100%)' }}>
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/acglogo.png" alt="ACG" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-white font-semibold">RoomView</span>
            </div>
            <span className="text-white/20">|</span>
            <span className="text-white/60 text-sm">{session.siteName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-green" />
                <span className="text-white/50">{rooms.length - occupiedCount} vacant</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-orange" />
                <span className="text-white/50">{occupiedCount} occupied</span>
              </span>
            </div>
            <a href="/manage" className="neon-btn-cyan py-1.5 text-xs">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Manage Rooms
            </a>
            <button onClick={logout} className="text-white/30 hover:text-white/60 text-sm transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse" style={{ minHeight: 200 }}>
                <div className="h-4 bg-white/5 rounded mb-3 w-2/3" />
                <div className="h-3 bg-white/5 rounded mb-2 w-1/2" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-white/20 text-6xl mb-4">🏥</div>
            <p className="text-white/40 text-lg mb-2">No rooms yet</p>
            <p className="text-white/20 text-sm mb-6">Add rooms from the Manage page to get started</p>
            <a href="/manage" className="neon-btn-cyan inline-flex">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add first room
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} siteSlug={session.siteSlug} siteName={session.siteName} onRefresh={fetchRooms} />
            ))}
          </div>
        )}

        {/* {!loading && rooms.length > 0 && <BroadcastPanel rooms={rooms} />} */}
      </main>
    </div>
  )
}
