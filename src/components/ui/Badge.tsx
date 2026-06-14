type BadgeVariant = 'gold' | 'green' | 'red' | 'amber' | 'blue' | 'muted'

const variantClasses: Record<BadgeVariant, string> = {
  gold: 'bg-[var(--gold-glow)] text-gold border border-[var(--gold-dim)]',
  green: 'bg-[var(--green-bg)] text-green border border-green',
  red: 'bg-[var(--red-bg)] text-red border border-red',
  amber: 'bg-[var(--amber-bg)] text-amber border border-amber',
  blue: 'bg-[var(--blue-bg)] text-blue border border-blue',
  muted: 'bg-bg3 text-text-muted border border-border',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
