## Adminstige — Developer Guide

This is the Admin dashboard for StigeHiling built with React, Vite, and TypeScript. It uses React Query for data fetching, SweetAlert2 for modals, and Tailwind CSS for styling.

### Tech Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- @tanstack/react-query (+ Devtools)
- SweetAlert2
- lucide-react icons

### Quick Start

1. Install deps

```bash
npm install
```

2. Configure environment (see Env below)
3. Run dev server

```bash
npm run dev
```

4. Open the URL Vite prints (usually http://localhost:5173)

### Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type-check then build production assets
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint on the repo

Handy one-offs:

```bash
# Type-check only (no output files)
npx tsc --noEmit

# Lint only pages (fast iteration)
npx eslint src/pages/*
```

### Env

Create a `.env` file at project root if needed:

```bash
cp .env.example .env  # if you have one
```

Set the API base (Laravel backend):

```bash
echo 'VITE_API_URL=http://localhost:8000/api/v1' >> .env
```

### Project Structure (trimmed)

```
src/
	pages/
		AdminDashboard.tsx
		UserManagement.tsx
		PartnerManagement.tsx
		Destination.tsx
	utils/
		api.ts            # apiCall wrapper, endpoints, errors
		userAPI.ts        # users CRUD, status updates, mock fallback
		destinationAPI.ts # destinations CRUD
	components/
		...
```

### API & Auth

- Base URL controlled by `VITE_API_URL` in `.env`.
- Requests use `Bearer` token from `localStorage.getItem('admin_token')`.
- If the backend returns 401/Unauthenticated, `admin_token` is cleared so the UI can re-login.
- Key routes expected by the UI:
  - `GET /admin/users` (with filters/search/pagination)
  - `GET /admin/users/:id`
  - `DELETE /admin/users/:id`
  - `PATCH /admin/users/:id/status` (activate/suspend)
  - `GET/POST/PATCH/DELETE /admin/destinations`

When the backend is unreachable, many calls use a mock fallback to keep the UI usable for demos and local development (see `userAPI.ts`).

### Data Fetching

- React Query is used for server state: caching, loading/error states, and refetching.
- Pages usually define `queryKey` with pagination, search, and filter params to scope caches.
- Prefer updating list state optimistically after mutations (e.g., delete, suspend) to keep UX snappy.

### UI Patterns

- SweetAlert2 is used for confirmations and detail popups.
  - Deletion confirmations use `icon: 'warning'`, cancel + confirm buttons, and success/error toasts.
  - Detail views (e.g., Users/Partners) render styled HTML in SweetAlert while keeping the original design semantics.
- Icons: `lucide-react`.
- Styling: Tailwind v4 utilities.
  - Note: Tailwind v4 prefers `bg-linear-to-r`/`bg-linear-to-br` over the old `bg-gradient-to-*` form. Follow existing patterns to satisfy linters.

### Conventions

- TypeScript: prefer explicit interfaces for API shapes in `utils/*API.ts`.
- Avoid inline comments in code unless necessary (project style).
- Keep changes minimal and focused; don’t reformat unrelated files.

### Troubleshooting

- “Failed to fetch” / Network errors:
  - Ensure backend is running and `VITE_API_URL` is correct.
  - Mock fallback logs to console when it’s used.
- 401/Unauthenticated:
  - Token is cleared; log in again to refresh `admin_token`.
- ESLint complaints about gradient classes:
  - Replace `bg-gradient-to-*` with `bg-linear-to-*` as suggested.

### Useful Files

- `src/utils/api.ts` — Fetch wrapper, endpoints, and error normalization.
- `src/utils/userAPI.ts` — Users list/detail/status, create, delete, with mock fallback.
- `src/pages/UserManagement.tsx` — Search, filters, detail via SweetAlert, actions.
- `src/pages/PartnerManagement.tsx` — Partner list, create, activate/suspend, delete, detail via SweetAlert.

### Commit & PR

- See `GIT_COMMIT_GUIDE.md` for conventions.
- Keep PRs focused and reference related docs: `API_CONTRACT.md`, `API_IMPLEMENTATION_MAPPING.md`, etc.

That’s it — run `npm run dev`, set your `.env`, and you’re good to go.
