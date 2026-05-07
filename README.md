# Medico Pharmacy — Patient Portal (`phcustomerportal`)

Customer-facing web portal for Medico Pharmacy patients. Built from the
Claude Design handoff (`Medico Pharmacy Portal`) — phone OTP + email/password
+ Google sign-in, dashboard, prescriptions, lab results, OTC shop, billing,
messages, and profile.

**Stack:** Vite + React 18 + TypeScript + React Router 6, Lucide icons,
self-hosted Inter variable font.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build → dist/
npm run preview  # serve dist/ locally
```

## Layout

```
src/
  main.tsx               # entry, mounts <App/> with BrowserRouter
  App.tsx                # routes + shared app state (cart, balance, prescriptions)
  components/            # atoms + composed components (Button, Card, TopNav, ...)
  screens/               # one file per top-level screen
  data.ts                # typed seed data (Margaret Chen demo persona)
  styles/                # tokens (colors_and_type.css) + app stylesheet
  assets/                # logo SVG + variable font files
```

The `data.ts` file is mock data only — no PHI. When the API is ready,
swap each screen's local hooks for typed fetchers.

## Notes

- Dashboard variant is selectable via the route — `/` shows variant B
  (hero card), `/dashboard/a` shows variant A (stat tiles).
- Login is currently a happy-path stub. Wire to the auth API once it lands.
- `--brand-primary: #14439A` (deep blue from the logo). Override via CSS
  custom properties on `:root` to re-theme at runtime.
