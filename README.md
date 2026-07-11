# EzAutoInventory (CarInventory)

Malaysia-market car marketplace and valuation platform. Private sellers and dealers list
vehicles, get MYR valuations powered by the EZAUTO Central Vehicle Datahouse, and reach buyers
through a moderated marketplace with on-platform chat.

## Repository structure

```
├── demo/     Interactive Next.js mockup — 4 portals (buyer, seller, dealer, admin)
└── docs/     Requirements (user stories), critical flows (SOPs), system proposal
```

## Quick start

```bash
cd demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick a portal. The mockup has **no
database and no real authentication** — login pages accept any credentials (or skip sign-in),
and all data is in-memory and resets on refresh. See `demo/README.md` for a step-by-step pitch
walk-through.

## Portals

| Portal | Route prefix | Layout | Highlights |
|---|---|---|---|
| **Buyer** | `/buyer` | Top navbar | Browse & compare, price-vs-market badges, plate check with valuation, masked chat |
| **Private seller** | `/seller` | Left sidebar | Plate auto-fill, two-stage valuation, price-deviation warning, enquiry inbox |
| **Dealer** | `/dealer` | Left sidebar | Instant appraisal (trade-in vs retail), inventory & consignments, lead inbox |
| **Admin** | `/admin` | Left sidebar | Risk-based review queue (flagged listings only), takedowns, dealer verification |

## The critical flow — valuation

Plate → EZAUTO datahouse lookup (spec auto-filled) → instant estimate from identity fields →
refined valuation after mileage/condition → asking price checked against market value
(deviation warnings for sellers, price badges for buyers, fraud flags for admin).
Mock integration points: `demo/lib/catalog.ts` (plate index) and `demo/lib/valuation.ts` (SaaS).

## Tech stack (mockup)

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Pure client-side state (`demo/lib/store.tsx`) — no API routes, no persistence
- Simulated EZAUTO valuation engine — production path integrates the real SaaS per proposal

## Documentation

- [`docs/requirements.md`](docs/requirements.md) — user stories per role
- [`docs/flow.md`](docs/flow.md) — critical flows / SOPs with diagrams
- [`docs/carinventory-system-proposal.md`](docs/carinventory-system-proposal.md) — schema, data strategy, rollout plan

## Market defaults

- Currency: **MYR** · Mileage: **km** · Vehicle identity: **number plate** (seller-facing)

## License

Private — VibeCoders Penang.
