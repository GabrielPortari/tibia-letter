import { useNavigate, useParams } from 'react-router-dom'
import type { NavigateOptions } from 'react-router-dom'

export function useLangNavigate() {
  const { lang } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  return (to: string, options?: NavigateOptions) =>
    navigate(`/${lang}${to}`, options)
}

export function useLang(): string {
  const { lang } = useParams<{ lang: string }>()
  return lang ?? 'en'
}
