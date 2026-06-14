import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useToasts } from '../hooks/useToasts'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { ago } from '../utils/time'
import type { Spawn, User, RemovalLog, AdminStats } from '../types'

type Tab = 'spawns' | 'players' | 'logs' | 'stats'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('spawns')

  return (
    <PageWrapper>
      <h1 className="font-display text-2xl text-gold font-semibold mb-6">Painel Admin</h1>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {(['spawns', 'players', 'logs', 'stats'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              tab === t
                ? 'border-gold text-gold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {{ spawns: 'Spawns', players: 'Jogadores', logs: 'Log de Remoções', stats: 'Stats' }[t]}
          </button>
        ))}
      </div>

      {tab === 'spawns' && <SpawnManager />}
      {tab === 'players' && <PlayerManager />}
      {tab === 'logs' && <RemovalLogTable />}
      {tab === 'stats' && <StatsPanel />}
    </PageWrapper>
  )
}

function SpawnManager() {
  const qc = useQueryClient()
  const { addToast } = useToasts()
  const [form, setForm] = useState({ name: '', minLevel: '', maxLevel: '', location: '' })

  const { data: spawns, isLoading } = useQuery<Spawn[]>({
    queryKey: ['admin-spawns'],
    queryFn: () => api.get<Spawn[]>('/spawns'),
  })

  const { mutate: createSpawn, isPending } = useMutation({
    mutationFn: () =>
      api.post<Spawn>('/spawns', {
        name: form.name,
        minLevel: Number(form.minLevel),
        maxLevel: Number(form.maxLevel),
        location: form.location || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-spawns'] })
      addToast('success', 'Spawn criado.')
      setForm({ name: '', minLevel: '', maxLevel: '', location: '' })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch<Spawn>(`/spawns/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-spawns'] }),
    onError: (e: Error) => addToast('error', e.message),
  })

  const { mutate: deleteSpawn } = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/spawns/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-spawns'] })
      addToast('success', 'Spawn removido.')
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  return (
    <div className="space-y-6">
      <div className="bg-bg2 border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-text">Novo Spawn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Localização"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Input
            label="Nível mínimo"
            type="number"
            value={form.minLevel}
            onChange={(e) => setForm((f) => ({ ...f, minLevel: e.target.value }))}
          />
          <Input
            label="Nível máximo"
            type="number"
            value={form.maxLevel}
            onChange={(e) => setForm((f) => ({ ...f, maxLevel: e.target.value }))}
          />
        </div>
        <Button
          isLoading={isPending}
          onClick={() => createSpawn()}
          disabled={!form.name || !form.minLevel || !form.maxLevel}
        >
          Criar Spawn
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="space-y-2">
          {spawns?.map((s) => (
            <div
              key={s.id}
              className="bg-bg2 border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text">{s.name}</p>
                  {!s.active && <Badge variant="muted">Inativo</Badge>}
                </div>
                <p className="text-xs text-text-muted">
                  Lv. {s.minLevel}–{s.maxLevel} · {s.location || '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleActive({ id: s.id, active: !s.active })}
                >
                  {s.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteSpawn(s.id)}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type PlayerFilter = 'all' | 'banned' | 'warnings' | 'premium'

function PlayerManager() {
  const qc = useQueryClient()
  const { addToast } = useToasts()
  const [filter, setFilter] = useState<PlayerFilter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [banHours, setBanHours] = useState('24')

  const { data: players, isLoading } = useQuery<User[]>({
    queryKey: ['admin-players'],
    queryFn: () => api.get<User[]>('/admin/players'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<User> }) =>
      api.patch<User>(`/admin/players/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-players'] })
      setEditingId(null)
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const filtered = players?.filter((p) => {
    if (filter === 'banned') return p.banned || (p.banUntil && new Date(p.banUntil) > new Date())
    if (filter === 'warnings') return p.warnings > 0
    if (filter === 'premium') return p.premium
    return true
  })

  function isBanned(p: User) {
    return p.banned || (!!p.banUntil && new Date(p.banUntil) > new Date())
  }

  function banUntilFromHours(hours: number): string {
    return new Date(Date.now() + hours * 3600 * 1000).toISOString()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', 'banned', 'warnings', 'premium'] as PlayerFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f
                ? 'border-gold text-gold bg-[var(--gold-glow)]'
                : 'border-border text-text-muted hover:border-border-hover'
            }`}
          >
            {{ all: 'Todos', banned: 'Banidos', warnings: 'Com Warnings', premium: 'Premium' }[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="space-y-2">
          {filtered?.map((p) => (
            <div key={p.id} className="bg-bg2 border border-border rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-text">{p.discordName}</span>
                  {p.premium && <Badge variant="gold">Premium</Badge>}
                  {p.warnings > 0 && <Badge variant="amber">{p.warnings} warnings</Badge>}
                  {isBanned(p) && <Badge variant="red">Banido</Badge>}
                  {p.isAdmin && <Badge variant="blue">Admin</Badge>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateMutation.mutate({ id: p.id, patch: { premium: !p.premium } })}
                  >
                    {p.premium ? 'Remover Premium' : 'Dar Premium'}
                  </Button>
                  {p.warnings > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateMutation.mutate({ id: p.id, patch: { warnings: 0 } })}
                    >
                      Zerar Warnings
                    </Button>
                  )}
                  {isBanned(p) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateMutation.mutate({ id: p.id, patch: { banned: false, banUntil: null } })}
                    >
                      Desbanir
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                    >
                      Banir
                    </Button>
                  )}
                </div>
              </div>

              {editingId === p.id && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <label className="text-xs text-text-muted">Duração (horas):</label>
                  <input
                    type="number"
                    value={banHours}
                    min="1"
                    onChange={(e) => setBanHours(e.target.value)}
                    className="w-20 bg-bg3 border border-border text-text rounded px-2 py-1 text-sm focus:outline-none focus:border-gold"
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: p.id,
                        patch: { banned: true, banUntil: banUntilFromHours(Number(banHours)) },
                      })
                    }
                  >
                    Confirmar Ban
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RemovalLogTable() {
  const { data: logs, isLoading } = useQuery<RemovalLog[]>({
    queryKey: ['admin-logs'],
    queryFn: () => api.get<RemovalLog[]>('/admin/removal-log'),
  })

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-2">
      {logs?.length === 0 && (
        <p className="text-center py-8 text-text-muted">Nenhum registro de remoção.</p>
      )}
      {logs?.map((l) => (
        <div key={l.id} className="bg-bg2 border border-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <span className="font-medium text-text">{l.targetName}</span>
            <Badge variant={l.action === 'removed_from_spawn' ? 'red' : 'amber'}>
              {l.action === 'removed_from_spawn' ? 'Removido do spawn' : 'Removido da fila'}
            </Badge>
          </div>
          <p className="text-sm text-text-muted">{l.reason}</p>
          <div className="flex gap-3 mt-1 text-xs text-text-dim">
            <span>{l.spawnName}</span>
            <span>{l.warningsAfter} warnings após</span>
            <span>{ago(l.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsPanel() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<AdminStats>('/admin/stats'),
    refetchInterval: 30_000,
  })

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: 'Usuários Totais', value: stats?.totalUsers ?? '—' },
        { label: 'Filas Ativas', value: stats?.activeQueues ?? '—' },
        { label: 'Remoções Recentes', value: stats?.recentRemovals ?? '—' },
      ].map((s) => (
        <div key={s.label} className="bg-bg2 border border-border rounded-xl p-6 text-center">
          <p className="font-display text-3xl font-bold text-gold mb-1">{s.value}</p>
          <p className="text-sm text-text-muted">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
