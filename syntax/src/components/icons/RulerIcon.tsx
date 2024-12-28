import * as React from 'react'

export function RulerIcon({ id }: { id: string }) {
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
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${id}-gradient)`} />
      <path
        d="M6 16h20M10 12v8M14 12v8M18 12v8M22 12v8"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  )
}
