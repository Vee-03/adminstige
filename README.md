# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Adminstige — Admin Dashboard (React + TypeScript + Vite)

  This repository contains the Admin UI for the Adminstige project, built with React 19, TypeScript and Vite.

  The app is a single-page admin dashboard to manage destinations, users and checkouts. It uses the backend API under `/admin/*` endpoints (configurable via an environment variable).

  This README focuses on developer setup, conventions, and a few implementation notes to help contributors get started quickly.

  ## Tech stack

  - React 19 + TypeScript
  - Vite (dev server / build)
  - TanStack React Query (v5) for data fetching, caching and invalidation
  - Chart.js + react-chartjs-2 for charts
  - TailwindCSS for styling
  - SweetAlert2 for confirmation / details modal UI

  ## Quick start (development)

  Prerequisites: Node.js (18+ recommended) and npm/yarn.

  1. Install dependencies

  ```bash
  npm install
  ```

  2. Configure environment (optional)

  Create a `.env` file or set environment variables. By default the app will use `http://localhost:8000/api/v1` for API calls. To override, set:

  ```
  VITE_API_URL=https://your-api.example.com/api/v1
  ```

  3. Run the dev server

  ```bash
  npm run dev
  ```

  Open http://localhost:5173/ (Vite will print the actual URL).

  4. Build for production

  ```bash
  npm run build
  npm run preview
  ```

  ## Useful scripts

  - npm run dev — run Vite dev server with HMR
  - npm run build — build production assets (also runs TypeScript build step)
  - npm run preview — preview production build locally
  - npm run lint — run ESLint across the repo

  ## Environment and API

  - The frontend calls the API using the base URL set by `VITE_API_URL` (defaults to `http://localhost:8000/api/v1` if not provided).
  - API endpoint constants are defined in `src/utils/api.ts` as `API_ENDPOINTS`. Important admin endpoints used by the app include:
    - `/admin/login`, `/admin/logout`
    - `/admin/destinations`
    - `/admin/checkouts`
    - `/admin/users`
    - `/admin/dashboard`

  ## Authentication token

  - When an admin logs in, the token is stored in localStorage under the key `admin_token`.
  - `src/utils/api.ts` reads this token and includes it as a `Bearer` header for API calls.
  - The application (in `src/App.tsx`) initializes logged-in state from `localStorage` and listens to the `storage` event so token changes in other tabs are reflected.

  If you need cookie-based auth or different token handling, update `apiCall` in `src/utils/api.ts` and `AdminLogin.tsx`.

  ## Data fetching and caching (React Query)

  - The app uses TanStack React Query (v5) to centralize fetching and caching. The global `QueryClient` is created in `src/main.tsx` and wrapped around the app.
  - Default query options (staleTime, retry behavior) are configured there. Queries in pages use `useQuery` and expose `refetch()` buttons for manual refresh.
  - Dev tip: Use React Query Devtools (package is installed) during development for cache inspection — add the Devtools component to `src/main.tsx` inside the `QueryClientProvider`.

  ## Where to normalize API shapes

  - The backend can return slightly different shapes across environments (e.g., `data.items` vs an array directly, numeric strings vs numbers, nested objects). To reduce copy-paste normalization across components, the project contains helper modules in `src/utils`:
    - `src/utils/api.ts` — low-level fetch wrapper and response types
    - `src/utils/destinationAPI.ts` — destination helpers and `normalizeDestination`
    - `src/utils/userAPI.ts` — users list/detail helpers + fallback mocks
    - `src/utils/checkoutAPI.ts` — checkout shapes and helpers

  When adding a new component that consumes an API, prefer adding a typed helper in `src/utils/*` that returns consistent UI-friendly shapes. This reduces `any` usage and ESLint/type churn.

  ## Linting & Type checking

  - Run TypeScript checks:

  ```bash
  npx tsc --noEmit
  ```

  - Run ESLint:

  ```bash
  npx eslint .
  ```

  We intentionally keep lint rules strict (no `any`) where practical. During migration you may see temporary `/* eslint-disable @typescript-eslint/no-explicit-any */` comments in pages — prefer to remove them by moving normalization into `src/utils` and adding proper types.

  ## Charts and Chart.js plugins

  - Chart.js (v4) requires certain plugins to be registered explicitly. The dashboard registers the `Filler` plugin to avoid runtime errors when using `fill` in a line chart — see `src/pages/DashboardContent.tsx`.

  If you add new charts, remember to import and register the required chart elements/plugins in the component or in a shared module.

  ## Common troubleshooting

  - CORS errors / network failures:
    - Ensure `VITE_API_URL` matches the backend host and the backend allows requests from the dev origin.
    - The code uses a `tryApiWithMockFallback` pattern in some utils to provide local mock data when the backend is unavailable — useful for local UI work.

  - Token not persisting across refresh:
    - The login flow stores `admin_token` in `localStorage`. If you still need sessions, consider switching to cookies and set `useCredentials` in `apiCall`.

  - ESLint complains about `any`:
    - Move normalization code into `src/utils/*` and add explicit interfaces (examples are present in `checkoutAPI.ts`, `destinationAPI.ts`, and `userAPI.ts`).

  ## Contributing and commits

  - Branch naming: feature/*, fix/*, chore/*
  - Follow conventional commits where possible. There is a `GIT_COMMIT_GUIDE.md` in the repo — please read before pushing.

  ## Next steps / suggestions

  - Remove the temporary `no-explicit-any` disables by centralizing normalization into typed helpers.
  - Add React Query Devtools in `src/main.tsx` for easier debugging.
  - Add a small e2e smoke test (Cypress/playwright) to verify critical flows if you plan to expand the app.

  If you'd like, I can (pick one):
  - Add React Query Devtools to the dev layout now.
  - Move the checkout normalization into `src/utils/checkoutAPI.ts` and type it properly.
  - Create a short CONTRIBUTING.md with code-style and PR/branch rules.

  Thanks — open an issue or assign me a task for any of the next steps and I will implement it.
