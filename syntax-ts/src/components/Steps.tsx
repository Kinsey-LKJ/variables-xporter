"use client"

import { ReactNode, useEffect, useState } from 'react'

export const Steps = ({ children }: { children: ReactNode }) => {
  const [steps, setSteps] = useState<number>(0)
  return <div>{children}</div>
}

export const Step = ({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) => {
  return (
    <div className="flex items-center gap-2">
      <div> {title}</div>
      <div>{children}</div>
    </div>
  )
}
