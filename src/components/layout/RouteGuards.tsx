import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { Spinner } from '../ui/Spinner'
import { fmt } from '../../utils/time'

function LangNav({ to }: { to: string }) {
  const { lang } = useParams<{ lang: string }>()
  return <Navigate to={lang ? `/${lang}${to}` : to} replace />
}

export function PrivateRoute() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <LangNav to="" />
  return <Outlet />
}

export function CharRequiredRoute() {
  const { user, isLoading, activeChar } = useAuthStore()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <LangNav to="" />
  if (!activeChar()) return <LangNav to="/app/characters" />
  return <Outlet />
}

export function AdminRoute() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <LangNav to="" />
  if (!user.isAdmin) return <LangNav to="/403" />
  return <Outlet />
}

export function BannedGuard({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { isBanned, banSecondsLeft, user } = useAuthStore()
  if (!isBanned()) return <>{children}</>
  const secs = banSecondsLeft()
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">🔨</div>
      <h1 className="font-display text-2xl text-red font-semibold">{t('spawnApp.banned')}</h1>
      <p className="text-text-muted max-w-sm">
        <span className="text-text font-mono font-bold">{fmt(secs)}</span>
      </p>
      <p className="text-xs text-text-dim">
        Warnings: {user?.warnings ?? 0}
      </p>
    </div>
  )
}
