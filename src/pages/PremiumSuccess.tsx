import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'

export default function PremiumSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const qc = useQueryClient()

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
            <h1 className="font-display text-xl font-bold text-red">Pagamento não concluído</h1>
            <p className="text-text-muted text-sm">
              O pagamento foi cancelado ou recusado. Tente novamente.
            </p>
          </>
        ) : isPending ? (
          <>
            <p className="text-4xl">⏳</p>
            <h1 className="font-display text-xl font-bold text-gold">Aguardando pagamento</h1>
            <p className="text-text-muted text-sm">
              Seu PIX foi gerado. Assim que o pagamento for confirmado o Premium será ativado automaticamente.
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl">✓</p>
            <h1 className="font-display text-xl font-bold text-green">Premium ativado!</h1>
            <p className="text-text-muted text-sm">
              Bem-vindo ao Premium. Aproveite as filas ilimitadas!
            </p>
          </>
        )}

        <Button className="w-full mt-6" onClick={() => navigate('/app/queue')}>
          Ir para as filas
        </Button>
      </div>
    </PageWrapper>
  )
}
