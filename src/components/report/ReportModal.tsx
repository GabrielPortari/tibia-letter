import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { useToasts } from '../../hooks/useToasts'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

type ReportReason = 'not_at_spawn' | 'left_without_passing'

const REASON_LABELS: Record<ReportReason, string> = {
  not_at_spawn: 'Não está no respawn / jogador ausente',
  left_without_passing: 'Saiu do respawn e não finalizou corretamente',
}

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  spawnId: string
  spawnName: string
  worldId: string
  targetName: string
}

export function ReportModal({
  isOpen,
  onClose,
  spawnId,
  spawnName,
  worldId,
  targetName,
}: ReportModalProps) {
  const { user } = useAuthStore()
  const { addToast } = useToasts()
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [confirmed, setConfirmed] = useState(false)

  const { mutate: sendReport, isPending } = useMutation({
    mutationFn: () =>
      api.post('/reports', {
        targetName,
        spawnId,
        worldId,
        reason,
      }),
    onSuccess: () => {
      addToast('success', 'Report enviado com sucesso.')
      onClose()
      setReason('')
      setConfirmed(false)
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reportar — ${spawnName}`}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-text-muted mb-1">Reportando:</p>
          <p className="font-semibold text-text">{targetName}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-muted">Motivo</p>
          {(Object.entries(REASON_LABELS) as [ReportReason, string][]).map(([key, label]) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="reason"
                value={key}
                checked={reason === key}
                onChange={() => setReason(key)}
                className="mt-0.5 accent-gold"
              />
              <span className="text-sm text-text group-hover:text-text leading-snug">{label}</span>
            </label>
          ))}
        </div>

        {!confirmed ? (
          <Button
            variant="danger"
            className="w-full"
            disabled={!reason}
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
