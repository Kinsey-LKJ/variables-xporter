import * as React from 'react'

export function PaletteIcon({ id }: { id: string }) {
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
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient
          id={`${id}-gradient-dark`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${id}-gradient)`} />
      <path
        d="M16 4a12 12 0 100 24 12 12 0 000-24zm0 22a10 10 0 110-20 10 10 0 010 20z"
        fill="#fff"
        fillOpacity="0.2"
      />
      <path
        d="M16 7a9 9 0 00-9 9c0 4.97 4.03 9 9 9a1 1 0 000-2 7 7 0 010-14 1 1 0 000-2z"
        fill="#fff"
      />
    </>
  )
}
