import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useQueueStore } from '../stores/queueStore'
import { api } from '../lib/api'
import { useToasts } from '../hooks/useToasts'
import { secondsUntil, fmt } from '../utils/time'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { CharVerifyModal } from '../components/character/CharVerifyModal'
import { getEntryStatus } from '../types'
import type { User, Character } from '../types'

const BASE = ((import.meta.env.VITE_API_URL as string) || '') + '/api/v1'

async function fetchMe(): Promise<User | null> {
  const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' })
  return res.ok ? (res.json() as Promise<User>) : null
}

type CharState = 'pending' | 'expired' | 'verified' | 'active'

function getCharState(char: Character): CharState {
  if (char.active) return 'active'
  if (char.verified) return 'verified'
  if (char.verifyCode) return 'pending'
  return 'expired'
}

export default function Characters() {
  const { user, setUser } = useAuthStore()
  const { getMyEntries } = useQueueStore()
  const { addToast } = useToasts()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [reInitChar, setReInitChar] = useState<Character | null>(null)
  const [confirmSwitch, setConfirmSwitch] = useState<Character | null>(null)

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/characters/${id}/activate`),
    onSuccess: async () => {
      const me = await fetchMe()
      if (me) setUser(me)
      addToast('success', 'Personagem ativado.')
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/characters/${id}`),
    onSuccess: async () => {
      const me = await fetchMe()
      if (me) setUser(me)
      addToast('success', 'Personagem removido.')
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const verifyMutation = useMutation({
    mutationFn: (name: string) => api.post('/characters/verify', { name }),
    onSuccess: async (_, name) => {
      const me = await fetchMe()
      if (me) setUser(me)
      addToast('success', `${name} verificado com sucesso!`)
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const characters = user?.characters ?? []
  const activeChar = characters.find((c) => c.active)

  function handleActivate(char: Character) {
    if (!activeChar || activeChar.id === char.id) {
      activateMutation.mutate(char.id)
      return
    }
    const entries = getMyEntries(activeChar.name)
    const hasWaiting = entries.some((e) => getEntryStatus(e) === 'waiting')
    if (hasWaiting) {
      setConfirmSwitch(char)
    } else {
      activateMutation.mutate(char.id)
    }
  }

  function openReInit(char: Character) {
    setReInitChar(char)
    setModalOpen(true)
  }

  function handleModalClose() {
    setModalOpen(false)
    setReInitChar(null)
  }

  function confirmDelete(char: Character) {
    if (!window.confirm(`Remover ${char.name}? Esta ação não pode ser desfeita.`)) return
    deleteMutation.mutate(char.id)
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-gold font-semibold">Personagens</h1>
          <p className="text-text-muted text-sm mt-1">
            {activeChar
              ? `Jogando como ${activeChar.name} · Lv. ${activeChar.level} · ${activeChar.world}`
              : 'Nenhum personagem ativo — vincule e ative um para usar as filas.'}
          </p>
        </div>
        <div className="flex gap-2">
          {activeChar && (
            <Button variant="secondary" onClick={() => navigate('/app/queue')}>
              Entrar na fila →
            </Button>
          )}
          <Button onClick={() => { setReInitChar(null); setModalOpen(true) }}>
            + Vincular Personagem
          </Button>
        </div>
      </div>

      {!activeChar && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber)', color: 'var(--amber)' }}
        >
          Você precisa de um personagem verificado e ativo para entrar em filas.
        </div>
      )}

      {characters.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-4xl mb-3">🎮</p>
          <p className="font-semibold mb-1">Nenhum personagem vinculado</p>
          <p className="text-sm">Clique em "Vincular Personagem" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {characters.map((char) => (
            <CharCard
              key={char.id}
              char={char}
              state={getCharState(char)}
              isActivating={activateMutation.isPending && activateMutation.variables === char.id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === char.id}
              isVerifying={verifyMutation.isPending && verifyMutation.variables === char.name}
              onActivate={() => handleActivate(char)}
              onDelete={() => confirmDelete(char)}
              onVerify={() => verifyMutation.mutate(char.name)}
              onReInit={() => openReInit(char)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirmSwitch}
        onClose={() => setConfirmSwitch(null)}
        title="Trocar de personagem?"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Você está aguardando em{' '}
            <span className="text-text font-medium">
              {getMyEntries(activeChar?.name ?? '').filter((e) => getEntryStatus(e) === 'waiting').length}
            </span>{' '}
            fila(s). Ao trocar para{' '}
            <span className="text-text font-medium">{confirmSwitch?.name}</span>, você será
            removido de todas elas automaticamente.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmSwitch(null)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              isLoading={activateMutation.isPending}
              onClick={() => {
                if (confirmSwitch) activateMutation.mutate(confirmSwitch.id)
                setConfirmSwitch(null)
              }}
            >
              Trocar mesmo assim
            </Button>
          </div>
        </div>
      </Modal>

      <CharVerifyModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        defaultName={reInitChar?.name}
        onVerified={async () => {
          const me = await fetchMe()
          if (me) setUser(me)
        }}
      />
    </PageWrapper>
  )
}

interface CharCardProps {
  char: Character
  state: CharState
  isActivating: boolean
  isDeleting: boolean
  isVerifying: boolean
  onActivate: () => void
  onDelete: () => void
  onVerify: () => void
  onReInit: () => void
}

function CharCard({ char, state, isActivating, isDeleting, isVerifying, onActivate, onDelete, onVerify, onReInit }: CharCardProps) {
  const anyPending = isActivating || isDeleting || isVerifying

  const dotColor =
    state === 'active' ? 'bg-gold' :
    state === 'verified' ? 'bg-green' :
    state === 'pending' ? 'bg-amber' :
    'bg-red'

  return (
    <div
      className={`bg-bg2 rounded-xl px-4 py-4 flex items-start justify-between gap-3 flex-wrap transition-all ${
        state === 'active' ? 'border border-gold' : 'border border-border'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dotColor}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text">{char.name}</span>
            {state === 'active' && <Badge variant="gold">Ativo</Badge>}
            {state === 'verified' && <Badge variant="green">Verificado</Badge>}
            {state === 'pending' && <Badge variant="amber">Aguard. verificação</Badge>}
            {state === 'expired' && <Badge variant="red">Expirado</Badge>}
          </div>

          {(state === 'active' || state === 'verified') && (
            <p className="text-xs text-text-muted mt-0.5">Lv. {char.level} · {char.world}</p>
          )}

          {state === 'pending' && char.verifyCode && (
            <PendingCodeBlock code={char.verifyCode} expiresAt={char.verifyCodeExpiresAt} />
          )}

          {state === 'expired' && (
            <p className="text-xs text-text-muted mt-1">
              Código expirado. Gere um novo para continuar a verificação.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap flex-shrink-0">
        {state === 'pending' && (
          <Button size="sm" isLoading={isVerifying} disabled={anyPending} onClick={onVerify}>
            Verificar agora
          </Button>
        )}
        {state === 'expired' && (
          <Button size="sm" variant="secondary" disabled={anyPending} onClick={onReInit}>
            Gerar novo código
          </Button>
        )}
        {state === 'verified' && (
          <Button size="sm" isLoading={isActivating} disabled={anyPending} onClick={onActivate}>
            Ativar
          </Button>
        )}
        {state !== 'active' && (
          <Button size="sm" variant="danger" isLoading={isDeleting} disabled={anyPending} onClick={onDelete}>
            Remover
          </Button>
        )}
      </div>
    </div>
  )
}

function PendingCodeBlock({ code, expiresAt }: { code: string; expiresAt: string | null }) {
  const [timeLeft, setTimeLeft] = useState(() => expiresAt ? secondsUntil(expiresAt) : 0)

  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setTimeLeft(secondsUntil(expiresAt)), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  async function copy() {
    await navigator.clipboard.writeText(code)
  }

  return (
    <div className="mt-2 bg-bg3 border border-border rounded-lg px-3 py-2 space-y-1">
      <p className="text-xs text-text-muted">
        Cole no campo <em>Comment</em> em <span className="text-text">tibia.com</span>:
      </p>
      <div className="flex items-center gap-2">
        <p className="font-mono text-sm font-bold text-gold tracking-widest">{code}</p>
        <button onClick={copy} className="text-xs text-text-dim hover:text-text underline">copiar</button>
      </div>
      {expiresAt && (
        <p className={`text-xs ${timeLeft <= 0 ? 'text-red' : 'text-text-dim'}`}>
          {timeLeft > 0 ? `Expira em ${fmt(timeLeft)}` : 'Expirado'}
        </p>
      )}
    </div>
  )
}
