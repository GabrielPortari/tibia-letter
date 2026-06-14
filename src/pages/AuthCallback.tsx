import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/ui/Spinner'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/worlds', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-text-muted text-sm">Autenticando com Discord…</p>
    </div>
  )
}
