'use client'

import { useState, useEffect } from 'react'

// Target: August 22, 2026 at 16:00 CEST (UTC+2)
// 16:00 CEST = 14:00 UTC, but adjusted +1 hour
const TARGET_DATE = new Date('2026-08-22T15:00:00Z')

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date()
  const difference = TARGET_DATE.getTime() - now.getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex justify-center gap-4 sm:gap-8">
      <div className="text-center">
        <div className="text-3xl sm:text-5xl font-serif text-gray-800">{timeLeft.days}</div>
        <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Dagar</div>
      </div>
      <div className="text-center">
        <div className="text-3xl sm:text-5xl font-serif text-gray-800">{timeLeft.hours}</div>
        <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Timmar</div>
      </div>
      <div className="text-center">
        <div className="text-3xl sm:text-5xl font-serif text-gray-800">{timeLeft.minutes}</div>
        <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Minuter</div>
      </div>
      <div className="text-center">
        <div className="text-3xl sm:text-5xl font-serif text-gray-800">{timeLeft.seconds}</div>
        <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Sekunder</div>
      </div>
    </div>
  )
}
