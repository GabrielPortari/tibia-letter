import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useToasts } from '../../hooks/useToasts'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

const REASONS = [
  'Não está no respawn / jogador ausente',
  'Saiu do respawn e não finalizou corretamente',
]

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  spawnId: string
  spawnName: string
  worldId: string
  targetId: string
  targetName: string
}

interface ReportQuota {
  used: number
  limit: number
  resets_at: string | null
}

export function ReportModal({
  isOpen,
  onClose,
  spawnId,
  spawnName,
  worldId,
  targetId,
  targetName,
}: ReportModalProps) {
  const { player } = useAuthStore()
  const { addToast } = useToasts()
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const { data: quota } = useQuery<ReportQuota>({
    queryKey: ['report-quota', player?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_report_quota', { player_id: player!.id })
      if (error) throw error
      return data as ReportQuota
    },
    enabled: !!player && isOpen,
  })

  const { mutate: sendReport, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('reports').insert({
        reporter_id: player!.id,
        target_id: targetId,
        spawn_id: spawnId,
        world_id: worldId,
        reason,
      })
      if (error) throw error
    },
    onSuccess: () => {
      addToast('success', 'Report enviado com sucesso.')
      onClose()
      setReason('')
      setConfirmed(false)
    },
    onError: () => {
      addToast('error', 'Falha ao enviar report. Tente novamente.')
    },
  })

  const canReport = quota && quota.used < quota.limit
  const remaining = quota ? quota.limit - quota.used : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reportar — ${spawnName}`}>
      <div className="space-y-4">
        {quota && (
          <p className="text-sm text-text-muted">
            Reports disponíveis:{' '}
            <span className={`font-semibold ${remaining > 0 ? 'text-green' : 'text-red'}`}>
              {remaining}/{quota.limit}
            </span>
            {!canReport && quota.resets_at && (
              <span className="text-xs block mt-1">
                Recarrega em {new Date(quota.resets_at).toLocaleTimeString('pt-BR')}
              </span>
            )}
          </p>
        )}

        <div>
          <p className="text-sm text-text-muted mb-1">Reportando:</p>
          <p className="font-semibold text-text">{targetName}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-muted">Motivo</p>
          {REASONS.map((r) => (
            <label key={r} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="mt-0.5 accent-gold"
              />
              <span className="text-sm text-text group-hover:text-text leading-snug">{r}</span>
            </label>
          ))}
        </div>

        {!confirmed ? (
          <Button
            variant="danger"
            className="w-full"
            disabled={!reason || !canReport}
            onClick={() => setConfirmed(true)}
          >
            Continuar
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-[var(--red-bg)] border border-red rounded-lg p-3 text-sm text-red">
              Esta ação não pode ser desfeita. Confirme o report.
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmed(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                isLoading={isPending}
                onClick={() => sendReport()}
              >
                Confirmar Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
