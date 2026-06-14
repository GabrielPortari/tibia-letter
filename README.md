# Tibia Letter

Plataforma web para organização de filas de respawn do Tibia em tempo real. Substitui o sistema manual de "cartas" por uma fila digital com verificação de personagem, controle de level, reports e painel admin.

## Stack

- **React 18 + TypeScript** via Vite
- **React Router v6** — roteamento com lazy loading
- **Zustand** — estado global (auth, fila otimista)
- **TanStack Query v5** — cache e mutations
- **Supabase** — banco de dados, auth (Discord OAuth PKCE), Realtime, Edge Functions
- **Tailwind CSS v3** — estilização mobile-first com design tokens via CSS variables
- **React Hook Form + Zod** — formulários validados
- **Vitest + Testing Library** — testes unitários

## Estrutura

```
src/
├── components/
│   ├── ui/           # Button, Badge, Input, Modal, Spinner, Avatar, Divider, ToastContainer
│   ├── layout/       # Topbar, PageWrapper, RouteGuards
│   ├── spawn/        # SpawnCard, MyQueuesBanner
│   ├── queue/        # QueueSlot, InlineTimer (HuntTimer, AcceptTimer)
│   ├── character/    # CharVerifyModal
│   ├── report/       # ReportModal
│   └── admin/        # (integrado em pages/Admin.tsx)
├── pages/            # Landing, WorldSelect, SpawnApp, Admin, AuthCallback, NotFound, Forbidden
├── hooks/            # useAuth, useCountdown, useQueueRealtime, useToasts
├── stores/           # authStore, queueStore
├── lib/              # supabase, queryClient, tibiaApi
├── types/            # index.ts
└── utils/            # time, level, security
```

## Configuração

```bash
cp .env.example .env
# Preencha as variáveis com suas credenciais Supabase e Discord
npm install
npm run dev
```

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_DISCORD_CLIENT_ID=
VITE_APP_URL=
VITE_ENVIRONMENT=development|production
```

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run test      # testes em modo watch
npm run test:run  # testes one-shot
npm run lint      # lint
```

## Rotas

| Rota | Página | Acesso |
|---|---|---|
| `/` | Landing | Público |
| `/worlds` | WorldSelect | Auth obrigatória |
| `/worlds/:worldId` | SpawnApp | Auth + char ativo |
| `/admin` | Admin | Role admin |
| `/auth/callback` | AuthCallback | — |
| `/403` | Forbidden | — |
| `/404` | Not Found | — |

## Backend necessário (Supabase)

Tabelas: `players`, `characters`, `worlds`, `spawns`, `queue_entries`, `reports`, `removal_logs`

Edge Functions: `init-character`, `verify-character`, `accept-spawn`, `finish-hunt`

RPC: `get_report_quota`

Ver [context.md](context.md) para detalhes de implementação e estado atual.
