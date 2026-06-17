import { useEffect } from 'react'
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS, detectLang, type SupportedLang } from '../i18n'

export function LangProvider() {
  const { lang } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!lang || !SUPPORTED_LANGS.includes(lang as SupportedLang)) {
      const detected = detectLang()
      // We can't reliably reconstruct the path since the invalid lang segment
      // consumed part of what should have been the actual path.
      navigate(`/${detected}`, { replace: true })
      return
    }
    localStorage.setItem('i18n-lang', lang)
    i18n.changeLanguage(lang)
  }, [lang, i18n, navigate, location])

  if (!lang || !SUPPORTED_LANGS.includes(lang as SupportedLang)) return null

  return <Outlet />
}

export function LangRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const lang = detectLang()
    const path = location.pathname === '/' ? '' : location.pathname
    navigate(`/${lang}${path}${location.search}${location.hash}`, { replace: true })
  }, [navigate, location])

  return null
}
