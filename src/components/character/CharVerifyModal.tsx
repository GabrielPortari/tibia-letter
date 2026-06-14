import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useToasts } from '../../hooks/useToasts'
import { sanitizeInput, validateCharacterName } from '../../utils/security'
import { secondsUntil, fmt } from '../../utils/time'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const schema = z.object({
  name: z
    .string()
    .min(2)
    .max(30)
    .refine((v) => validateCharacterName(v), 'Nome inválido (apenas letras e espaços)'),
})

type FormData = z.infer<typeof schema>

interface InitResponse {
  code: string
  expiresAt: string
  warning?: string
}

interface CharVerifyModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified?: () => void
  defaultName?: string
}

export function CharVerifyModal({ isOpen, onClose, onVerified, defaultName }: CharVerifyModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [charName, setCharName] = useState('')
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [warning, setWarning] = useState<string | undefined>()
  const [timeLeft, setTimeLeft] = useState(0)
  const { addToast } = useToasts()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: defaultName ?? '' },
  })

  useEffect(() => {
    if (!expiresAt) return
    setTimeLeft(secondsUntil(expiresAt))
    const id = setInterval(() => setTimeLeft(secondsUntil(expiresAt)), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const { mutate: initChar, isPending: initing } = useMutation({
    mutationFn: async (data: FormData) => {
      const safe = sanitizeInput(data.name)
      return api.post<InitResponse>('/characters/init', { name: safe })
    },
    onSuccess: (data, variables) => {
      setCharName(variables.name)
      setCode(data.code)
      setExpiresAt(data.expiresAt)
      setWarning(data.warning)
      setStep(2)
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const { mutate: verifyChar, isPending: verifying } = useMutation({
    mutationFn: () => api.post<User>('/characters/verify', { name: charName }),
    onSuccess: () => {
      addToast('success', `${charName} verificado com sucesso!`)
      if (onVerified) onVerified()
      handleClose()
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  function handleClose() {
    setStep(1)
    reset({ name: defaultName ?? '' })
    setCharName('')
    setCode('')
    setExpiresAt('')
    setWarning(undefined)
    onClose()
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    addToast('info', 'Código copiado!')
  }

  const expired = timeLeft <= 0 && !!expiresAt

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Vincular Personagem">
      <div className="space-y-5">
        <div className="flex gap-2 mb-2">
          {([1, 2] as const).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? 'bg-gold' : 'bg-bg3'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit((d) => initChar(d))} className="space-y-4">
            <Input
              label="Nome do Personagem"
              placeholder="Ex: Tibia Knight"
              error={errors.name?.message}
              {...register('name')}
            />
            <Button type="submit" className="w-full" isLoading={initing}>
              Gerar Código
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {warning && (
              <div
                className="rounded-lg px-3 py-2 text-xs leading-relaxed"
                style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber)', color: 'var(--amber)' }}
              >
                {warning}
              </div>
            )}

            <p className="text-sm text-text-muted leading-relaxed">
              Acesse <strong className="text-text">tibia.com</strong>, edite o personagem{' '}
              <strong className="text-text">{charName}</strong> e cole o código abaixo no campo{' '}
              <em>Comment</em> do perfil. Depois clique em "Já coloquei o código".
            </p>
            <div
              className="rounded-lg px-3 py-2.5 text-xs leading-relaxed flex gap-2"
              style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue)', color: 'var(--blue)' }}
            >
              <span className="flex-shrink-0 mt-0.5">ℹ️</span>
              <span>
                O tibia.com pode levar <strong>até 5 minutos</strong> para refletir alterações no perfil.
                Se a verificação falhar logo após salvar, aguarde alguns minutos e tente novamente.
              </span>
            </div>

            <div className="bg-bg3 border border-border rounded-lg p-4 text-center">
              <p className="font-mono text-2xl font-bold text-gold tracking-widest mb-2">{code}</p>
              <button
                onClick={copyCode}
                className="text-xs text-text-muted hover:text-text underline"
              >
                Copiar código
              </button>
              {expiresAt && (
                <p className={`text-xs mt-2 ${expired ? 'text-red' : 'text-text-dim'}`}>
                  {expired ? 'Código expirado — ' : `Expira em ${fmt(timeLeft)} — `}
                  <button
                    className="underline hover:text-text"
                    onClick={() => setStep(1)}
                  >
                    gerar novo
                  </button>
                </p>
              )}
            </div>

            <Button
              className="w-full"
              isLoading={verifying}
              disabled={expired}
              onClick={() => verifyChar()}
            >
              Já coloquei o código →
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
