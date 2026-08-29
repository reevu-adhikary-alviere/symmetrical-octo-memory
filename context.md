# Context

Working notes for the Alviere HIVE developer docs site in this repo. Reconstructed
from git history, the standing feedback rules, and an audit of the current tree on
2026-08-29. Everything in "Open work" was verified against the canonical specs, not
recalled.

## ACTIVE WORK — read before picking anything up

An agent session is working through the remaining "Open work" list right now
(2026-08-29, session `ses_fbaaaf732ffejTUDLdgKOf9NR8`), in the order this file's
"Suggested order" gives: **6 → 4 → 5 → 7**. Items 1-3, 8, and 9 are done and
uncommitted; do not redo them. The working tree has uncommitted changes from
this and earlier sessions — do not revert or "clean up" them, and re-read
`git status` / `git log` before trusting any part of this file, which may be
stale relative to the tree.

## What this repo is

A Scalar GitHub-sync docs site for the Alviere HIVE platform. **This is the new
site, not the live one.** The site currently in production is
`~/Documents/alviere-docs`, which is thin — 47 markdown files, mostly entity
definition pages and webhook payload dumps, with no task-oriented guides. This
repo replaces it.

That matters for provenance: several pages here are tightened rewrites of their
`alviere-docs` counterparts and inherit their limitations. `docs/guides/cards.md`
is close to a verbatim restatement of
`alviere-docs/scalar-docs/guides/hive-definitions/issued-card.md` — the same two
tables, no mechanism in either.

- `scalar.config.json` is the whole site: nav routes, page-to-file mapping, and the
  two API reference entries.
- `docs/guides/*.md` — 46 guide pages, all wired into the nav.
- `docs/swagger_1.yaml` (V2) and `docs/swagger_3.yaml` (V3) are the specs the site
  renders. They are copies pulled from `~/Documents/alviere-openapi`.
- `docs/scripts/*.js` + `docs/assets/*.css` — the custom header, the Guides mega
  menu, and the API mega menu. These run against Scalar's rendered DOM, so they
  break when Scalar changes markup.

The guides were mechanically AI-ported from internal specs. That port is the source
of most of the defects found so far.

## Standing rules

Seven rules carried over from earlier sessions. They are also in the memory files. Rules 6 and
7 sit after the Architecture section because they depend on it.

1. **Verify every API example against the canonical spec.** The ported guides
   contain fabricated endpoints, fields, and mechanisms. Grep before writing.
   **But the spec is necessary, not sufficient** — see rule 5.
2. **Payment Acceptance pages use merchant-processor voice** (Stripe/Adyen), not
   BAAS infrastructure voice. Wallet is where funds land, not the headline. Other
   surfaces (Wallets, Accounts, Identity, Treasury) can stay BAAS-flavoured.
3. **No industry lists.** Pedro's rule. Any list is missing a vertical, and the
   reader in that vertical bounces. Describe the capability instead: settlement
   time, cost, mandate handling, return windows.
4. **No placeholder callouts.** "Being expanded, see the API reference" is an IOU
   shipped as content. Fill it from the spec or cut the heading. If a value set
   genuinely is not enumerated anywhere, say the field is free-form and point at
   the enumerated field that should drive logic instead.

5. **Being in the spec does not mean it ships.** Some surface exists in
   `alviere-openapi.yml` for optics rather than because it is live. Issued-card
   spend limits are a confirmed case. Before documenting a capability, check it
   against a live signal, not just the spec. In rough order of strength:

   - **Live webhook payloads** in `alviere-docs/scalar-docs/guides/webhook/`.
     These are real production events, so a field present there is real and a
     field absent from an otherwise-complete entity dump is a genuine warning.
   - **Error codes** in `Sierra-error-codes/error.md`. A specific enforcement
     error implies the thing being enforced exists.
   - **Release notes** in `alviere-docs/scalar-docs/release-notes/`. Positive
     signal only, and sparse — the latest is v2524H.c, 25 November 2025.
   - **The live docs site.** Weak signal. It is thin enough that absence there
     means little.

   None of these covers every endpoint. When they are silent, ask rather than
   assume.

## Architecture

`sierra` is the API gateway and the only public-facing service. Everything else is a
microservice behind it. `Sierra-error-codes/error.md` is its error surface, which is
why those are the customer-facing codes.

Sierra is organised by API version (`internal/{v20210114,v20211118,v3}`, matching the
`Version` header) and calls each microservice through a `gateway_<service>_http.go`
client. It fronts eevee, hypno, kabuto, maat, persian, pidgeot, rotom, rotom_srv,
seaking, tx, and uxie.

**Sierra rewrites paths, so never document a microservice route.** Every public
issued-card path differs from its internal one, and one is renamed outright:

| Public | Internal (pidgeot) |
|---|---|
| `/wallets/{uuid}/issued-cards/…` | `/v1/wallets/{uuid}/cards/…` |
| `…/{card_uuid}/mobile-wallet` | `…/{card_uuid}/wallet` |

Take **behaviour** from the microservice. Take the **path and request shape** from
sierra and `alviere-openapi.yml`.

`zacian` has no gateway client in sierra at all. That is the architectural reason
customers cannot originate wires: there is no public route into it. Inbound wires
reach customers as ledger events through `tx`.

| Service | Owns |
|---|---|
| `pidgeot` | Card issuance |
| `tx` | Core ledger |
| `zacian` | Wire and bank integration |
| `eevee` | International transfers |
| `rotom` | Accounts, payment methods, payout methods, beneficiaries |
| `persian` | Payment processing adapter |

Go services share a layout: `internal/{entities,repositories,services}`, spec at
`docs/api/swagger.yaml`, plus `docs/events`, `docs/portal`, and
`public_errors.md` / `private_errors.md`. `tx` is PHP and differs.

Searching them: `omad` matches HashiCorp **Nomad** in every `_ops_` directory and
`ach` matches "each" and "cache". Use `grep -w`, exclude `_ops_` and `vendor`.

6. **Docs are a sales tool, and scope is Pedro and Reevu's call.** A feature's
   absence from sierra, the spec, or a microservice is not grounds to refuse to
   write it up. Forward-looking guides are deliberate. Flag what does not ship, once,
   then defer to them — never silently drop a capability and never silently include
   one.

   Rules 1 and 4 still hold, because they are about accuracy rather than scope: where
   a real source exists, use it rather than inventing field names and payloads, and a
   forward-looking page still has to say something real.

   Correction (2026-08-29, Reevu): do NOT mark endpoints "In development" in the docs.
   These readers are enterprise buyers, and an "In development" line reads as a roadmap
   commitment they will hold us to. Document only what ships. Do not list an unshipped
   endpoint, even to warn integrators off it — its absence is the warning. The
   `pay-by-bank.md` Status-column pattern was wrong for the same reason and was corrected
   the same day (the `/v3/ach/credit` "In development" row is gone). When a capability
   genuinely does not ship, leave it out and,
   where a reader would otherwise expect it, point them to their program manager without
   naming a timeline.

7. **The spec defines; internal repos only describe behaviour.** Take field names, enums,
   request shapes, and paths from `alviere-openapi.yml`. Microservices sit behind a sierra
   adapter, so their constants and validation are not the public contract — reading a value
   set out of `pidgeot` and publishing it as documentation is how rule 1 gets violated while
   feeling rigorous. Use them to understand what a feature *does*, then write it in public
   terms.

   **Never name providers.** Not the card processor, not the bank, not the embosser, and not
   the internal service names in the map above. Which provider sits behind a product is a
   business disclosure, and provider names date fast. Internal Confluence and service repos
   name them freely — that is a source, never a phrasing to copy. Reevu, 2026-08-29.

   Where a mechanism cannot be described without naming one, ask.

## Sources of truth

| Source | Status |
|---|---|
| `~/Documents/alviere-openapi/alviere-openapi.yml` | Canonical V2. Currently `6.6.16` |
| `~/Documents/alviere-openapi/alviere-openapi-v3.yml` | Canonical V3. Currently `1.1.5` |
| `~/Documents/alviere-docs/scalar-docs/guides/integration/mock-services.md` | Canonical sandbox behaviour. Not in any OpenAPI spec |
| `~/Documents/Sierra-error-codes/error.md` | 476 numeric error codes |
| `~/Documents/alviere-docs/` | The current live site. Thin, but its webhook payloads are real production events and the best available live-surface signal |
| `docs/swagger_3.yaml` | In sync with canonical V3 as of `362748a` |
| `docs/swagger_1.yaml` | **Stale.** 8 paths and ~3,000 lines behind canonical V2 |
| `~/Documents/alviere-openapi/docs/**` | **Stale — do not read.** Internal design docs that no longer track the shipped spec. Reevu, 2026-08-29. The `.yml` specs in that repo's root are canonical; the `docs/` tree is not |
| `docs/swagger_2.yaml` | **Dead.** Byte-identical to `swagger_1`, referenced by nothing |

## What has shipped

Navigation and chrome:

- Guides migrated into Scalar with mega-menu navigation (`f1a49ae`).
- Sidebar version switcher, designed and built (`0cdf52f` → `507bc3d`).
- Two rounds of DOM fixes after the menus failed on the deployed site
  (`1a082b2`, `e483afb`).
- V3 mega menu pointed at tags that actually exist (`302791b`).

Content correctness:

- AI tells stripped and industry lists removed (`74f6977`).
- Pay by Bank and ACH guides filled out (`469dc3b`).
- All 17 placeholder callouts across 10 pages replaced with spec-grounded
  reference (`c6bb020`). Zero placeholders remain by grep.
- Webhook payload shapes documented per subscription (`a596e17`).
- Sandbox scenarios filled from the canonical mock-services source (`51842dd`).
- Full error code reference published (`4979ed4`).
- Enums corrected against canonical (`f62614f`).
- ACH reframed as a rail rather than a transaction type (`99e008b`).
- Mandates reframed as an Alviere API rather than the reader's problem (`ab4f6d4`).
- `swagger_3` synced from canonical (`362748a`).
- Card Issuing rebuilt, 2 pages to 9, 571 words to 8,573 (item 8, uncommitted).

Verified clean right now: no placeholder callouts, no broken internal guide links
(36 cross-links all resolve), every markdown file under `docs/guides/` is wired
into the nav, and the V3 mega menu tags all match real V3 tags.

## Open work

### 1-3. Done, uncommitted

Fixed on 2026-08-29, in the working tree, not yet committed.

- **V2 mega menu.** `activities` and `cash-loading` had guides but no V2 tag, so
  they now use `href` to those guides, matching what `MENU_V3` already does for
  Webhooks. `payment-processing` had neither a tag nor a single guide equivalent
  and was dropped. All 13 remaining V2 tags and all 8 V3 tags verified against the
  specs the site actually renders.
- **`ach.md`.** The push row points at `POST /wallets/{wallet_uuid}/withdraw`,
  which is the real push path and already what the page's own `WITHDRAW_FUNDS` row
  said. The `/v3/ach/credit` "in development" line was removed on 2026-08-29 under
  the enterprise-docs correction (see item 8 rule 6), along with the matching
  "In development" row in `pay-by-bank.md`. Docs now describe only what ships.
- **`wire.md`.** Rewritten, 85 to 591 words, inbound only. See item 6b.
- **`transactions-overview.md` and `ach.md`.** Both claimed 47 transaction types,
  a count taken from a spec enum now known to be missing at least one. Softened
  rather than renumbered.

### 4. ~~Four pointer-only pages~~ DONE

Rewritten 2026-08-29, uncommitted. All four are now spec-grounded rail pages with
worked request bodies, field tables, and status/late-arrival behaviour:

| Page | Was | Now |
|---|---|---|
| `cash-loading.md` | 115 | 435 words. Barcode generate + store search endpoints, barcode limits/expiry, statuses from the mock-services source |
| `internal-transfers.md` | 116 | 379 words. `POST /wallets/{uuid}/send`, P2P program prerequisite, idempotency, when to use which rail |
| `card-pull.md` | 120 | 411 words. `POST /wallets/{uuid}/load` with a card PM, transit-bucket settlement timing, `LOAD_PULLBACK` |
| `global-money-transfers.md` | 123 | 592 words. Quote → remittance flow, quote expiry, compliance fields, cash pickup, `global_payments_details` |

Every claim sourced from `docs/swagger_1.yaml` (now synced), the mock-services
source, or the test guides. All internal links resolve against `scalar.config.json`.
`transaction_purpose` documented as free-form/corridor-specific per rule 4 — the
spec enumerates `source_of_funds` but not purposes, so no purpose list was invented.

### 5. `changelog.md` is a placeholder

`docs/guides/changelog.md:11` — "This page will be updated with versioned entries
as new releases roll out. In the meantime, check the V2 and V3 API references."
That is the exact pattern rule 4 bans, and the page is in the header nav, so it is
one of three top-level destinations. Either seed it from real release history or
pull it out of the header.

### 6. ~~Sync `swagger_1` from canonical, straight copy~~ DONE

Done 2026-08-29, uncommitted. `swagger_1.yaml` is a byte copy of canonical
`6.6.16`; all 8 missing paths verified present; `non-reloadable` confirmed
`x-internal: true` (line 5977) so it drops from the rendered reference as the
card pages assume. `swagger_2.yaml` deleted; no references remain anywhere in
the repo.

### 6b. Wire is receive-only, and the spec does not say so

**Customers cannot originate wires on Alviere. Incoming only.** Anything in the
spec that looks like wire origination is not a customer-facing capability:
`wire_details` is one of six options in `bank-account-details-request`, so a payout
method will accept it, but that is not a supported outbound path. Do not build a
guide, an example, or a "coming soon" note on it.

`wire.md` is therefore written as a receiving guide and does not mention sending at
all. It is not framed as a limitation and carries no note about what is missing —
readers who need to move money out are pointed at ACH and Global Money Transfers in
the Related list, which is where they should have gone anyway. Keep that framing on
any future edit.

Incoming wires are real and were completely undocumented. What the page now covers,
all verified in the `tx` repo:

- A wire credit posts as a `WIRE_TRANSFER` transaction and fires the
  `WALLET_TRANSACTION` webhook, so integrators get it on the subscription they
  already run.
- It carries `wire_transfer_details` with `omad`, `imad`, `originator_name`,
  `originator_account`, all nullable.
- The object sits at a **different depth per surface**: `transaction.wire_transfer_details`
  on `GET /transactions/{transaction_uuid}`, but `entity.type_details.wire_transfer_details`
  in the webhook. Code written against one will not read the other.
- No return window, unlike ACH.

Sources: `tx/src/Model/Accounting/UserTransaction.php`,
`tx/docs/api/swagger.yaml` (`WireTransferDetails`), `tx/docs/event/swagger.yaml`,
and the integration tests under `tx/tests/Integration/Controller/Api/V2/`.

Two gaps in `alviere-openapi.yml` worth closing, since both are things customers
legitimately need and neither is about origination:

| Gap | Effect |
|---|---|
| `WIRE_TRANSFER` missing from the `transaction-type` enum | The enum has 47 values and should have at least 48. Integrators switching on `type` get no signal this value exists |
| `wire_transfer_details` missing from the transaction response schema | The four Fedwire fields are undocumented for customers, including `imad` and `omad`, which are exactly what a bank asks for when tracing a wire |

Until the enum is fixed, do not restore a hard type count to
`transactions-overview.md` — it cannot be assumed complete. The `tx` model has 132
`TYPE_*` constants against the spec's 47, so deriving the real public list is its
own task, not a guess.

### 7. Repo hygiene

- `README.md` is still the stock Scalar template text. It describes a template,
  not this site.
- `index.html` at the repo root is a 1,108-line standalone landing page, committed,
  referenced by nothing, and not part of the Scalar build.
- `docs/overview.md` and `docs/introduction.md` are the only markdown files not
  wired into the nav. Orphans.
- `image-removebg-preview.png` is untracked in the working tree. Either commit it
  somewhere deliberate or remove it.

### 8. Card Issuing — done, uncommitted

Rewritten on 2026-08-29. Two pages, 571 words, zero API examples became nine pages,
8,573 words, with worked request and response bodies on every public endpoint.

| Page | File | Words |
|---|---|---|
| Overview | `card-issuing-overview.md` | 1,010 |
| Issued Cards | `cards.md` | 1,266 |
| Card Operations | `card-operations.md` | 1,156 |
| Physical Cards | `physical-cards.md` | 1,266 |
| Merchant Controls | `merchant-controls.md` | 598 |
| Digital Wallets | `digital-wallets.md` | 861 |
| Card Data and PCI | `card-security.md` | 1,072 |
| Gift Cards | `gift-cards.md` | 776 |
| Incentives | `incentives.md` | 568 |

All nine are wired into `scalar.config.json` and `guides-mega-menu.js`, and every
internal link across all 46 guides still resolves. `activity.md` was corrected in the
same pass: it pointed at `GET /issued-cards`, which is `x-internal`, and now points at
the wallet-scoped path.

#### The public surface is 13 operations, not 17

The earlier count in this file was wrong. Canonical V2 has 17 operations tagged
`Card issuance` across 13 path keys, and **four are `x-internal: true`**:

| Internal operation | |
|---|---|
| `POST /issued-cards` | Create Card |
| `GET /issued-cards` | List Cards |
| `GET /issued-cards/{card_uuid}` | Get Card details |
| `POST /accounts/{account_uuid}/issued-cards/non-reloadable` | Create non-reloadable |

Two consequences for the old plan, both of which it got wrong:

- **There is one public create path**, `POST /wallets/{wallet_uuid}/issued-cards`. Not three.
- **The `owner` oneOf is not public.** It lives on the `issued-card-request` schema, which
  only the internal `POST /issued-cards` uses. The public create takes the wallet from the
  path and has no `owner` field at all.

`GET .../image` is public, was absent from the old capability table, and is documented in
`physical-cards.md`.

#### Sources, and the rule that came out of this

**The spec defines; internal repos only describe behaviour.** Reevu stopped the first
draft on 2026-08-29 because it was taking field semantics from `pidgeot`. Pidgeot sits
behind a sierra adapter, so its constants are not the public contract. Everything sourced
that way was stripped and re-grounded on `alviere-openapi.yml`:

- `status_reason` value tables (`INVALID_SHIPPING_ADDRESS`, `DEPLETED_FUNDS`, and the rest)
  came out. The spec has `status_reason` as a free-form string, so the pages now say so and
  send readers to `status` for logic, per rule 4.
- Per-genre wallet card caps, the prepaid one-card limit, and the replace-cancels-the-old-card
  matrix all came out.

That produced **standing rule 7** below. The other half of it — never name providers — is
Reevu's, confirmed the same day.

#### Facts that exist only in Reevu's Confluence

Not in any spec, repo, or the live site. Recorded here because they are otherwise lost, and
because five of them corrected drafts that would have shipped wrong.

**Genres are tangibility, not delivery channel:**

| Genre | Meaning |
|---|---|
| `PHYSICAL` | Plastic with the number printed on it |
| `VIRTUAL` | Exists only as an image in an app, on a website, or in an email |
| `DIGITAL` | Digital-first. Electronic representation of a physical card, **same PAN, CVV, expiry** |

`DIGITAL` is not a mobile wallet. An early draft defined it as "issued for digital wallet
use", which collides with push provisioning and is simply wrong. Virtual and digital cards
are created `ACTIVE`; only physical goes through emboss and shipping.

**`GIFT` vs `PREPAID_NON_RELOADABLE` is a funding-source difference**, not a reload count.
Gift is loaded from program funds via the `CARD_FUNDING` treasury vault. Non-reloadable
prepaid is loaded once with the consumer's own funds.

**PIN requires `ACTIVE`.** The spec's `READY_TO_ACTIVATE` description says "Ready for
activation and PIN setup", which is misleading — activation has to happen first.

**`auto_pin_generation: true` is not sufficient.** It also needs `auto_pin_generation_length`
configured on the card product. Without it no PIN is generated and **the create still
succeeds**, leaving `pin_set: false` and no error. This silent failure is the most valuable
line on the PCI page.

**PINs are not stored or logged anywhere**, generated ones included. There is no read-back
and no recovery, so "forgot my PIN" is a set-a-new-PIN flow. An earlier draft claimed the
cardholder retrieves a generated PIN through the SDK. Invented, now removed.

**Physical cards also activate by phone**, through the card program's activation line, and
Alviere moves the card to `ACTIVE` on the callback. So a card reaches `ACTIVE` without the
integrator calling anything. The pages tell readers to treat `ISSUED_CARD` as the source of
truth rather than their own API call.

**`shipped_at` is not a dispatch date.** It records when the card went to the embossing
partner. There is no reliable shipment tracking. The spec's own description ("Date when
physical card was shipped") is misleading and an early draft copied it.

**Shipping coverage** is any valid US address plus AS, GU, MP, PR, VI, passed in `state`
with `country: USA`.

**Brands are Visa and Mastercard only.**

#### Held to the standing rules

- Spend limits (`auth_rules.limits[]`) appear nowhere. Rule 5 held.
- The four `x-internal` operations are undocumented.
- No placeholder callouts.
- Account-level limits appear exactly once, in `merchant-controls.md`, explicitly flagged as
  a different feature from card limits so the two do not get merged.
- No provider or internal service names.

#### The mobile-wallet summary bug is fixed

`PUT .../mobile-wallet` now reads `summary: Add Card to digital wallet` in both canonical
and `docs/swagger_1.yaml`. The item that said to report it upstream is closed.

#### Open, needs Pedro and Reevu

1. **`action: REISSUE` does not ship — resolved (2026-08-29).** Sierra rejects it at
   validation (`internal/v20211118/entities/sierra_requests_cards_issued.go:738`, with a
   TODO), though the spec enumerates it. Per Reevu's enterprise-docs correction, REISSUE is
   now left out entirely rather than marked "In development": the operations table, the
   `### Reissue` section, the `activity.md` reissue column, and the "reissue" operation
   labels and Related links across `cards.md` and `card-issuing-overview.md` are gone.
   `reissue` survives only inside the literal endpoint path `reissue_replace`. Nothing to
   confirm; noted here as the record of what changed.
2. **`PATCH` accepts `auth_rules` but the spec's PATCH body omits it.** Sierra's
   `UpdateCardIssuedRequest` carries it and forwards it to the gateway, so changing a
   merchant allow-list after issuance works. It is left out of `merchant-controls.md` rather
   than documenting something the rendered API reference contradicts. Fix the spec, then add
   the section.
3. **`test-cards.md` AMEX/DISCOVERY note — stale, closed (2026-08-29).** Verified: the
   current `test-cards.md` (Card Issuance Testing) already lists only Visa and Mastercard
   (`firstName` = `Mestre`/`Vision`). No AMEX or DISCOVERY there. The AMEX and DISCOVER test
   PANs are in `test-payments.md` (Payment Method / acquiring testing), where all four
   networks are legitimately valid, and those stay untouched. The shared `brand` enum in
   `alviere-openapi.yml` (VISA, MASTERCARD, AMEX, DINERS, DISCOVER, JCB, UNIONPAY, …) is a
   card-network type used across acquiring, card-pull, and transactions; issuance narrows it
   to Visa/Mastercard at the product level, so the broad enum is not a contradiction to fix.
   Swagger enums and `alviere-docs` left untouched. No docs change needed.


### 9. Instant payments — done, uncommitted

`docs/guides/instant-payments.md`, 869 words, wired into Transactions between ACH
and Cash Loading. Sourced entirely from the shipped V3 spec.

Covers both endpoints with worked request and response bodies, the `destination`
`oneOf` (third-party payout method vs the customer's own payment method), network
selection as a property of the destination rather than a preference, RfP's TCH RTP
restriction and required `expires_at`, the negative `amount` on a send, rejection
handling (`status_reason` first, `iso_reason_code` only when the rail returned a
real one), and `external_id` idempotency with the `409` behaviour.

The one thing worth keeping in future edits: a callout that a `201` is **not**
settlement. The spec says the bank leg may only be acknowledged at that point, and
it is the most expensive mistake available on this page.

Cross-linked in from `pay-by-bank.md`, `transactions-overview.md`, `api-versions.md`,
and `ach.md`, so it is reachable without the nav.

## Notes from Pedro conversation

The transcript is mostly personal conversation, company venting, and unverified product
strategy. It is not a source of API truth. The applicable parts are:

### Audience and content posture

- Pedro explicitly sees the API reference and the guides as both a developer tool and a sales
  / technical-evaluation surface. The evaluator may be an enterprise architecture team
  or a CFO's technical staff, not a self-serve founder. Guides therefore need to make
  the product's scope, capabilities, boundaries, and organization obvious on a first
  pass; do not optimize only for “generate an API key and try curl.”
- The product story is simplification: HIVE abstracts financial-services complexity for
  non-financial institutions. Explain the stable public primitives and their observable
  boundaries, without exposing provider/adapter internals or pretending an enterprise
  integration is one click.
- Do not turn this into a generic enterprise-architecture template. Avoid sections such
  as “what HIVE handles / what you build”: they assume the customer's systems, teams,
  and ownership model. Describe capabilities, prerequisites, inputs, outputs, and
  integration choices neutrally; use conditional language where customer architecture
  can vary.
- For Payment Acceptance, lead with the buyer's job and the money flow—who pays, where
  funds settle, fees, settlement/reconciliation, returns, and what happens next. This
  supports rules 2–4. Pedro's mention of yield and fee revenue was a marketing/content
  prompt, not verified API behavior; do not add either as a fact without a source.

### API version strategy — unresolved

Pedro's preference was to make V3 look complete to a new customer: preserve V2 for
existing integrations while exposing V3 routes for unchanged capabilities, potentially
through a Sierra mapper/transformer. He also questioned path parameters on POST/create
and suggested body-owned identifiers for future V3, while retaining resource paths for
GET/PATCH/PUT/DELETE.

This is a product/architecture proposal, not current behavior. Do not add V3 paths,
claim parity, or change `api-versions.md` until product and engineering approve it and
Sierra/specs implement it. Current V2/V3 docs remain the truth. If a future surface is
intentionally unshipped, use the status-table pattern in rule 6.

### Enterprise embedded integrations — discovery only

- The conversation positions HIVE as the payment/money-movement layer inside systems
  such as Oracle HCM or NetSuite, not as the system that owns payroll calculation,
  tax/labor rules, or the whole AP/AR workflow. The payroll claims were Pedro's read
  and remain unverified. There is no Oracle/payroll guide here; verify with product and
  the customer before publishing.
- A web SDK/embedded UI and internal wallet-to-wallet settlement may be future product
  packaging. The chat raised global beneficiaries, sender/receiver metadata,
  parent-child transactions, and fee placement as design questions, not a settled
  public contract. Do not document or alter schemas from this conversation alone.
- The generic payment-processing checklist Pedro named—authorization, capture,
  zero-dollar AVS, refunds, 3DS, and settlement-file processing—is a candidate content
  checklist only. Verify each item against public endpoints and live status, and
  describe it without provider names.

### Safety and delivery

- The service-fee example is a regulatory-risk prompt, not proof of an existing limit.
  Verify whether program-configured fee caps are enforced and which public error supports
  them before documenting guardrails.
- AI can accelerate drafts and implementation; it does not lower the verification bar.
  Keep TX/ledger and payment state changes expert-reviewed, and keep docs examples
  spec/live-signal verified.

## Suggested order

Ship 1, 2, and 3 first. They are wrong, not merely thin, and 1 is a five-minute
fix. Then 6 (sync the spec, delete the duplicate) so later content work is checked
against current truth.

8 is done. 4 and 5 are the same kind of work at smaller scale — four pointer-only rail pages
and the changelog — and are now the largest remaining content gap. 7 last.

Item 6 is worth doing before 4, for the same reason it was worth doing before 8: the four
rail pages should be checked against a current spec. Note that syncing `swagger_1` also
drops the non-reloadable create endpoint out of the rendered reference, which the card pages
already assume.
