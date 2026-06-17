import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'

export default function PremiumSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const qc = useQueryClient()
  const { t } = useTranslation()

  const status = params.get('status') // MP sends: approved, pending, failure

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ['premium-status'] })
    qc.invalidateQueries({ queryKey: ['me'] })
  }, [qc])

  const isPending = status === 'pending' || !status
  const isFailed = status === 'failure'

  return (
    <PageWrapper>
      <div className="max-w-sm mx-auto py-16 text-center space-y-4">
        {isFailed ? (
          <>
            <p className="text-4xl">✗</p>
            <h1 className="font-display text-xl font-bold text-red">{t('supporterSuccess.failed_title')}</h1>
            <p className="text-text-muted text-sm">{t('supporterSuccess.failed_desc')}</p>
          </>
        ) : isPending ? (
          <>
            <p className="text-4xl">⏳</p>
            <h1 className="font-display text-xl font-bold text-gold">{t('supporterSuccess.pending_title')}</h1>
            <p className="text-text-muted text-sm">{t('supporterSuccess.pending_desc')}</p>
          </>
        ) : (
          <>
            <p className="text-4xl">★</p>
            <h1 className="font-display text-xl font-bold text-gold">{t('supporterSuccess.success_title')}</h1>
            <p className="text-text-muted text-sm">{t('supporterSuccess.success_desc')}</p>
          </>
        )}

        <Button className="w-full mt-6" onClick={() => navigate('/app/queue')}>
          {t('supporterSuccess.go_queue')}
        </Button>
      </div>
    </PageWrapper>
  )
}
