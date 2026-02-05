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
  const [submitResult, setSubmitResult] = useState<{ submitted: boolean; updated: boolean }>({
    submitted: false,
    updated: false,
  })
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

      const data = await res.json().catch(() => ({}))
      setSubmitResult({ submitted: true, updated: data.updated === true })
    } catch (err) {
      setError('Kunde inte skicka. Kontrollera nätverket och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  if (submitResult.submitted) {
    return (
      <div className="text-center py-12 text-gray-800">
        <p className="font-script text-2xl mb-2">Tack!</p>
        <p className="text-sm text-gray-600">
          {submitResult.updated
            ? 'Din OSA har uppdaterats.'
            : 'Vi har fått din anmälan.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm text-gray-700 mb-1.5">
          Namn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={255}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-[#B8D4E3] focus:border-[#B8D4E3]"
          placeholder="Anna Andersson"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-gray-700 mb-1.5">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-[#B8D4E3] focus:border-[#B8D4E3]"
          placeholder="anna@example.com"
        />
      </div>

      <div>
        <span className="block text-sm text-gray-700 mb-3">Kommer du?</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coming"
              value="yes"
              defaultChecked
              className="w-4 h-4 border-gray-300 bg-gray-50 text-[#B8D4E3] focus:ring-[#B8D4E3]"
            />
            <span className="text-gray-800">Ja</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coming"
              value="no"
              className="w-4 h-4 border-gray-300 bg-gray-50 text-[#B8D4E3] focus:ring-[#B8D4E3]"
            />
            <span className="text-gray-800">Nej</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="allergies" className="block text-sm text-gray-700 mb-1.5">
          Allergier eller matpreferenser <span className="text-gray-400">(valfritt, max 500 tecken)</span>
        </label>
        <input
          id="allergies"
          name="allergies"
          type="text"
          maxLength={500}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-[#B8D4E3] focus:border-[#B8D4E3]"
          placeholder="T.ex. vegetarian, glutenfritt"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="transport_assist"
            className="w-4 h-4 border-gray-300 bg-gray-50 text-[#B8D4E3] rounded focus:ring-[#B8D4E3]"
          />
          <span className="text-sm text-gray-800">Jag behöver hjälp med transport</span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-4 text-sm font-medium text-gray-800 bg-[#B8D4E3] rounded hover:bg-[#A3C5D9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Skickar…' : 'Skicka'}
      </button>
    </form>
  )
}
