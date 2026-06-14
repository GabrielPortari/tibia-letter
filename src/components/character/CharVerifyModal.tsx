import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useToasts } from '../../hooks/useToasts'
import { sanitizeInput, validateCharacterName } from '../../utils/security'
import { secondsUntil, fmt } from '../../utils/time'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Character } from '../../types'

const nameSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(30)
    .refine((v) => validateCharacterName(v), 'Nome inválido (apenas letras e espaços, 2-30 chars)'),
})

interface CharVerifyModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified?: (char: Character) => void
}

type Step = 1 | 2 | 3

export function CharVerifyModal({ isOpen, onClose, onVerified }: CharVerifyModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [charName, setCharName] = useState('')
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { player, setActiveChar } = useAuthStore()
  const { addToast } = useToasts()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: standardSchemaResolver(nameSchema),
  })

  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setTimeLeft(secondsUntil(expiresAt)), 1000)
    setTimeLeft(secondsUntil(expiresAt))
    return () => clearInterval(id)
  }, [expiresAt])

  const tryVerify = useCallback(async () => {
    if (verifying) return
    setVerifying(true)
    try {
      const { data, error } = await supabase.functions.invoke('verify-character', {
        body: { characterName: charName, code },
      })
      if (!error && data?.character) {
        if (pollRef.current) clearInterval(pollRef.current)
        if (onVerified) onVerified(data.character as Character)
        setActiveChar(data.character as Character)
        addToast('success', `${data.character.name} verificado com sucesso!`)
        handleClose()
      }
    } finally {
      setVerifying(false)
    }
  }, [charName, code, verifying, onVerified, setActiveChar, addToast])

  useEffect(() => {
    if (step !== 3) return
    pollRef.current = setInterval(tryVerify, 15000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [step, tryVerify])

  const { mutate: initChar, isPending: initing } = useMutation({
    mutationFn: async (name: string) => {
      const safe = sanitizeInput(name)
      const { data, error } = await supabase.functions.invoke('init-character', {
        body: { characterName: safe, playerId: player?.id },
      })
      if (error) throw error
      return data as { code: string; expiresAt: string }
    },
    onSuccess: (data) => {
      setCode(data.code)
      setExpiresAt(data.expiresAt)
      setStep(2)
    },
    onError: () => addToast('error', 'Falha ao gerar código. Tente novamente.'),
  })

  function handleClose() {
    if (step === 3) {
      const ok = window.confirm('Tem certeza que deseja fechar? O código ficará disponível por mais tempo.')
      if (!ok) return
    }
    if (pollRef.current) clearInterval(pollRef.current)
    setStep(1)
    reset()
    setCharName('')
    setCode('')
    setExpiresAt('')
    onClose()
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    addToast('info', 'Código copiado!')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Vincular Personagem">
      <div className="space-y-5">
        <div className="flex gap-2 mb-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-gold' : 'bg-bg3'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <form
            onSubmit={handleSubmit((d) => {
              setCharName(d.name)
              initChar(d.name)
            })}
            className="space-y-4"
          >
            <Input
              label="Nome do Personagem"
              placeholder="Ex: Tibia Knight"
              error={errors.name?.message as string}
              {...register('name')}
            />
            <Button type="submit" className="w-full" isLoading={initing}>
              Gerar Código
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted leading-relaxed">
              Acesse o site do Tibia, edite o personagem{' '}
              <strong className="text-text">{charName}</strong> e cole o código abaixo no campo
              de <em>Comentário</em> do perfil.
            </p>
            <div className="bg-bg3 border border-border rounded-lg p-4 text-center">
              <p className="font-mono text-2xl font-bold text-gold tracking-widest mb-2">{code}</p>
              <button
                onClick={copyCode}
                className="text-xs text-text-muted hover:text-text underline"
              >
                Copiar código
              </button>
              {timeLeft > 0 && (
                <p className="text-xs text-text-dim mt-2">Expira em {fmt(timeLeft)}</p>
              )}
            </div>
            <Button className="w-full" onClick={() => setStep(3)}>
              Já coloquei o código →
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Estamos verificando se o código aparece no comentário do personagem{' '}
              <strong className="text-text">{charName}</strong>. Tentativa automática a cada 15s.
            </p>
            <div className="bg-bg3 border border-border rounded-lg p-3 flex items-center gap-3">
              <span className="inline-block w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-sm text-text-muted">Verificando…</span>
            </div>
            {timeLeft > 0 && (
              <p className="text-xs text-text-dim text-center">Código válido por {fmt(timeLeft)}</p>
            )}
            <Button
              variant="secondary"
              className="w-full"
              isLoading={verifying}
              onClick={tryVerify}
            >
              Verificar Agora
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
