# EzAutoInventory — Interactive Mockup

Next.js mockup of the EzAutoInventory car marketplace, built to demonstrate the flows in
`../docs/requirements.md` and `../docs/flow.md`. Everything is simulated — **no database, no real
authentication, no API keys**. All data lives in memory and resets on refresh.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick a portal. The login pages accept any
credentials (or skip sign-in entirely).

## Portals

| Portal | Prefix | Layout | Persona |
| --- | --- | --- | --- |
| Buyer marketplace | `/buyer` | Top navbar | Guest buyer (no account) |
| Private seller | `/seller` | Left sidebar | Lim Wei Jian |
| Dealer | `/dealer` | Left sidebar | Prestige Auto Sdn Bhd |
| Platform admin | `/admin` | Left sidebar | Aisyah Rahman |

## Demo script (pitch walk-through)

1. **Seller — add a car** (`/seller/sell`): enter plate `VHR 2210` (or chassis
   `MHFGN8GM5L0812349`) → spec auto-fills from the mock EZAUTO datahouse → add mileage/condition → photos (AI check verifies the declared
   condition — try "Excellent" with fewer than 3 photos to trip it) → valuation is revealed →
   set the price last (try one 20% above market to trigger the deviation warning) → submit.
   A clean submission **goes live instantly**; price it >15% below market (or pick only 1 photo)
   to see it held for manual review instead.
2. **Admin — review the flagged ones** (`/admin/queue`): only flagged submissions sit here. Two
   are seeded: one priced 40% below market, one with a duplicate plate.
3. **Buyer — find it** (`/buyer`): search by model or plate, filter (incl. new/used/recon), compare 2–3 cars, open a listing, see the
   price-vs-market badge, send an enquiry or offer (contact masked).
4. **Buyer — plate check** (`/buyer/plate-check`): check `VBU 3421` (live listing match) or
   `WPM 9083` (not listed → set an alert).
5. **Dealer — stock aging** (`/dealer/aging`): the dealer's trading position — capital
   deployed, net potential profit, financing exposure, and every unit's age against the
   **6-month STMS → eSTM window**. Crossing into eSTM is fully costed: transfer fee charged,
   +1 owner → −8% market markdown, financing interest accruing daily, and net margin after
   holding costs per unit. One seeded unit is already eSTM, one is at risk — hit
   "Cut price 5%" and watch it sync. When a dealer adds a car, the wizard's price step
   captures the take-in date, cost of purchase and a voluntary financing record that feed
   this report.
6. **Dealer — classifieds aggregator** (`/dealer/classifieds`): inventory as the single source
   of truth — publish a unit to Carlist.my / Mudah.my / Facebook Marketplace with one click;
   price edits and mark-as-sold auto-sync, and the future marketplace pulls from the same feed.
7. **Dealer — appraise** (`/dealer/appraise`): plate `WPM 9083` → trade-in vs retail range →
   "Add to inventory" pre-fills the wizard with consignment support.
8. **Seller/Dealer — messages** (`/seller/messages`, `/dealer/leads`): reply to offers and
   viewing requests.

## Key mock points (real integrations in production)

- `lib/catalog.ts` — plate → spec lookup (mock of the EZAUTO Central Vehicle Datahouse index)
- `lib/valuation.ts` — two-stage valuation + price-deviation rules (mock of the EZAUTO SaaS)
- `lib/mock-data.ts` — seeded listings, conversations, dealer applications
- `lib/store.tsx` — in-memory state (replaces DB + API); mutations mirror the future BFF endpoints

## Structure

```
app/
  page.tsx        Portal selection landing
  login/          Mock sign-in (any credentials work)
  buyer/          Marketplace: browse, compare, listing detail, plate check, saved, messages
  seller/         Dashboard, add-a-car wizard, my inventory, classifieds aggregator, enquiries
  dealer/         Dashboard, instant appraisal, my inventory (+ consignment), stock aging & financials, classifieds aggregator, lead inbox
  admin/          Overview, review queue (flagged listings only), all listings, dealer verification
components/       Shared UI (PortalShell, ListingWizard, ChatPanel, ValuationPanel, …)
lib/              Types, catalog, valuation engine, mock data, in-memory store
```
