# Context

Working notes for the Alviere HIVE developer docs site in this repo. Reconstructed
from git history, the standing feedback rules, and an audit of the current tree on
2026-08-29. Everything in "Open work" was verified against the canonical specs, not
recalled.

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

Four rules carried over from earlier sessions. They are also in the memory files.

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

   The house pattern for this is already in `pay-by-bank.md` — an endpoint table with
   a **Status** column (`Available` / `In development`). It lets unshipped endpoints
   sit beside shipped ones without an integrator building against them by accident.
   Default to that shape, and treat it as a suggestion to them rather than a
   condition.

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
- **`ach.md`.** The push row now points at `POST /wallets/{wallet_uuid}/withdraw`,
  which is the real push path and already what the page's own `WITHDRAW_FUNDS` row
  said. Added a line marking `/v3/ach/credit` as in development, so the page agrees
  with `pay-by-bank.md` instead of contradicting it.
- **`wire.md`.** Rewritten, 85 to 591 words, inbound only. See item 6b.
- **`transactions-overview.md` and `ach.md`.** Both claimed 47 transaction types,
  a count taken from a spec enum now known to be missing at least one. Softened
  rather than renumbered.

### 4. Four pointer-only pages

These pass the no-placeholder grep because they avoid the banned phrasing, but
they are the same thing: a heading whose body is a link to the API reference.

| Page | Words |
|---|---|
| `docs/guides/cash-loading.md` | 115 |
| `docs/guides/internal-transfers.md` | 116 |
| `docs/guides/card-pull.md` | 120 |
| `docs/guides/global-money-transfers.md` | 123 |

Each is a transaction rail with real mechanics to document: timing, limits,
reversal and return behaviour, which statuses the rail can produce. Rule 4 applies.

### 5. `changelog.md` is a placeholder

`docs/guides/changelog.md:11` — "This page will be updated with versioned entries
as new releases roll out. In the meantime, check the V2 and V3 API references."
That is the exact pattern rule 4 bans, and the page is in the header nav, so it is
one of three top-level destinations. Either seed it from real release history or
pull it out of the header.

### 6. Sync `swagger_1` from canonical, straight copy

`docs/swagger_1.yaml` is the V2 spec the site renders. It is behind canonical
`6.6.16` by 8 paths: `/payment-methods/bank-accounts/{payment_method_uuid}`,
`/transactions/limits`, `/v3/cards/capture`, `/v3/cards/debit`, `/v3/cards/push`,
`/v3/cards/reverse`, `/v3/transactions`, `/v3/transactions/{transaction_uuid}`.
Re-diff enums after syncing, they drift.

A straight copy is correct. An earlier draft of this file said to merge and
preserve ten "… in Wallet" card summaries from the local copy. That was wrong.
Those summaries are not local improvements, they are the *old* canonical text.
Reevu simplified them upstream in `c38e3f9` on 2026-08-29, deliberately. Re-applying
them would revert that.

Two consequences of syncing, both wanted:

- `POST /accounts/{account_uuid}/issued-cards/non-reloadable` is marked
  `x-internal: true` in `c38e3f9`, so it drops out of the rendered reference. It
  must also drop out of any guide — see item 8.
- Canonical carries card payment examples the repo copy has none of (AUTHCAP,
  AUTH-only, 3DS challenge, issuer decline, partial capture, full and partial
  reversal, push-to-card payouts) plus webhook payload examples for nine entity
  types.

`docs/swagger_2.yaml` is byte-identical to `swagger_1` and referenced by nothing.
Delete it.

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

### 8. Card Issuing is two pages covering seventeen endpoints

The thinnest section relative to its API surface. Canonical V2 exposes 17 paths
tagged `Card issuance`. The section documents them with two pages, 571 words
total, and **zero API examples** — `cards.md` has one code block (a mermaid
diagram), `incentives.md` has none. Across all 46 guides, exactly one file
(`activity.md`) references an issued-cards endpoint, and only in passing.

Both pages are reference tables with no mechanism. `cards.md` lists `FROZEN` as a
status and `PREPAID_NON_RELOADABLE` as a card type, but never says how to freeze a
card or how to issue a non-reloadable one. The reader learns the vocabulary and
cannot act on any of it.

Verified absent from every guide in the repo:

| Capability | Spec surface | Guide coverage |
|---|---|---|
| Digital wallet provisioning | `PUT .../mobile-wallet` — Apple Pay, Google Pay, Samsung Pay | **None.** Zero mentions of any wallet provider anywhere |
| Merchant allow-lists | `auth_rules.allowed_merchants` — `allowed_merchant_ids` / `allowed_merchant_names` | None. **Live**, see below |
| Spend limits | `auth_rules.limits[]` — `ROLLING`/`DAILY`/`MONTHLY`/`ANNUAL`, MCC group, MCC list, or merchant ID | None. **Not live — do not document**, see below |
| Freeze / unfreeze | `PUT .../freeze`, `PUT .../unfreeze` | Status table only |
| PIN | `PUT /issued-cards/{card_uuid}/pin`, `auto_pin_generation` | None |
| Reissue / replace | `POST /issued-cards/{card_uuid}/reissue_replace` | One line in `activity.md` |
| Card data / PCI | `GET .../sensitive-data` — returns full PAN and CVV, restricted to the Alviere SDK or preauthorized clients | None. This one matters: nothing warns integrators off calling it from their own backend |
| Physical fulfilment | `shipping_address`, `shipping_method` (`DEFAULT`/`EXPRESS_FEDEX`), `name_on_card`, `carrier_id`, `carrier_message`, `emboss_id` | Statuses only |
| Gift cards | `initial_balance` (gift only, 400 otherwise) | Type table only |
| Card service fees | `service_fees[]` — activation fee, always `DEDUCT` | None |
| Attaching incentives at issue | `incentives` — `rule_uuids` or inline `incentive_rules` | `incentives.md` never mentions it |

**`pidgeot` settles what these features do**; sierra settles what customers call.
Pidgeot's 16 routes independently confirm every capability the guides omit — PIN,
replace, freeze, unfreeze, activate, sensitive-data, `/wallet` (push provisioning),
non-reloadable, and incentive rules all ship. Read pidgeot for behaviour, then write
every path and payload in the public shape. An earlier draft of this file said to
write the pages against pidgeot directly. That was wrong and would have published
internal paths — see Architecture above.

Proposed shape, 2 pages to roughly 8:

1. **Overview** — what issuing is, program setup, `product_id`, virtual vs physical.
2. **Issued Cards** — keep the lifecycle diagram and status table, add the three
   create paths, the `owner` oneOf (account vs wallet), `external_id` idempotency,
   and list/get/update/cancel.
3. **Card operations** — activate, freeze, unfreeze, PIN, reissue vs replace and
   what happens to the PAN, cancel.
4. **Physical cards** — shipping, emboss, carrier, and the
   `SET_TO_EMBOSS` → `READY_TO_ACTIVATE` → `RETURNED_MAIL` path.
5. **Merchant controls** — the `allowed_merchants` allow-list only. Not limits.
6. **Digital wallets** — push provisioning, the `SUCCESS`/`FAILED` result, and
   handing `provisioning_request_data` to the mobile SDK.
7. **Card data and PCI** — the SDK boundary. What you may hold and what you may not.
8. **Gift cards** — `initial_balance` and why the field 400s on other product
   types. Do **not** document
   `POST /accounts/{account_uuid}/issued-cards/non-reloadable`; it is
   `x-internal: true` as of `c38e3f9`. `PREPAID_NON_RELOADABLE` stays a card type
   in the table, but there is no public endpoint to create one that way.

`incentives.md` stays, and gains the cross-link to attaching rules at issue time.

**Spend limits are not live.** `auth_rules.limits[]` is in the spec for optics, not
because it ships. Do not write it up, and do not let it back in on the strength of
being in the spec — this is the case that produced standing rule 5.

The live `ISSUED_CARD` webhook payload in
`alviere-docs/scalar-docs/guides/webhook/issued-card-event.md` corroborates it. That
payload is a real production event and dumps the entity in full: `auth_rules`,
`incentive_rules`, `blocked`, `brand`, `card_expiration`, `custom_fields`,
`emboss_id`, `external_id`, `initial_balance`, `last_4`, `metadata`, `pin_set`,
`product_id`, `service_fees`, `shipping_address`, `status`, `status_reason`, `type`.
Its `auth_rules` object contains exactly one key, `allowed_merchants`. There is no
`limits` key anywhere in it.

So the split is:

| Piece | Verdict |
|---|---|
| `auth_rules.allowed_merchants` | Live. Present in the production webhook payload. Document it |
| `auth_rules.limits[]` | Not live. Absent from the payload, confirmed as optics. Leave it alone |
| Account-level rolling and daily limits | Live, but a different feature. Real error codes back it: `430106` daily, `430107` rolling period, `430110`, `430111`. These are Account limits, not card limits — do not merge the two |

The same payload also settles part of the rest of the proposal. `blocked` and
`pin_set` are real fields on a live card, so freeze/unfreeze and PIN are shipped
and safe to document. `shipping_address`, `custom_fields.shipping_method`,
`emboss_id`, `service_fees`, and `initial_balance` are all present too, which
covers pages 4, 8, and the service-fee material.

**Pages 6 and 7 are confirmed live.** Push provisioning
(`PUT .../mobile-wallet`, Apple/Google/Samsung Pay) and `GET .../sensitive-data`
both ship — confirmed by Reevu on 2026-08-29. They are absent from every live
signal only because the live site never covered them, not because they don't
exist. Write them up.

Scope of the optics problem: **spend limits are the only known case.** The rest of
the Card issuance surface is real. Rule 5 is a prompt to check when something looks
aspirational, not a reason to doubt the spec by default.

One upstream bug still open in canonical V2, worth reporting to `alviere-openapi`:
`PUT .../issued-cards/{card_uuid}/mobile-wallet` has `summary: Get Card image`,
copy-pasted from the endpoint below it. The `operationId` and body are correct.

(The duplicate `Create Card` summaries flagged earlier are not a bug. `c38e3f9`
made them deliberately, and marking non-reloadable internal leaves two public
create operations that genuinely are near-duplicates.)

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

## Suggested order

Ship 1, 2, and 3 first. They are wrong, not merely thin, and 1 is a five-minute
fix. Then 6 (sync the spec, delete the duplicate) so later content work is checked
against current truth.

Then 8, now the largest remaining gap and the one a reader is most likely to hit, since card issuing is a headline product with a real
API behind it and almost no prose. 4 and 5 are the same kind of work at smaller scale, so folding
them into the same pass makes sense. 7 last.
