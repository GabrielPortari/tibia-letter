# Tibia Letter

Spawn queue system for Tibia. Organizes respawn slots into transparent, real-time digital queues — first come, first hunt, no arguments.

## Features

- **Verified characters** — confirmation via the public Comment field on tibia.com, no credentials required
- **Per-world queues** — each world has its own independent queues
- **Real-time updates** — queue state updates instantly as players join, accept, and finish hunts
- **Multilingual** — available in Portuguese, English, Spanish, and Polish (`/pt`, `/en`, `/es`, `/pl`)
- **Discord login** — authentication via Discord OAuth, no registration form

## Tech stack

- React 19 + React Router v7
- i18next / react-i18next
- Tanstack Query
- Supabase (auth)
- Tailwind CSS
- Vite

## Getting started

```bash
npm install
npm run dev
```

## Contributing

Pull requests are welcome. Open an issue first for significant changes.

## License

MIT
