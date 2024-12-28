import React from 'react'

interface FileTreeProps {
  children: React.ReactNode
}

export function FileTree({ children }: FileTreeProps) {
  return (
    <div className="my-6 font-mono text-sm leading-6">
      <pre className="rounded-lg bg-slate-900 p-4">
        <code className="text-white">{children}</code>
      </pre>
    </div>
  )
}
