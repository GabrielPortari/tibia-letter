import { useToastStore } from '../../hooks/useToasts'

const typeClasses = {
  success: 'bg-[var(--green-bg)] border-green text-green',
  error: 'bg-[var(--red-bg)] border-red text-red',
  warning: 'bg-[var(--amber-bg)] border-amber text-amber',
  info: 'bg-[var(--blue-bg)] border-blue text-blue',
}

const icons = { success: '✓', error: '✕', warning: '⚠', info: 'i' }

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-32px)] sm:w-80"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium animate-fadeIn ${typeClasses[t.type]}`}
        >
          <span className="text-base leading-none mt-0.5">{icons[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity text-base leading-none min-w-[24px] text-center"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
