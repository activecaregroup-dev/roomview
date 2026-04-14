'use client'

import { useState, useEffect } from 'react'

interface Room { id: string; room_number: string; location: string }

interface Props { rooms: Room[] }

function formatTime(ts: string | null) {
  if (!ts) return null
  try { return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return null }
}

export default function BroadcastPanel({ rooms }: Props) {
  const [concierge, setConcierge] = useState('')
  const [activities, setActivities] = useState('')
  const [pushedAt, setPushedAt] = useState<string | null>(null)
  const [pushing, setPushing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Default: all rooms selected
  useEffect(() => {
    setSelectedIds(new Set(rooms.map(r => r.id)))
  }, [rooms])

  useEffect(() => {
    fetch('/api/broadcast').then(r => r.json()).then(d => {
      setConcierge(d.concierge_message || '')
      setActivities(d.activities || '')
      setPushedAt(d.pushed_at)
    })
  }, [])

  const allSelected = rooms.length > 0 && selectedIds.size === rooms.length
  const noneSelected = selectedIds.size === 0

  function toggleRoom(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(rooms.map(r => r.id)))
  }

  async function push() {
    if (noneSelected) return
    setPushing(true)
    await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concierge_message: concierge,
        activities,
        room_ids: allSelected ? null : Array.from(selectedIds),
      }),
    })
    setPushedAt(new Date().toISOString())
    setPushing(false)
  }

  return (
    <div className="glass-card p-5 mt-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <h2 className="text-white font-semibold">Broadcast</h2>
        </div>
        {pushedAt && (
          <span className="text-white/30 text-xs">Last push: {formatTime(pushedAt)}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Message fields */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label-dark">Concierge message</label>
            <textarea
              className="input-dark resize-none"
              rows={4}
              placeholder="A warm message for selected rooms..."
              value={concierge}
              onChange={e => setConcierge(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="label-dark">Today&apos;s activities</label>
            <textarea
              className="input-dark resize-none"
              rows={4}
              placeholder="10:00 Morning exercise&#10;14:00 Arts & crafts&#10;16:30 Music session"
              value={activities}
              onChange={e => setActivities(e.target.value)}
            />
          </div>
        </div>

        {/* Room selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label-dark mb-0">Rooms to push to</label>
            <button onClick={toggleAll} className="text-xs text-neon-cyan/60 hover:text-neon-cyan transition-colors">
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {rooms.length === 0 ? (
              <p className="text-white/30 text-xs p-3">No rooms yet</p>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                {rooms.map((room, i) => (
                  <label
                    key={room.id}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/5"
                    style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: selectedIds.has(room.id) ? 'rgba(0,212,255,0.2)' : 'transparent',
                        border: `1.5px solid ${selectedIds.has(room.id) ? '#00D4FF' : 'rgba(255,255,255,0.2)'}`,
                      }}
                    >
                      {selectedIds.has(room.id) && (
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <polyline points="2 6 5 9 10 3" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" className="sr-only" checked={selectedIds.has(room.id)} onChange={() => toggleRoom(room.id)} />
                    <div className="min-w-0">
                      <span className="text-white text-sm">Room {room.room_number}</span>
                      {room.location && <span className="text-white/30 text-xs ml-1.5">{room.location}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={push}
            disabled={pushing || noneSelected}
            className="neon-btn-cyan w-full justify-center disabled:opacity-40 mt-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {pushing ? 'Pushing...' : noneSelected ? 'Select rooms first' : `Push to ${allSelected ? 'all' : selectedIds.size} room${selectedIds.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
