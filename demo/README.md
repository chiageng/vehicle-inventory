# CarInventory — Interactive Preview

Next.js application demonstrating the CarInventory seller, buyer, and admin experiences described in the system proposal.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User flows

### Seller / reseller
1. Register or log in
2. **Sell Your Car** — complete the wizard and publish (valuation runs at publish)
3. **My Listings** — track status, edit price, view buyer conversations
4. Reply to enquiries from the dashboard

### Buyer
1. Browse listings (no login required)
2. Open a listing and send an enquiry
3. **My Enquiries** — view seller replies and continue the conversation

### Platform admin
1. Log in as `admin@carinventory.my` / `admin123`
2. Approve or reject listings in the moderation queue

## Data persistence

Preview data is stored in `data/*.json` (users, marketplace, conversations). Files are created from sample seed data on first run. See `data/README.md`.

To restore defaults: `npm run reset-data` then restart the server.

## Project structure

```
app/           Pages and API routes
components/    UI components
lib/           Client API, types, valuation engine
lib/server/    File database and business logic
data/          Runtime JSON store (gitignored)
```

## Production path

This preview uses JSON files and a rule-based valuation engine. The proposal in `../docs/carinventory-system-proposal.md` describes the production PostgreSQL schema, EZAUTO integration, encryption, and phased rollout.
