'use client'

import { useState } from 'react'

interface Room {
  id: string; room_number: string; location: string; notes: string;
  pin: string; welcome_message: string;
}

interface Props {
  room: Room
  siteName: string
  onClose: () => void
  onSuccess: () => void
}

function defaultMessage(siteName: string) {
  return `A warm welcome to ${siteName}
Our team is here to support you on your rehabilitation journey.
[Registered Manager Name], Registered Manager

Your concierge is [Concierge Name]`
}

export default function EditRoomModal({ room, siteName, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    room_number: room.room_number || '',
    location: room.location || '',
    notes: room.notes || '',
    pin: room.pin || '',
    welcome_message: room.welcome_message || defaultMessage(siteName),
  })
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await fetch(`/api/rooms/${room.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit', ...form }),
    })
    onSuccess()
  }

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl glass-card p-6 z-10 max-h-[90vh] overflow-y-auto" style={{ maxWidth: 596 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Room</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Room number</label>
              <input className="input-dark" value={form.room_number} onChange={e => set('room_number', e.target.value)} />
            </div>
            <div>
              <label className="label-dark">PIN <span className="text-white/30">(4 digits)</span></label>
              <input className="input-dark" maxLength={4} value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>
          <div>
            <label className="label-dark">Location</label>
            <input className="input-dark" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label-dark">Notes <span className="text-white/30">(internal)</span></label>
            <textarea className="input-dark resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="border-t border-white/10 pt-4">
            <div>
              <label className="label-dark">Screen message</label>
              <textarea
                className="input-dark resize-none"
                rows={6}
                style={{ padding: '8px 16px' }}
                value={form.welcome_message}
                onChange={e => set('welcome_message', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))', border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF' }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
