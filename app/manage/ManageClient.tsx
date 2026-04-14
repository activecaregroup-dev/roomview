'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SessionPayload } from '@/lib/auth'

interface Room {
  id: string; room_number: string; location: string; notes: string;
  is_occupied: string; pin: string;
}

interface FormState {
  room_number: string; location: string; notes: string; pin: string;
}

function generatePin() { return String(Math.floor(1000 + Math.random() * 9000)) }

export default function ManageClient({ session }: { session: SessionPayload }) {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null)
  const [form, setForm] = useState<FormState>({ room_number: '', location: '', notes: '', pin: generatePin() })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchRooms = useCallback(async () => {
    const res = await fetch('/api/rooms')
    if (res.status === 401) { router.push('/login'); return }
    setRooms(await res.json())
    setLoading(false)
  }, [router])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleAdd() {
    setSaving(true)
    setSaveError('')
    const res = await fetch('/api/rooms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setSaveError(d.error || `Error ${res.status}`)
      setSaving(false)
      return
    }
    setShowAdd(false)
    setForm({ room_number: '', location: '', notes: '', pin: generatePin() })
    setSaving(false)
    fetchRooms()
  }

  async function handleEdit() {
    if (!editRoom) return
    setSaving(true)
    setSaveError('')
    const res = await fetch(`/api/rooms/${editRoom.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit', ...form }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setSaveError(d.error || `Error ${res.status}`)
      setSaving(false)
      return
    }
    setEditRoom(null)
    setSaving(false)
    fetchRooms()
  }

  async function handleDelete() {
    if (!deleteRoom) return
    setDeleting(true)
    await fetch(`/api/rooms/${deleteRoom.id}`, { method: 'DELETE' })
    setDeleteRoom(null)
    setDeleting(false)
    fetchRooms()
  }

  function openEdit(room: Room) {
    setForm({ room_number: room.room_number, location: room.location || '', notes: room.notes || '', pin: room.pin })
    setEditRoom(room)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0A0F1A 0%, #0D1525 50%, #0A0F1A 100%)' }}>
      <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-white/40 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </a>
            <div className="w-px h-5 bg-white/10" />
            <h1 className="text-white font-semibold">Manage Rooms</h1>
            <span className="text-white/30 text-sm">{session.siteName}</span>
          </div>
          <button
            onClick={() => { setForm({ room_number: '', location: '', notes: '', pin: generatePin() }); setShowAdd(true) }}
            className="neon-btn-green"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add room
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24 text-white/40">No rooms yet. Add one above.</div>
        ) : (
          <div className="space-y-3">
            {rooms.map(room => (
              <div key={room.id} className="glass-card-hover p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">Room {room.room_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (room.is_occupied === 'true' || room.is_occupied === true as unknown as string) ? 'text-neon-orange bg-neon-orange/10' : 'text-neon-green bg-neon-green/10'
                    }`}>
                      {(room.is_occupied === 'true' || room.is_occupied === true as unknown as string) ? 'Occupied' : 'Vacant'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
                    {room.location && <span>{room.location}</span>}
                    <span>PIN: <span className="font-mono text-white/60">{room.pin}</span></span>
                  </div>
                  {room.notes && <p className="text-white/30 text-xs mt-1 truncate max-w-md">{room.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(room)} className="neon-btn-cyan py-1.5 text-xs">Edit</button>
                  <button
                    onClick={() => setDeleteRoom(room)}
                    disabled={room.is_occupied === 'true' || room.is_occupied === true as unknown as string}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit modal */}
      {(showAdd || editRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEditRoom(null) }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md glass-card p-6 z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">{editRoom ? 'Edit Room' : 'Add Room'}</h2>
              <button onClick={() => { setShowAdd(false); setEditRoom(null) }} className="text-white/40 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">Room number</label>
                  <input className="input-dark" value={form.room_number} onChange={e => set('room_number', e.target.value)} />
                </div>
                <div>
                  <label className="label-dark">PIN</label>
                  <div className="flex gap-2">
                    <input className="input-dark font-mono" maxLength={4} value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} />
                    <button onClick={() => set('pin', generatePin())} className="px-2.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs transition-all">↻</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="label-dark">Location</label>
                <input className="input-dark" placeholder="e.g. East Wing, Floor 2" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div>
                <label className="label-dark">Notes</label>
                <textarea className="input-dark resize-none" rows={2} placeholder="Internal notes about this room..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
            {saveError && (
              <div className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {saveError}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowAdd(false); setEditRoom(null); setSaveError('') }} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all text-sm">
                Cancel
              </button>
              <button
                onClick={editRoom ? handleEdit : handleAdd}
                disabled={!form.room_number || saving}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,156,0.2), rgba(0,255,156,0.1))', border: '1px solid rgba(0,255,156,0.4)', color: '#00FF9C' }}
              >
                {saving ? 'Saving...' : editRoom ? 'Save Changes' : 'Add Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteRoom(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass-card p-6 z-10" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-2">Delete room?</h2>
            <p className="text-white/50 text-sm mb-5">
              Room {deleteRoom.room_number} will be permanently deleted along with its screen data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRoom(null)} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all text-sm">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
