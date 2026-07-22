# People Connect MLA — Web Dashboard

React + TypeScript + Vite + Tailwind CSS dashboard for **MLA offices** and
**district
administrators**. Part of the People Connect MLA civic-tech platform
(District Public Grievance + MLA Connect).

## Design

A "civic register" visual identity built specifically for this brief:
deep indigo ink, parchment paper background, sindoor-red and marigold-gold
accents, banyan green for resolved states. Headings in Fraunces (a serif
with an official, gazette-like character), body text in Inter, data/IDs in
IBM Plex Mono. The signature moment is a circular ink-seal stamp that
animates onto a complaint the moment it's marked **Resolved** — a nod to
the physical "file stamped and closed" act of an actual government office.

## Stack

- React 19 + Vite
- TypeScript
- React Router
- Tailwind CSS
- Recharts (analytics charts)
- Axios (API client)
- lucide-react (icons)

## Running it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`.

### Demo mode vs live backend

By default, **no backend is required** — the app runs against realistic
seed data in `src/data/seed.js` via the API client in `src/api/client.js`,
so you can browse the whole dashboard immediately.

To connect the real Spring Boot backend, copy `.env.example` to `.env` and
set:

```
VITE_API_URL=http://localhost:8080
```

The API client (`src/api/client.js`) already mirrors every backend
endpoint 1:1 — switching modes requires no other code changes.

### Login

Any password works in demo mode. Pick a role (MLA Office / Administrator)
on the login screen — this determines which section of the app you land in.

## Structure

```
src/
├── api/client.js       # API layer — live backend or demo data, same shape
├── components/         # Layout, badges, drawer, seal logo, shared UI
├── context/             # Auth/session context
├── data/seed.js           # Demo data mirroring backend DTOs
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx        # MLA home — stats, recent complaints, profile
    ├── Complaints.jsx         # Full grievance register with filters
    ├── Posts.jsx                # Activity posts (meetings/works/announcements)
    ├── Analytics.jsx              # Charts: category split, status distribution
    └── Admin.jsx                    # MLA verification, user management
```

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — deploy to any static host (S3 + CloudFront,
Netlify, Vercel, Nginx, etc).
# Web
