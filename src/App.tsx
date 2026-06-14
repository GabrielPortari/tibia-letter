import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAuth } from './hooks/useAuth'
import { Topbar } from './components/layout/Topbar'
import { ToastContainer } from './components/ui/ToastContainer'
import { PrivateRoute, CharRequiredRoute, AdminRoute } from './components/layout/RouteGuards'
import { Spinner } from './components/ui/Spinner'

const Landing = lazy(() => import('./pages/Landing'))
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
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />

          <Route element={<PrivateRoute />}>
            <Route path="/worlds" element={<WorldSelect />} />
          </Route>

          <Route element={<CharRequiredRoute />}>
            <Route path="/worlds/:worldId" element={<SpawnApp />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

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
