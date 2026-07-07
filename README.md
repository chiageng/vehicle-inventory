# CarInventory

Malaysia-market car valuation and inventory marketplace. Private sellers list vehicles, receive MYR valuations at publish time, and reach buyers through a moderated marketplace. Production valuations integrate with the EZAUTO Central Vehicle Datahouse.

## Repository structure

```
├── demo/     Interactive Next.js preview (sell, browse, enquiries, admin)
└── docs/     System proposal — schema, data strategy, rollout plan
```

## Quick start

```bash
cd demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Preview accounts

| Role     | Email                      | Password     |
| -------- | -------------------------- | ------------ |
| Admin    | `admin@carinventory.my`    | `admin123`   |
| Reseller | `reseller@carinventory.my` | `reseller123`|
| Seller   | `sarah@example.com`        | `demo123`    |

New accounts can be registered from the sign-up page. Buyers can browse and enquire without an account; registered buyers see seller replies under **My Enquiries**.

### Reset sample data

```bash
cd demo
npm run reset-data
```

Restart the dev server after resetting.

## Preview features

| Area | Capability |
|------|------------|
| **Sell** | Guided listing wizard — vehicle details, photos, valuation at publish, admin review queue |
| **Browse** | Search and filter by make, model, year, price, mileage |
| **Enquiries** | Two-way buyer–seller messaging with conversation history |
| **Dashboard** | Sellers manage listings, update prices, reply to buyers |
| **Admin** | Approve or remove listings (separate moderation console) |

## Tech stack (preview)

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- REST API routes with JSON file persistence (`demo/data/`)
- Cookie-based authentication
- Rule-based valuation engine (`demo/lib/valuation.ts`) — production path uses EZAUTO per proposal

## Documentation

Full system proposal: [`docs/carinventory-system-proposal.md`](docs/carinventory-system-proposal.md)

Covers database schema, multi-source data strategy (seller input vs EZAUTO valuation), user stories, and a six-phase rollout plan.

## Market defaults

- Currency: **MYR**
- Mileage: **km**
- Vehicle identity: **number plate** (seller-facing)

## License

Private — VibeCoders Penang.
