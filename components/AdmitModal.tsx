'use client'

import { useState } from 'react'

interface Props {
  room: { id: string; room_number: string; location: string }
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

export default function AdmitModal({ room, siteName, onClose, onSuccess }: Props) {
  const [patientName, setPatientName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState(defaultMessage(siteName))
  const [loading, setLoading] = useState(false)

  async function handleAdmit() {
    if (!patientName.trim()) return
    setLoading(true)
    await fetch(`/api/rooms/${room.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'admit', patient_name: patientName, welcome_message: welcomeMessage }),
    })
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg glass-card p-6 z-10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Admit Patient</h2>
            <p className="text-white/40 text-sm mt-0.5">Room {room.room_number} — {room.location}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-dark">Patient first name <span className="text-neon-orange">*</span></label>
            <input
              className="input-dark"
              placeholder="e.g. Margaret"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label-dark">Personal welcome message <span className="text-white/30">(optional)</span></label>
            <textarea
              className="input-dark resize-none"
              rows={5}
              placeholder="e.g. We're so glad to have you with us, Margaret..."
              value={welcomeMessage}
              onChange={e => setWelcomeMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm">
            Cancel
          </button>
          <button
            onClick={handleAdmit}
            disabled={!patientName.trim() || loading}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(0,255,156,0.2), rgba(0,255,156,0.1))', border: '1px solid rgba(0,255,156,0.4)', color: '#00FF9C' }}
          >
            {loading ? 'Admitting...' : 'Admit Patient'}
          </button>
        </div>
      </div>
    </div>
  )
}
