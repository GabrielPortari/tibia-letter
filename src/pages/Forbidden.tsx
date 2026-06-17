import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { useLangNavigate } from '../hooks/useLangNavigate'

export default function Forbidden() {
  const { t } = useTranslation()
  const langNavigate = useLangNavigate()

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl text-red font-bold">403</p>
      <h1 className="text-xl font-semibold text-text">{t('forbidden.title')}</h1>
      <p className="text-text-muted max-w-sm">{t('forbidden.desc')}</p>
      <Button variant="secondary" onClick={() => langNavigate('/app/queue')}>{t('forbidden.go_worlds')}</Button>
    </div>
  )
}
