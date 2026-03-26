# Prestek Intranet

Internal employee portal for Prestek Telecom. Built with React + Vite (frontend) and Express (backend).

## Architecture

- **Frontend**: React 18 + Vite, TailwindCSS, running on port 5000
- **Backend**: Express.js, running on port 3001
- **Database**: PostgreSQL (Replit built-in)
- **External API**: IXC Soft (ISP management platform) for authentication and employee/ticket data

## Project Structure

```
/
├── src/                    # React frontend
│   ├── App.jsx             # Main app + routing logic
│   ├── components/         # UI components (Dashboard, Login, Tickets, etc.)
│   ├── hooks/              # Custom hooks (useTheme, usePresence)
│   └── services/           # API service layer
├── backend/
│   ├── server.js           # Express API server (proxy for IXC API + DB routes)
│   ├── db.js               # PostgreSQL pool (uses DATABASE_URL or PG* env vars)
│   └── migrations/         # SQL migration files (run manually via migrations/run.js)
├── vite.config.js          # Vite config (host: 0.0.0.0, port: 5000, proxy /api → 3001)
└── index.html
```

## Environment Variables / Secrets

| Variable | Description |
|---|---|
| `DATABASE_URL` / `PG*` | Replit PostgreSQL (auto-provisioned) |
| `IXC_HOST` | IXC Soft server hostname |
| `IXC_USER_ID` | IXC API user ID |
| `IXC_TOKEN_SECRET` | IXC API token/secret |

## Workflows

- **Start application** — `npm run dev:frontend` on port 5000 (webview)
- **Backend API** — `cd backend && node --watch server.js` on port 3001 (console)

## Database Tables

- `usuarios_perfil` — User profile data synced from IXC on login
- `usuarios_preferencias` — Per-user settings (theme, etc.)
- `configuracoes_site` — Admin-managed global site settings
- `comunicados` — Internal announcements
- `plantoes` — On-call schedule

## Deployment

Configured for autoscale deployment:
- Build: `npm run build` (Vite bundles frontend to /dist)
- Run: `node backend/server.js & npx serve dist -l 5000`
