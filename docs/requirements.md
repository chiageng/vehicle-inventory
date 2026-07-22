# CarInventory — Requirements (User Stories)

Roles: **Private seller** (C2C), **Dealer** (B2C, business account), **Buyer**, **Platform admin**.

Each row is a **goal**, not a UI task. Entering fields, clicking publish, or opening a filter are tasks that support a story — they belong in acceptance criteria, not here.

Read as: *As a [Role], I want [Goal], so that [So that…].*

## Private seller (C2C)

| Goal | So that… |
| ---- | -------- |
| register and log in securely | only I can access and manage my account and listings |
| enter my plate number and have my vehicle's details auto-filled (make, model, variant, year, engine, transmission) | I can list quickly and accurately without knowing my exact variant |
| have my declared condition verified against my photos | buyers trust the listing and the valuation reflects reality |
| get a market valuation (MYR) once my details, condition and photos are complete | the number is trustworthy and I can price with confidence |
| set my own asking price independently of the valuation | I stay in control of what I sell for |
| be warned when my asking price deviates significantly from the market valuation | I don't scare off buyers by overpricing or lose money by underpricing |
| create and publish a listing with details and photos | interested buyers can discover it |
| be notified by email and SMS when a buyer enquires | I can respond promptly and not miss a sale |
| edit, mark as sold, or withdraw my listing | my listing always reflects reality |
| publish my listing to external classifieds (Carlist, Mudah, Facebook Marketplace) from one place | I reach buyers everywhere without re-posting manually |

## Dealer

| Goal | So that… |
| ---- | -------- |
| register a verified dealer business account | buyers trust my listings and I access dealer tooling |
| get a valuation for any vehicle by plate before I acquire or consign it | I appraise trade-ins and consignments on the spot (AutoGrab-style instant appraisal) |
| sell a client's vehicle on the marketplace | the owner reaches buyers without listing the car themselves |
| manage all my inventory and client sales in one dashboard | I stay on top of every unit and consignment without losing track |
| record each unit's stock take-in date and cost of purchase when I add it | my inventory doubles as my trading position, not just a list of ads |
| see stock aging and get flagged before a unit crosses the 6-month STMS window (eSTM) | I reprice and sell fast before the unit becomes hard to sell |
| see my financial position at a glance — capital deployed, potential margin, financing exposure | I manage cash flow in a credit-bearing business |
| record financing against a unit on a voluntary basis | my true exposure is tracked without forced disclosure |
| list vehicles quickly via plate auto-fill, individually or in bulk | stocking the marketplace doesn't consume my day |
| list used, recon and brand-new units under one inventory | my whole stock mix reaches buyers on one marketplace |
| syndicate my inventory to Carlist, Mudah and Facebook Marketplace | one stock list feeds every channel, always in sync |
| set my own asking price per vehicle and see a warning when it deviates from market valuation | I price competitively and spot mistakes before publishing |
| act as the enquiry contact for client listings | the owner gets professional representation without handling buyer calls |
| receive all buyer leads in one inbox across my listings | no lead is missed and my team can follow up |

## Buyer

| Goal | So that… |
| ---- | -------- |
| browse and search vehicles without creating an account | I can shortlist options with zero friction |
| filter by new, used (second-hand) or recon cars | I only see the category I'm shopping for |
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

Standard operating flows (SOPs) with diagrams live in `flow.md`.
