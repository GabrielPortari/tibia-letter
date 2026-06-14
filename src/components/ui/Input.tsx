import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2.5 rounded-lg bg-bg3 border text-text placeholder:text-text-dim text-sm transition-colors outline-none focus:border-gold min-h-[44px] ${
            error ? 'border-red' : 'border-border hover:border-border-hover'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
