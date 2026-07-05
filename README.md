# CarInventory

Malaysia-market car valuation and inventory marketplace. Private sellers list vehicles, receive MYR valuations, and publish to a buyer-facing marketplace. Production valuations come from the EZAUTO Central Vehicle Datahouse.

## Repository structure

```
├── demo/          Interactive Next.js prototype (sell, browse, admin)
└── docs/          System proposal (schema, data strategy, rollout plan)
```

## Quick start (prototype)

```bash
cd demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role     | Email                     | Password  |
| -------- | ------------------------- | --------- |
| Admin    | `admin@carinventory.my`   | any value |
| Reseller | `reseller@carinventory.my`| any value |
| Seller   | any other email           | any value |

Buyers can browse and send inquiries without logging in.

## Features (prototype)

- **Sell** — Multi-step wizard: vehicle details → photos → valuation → publish (pending admin review)
- **Browse** — Filter listings by make, year, price, mileage
- **Listing detail** — Photos, specs, valuation estimate, contact seller
- **Dashboard** — Sellers manage their listings
- **Admin** — Approve/reject listings, view inquiries

## Tech stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Mock API with localStorage (`demo/lib/mock-api.ts`)
- Rule-based valuation engine for prototype (`demo/lib/valuation.ts`)
- Production path: EZAUTO datahouse integration (see docs)

## Documentation

Main proposal: [`docs/carinventory-system-proposal.md`](docs/carinventory-system-proposal.md)

Covers:

1. Database schema (PostgreSQL, encryption, EZAUTO payloads)
2. Multi-source data strategy (seller input vs EZAUTO valuation)
3. Rollout plan (assess → host → protect → migrate → gate → cutover)

## Market defaults

- Currency: **MYR**
- Mileage: **km**
- Identity: **number plate** (seller-facing)

## License

Private — VibeCoders Penang.
