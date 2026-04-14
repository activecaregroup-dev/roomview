'use client'

import { useState, useEffect, useCallback } from 'react'

interface ScreenData {
  id: string;
  room_number: string;
  location: string;
  is_occupied: string;
  current_patient_name: string;
  admitted_at: string;
  welcome_message: string;
  concierge_message: string;
  activities: string;
  last_updated_at: string;
  site_name: string;
}

// ── ACG Logo ──────────────────────────────────────────────────────────────────
function ACGLogo({ size = 48 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/acglogo.png" alt="ACG" width={size} height={size} style={{ objectFit: 'contain' }} />
  )
}

// ── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock({ light = false }: { light?: boolean }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return light ? (
    <div>
      <div style={{ fontFamily: 'Lato, sans-serif', fontSize: '2.4rem', fontWeight: 300, color: '#6B1E3C', letterSpacing: '0.04em', lineHeight: 1 }}>
        {time}
      </div>
      <div style={{ fontFamily: 'Lato, sans-serif', fontSize: '1rem', color: 'rgba(107,30,60,0.5)', marginTop: 4 }}>
        {date}
      </div>
    </div>
  ) : (
    <div className="text-right">
      <div style={{ fontFamily: 'Lato, sans-serif', fontSize: '3rem', fontWeight: 300, color: '#E8C97A', letterSpacing: '0.05em', lineHeight: 1 }}>
        {time}
      </div>
      <div style={{ fontFamily: 'Lato, sans-serif', fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
        {date}
      </div>
    </div>
  )
}

// ── Ambient background — photo + layered overlays ────────────────────────────
function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Photo layer */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />
      {/* Deep navy tint — preserves photo texture while keeping luxury dark feel */}
      <div className="absolute inset-0" style={{
        background: 'rgba(9, 20, 34, 0.82)',
      }} />
      {/* Vignette — darkens edges, draws eye to centre */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,12,22,0.75) 100%)',
      }} />
      {/* Warm gold horizon glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '35%',
        background: 'linear-gradient(to top, rgba(201,168,76,0.07), transparent)',
      }} />
      {/* Subtle gold shimmer top-left */}
      <div className="absolute rounded-full" style={{
        width: 500, height: 500, top: '-10%', left: '-5%',
        background: 'rgba(201,168,76,0.04)',
        filter: 'blur(120px)',
        animation: 'float 20s ease-in-out infinite',
      }} />
    </div>
  )
}

// ── PIN Entry ─────────────────────────────────────────────────────────────────
function PinEntry({ roomId, onUnlock }: { roomId: string; onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)

  async function verify(fullPin: string) {
    const res = await fetch(`/api/screens/${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: fullPin }),
    })
    if (res.ok) {
      onUnlock()
    } else {
      setShake(true)
      setError(true)
      setPin('')
      setTimeout(() => { setShake(false); setError(false) }, 700)
    }
  }

  function pressKey(k: string) {
    if (pin.length >= 4) return
    const next = pin + k
    setPin(next)
    if (next.length === 4) verify(next)
  }

  function backspace() { setPin(p => p.slice(0, -1)) }

  const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['','0','⌫']]

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#050c16' }}>
      <AmbientBackground />
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <div className="flex flex-col items-center gap-3">
          <ACGLogo size={64} />
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#E8C97A', fontWeight: 600 }}>
            Active Care Group
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>Enter PIN to access this screen</p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-4 ${shake ? 'animate-shake' : ''}`}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < pin.length ? (error ? '#ef4444' : '#C9A84C') : 'transparent',
              border: `2px solid ${i < pin.length ? (error ? '#ef4444' : '#C9A84C') : 'rgba(255,255,255,0.2)'}`,
              transition: 'all 0.15s',
            }} />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {keys.flat().map((k, i) => (
            <button
              key={i}
              onClick={() => k === '⌫' ? backspace() : k ? pressKey(k) : undefined}
              disabled={!k}
              style={{
                width: 72, height: 72, borderRadius: 16,
                fontSize: k === '⌫' ? '1.4rem' : '1.6rem',
                fontFamily: k === '⌫' ? 'system-ui' : 'Lato, sans-serif',
                fontWeight: 300,
                color: !k ? 'transparent' : 'rgba(255,255,255,0.85)',
                background: k ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: k ? '1px solid rgba(255,255,255,0.1)' : 'none',
                cursor: k ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { if (k) (e.target as HTMLElement).style.background = 'rgba(201,168,76,0.15)' }}
              onMouseOut={e => { if (k) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


// ── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ data }: { data: ScreenData }) {
  const isOccupied = data.is_occupied === 'true' || data.is_occupied === true as unknown as string
  const patientName = data.current_patient_name
  const hasMessage = !!data.welcome_message

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: 'Lato, sans-serif' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '2.5rem 3.5rem' }}>
        <div>
          <div style={{ fontFamily: 'Lato, sans-serif', fontSize: '1.1rem', color: 'rgba(107,30,60,0.45)', letterSpacing: '0.05em', marginBottom: 10 }}>
            {data.site_name} · Room {data.room_number}
          </div>
          <LiveClock light />
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/anlogo.jfif" alt="Active Neuro" style={{ height: 71, width: 'auto', objectFit: 'contain' }} />
        </div>
      </header>

      {/* Main card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 5rem 3rem' }}>
        <div style={{
          border: '2px solid rgba(175,135,85,0.35)',
          borderRadius: 28,
          padding: '4.5rem 6rem',
          maxWidth: 1080,
          width: '100%',
          textAlign: 'center',
        }}>

          {/* Name */}
          <h1 style={{
            fontFamily: 'Comfortaa, sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
            fontWeight: 600,
            color: '#6B1E3C',
            lineHeight: 1.1,
            marginBottom: hasMessage ? '2rem' : 0,
          }}>
            {isOccupied && patientName ? patientName : data.site_name}
          </h1>

          {/* Message */}
          {hasMessage && (
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 'clamp(1.2rem, 2.2vw, 1.7rem)',
              color: '#6B1E3C',
              lineHeight: 1.65,
              fontWeight: 400,
              whiteSpace: 'pre-line',
            }}>
              {data.welcome_message}
            </p>
          )}
        </div>
      </main>

      {/* Bottom colour strip */}
      <div style={{ display: 'flex', height: 90, flexShrink: 0 }}>
        <div style={{ flex: 2.5, background: '#E0CFA8' }} />
        <div style={{ flex: 0.45, background: '#E06020' }} />
        <div style={{ flex: 3, background: '#6B1E3C' }} />
      </div>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
export default function ScreenClient({ roomId }: { roomId: string }) {
  const [unlocked, setUnlocked] = useState(false)
  const [data, setData] = useState<ScreenData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/screens/${roomId}`)
    if (res.status === 404) { setNotFound(true); return }
    const d = await res.json()
    setData(d)
    // If last_updated_at changed after unlock, reload screen content
    if (lastUpdated && d.last_updated_at !== lastUpdated) {
      setLastUpdated(d.last_updated_at)
    } else if (!lastUpdated && d.last_updated_at) {
      setLastUpdated(d.last_updated_at)
    }
  }, [roomId, lastUpdated])

  // Initial load
  useEffect(() => { fetchData() }, [roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for refresh signal (checks last_updated_at every 30s after unlock)
  useEffect(() => {
    if (!unlocked) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/screens/${roomId}`)
      if (!res.ok) return
      const d = await res.json()
      setData(d)
    }, 30000)
    return () => clearInterval(interval)
  }, [unlocked, roomId])

  // Also reload on visibility change (tab comes back into focus)
  useEffect(() => {
    if (!unlocked) return
    function onVisible() {
      if (document.visibilityState === 'visible') fetchData()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [unlocked, fetchData])

  if (notFound) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#050c16' }}>
        <div className="text-center">
          <ACGLogo size={64} />
          <p style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(255,255,255,0.3)', marginTop: 24, fontSize: '1.1rem' }}>
            Room not found
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#050c16' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!unlocked) {
    return <PinEntry roomId={roomId} onUnlock={() => { setUnlocked(true) }} />
  }

  return <WelcomeScreen data={data} />
}
