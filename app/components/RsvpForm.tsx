'use client'

import { useState } from 'react'

const API_BASE =
  process.env.NEXT_PUBLIC_RSVP_API_URL ?? 'https://englajimmy-backend-production.up.railway.app'
const API_KEY = process.env.NEXT_PUBLIC_RSVP_API_KEY ?? ''

/** Matches RsvpCreate from API: name, email, coming, allergies?, transport_assist */
type RsvpCreate = {
  name: string
  email: string
  coming: boolean
  allergies?: string | null
  transport_assist?: boolean
}

export function RsvpForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = (formData.get('name') as string).trim()
    const email = (formData.get('email') as string).trim()
    const coming = formData.get('coming') === 'yes'
    const allergies = (formData.get('allergies') as string)?.trim() || null
    const transport_assist = formData.get('transport_assist') === 'on'

    const body: RsvpCreate = {
      name: name.slice(0, 255),
      email,
      coming,
      allergies: allergies ? allergies.slice(0, 500) : null,
      transport_assist,
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (API_KEY) headers['X-API-Key'] = API_KEY

    try {
      const res = await fetch(`${API_BASE}/rsvps`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))

        // 409 = duplicate email
        if (res.status === 409) {
          setError('En OSA med denna e-postadress har redan skickats in.')
          setLoading(false)
          return
        }

        // Handle validation errors (detail is array) or plain message (detail is string)
        const msg =
          typeof data.detail === 'string'
            ? data.detail
            : data.detail?.[0]?.msg ?? data.message ?? `Något gick fel (${res.status})`
        setError(msg)
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError('Kunde inte skicka. Kontrollera nätverket och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 text-white/90">
        <p className="font-serif text-xl mb-2">Tack!</p>
        <p className="text-sm">Vi har fått er anmälan.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm text-white/80 mb-1.5">
          Namn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={255}
          className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 rounded focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40"
          placeholder="Anna Andersson"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-white/80 mb-1.5">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 rounded focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40"
          placeholder="anna@example.com"
        />
      </div>

      <div>
        <span className="block text-sm text-white/80 mb-3">Kommer du?</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coming"
              value="yes"
              defaultChecked
              className="w-4 h-4 border-white/30 bg-white/5 text-white focus:ring-white/40"
            />
            <span className="text-white/90">Ja</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coming"
              value="no"
              className="w-4 h-4 border-white/30 bg-white/5 text-white focus:ring-white/40"
            />
            <span className="text-white/90">Nej</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="allergies" className="block text-sm text-white/80 mb-1.5">
          Allergier eller matpreferenser <span className="text-white/50">(valfritt, max 500 tecken)</span>
        </label>
        <input
          id="allergies"
          name="allergies"
          type="text"
          maxLength={500}
          className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 rounded focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40"
          placeholder="T.ex. vegetarian, glutenfritt"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="transport_assist"
            className="w-4 h-4 border-white/30 bg-white/5 text-white rounded focus:ring-white/40"
          />
          <span className="text-sm text-white/90">Jag behöver hjälp med transport</span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-4 text-sm font-medium text-black bg-white rounded hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Skickar…' : 'Skicka'}
      </button>
    </form>
  )
}
