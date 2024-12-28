import * as React from 'react'

export function TypeIcon({ id }: { id: string }) {
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
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${id}-gradient)`} />
      <path
        d="M8 11h16M12 17h8M10 23h12"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  )
}
