import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useToasts } from '../hooks/useToasts'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { ago } from '../utils/time'
import type { Spawn, Player, Report, RemovalLog } from '../types'

type Tab = 'spawns' | 'players' | 'reports' | 'logs'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('spawns')

  return (
    <PageWrapper>
      <h1 className="font-display text-2xl text-gold font-semibold mb-6">Painel Admin</h1>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {(['spawns', 'players', 'reports', 'logs'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              tab === t
                ? 'border-gold text-gold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {{ spawns: 'Spawns', players: 'Jogadores', reports: 'Reports', logs: 'Log de Remoções' }[t]}
          </button>
        ))}
      </div>

      {tab === 'spawns' && <SpawnManager />}
      {tab === 'players' && <PlayerManager />}
      {tab === 'reports' && <ReportsTable />}
      {tab === 'logs' && <RemovalLogTable />}
    </PageWrapper>
  )
}

function SpawnManager() {
  const qc = useQueryClient()
  const { addToast } = useToasts()
  const [form, setForm] = useState({ name: '', min_level: '', max_level: '', location: '' })

  const { data: spawns, isLoading } = useQuery<Spawn[]>({
    queryKey: ['admin-spawns'],
    queryFn: async () => {
      const { data, error } = await supabase.from('spawns').select('*').order('name')
      if (error) throw error
      return data as Spawn[]
    },
  })

  const { mutate: createSpawn, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('spawns').insert({
        name: form.name,
        min_level: Number(form.min_level),
        max_level: Number(form.max_level),
        location: form.location || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-spawns'] })
      addToast('success', 'Spawn criado.')
      setForm({ name: '', min_level: '', max_level: '', location: '' })
    },
    onError: () => addToast('error', 'Falha ao criar spawn.'),
  })

  const { mutate: deleteSpawn } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('spawns').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-spawns'] })
      addToast('success', 'Spawn removido.')
    },
    onError: () => addToast('error', 'Falha ao remover spawn.'),
  })

  return (
    <div className="space-y-6">
      <div className="bg-bg2 border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-text">Novo Spawn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Nome" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Localização" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <Input label="Nível mínimo" type="number" value={form.min_level} onChange={(e) => setForm((f) => ({ ...f, min_level: e.target.value }))} />
          <Input label="Nível máximo" type="number" value={form.max_level} onChange={(e) => setForm((f) => ({ ...f, max_level: e.target.value }))} />
        </div>
        <Button isLoading={isPending} onClick={() => createSpawn()} disabled={!form.name || !form.min_level || !form.max_level}>
          Criar Spawn
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="space-y-2">
          {spawns?.map((s) => (
            <div key={s.id} className="bg-bg2 border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-text">{s.name}</p>
                <p className="text-xs text-text-muted">Lv. {s.min_level}–{s.max_level} · {s.location ?? '—'}</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => deleteSpawn(s.id)}>Remover</Button>
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

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['admin-players', filter],
    queryFn: async () => {
      let q = supabase.from('players').select('*')
      if (filter === 'banned') q = q.not('banned_until', 'is', null)
      if (filter === 'warnings') q = q.gt('warnings', 0)
      if (filter === 'premium') q = q.eq('is_premium', true)
      const { data, error } = await q.order('created_at', { ascending: false }).limit(50)
      if (error) throw error
      return data as Player[]
    },
  })

  async function togglePremium(p: Player) {
    const { error } = await supabase.from('players').update({ is_premium: !p.is_premium }).eq('id', p.id)
    if (error) { addToast('error', 'Falha.'); return }
    qc.invalidateQueries({ queryKey: ['admin-players'] })
    addToast('success', `Premium ${!p.is_premium ? 'concedido' : 'removido'}.`)
  }

  async function clearWarnings(id: string) {
    const { error } = await supabase.from('players').update({ warnings: 0 }).eq('id', id)
    if (error) { addToast('error', 'Falha.'); return }
    qc.invalidateQueries({ queryKey: ['admin-players'] })
    addToast('success', 'Warnings zerados.')
  }

  async function unban(id: string) {
    const { error } = await supabase.from('players').update({ banned_until: null }).eq('id', id)
    if (error) { addToast('error', 'Falha.'); return }
    qc.invalidateQueries({ queryKey: ['admin-players'] })
    addToast('success', 'Jogador desbanido.')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', 'banned', 'warnings', 'premium'] as PlayerFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f ? 'border-gold text-gold bg-[var(--gold-glow)]' : 'border-border text-text-muted hover:border-border-hover'
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
          {players?.map((p) => (
            <div key={p.id} className="bg-bg2 border border-border rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{p.discord_username}</span>
                  {p.is_premium && <Badge variant="gold">Premium</Badge>}
                  {p.warnings > 0 && <Badge variant="amber">{p.warnings} warnings</Badge>}
                  {p.banned_until && new Date(p.banned_until) > new Date() && <Badge variant="red">Banido</Badge>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={() => togglePremium(p)}>
                    {p.is_premium ? 'Remover Premium' : 'Dar Premium'}
                  </Button>
                  {p.warnings > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => clearWarnings(p.id)}>Zerar Warnings</Button>
                  )}
                  {p.banned_until && new Date(p.banned_until) > new Date() && (
                    <Button size="sm" variant="danger" onClick={() => unban(p.id)}>Desbanir</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReportsTable() {
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as Report[]
    },
  })

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-2">
      {reports?.map((r) => (
        <div key={r.id} className="bg-bg2 border border-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <span className="font-medium text-text">{r.target_name}</span>
            <span className="text-xs text-text-dim">{ago(r.created_at)}</span>
          </div>
          <p className="text-sm text-text-muted">{r.reason}</p>
          <p className="text-xs text-text-dim mt-1">{r.spawn_name} · {r.world_id}</p>
        </div>
      ))}
    </div>
  )
}

function RemovalLogTable() {
  const { data: logs, isLoading } = useQuery<RemovalLog[]>({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('removal_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as RemovalLog[]
    },
  })

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-2">
      {logs?.map((l) => (
        <div key={l.id} className="bg-bg2 border border-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <span className="font-medium text-text">{l.target_name}</span>
            <Badge variant={l.action === 'removed_from_spawn' ? 'red' : 'amber'}>
              {l.action === 'removed_from_spawn' ? 'Removido do spawn' : 'Removido da fila'}
            </Badge>
          </div>
          <p className="text-sm text-text-muted">{l.reason}</p>
          <div className="flex gap-3 mt-1 text-xs text-text-dim">
            <span>{l.spawn_name}</span>
            <span>{l.warnings_after} warnings após</span>
            <span>{ago(l.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
