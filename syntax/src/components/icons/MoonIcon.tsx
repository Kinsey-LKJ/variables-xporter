import * as React from 'react'

export function MoonIcon({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient
          id={`${id}-gradient`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${id}-gradient)`} />
      <path
        d="M16 4a12 12 0 00-12 12 12 12 0 0012 12 12 12 0 000-24zm0 20a8 8 0 110-16 8 8 0 010 16z"
        fill="#fff"
        fillOpacity="0.2"
      />
      <path
        d="M16 7a9 9 0 00-9 9 9 9 0 009 9 1 1 0 000-2 7 7 0 010-14 1 1 0 000-2z"
        fill="#fff"
      />
    </>
  )
}
