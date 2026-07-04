# CarInventory Demo

Interactive prototype for the Car Valuation & Inventory System.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Sell flow** — Multi-step wizard: vehicle info → photos & condition → instant valuation → publish
- **Browse** — Search and filter marketplace listings by make, year, price, mileage
- **Listing detail** — Photo gallery, specs, valuation badge, contact seller form
- **Dashboard** — View your listings (mock auth via localStorage)
- **Auth** — Login/register UI (any credentials work in demo mode)

## Tech stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Mock API with localStorage persistence (`lib/mock-api.ts`)
- Client-side valuation engine (`lib/valuation.ts`)

## Data

Seed data includes 8 sample vehicles. User-created listings persist in `localStorage` under key `carval_inventory`.

To reset data, clear localStorage in browser dev tools or run in console:

```js
localStorage.removeItem('carval_inventory');
location.reload();
```

## Documentation

See the `docs/` folder at the project root:

- `system-architecture.md` — High-level architecture
- `user-stories.md` — Epics and acceptance criteria
- `database-schema.md` — PostgreSQL schema design
- `system-design.md` — Flows, valuation algorithm, API contracts

## Out of scope

This is a frontend prototype only. No real backend, database, payments, or email delivery.
