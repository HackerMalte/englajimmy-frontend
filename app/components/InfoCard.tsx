'use client'

import { useState } from 'react'

interface InfoCardProps {
  title: string
  children: React.ReactNode
  bgColor: string
  borderColor: string
  align: 'left' | 'right'
}

export function InfoCard({ title, children, bgColor, borderColor, align }: InfoCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const isLeft = align === 'left'
  const borderRadius = isLeft
    ? '0 var(--box-radius) var(--box-radius) 0'
    : 'var(--box-radius) 0 0 var(--box-radius)'
  const borderSide = isLeft ? 'border-l-0' : 'border-r-0'

  return (
    <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} mb-6`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[85%] sm:w-[45%] px-6 py-3 border-2 ${borderSide} text-left transition-all duration-300 cursor-pointer`}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderRadius,
        }}
      >
        <div className={`flex items-center justify-between ${!isLeft ? 'flex-row-reverse' : ''}`}>
          <h3 className="font-script text-2xl text-gray-800">{title}</h3>
          <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1">
            {!isOpen && <span className="text-gray-400 text-xs">klicka här</span>}
            <span className={`text-gray-500 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="text-gray-600 text-sm space-y-4 mt-4">
            {children}
          </div>
        )}
      </button>
    </div>
  )
}
