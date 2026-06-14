import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement as HTMLElement
    dialogRef.current?.focus()
    return () => prev?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative z-10 w-full sm:max-w-lg bg-bg2 border border-border rounded-t-2xl sm:rounded-2xl p-6 outline-none animate-fadeIn max-h-[90svh] overflow-y-auto ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-text">{title}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text p-1 rounded-lg hover:bg-bg3 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Fechar"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
