# Tibia Letter — Context

## Estado atual (2026-06-14)

Frontend implementado do zero a partir de um template Vite + React.

## O que está implementado

### Infraestrutura
- Tailwind CSS v3 configurado com design tokens via CSS variables (paleta dark gold/vermelho/verde)
- Fontes: Cinzel (display), Inter (interface), JetBrains Mono (código)
- Vite config com suporte a Vitest + jsdom

### Tipos (`src/types/index.ts`)
Player, Character, Spawn, QueueEntry, Report, RemovalLog, World, VerificationCode, Toast

### Utils
- `time.ts`: fmt(), ago(), huntDuration(), overlap(), secondsUntil()
- `level.ts`: validateLevelRange()
- `security.ts`: sanitizeInput() com DOMPurify, validateCharacterName(), validateCode(), generateVerificationCode() com crypto.getRandomValues()

### Lib
- `supabase.ts`: cliente tipado com PKCE flow
- `queryClient.ts`: TanStack Query client com defaults
- `tibiaApi.ts`: wrapper para proxy da API do Tibia (chama `/api/tibia-proxy` no backend)

### Stores (Zustand)
- `authStore.ts`: player, activeChar, isLoading, isBanned(), banSecondsLeft()
- `queueStore.ts`: entries por spawnId, setEntries, upsertEntry, removeEntry, removePlayerFromAllQueues, getSpawnQueue, getMyEntries

### Hooks
- `useAuth.ts`: carrega sessão Supabase, listener de auth state change
- `useCountdown.ts`: countdown com setInterval 1s, onExpire ref guard
- `useQueueRealtime.ts`: subscribe ao canal `queue:{worldId}`, exponential backoff
- `useToasts.ts`: store de toasts com auto-dismiss 4s

### Componentes UI
- Button, Badge, Input, Modal (bottom-sheet mobile / centered desktop), Spinner, Avatar, Divider, ToastContainer

### Layout
- Topbar: logo, char ativo, badge premium, avatar Discord, logout, menu hamburguer mobile
- PageWrapper: max-width centrado, padding
- RouteGuards: PrivateRoute, CharRequiredRoute, AdminRoute, BannedGuard

### Spawn/Queue
- SpawnCard: expansível (aria-expanded), status dot, borda dourada pulsante quando é vez do user, AcceptTimer integrado, bloqueio por level
- MyQueuesBanner: 3 seções (aceites pendentes com countdown + botão pular, hunts ativas em verde, aguardando em cinza); detecta conflito de duplo aceite simultâneo e exibe aviso
- QueueSlot: linha de fila com posição, char, level, HuntTimer/AcceptTimer inline
- HuntTimer + AcceptTimer em `InlineTimer.tsx`

### Regras de fila (lógica frontend — backend é fonte de verdade)
- **Limite**: Free = 1 fila simultânea · Premium = 2 filas simultâneas
- **Bloqueio de join se caçando**: se o player tem qualquer entry com `status === 'active'`, não pode entrar em nova fila
- **Ao aceitar**: `removePlayerFromAllQueues(playerId, exceptSpawnId)` remove otimisticamente o player de todas as outras filas; o backend confirma e repassa os aceites pendentes para o próximo na fila
- **Duplo aceite simultâneo**: se dois spawns ficam vagos ao mesmo tempo (`pending_accept` em ambos), MyQueuesBanner exibe ambos com aviso de conflito; aceitar um chama `leave` no outro via backend
- **Pular aceite**: botão "Pular" no chip de aceite chama `leaveMutation` — o backend repassa para o próximo

### Character
- CharVerifyModal: stepper 3 etapas (Nome → Código → Verificar), polling 15s, TTL countdown, cópia do código

### Report
- ReportModal: quota display, 2 motivos, confirmação obrigatória

### Pages
- Landing: hero + 3 feature cards + botão Discord OAuth
- AuthCallback: aguarda sessão e redireciona
- WorldSelect: grid de mundos do Supabase
- SpawnApp: lista de spawns + Realtime + mutations (join/accept/finish/leave) + ReportModal
- Admin: 4 abas (Spawns CRUD, Jogadores com filtros/ações, Reports, Log de Remoções)
- Forbidden (403) e NotFound (404)

### App.tsx
- React Router v6 com lazy loading em todas as rotas
- QueryClientProvider + BrowserRouter
- Guards aninhados

### Testes (19 passando)
- `useCountdown`: dispara onExpire exatamente 1x, limpa interval no unmount
- `level.ts`: validateLevelRange com boundaries exatos e edge cases
- `time.ts`: fmt() com horas/minutos/segundos, overlap() com ranges adjacentes e sobrepostos

## O que falta (backend)

Para funcionar em produção, o Supabase precisa de:

### Tabelas
```sql
players, characters, worlds, spawns, queue_entries, reports, removal_logs
```

### Edge Functions
- `init-character(characterName, playerId)` → gera código SQ-XXXXXX, salva com TTL 30min
- `verify-character(characterName, code)` → consulta API Tibia, valida comentário
- `accept-spawn(spawnId, worldId, playerId)` → registra started_at
- `finish-hunt(spawnId, worldId, playerId)` → remove da posição 0, dispara aceite para próximo

### RPC
- `get_report_quota(player_id)` → retorna { used, limit, resets_at }

### Realtime
- Habilitar publicação de mudanças na tabela `queue_entries`

### Auth
- Configurar Discord OAuth no painel Supabase
- Redirect URL: `{VITE_APP_URL}/auth/callback`

## Versões das dependências principais

- React 19.2
- Zustand 5.0
- @tanstack/react-query 5.101
- @supabase/supabase-js 2.108
- tailwindcss 3.4
- zod 4.4
- @hookform/resolvers 5.4 (usa standardSchemaResolver — zod v4 suporta Standard Schema)
- vitest 4.1

## Notas de implementação

- Zod v4 não tem resolver dedicado no @hookform/resolvers v5 — usar `standardSchemaResolver` do `@hookform/resolvers/standard-schema`
- Mutations do TanStack Query v5 usam `onSuccess` via callback, não propriedade da query options
- `useQueueStore.getState()` é chamado diretamente em SpawnApp dentro de callbacks de evento para evitar closure stale
