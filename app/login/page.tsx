'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Site { name: string; slug: string }

export default function LoginPage() {
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSites, setLoadingSites] = useState(true)

  useEffect(() => {
    fetch('/api/sites').then(r => r.json()).then(d => {
      setSites(d)
      setLoadingSites(false)
    })
  }, [])

  const selectedSite = sites.find(s => s.slug === selectedSlug)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlug) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: selectedSlug, password }),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A0F1A 0%, #0F1A2E 50%, #0A0F1A 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: '#00D4FF', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: '#FF6B2B', filter: 'blur(120px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,201,122,0.05))', border: '1px solid rgba(201,168,76,0.2)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/acglogo.png" alt="ACG" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>RoomView</h1>
          <p className="text-white/40 text-sm">Active Care Group</p>
        </div>

        {/* Step 1 — site picker */}
        {!selectedSlug ? (
          <div className="glass-card p-8">
            <h2 className="text-lg font-semibold text-white mb-1">Select your site</h2>
            <p className="text-white/30 text-sm mb-5">Choose the site you manage</p>
            {loadingSites ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
              </div>
            ) : sites.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">No sites found. Add one via Snowflake SQL.</p>
            ) : (
              <div className="space-y-2">
                {sites.map(site => (
                  <button
                    key={site.slug}
                    onClick={() => setSelectedSlug(site.slug)}
                    className="w-full text-left px-4 py-4 rounded-xl transition-all duration-200 flex items-center justify-between group"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.25)' }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', fontFamily: 'Playfair Display, serif' }}>
                        {site.name[0]}
                      </div>
                      <span className="text-white font-medium">{site.name}</span>
                    </div>
                    <svg className="text-white/20 group-hover:text-white/50 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Step 2 — password */
          <div className="glass-card p-8">
            <button
              onClick={() => { setSelectedSlug(null); setPassword(''); setError('') }}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to sites
            </button>

            <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', fontFamily: 'Playfair Display, serif' }}>
                {selectedSite?.name[0]}
              </div>
              <div>
                <p className="text-white font-semibold">{selectedSite?.name}</p>
                <p className="text-white/30 text-xs">Enter your password to continue</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-dark">Password</label>
                <input
                  type="password"
                  className="input-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200"
                style={{ background: loading ? 'rgba(0,212,255,0.2)' : 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,212,255,0.15))', border: '1px solid rgba(0,212,255,0.4)' }}
              >
                {loading ? 'Signing in...' : `Sign in to ${selectedSite?.name}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
