import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

const STORAGE_KEY = 'cookie-consent'
const HEADING_ID = 'cookie-consent-title'

export function CookieConsentModal() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    const prev = document.activeElement as HTMLElement
    panelRef.current?.focus()
    return () => prev?.focus()
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss('accepted')
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [visible])

  function dismiss(value: 'accepted' | 'rejected') {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={HEADING_ID}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full sm:max-w-lg bg-bg2 border border-border rounded-t-2xl sm:rounded-2xl p-6 outline-none animate-fadeIn"
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">🍪</span>
          <div>
            <h2 id={HEADING_ID} className="font-display text-base font-semibold text-text mb-1">
              {t('cookies.title')}
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              {t('cookies.desc')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" onClick={() => dismiss('rejected')}>
            {t('cookies.decline')}
          </Button>
          <Button size="sm" onClick={() => dismiss('accepted')}>
            {t('cookies.accept')}
          </Button>
        </div>
      </div>
    </div>
  )
}
