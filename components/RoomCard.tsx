'use client'

import { useState } from 'react'
import AdmitModal from './AdmitModal'
// import DischargeModal from './DischargeModal'
import EditRoomModal from './EditRoomModal'

interface Room {
  id: string; room_number: string; location: string; notes: string;
  is_occupied: string; current_patient_name: string; admitted_at: string;
  pin: string; welcome_message: string; last_updated_at: string;
}

interface Props {
  room: Room
  siteSlug: string
  siteName: string
  onRefresh: () => void
}

function formatTime(ts: string | null) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export default function RoomCard({ room, siteSlug, siteName, onRefresh }: Props) {
  const [showAdmit, setShowAdmit] = useState(false)
  // const [showDischarge, setShowDischarge] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showUrl, setShowUrl] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pinVisible, setPinVisible] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(room.current_patient_name || '')

  async function saveName() {
    setEditingName(false)
    if (nameValue === room.current_patient_name) return
    await fetch(`/api/rooms/${room.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rename', patient_name: nameValue }),
    })
    onRefresh()
  }

  const isOccupied = room.is_occupied === 'true' || room.is_occupied === true as unknown as string

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shortSlug = siteSlug.slice(0, 4).toLowerCase()
  const shortUrl = `${origin}/s/${shortSlug}/${room.room_number.toLowerCase()}`
  const fullUrl = `${origin}/screen/${room.id}`

  async function refreshScreen() {
    setRefreshing(true)
    await fetch(`/api/rooms/${room.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh' }),
    })
    setTimeout(() => setRefreshing(false), 800)
  }

  const msg = room.welcome_message
  const truncatedMsg = msg && msg.length > 120 ? msg.slice(0, 120) + '…' : msg

  return (
    <>
      <div className={`glass-card-hover flex flex-col relative overflow-hidden ${isOccupied ? 'glow-orange' : 'glow-green'}`}
        style={{ borderColor: isOccupied ? 'rgba(255,107,43,0.2)' : 'rgba(0,255,156,0.2)' }}>

        {/* Status indicator line */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{
          background: isOccupied
            ? 'linear-gradient(90deg, transparent, rgba(255,107,43,0.6), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0,255,156,0.6), transparent)'
        }} />

        {/* Clickable body — opens edit */}
        <div
          className="p-4 flex flex-col gap-3 cursor-pointer flex-1"
          onClick={() => setShowEdit(true)}
          title="Click to edit room"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold text-white">Room {room.room_number}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOccupied ? 'text-neon-orange bg-neon-orange/10' : 'text-neon-green bg-neon-green/10'}`}>
                  {isOccupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>
              <p className="text-white/40 text-sm mt-0.5 h-5 truncate">
                {room.location || ''}
              </p>
            </div>
            {/* Edit hint */}
            <div className="text-white/15 p-1 flex-shrink-0 ml-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          </div>

          {/* Patient info */}
          {isOccupied && (
            <div className="rounded-lg p-3" style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.15)' }}
              onClick={e => e.stopPropagation()}>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    className="font-semibold text-white bg-transparent border-b border-neon-orange/50 focus:outline-none flex-1 min-w-0"
                    value={nameValue}
                    autoFocus
                    onChange={e => setNameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameValue(room.current_patient_name || ''); setEditingName(false) } }}
                  />
                  <button
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); saveName() }}
                    className="text-neon-green hover:text-white transition-colors flex-shrink-0"
                    title="Save"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                  <button
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setNameValue(room.current_patient_name || ''); setEditingName(false) }}
                    className="text-white/30 hover:text-white transition-colors flex-shrink-0"
                    title="Cancel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <p
                  className="text-white font-semibold cursor-pointer hover:text-neon-orange transition-colors"
                  title="Click to edit name"
                  onClick={() => { setNameValue(room.current_patient_name || ''); setEditingName(true) }}
                >
                  {room.current_patient_name}
                </p>
              )}
              {room.admitted_at && (
                <p className="text-white/40 text-xs mt-0.5">Admitted {formatTime(room.admitted_at)}</p>
              )}
            </div>
          )}

          {/* Screen message */}
          {msg ? (
            <p className="text-white/55 text-sm leading-relaxed">{truncatedMsg}</p>
          ) : (
            <p className="text-white/20 text-xs italic">No screen message set</p>
          )}
        </div>

        {/* Actions — not part of the clickable area */}
        <div className="px-4 pb-4 pt-3 border-t border-white/5 space-y-2">

          {/* Row 1 — primary action + PIN */}
          <div className="flex items-center gap-2">
            {isOccupied ? (
              <button onClick={e => { e.stopPropagation(); setShowEdit(true) }} className="neon-btn-orange flex-1 justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Message
              </button>
            ) : (
              <button onClick={e => { e.stopPropagation(); setShowAdmit(true) }} className="neon-btn-green flex-1 justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/>
                </svg>
                Add Message
              </button>
            )}

            {/* PIN with hold-to-reveal */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-white/30 text-xs">PIN</span>
              <span className="font-mono text-sm text-white/70 w-9 tracking-widest select-none">
                {pinVisible ? room.pin : '••••'}
              </span>
              <button
                onMouseDown={() => setPinVisible(true)}
                onMouseUp={() => setPinVisible(false)}
                onMouseLeave={() => setPinVisible(false)}
                onTouchStart={() => setPinVisible(true)}
                onTouchEnd={() => setPinVisible(false)}
                className="text-white/20 hover:text-white/60 transition-colors"
                title="Hold to reveal PIN"
              >
                {pinVisible ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Row 2 — screen utilities */}
          <div className="grid grid-cols-3 gap-1.5">
            <button onClick={e => { e.stopPropagation(); refreshScreen() }} disabled={refreshing}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={refreshing ? 'animate-spin' : ''}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {refreshing ? '...' : 'Refresh'}
            </button>

            <a href={fullUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Preview
            </a>

            <button onClick={e => { e.stopPropagation(); setShowUrl(true) }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Show URL
            </button>
          </div>
        </div>
      </div>

      {showAdmit && <AdmitModal room={room} siteName={siteName} onClose={() => setShowAdmit(false)} onSuccess={() => { setShowAdmit(false); onRefresh() }} />}
      {/* showDischarge && <DischargeModal room={room} onClose={() => setShowDischarge(false)} onSuccess={() => { setShowDischarge(false); onRefresh() }} /> */}
      {showEdit && <EditRoomModal room={room} siteName={siteName} onClose={() => setShowEdit(false)} onSuccess={() => { setShowEdit(false); onRefresh() }} />}

      {showUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowUrl(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md glass-card p-8 z-10 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-5">Screen URL — Room {room.room_number}</p>

            <div className="mb-3 p-5 rounded-xl" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.25)' }}>
              <p className="text-white/30 text-xs mb-2">Type this into the TV browser</p>
              <p className="text-neon-cyan font-mono text-xl font-bold break-all leading-snug">{shortUrl}</p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="text-white/30 text-sm">PIN</span>
              <span className="font-mono text-white text-2xl font-bold tracking-[0.3em]">{room.pin}</span>
            </div>

            <p className="text-white/20 text-xs font-mono break-all leading-relaxed mb-5">{fullUrl}</p>

            <button onClick={() => setShowUrl(false)} className="neon-btn-cyan mx-auto justify-center px-8">
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
