import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useToasts } from '../hooks/useToasts'

interface PremiumStatus {
  active: boolean
  until: string | null
  status: string | null
}

const PRICE = 'R$ 19,90'
const PRICE_ORIGINAL = 'R$ 29,90'
const BENEFITS = [
  'Até 3 filas simultâneas (Free: 1)',
  'Personagens ilimitados (Free: 2)',
  'Prioridade na fila',
]

export default function Premium() {
  const { user } = useAuthStore()
  const { addToast } = useToasts()

  const { data: status, isLoading } = useQuery<PremiumStatus>({
    queryKey: ['premium-status'],
    queryFn: () => api.get<PremiumStatus>('/payments/status'),
    enabled: !!user,
  })

  const subscribeMutation = useMutation({
    mutationFn: () => api.post<{ initPoint: string }>('/payments/subscribe'),
    onSuccess: (data) => {
      window.location.href = data.initPoint
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.delete<void>('/payments/cancel'),
    onSuccess: () => addToast('success', 'Assinatura cancelada.'),
    onError: (e: Error) => addToast('error', e.message),
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto py-8">
        <h1 className="font-display text-2xl font-bold text-gold mb-1">Premium</h1>
        <p className="text-text-muted text-sm mb-8">Desbloqueie o máximo da sua experiência no Tibia Letter.</p>

        <div className="bg-bg2 border border-border rounded-2xl overflow-hidden mb-6">
          <div className="bg-[var(--gold-glow)] border-b border-[var(--gold-dim)] px-6 py-5">
            <div className="flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-gold">{PRICE}</span>
              <span className="text-text-muted text-sm mb-1">/mês</span>
              <span className="text-text-dim text-sm line-through mb-1">{PRICE_ORIGINAL}</span>
            </div>
            <p className="text-gold/70 text-xs mt-1 font-medium">Oferta de lançamento</p>
            <p className="text-text-dim text-xs mt-0.5">Cobrado via PIX pelo Mercado Pago</p>
          </div>

          <ul className="px-6 py-5 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-text">
                <span className="text-green">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : status?.active ? (
          <div className="space-y-4">
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', color: 'var(--green)' }}
            >
              ✓ Assinatura ativa
              {status.until && (
                <span className="text-text-muted ml-2 text-xs">
                  — renova em {formatDate(status.until)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full text-text-muted hover:text-red text-sm"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Cancelar assinatura
            </Button>
          </div>
        ) : (
          <Button
            className="w-full opacity-60 cursor-not-allowed"
            size="lg"
            disabled
          >
            Em breve
          </Button>
          <p className="text-center text-xs text-text-dim mt-1">Pagamentos chegando em breve</p>
        )}

        <p className="text-center text-xs text-text-dim mt-4">
          Pagamento seguro via Mercado Pago · Cancele quando quiser
        </p>
      </div>
    </PageWrapper>
  )
}
