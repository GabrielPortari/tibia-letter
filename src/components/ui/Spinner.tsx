interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={`inline-block border-2 border-text-dim border-t-gold rounded-full animate-spin ${sizeClasses[size]} ${className}`}
      aria-label="Carregando"
    />
  )
}
