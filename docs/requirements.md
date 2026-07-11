# CarInventory — Requirements (User Stories)

Roles: **Private seller** (C2C), **Dealer** (B2C, business account), **Buyer**, **Platform admin**.

Each row is a **goal**, not a UI task. Entering fields, clicking publish, or opening a filter are tasks that support a story — they belong in acceptance criteria, not here.

Read as: *As a [Role], I want [Goal], so that [So that…].*

## Private seller (C2C)

| Goal | So that… |
| ---- | -------- |
| register and log in securely | only I can access and manage my account and listings |
| enter my plate number and have my vehicle's details auto-filled (make, model, variant, year, engine, transmission) | I can list quickly and accurately without knowing my exact variant |
| get an instant valuation estimate (low / mid / high MYR) from my plate and basic details | I know what my car is worth before I commit to listing |
| refine the valuation by adding mileage, condition, owners, and accident/flood history | the estimate range tightens and I can price with confidence |
| set my own asking price independently of the valuation | I stay in control of what I sell for |
| be warned when my asking price deviates significantly from the market valuation | I don't scare off buyers by overpricing or lose money by underpricing |
| create and publish a listing with details and photos | interested buyers can discover it |
| be notified by email and SMS when a buyer enquires | I can respond promptly and not miss a sale |
| edit, mark as sold, or withdraw my listing | my listing always reflects reality |

## Dealer

| Goal | So that… |
| ---- | -------- |
| register a verified dealer business account | buyers trust my listings and I access dealer tooling |
| get a valuation for any vehicle by plate before I acquire or consign it | I appraise trade-ins and consignments on the spot (AutoGrab-style instant appraisal) |
| sell a client's vehicle on the marketplace | the owner reaches buyers without listing the car themselves |
| manage all my inventory and client sales in one dashboard | I stay on top of every unit and consignment without losing track |
| list vehicles quickly via plate auto-fill, individually or in bulk | stocking the marketplace doesn't consume my day |
| set my own asking price per vehicle and see a warning when it deviates from market valuation | I price competitively and spot mistakes before publishing |
| act as the enquiry contact for client listings | the owner gets professional representation without handling buyer calls |
| receive all buyer leads in one inbox across my listings | no lead is missed and my team can follow up |

## Buyer

| Goal | So that… |
| ---- | -------- |
| browse and search vehicles without creating an account | I can shortlist options with zero friction |
| search by plate number and see the vehicle's data and market valuation | I can check any car — on or off the platform — before I commit |
| compare listings on price, mileage, and spec | I focus on the best-value cars before I enquire |
| see how a listing's asking price compares to its market valuation | I judge whether it's fairly priced before I contact anyone |
| start a conversation with the seller or dealer through the platform | I can ask questions, make an offer, or arrange a viewing without exposing my phone number |
| be notified when new listings match my saved search | I don't miss the right car when it appears |

## Platform admin

| Goal | So that… |
| ---- | -------- |
| run marketplace moderation separately from the public site | listing decisions are not mixed with the buyer/seller experience |
| keep the listing approval queue moving | sellers go live quickly and buyers see fresh inventory |
| prevent low-quality or fraudulent listings from going public (missing photos, duplicate plates, price far off valuation) | buyers trust what appears on the marketplace |
| verify dealer accounts before granting dealer privileges | the dealer badge means something |
| remove listings that breach policy | the platform stays safe and credible |

---

## Standard operating flows (SOP)

Industry-standard flows modelled on Carsome / AutoGrab. Diagrams in `flow.md`.

### SOP 1 — Listing creation (seller or dealer)

1. Enter plate number → platform queries valuation SaaS (EZAUTO) → auto-fill make, model, variant, year, engine, transmission.
2. On lookup miss: manual selection from the vehicle taxonomy (make → model → variant dropdowns, never free text).
3. Seller confirms/corrects spec, adds mileage, condition grade, owners, accident/flood declaration.
4. Platform returns valuation: low / mid / high MYR.
5. Seller sets asking price. If price deviates beyond threshold (e.g. ±15% of mid), show a warning — advisory, not blocking.
6. Add photos (≥1 required) and description → submit.
7. Listing enters admin approval queue → approved listings go live.

### SOP 2 — Valuation

- **Two-stage:** instant estimate from identity fields (plate/make/model/variant/year), refined estimate once condition fields are added.
- Every valuation stored and versioned (`algorithm_version`, factors, source payload) for audit.
- Cache SaaS responses per vehicle with a TTL (~30 days); re-valuate only when price-relevant fields change (mileage, condition), not on photo/description edits.
- Fallback to rule engine v1.0 if the SaaS is unreachable; result flagged as fallback.

### SOP 3 — Price deviation warning

- Compare asking price against latest valuation mid.
- Within threshold → "priced at market" indicator. Above → overpriced warning to seller. Below → underpriced notice to seller and possible fraud flag to admin (too-good-to-be-true detection).
- Buyer side shows the same signal as a price-vs-market badge on the listing.

### SOP 4 — Buyer plate lookup

1. Buyer enters a plate number (no account needed for a basic check).
2. Platform returns vehicle data + market valuation range.
3. If the plate matches a live listing, link to it; otherwise offer "get notified if this car is listed".
4. Rate-limit and log lookups to control SaaS cost and abuse.

### SOP 5 — Enquiry & communication

1. Buyer contacts via on-platform chat or inquiry form; phone/email masked.
2. Seller/dealer notified by email + SMS; dealer leads land in the shared lead inbox.
3. Structured actions in chat: make offer, request viewing/test drive.
4. All conversations retained for dispute handling.

### SOP 6 — Moderation

1. New/edited listings enter the approval queue.
2. Auto-flags assist review: duplicate plate, missing photos, price anomaly vs valuation, disposable email.
3. Approve, reject with reason, or take down for policy breach; every decision logged.
4. Dealer verification (business registration check) before dealer privileges are granted.
