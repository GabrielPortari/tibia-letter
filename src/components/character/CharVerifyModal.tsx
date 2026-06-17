import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { useToasts } from '../../hooks/useToasts'
import { sanitizeInput, validateCharacterName } from '../../utils/security'
import { secondsUntil, fmt } from '../../utils/time'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import accountManagement from '../../assets/account-management.png'
import characterEdit from '../../assets/character-edit.png'

function GuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const [guideStep, setGuideStep] = useState(0)

  const GUIDE_STEPS = [
    { img: accountManagement, label: t('verify.guide_step1_label'), desc: t('verify.guide_step1_desc') },
    { img: characterEdit, label: t('verify.guide_step2_label'), desc: t('verify.guide_step2_desc') },
  ]

  const current = GUIDE_STEPS[guideStep]

  function handleClose() {
    setGuideStep(0)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={current.label}>
      <div className="space-y-4">
        <img
          src={current.img}
          alt={current.label}
          className="w-full rounded-lg border border-border object-contain max-h-72"
        />
        <p className="text-sm text-text-muted">{current.desc}</p>
        <div className="flex items-center gap-2">
          {guideStep > 0 && (
            <Button variant="secondary" className="flex-1" onClick={() => setGuideStep(guideStep - 1)}>
              {t('verify.guide_prev')}
            </Button>
          )}
          {guideStep < GUIDE_STEPS.length - 1 ? (
            <Button className="flex-1" onClick={() => setGuideStep(guideStep + 1)}>
              {t('verify.guide_next')}
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleClose}>
              {t('verify.guide_done')}
            </Button>
          )}
        </div>
        <div className="flex justify-center gap-1.5">
          {GUIDE_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === guideStep ? 'bg-gold' : 'bg-bg3'}`}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}

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
  const { t } = useTranslation()
  const [step, setStep] = useState<1 | 2>(1)
  const [charName, setCharName] = useState('')
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [warning, setWarning] = useState<string | undefined>()
  const [showGuide, setShowGuide] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const { addToast } = useToasts()

  const schema = z.object({
    name: z
      .string()
      .min(2)
      .max(30)
      .refine((v) => validateCharacterName(v), t('verify.name_invalid')),
  })

  type FormData = z.infer<typeof schema>

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
    mutationFn: () => api.post<unknown>('/characters/verify', { name: charName }),
    onSuccess: () => {
      addToast('success', t('verify.verified_toast', { name: charName }))
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
    addToast('info', t('verify.code_copied_toast'))
  }

  const expired = timeLeft <= 0 && !!expiresAt

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={t('verify.modal_title')}>
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
                label={t('verify.char_name_label')}
                placeholder={t('verify.char_name_placeholder')}
                error={errors.name?.message}
                {...register('name')}
              />
              <Button type="submit" className="w-full" isLoading={initing}>
                {t('verify.generate_code')}
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

              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-text-muted leading-relaxed">
                  {t('verify.instructions', { name: charName })}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGuide(true)}
                  title={t('verify.guide_btn')}
                  aria-label={t('verify.guide_btn')}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-bg3 border border-border text-xs font-bold p-0"
                >
                  ?
                </Button>
              </div>
              <div
                className="rounded-lg px-3 py-2.5 text-xs leading-relaxed flex gap-2"
                style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue)', color: 'var(--blue)' }}
              >
                <span className="flex-shrink-0 mt-0.5">ℹ️</span>
                <span>{t('verify.info_delay')}</span>
              </div>

              <div className="bg-bg3 border border-border rounded-lg p-4 text-center">
                <p className="font-mono text-2xl font-bold text-gold tracking-widest mb-2">{code}</p>
                <button onClick={copyCode} className="text-xs text-text-muted hover:text-text underline">
                  {t('verify.copy_code')}
                </button>
                {expiresAt && (
                  <p className={`text-xs mt-2 ${expired ? 'text-red' : 'text-text-dim'}`}>
                    {expired ? t('verify.code_expired_inline') : t('verify.expires_in_inline', { time: fmt(timeLeft) })}
                    <button className="underline hover:text-text" onClick={() => setStep(1)}>
                      {t('verify.generate_new')}
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
                {t('verify.done_btn')}
              </Button>
            </div>
          )}
        </div>
      </Modal>
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  )
}
