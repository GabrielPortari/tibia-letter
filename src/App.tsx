import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAuth } from './hooks/useAuth'
import { Topbar } from './components/layout/Topbar'
import { ToastContainer } from './components/ui/ToastContainer'
import { PrivateRoute, CharRequiredRoute, AdminRoute } from './components/layout/RouteGuards'
import { Spinner } from './components/ui/Spinner'

const Landing = lazy(() => import('./pages/Landing'))
const Characters = lazy(() => import('./pages/Characters'))
const WorldSelect = lazy(() => import('./pages/WorldSelect'))
const SpawnApp = lazy(() => import('./pages/SpawnApp'))
const Admin = lazy(() => import('./pages/Admin'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Forbidden = lazy(() => import('./pages/Forbidden'))

function AppInner() {
  useAuth()

  return (
    <>
      <Topbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />

          <Route element={<PrivateRoute />}>
            <Route path="/app/characters" element={<Characters />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/app/queue" element={<WorldSelect />} />
          </Route>

          <Route element={<CharRequiredRoute />}>
            <Route path="/app/queue/:worldId" element={<SpawnApp />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/app/admin" element={<Admin />} />
          </Route>

          {/* Legacy redirects */}
          <Route path="/worlds" element={<Navigate to="/app/queue" replace />} />
          <Route path="/worlds/:worldId" element={<Navigate to="/app/queue" replace />} />
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
