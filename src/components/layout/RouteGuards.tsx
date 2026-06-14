import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Spinner } from '../ui/Spinner'
import { fmt } from '../../utils/time'

export function PrivateRoute() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}

export function CharRequiredRoute() {
  const { user, isLoading, activeChar } = useAuthStore()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/" replace />
  if (!activeChar()) return <Navigate to="/app/characters" replace />
  return <Outlet />
}

export function AdminRoute() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/" replace />
  if (!user.isAdmin) return <Navigate to="/403" replace />
  return <Outlet />
}

export function BannedGuard({ children }: { children: React.ReactNode }) {
  const { isBanned, banSecondsLeft, user } = useAuthStore()
  if (!isBanned()) return <>{children}</>
  const secs = banSecondsLeft()
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">🔨</div>
      <h1 className="font-display text-2xl text-red font-semibold">Conta banida</h1>
      <p className="text-text-muted max-w-sm">
        Sua conta foi banida por violação das regras. Tempo restante:{' '}
        <span className="text-text font-mono font-bold">{fmt(secs)}</span>
      </p>
      <p className="text-xs text-text-dim">
        Acumulou {user?.warnings ?? 0} warnings.
      </p>
    </div>
  )
}
