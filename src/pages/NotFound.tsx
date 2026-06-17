import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { useLangNavigate } from '../hooks/useLangNavigate'

export default function NotFound() {
  const { t } = useTranslation()
  const langNavigate = useLangNavigate()

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl text-gold font-bold">404</p>
      <h1 className="text-xl font-semibold text-text">{t('notFound.title')}</h1>
      <p className="text-text-muted max-w-sm">{t('notFound.desc')}</p>
      <Button variant="secondary" onClick={() => langNavigate('')}>{t('common.back_home')}</Button>
    </div>
  )
}
