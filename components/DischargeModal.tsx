'use client'

import { useState } from 'react'

interface Props {
  room: { id: string; room_number: string; current_patient_name: string }
  onClose: () => void
  onSuccess: () => void
}

export default function DischargeModal({ room, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDischarge() {
    setLoading(true)
    await fetch(`/api/rooms/${room.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'discharge' }),
    })
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm glass-card p-6 z-10" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: 'rgba(255,107,43,0.15)', border: '1px solid rgba(255,107,43,0.3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Discharge Patient</h2>
          <p className="text-white/50 text-sm mt-2">
            This will discharge <span className="text-white font-medium">{room.current_patient_name}</span> from Room {room.room_number} and reset the screen.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm">
            Cancel
          </button>
          <button
            onClick={handleDischarge}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(255,107,43,0.2), rgba(255,107,43,0.1))', border: '1px solid rgba(255,107,43,0.4)', color: '#FF6B2B' }}
          >
            {loading ? 'Discharging...' : 'Confirm Discharge'}
          </button>
        </div>
      </div>
    </div>
  )
}
