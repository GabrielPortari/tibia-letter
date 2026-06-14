import type { ReactNode } from 'react'

export function PageWrapper({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main className={`flex-1 max-w-7xl mx-auto w-full px-4 py-6 ${className}`}>
      {children}
    </main>
  )
}
