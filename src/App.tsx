import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAuth } from './hooks/useAuth'
import { Topbar } from './components/layout/Topbar'
import { ToastContainer } from './components/ui/ToastContainer'
import { CookieConsentModal } from './components/ui/CookieConsentModal'
import { PrivateRoute, CharRequiredRoute, AdminRoute } from './components/layout/RouteGuards'
import { Spinner } from './components/ui/Spinner'
import { LangProvider, LangRedirect } from './components/LangProvider'

const Landing = lazy(() => import('./pages/Landing'))
const Characters = lazy(() => import('./pages/Characters'))
const WorldSelect = lazy(() => import('./pages/WorldSelect'))
const SpawnApp = lazy(() => import('./pages/SpawnApp'))
const Admin = lazy(() => import('./pages/Admin'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Forbidden = lazy(() => import('./pages/Forbidden'))
const Contact = lazy(() => import('./pages/Contact'))
const About = lazy(() => import('./pages/About'))
const Premium = lazy(() => import('./pages/Premium'))
const PremiumSuccess = lazy(() => import('./pages/PremiumSuccess'))
const PaymentHistory = lazy(() => import('./pages/PaymentHistory'))

const Fallback = <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>

function AppInner() {
  useAuth()

  return (
    <>
      <Topbar />
      <Suspense fallback={Fallback}>
        <Routes>
          {/* Auth callback must stay without lang prefix (Discord OAuth redirects here) */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Lang-prefixed routes */}
          <Route path="/:lang" element={<LangProvider />}>
            <Route index element={<Landing />} />
            <Route path="403" element={<Forbidden />} />
            <Route path="404" element={<NotFound />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<About />} />

            <Route element={<PrivateRoute />}>
              <Route path="app/characters" element={<Characters />} />
              <Route path="app/queue" element={<WorldSelect />} />
            </Route>

            <Route element={<CharRequiredRoute />}>
              <Route path="app/queue/:worldId" element={<SpawnApp />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="app/admin" element={<Admin />} />
            </Route>

            <Route path="supporter" element={<Premium />} />
            <Route path="supporter/sucesso" element={<PremiumSuccess />} />
            <Route element={<PrivateRoute />}>
              <Route path="app/payments" element={<PaymentHistory />} />
            </Route>

            {/* Legacy redirects within lang context */}
            <Route path="login" element={<Navigate to=".." replace />} />
            <Route path="worlds" element={<Navigate to="../app/queue" replace />} />
            <Route path="worlds/:worldId" element={<Navigate to="../../app/queue" replace />} />
            <Route path="admin" element={<Navigate to="../app/admin" replace />} />
            <Route path="premium" element={<Navigate to="../supporter" replace />} />
            <Route path="premium/sucesso" element={<Navigate to="../supporter/sucesso" replace />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Redirect everything else (including /) to lang-prefixed version */}
          <Route path="*" element={<LangRedirect />} />
        </Routes>
      </Suspense>
      <ToastContainer />
      <CookieConsentModal />
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
