import * as React from 'react'

export function BoxIcon({ id }: { id: string }) {
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
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${id}-gradient)`} />
      <path
        d="M8 8h16v16H8z"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8 12h16M12 8v16"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  )
}
