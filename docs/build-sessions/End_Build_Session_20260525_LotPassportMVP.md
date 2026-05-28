# OmniLytix Build Session End

## Date

2026-05-25

## Session Name

Lot Passport MVP / Production Lot Code Generator Foundation

---

## Session Summary

This session continued the OmniLytix Lot Passport MVP build. The original working area began under the `/receive/lots` route, but during the build it became clear that the terminology “Receive Lots” is not accurate for the current feature.

The current feature is not true goods receiving. It is production lot-code generation for internally produced mash, puree, sauce, and finished goods. This distinction is critical because “receiving” implies inbound vendor goods, supplier lots, COAs, and raw material intake.

The current module should be reframed as:

- Production Lots
- Production Lot Codes
- Production Lot Code Generator

Goods Receiving must remain a separate, high-importance OmniLytix module and should later handle inbound supplier/vendor materials, supplier lot numbers, manufacturer lot numbers, COAs, receiving records, QA disposition, and inbound material traceability.

---

## Current Build State

OmniLytix is running in GitHub Codespaces through VS Code Desktop.

The UI runs from:

```bash
cd /workspaces/OmniLytix/apps/web
npm run dev
```

The UI opens on port `3001`.

Current working route:

```text
/receive/lots
```

Current working file:

```text
apps/web/app/receive/lots/page.tsx
```

Temporary note: the route still uses `/receive/lots`, but the visible UI language and future module structure should be changed to Production Lots / Production Lot Code Generator before continuing too far.

---

## What Was Completed

### 1. Prisma Helper Created

Created:

```text
apps/web/lib/prisma.ts
```

Purpose:

- Provides a shared Prisma client for the Next.js app.
- Connects the app to the PostgreSQL database.
- Prisma Client generation issue was fixed by running `npx prisma generate`.
- Restarting the TypeScript Server cleared the PrismaClient editor error.

---

### 2. Lot-Code Cipher Logic Started

Created:

```text
apps/web/lib/lot-engine.ts
```

Purpose:

- Holds the lot-code generation logic outside the UI page.
- Begins the OmniLytix Lot Code Engine.
- Keeps the lot-code cipher from being buried inside UI code.

Locked cipher rules:

#### Simple Mash / Puree / Ingredient Production Lots

```text
[Facility][ProductCode][ProcessType][Expiration YYMMDD][DayCode][Time HHmm]
```

Example:

```text
OMRJM280525A1749
```

Meaning:

```text
OM     = OmniLytix facility
RJ     = Red Jalapeno
M      = Mash
280525 = Expiration date 2028-05-25
A      = Monday
1749   = 5:49 PM
```

#### Finished Sauce / Finished Product Lots

```text
[Facility][ProductCode][Expiration YYMMDD][DayCode][Time HHmm][LineCode]
```

Example:

```text
OMDS280525A1800L2
```

Meaning:

```text
OM     = OmniLytix facility
DS     = Demon Slayer Hot Sauce
280525 = Expiration date 2028-05-25
A      = Monday
1800   = 6:00 PM
L2     = Production Line 2
```

---

### 3. API Routes Created to Replace Server Actions

Created:

```text
apps/web/app/api/lots/route.ts
apps/web/app/api/lots/seed/route.ts
```

Reason:

Next.js Server Actions were causing Codespaces/browser-origin issues:

```text
Invalid Server Actions request
```

Decision:

Move form submit logic to API routes instead of fighting Server Actions inside Codespaces.

Current API route purpose:

```text
/api/lots      = create production lot from structured form input
/api/lots/seed = seed cipher demo lots
```

---

### 4. Seed and Database Flow Started Working

The page eventually showed records in the lower table section.

Observed page status:

```text
Showing 4 lot records
```

This confirmed:

- API route/database write is working.
- Database read is working.
- Lot-code cipher generation is creating records.
- The UI is reading the records back from PostgreSQL.

Example generated record observed:

```text
OMRJM280525A2035
```

---

### 5. Database / Container Position

PostgreSQL container exists:

```text
omnilytix-postgres
```

Database container had been confirmed running previously and listening on port `5432`.

Important distinction:

```text
3001 = OmniLytix UI
5432 = PostgreSQL database
```

The UI should always be opened through port `3001`, not `5432`.

---

## Important Architecture Decisions Made

### Decision 1 — “Receive Lots” Is the Wrong Language for This Module

The current feature should not be called Receive Lots long-term.

Reason:

Receiving implies inbound goods from suppliers/vendors. This current module is generating internal production lot codes.

Correct separation:

```text
Production Lot Codes
- Internal production lots
- Mash / puree / sauce / finished goods
- System-generated cipher
- No manual lot-code creation
- Duplicate prevention
```

```text
Goods Receiving
- Inbound vendor/supplier materials
- Supplier lot number
- Manufacturer lot number
- COA
- Receiving date
- QA hold/release
- PO/BOL and receiving documentation
```

Immediate next correction:

Change visible UI language from Receive Lots to Production Lot Codes / Production Lot Code Generator.

Possible future route:

```text
/production/lots
```

or:

```text
/lots/production
```

Goods Receiving should be built later as a separate module.

---

### Decision 2 — Lot Codes Must Be System-Generated Only

Users should never manually type or create lot codes.

Users should enter structured production details, and OmniLytix should generate the lot code using the locked cipher.

Required structured inputs include:

```text
Lot Type
Product / Ingredient Name
Product Code
Process Type or Line Code
Facility Code
Production Date
Production Time
Expiration Date
Supplier / Internal Production
```

The system should generate the lot code from those fields.

---

### Decision 3 — Duplicate Lot Codes Must Not Be Created

Normal production lot-code creation must not silently update an existing lot.

The real production route should not use `upsert`.

Correct rule:

```text
Normal production lot creation = create only.
If duplicate lot code exists = reject and show warning.
```

Seed/demo route may use `upsert` because demo data should refresh the same sample records without creating duplicates.

Important distinction:

```text
/api/lots = create-only with duplicate protection
/api/lots/seed = upsert allowed for demo data only
```

---

### Decision 4 — Lot Code Corrections Must Be Controlled

In the real world, lot codes may sometimes need correction.

But users must not be allowed to break the cipher, manually edit the code, create duplicates, or bypass the naming convention.

Future correction workflow should be strict:

```text
Original lot code is preserved.
Correction reason is required.
Original lot may be marked voided/superseded/corrected.
Replacement lot is system-generated.
Replacement lot is linked back to original lot.
Audit trail records who changed it, when, and why.
```

Do not directly overwrite original lot-code identity.

---

## UX / UI Issues Captured

### 1. Data-Entry Order Is Not Intuitive

The current form fields are not in the best workflow order.

Better future order:

```text
Lot Type
Product / Ingredient Name
Product Code
Process Type or Line Code
Facility Code
Production Date
Production Time
Expiration Date
Supplier / Internal Production
Generated Lot Code Preview
```

The form should feel like a guided production workflow, not a raw grid.

---

### 2. Form Layout Is Cramped

Some placeholder text and field content appear cut off or squeezed.

The form needs:

```text
Better spacing
Larger input fields
Less cramped grid
Conditional fields based on lot type
Clearer visual grouping
```

---

### 3. Buttons Do Not Feel Like Buttons

The action buttons need stronger UI treatment.

Buttons needing improvement:

```text
Generate Lot Code + Receive
Seed Cipher Demo Lots
```

Future polish should include:

```text
Stronger contrast
Better padding
Clear hover/press states
Clear primary/secondary hierarchy
Possible icons or glow treatment
```

---

### 4. Results Table Is Too Far Down the Page

After submitting, the records appear below the fold. This makes it feel like nothing happened.

Future correction:

```text
Move recent lots / results higher
Add success/error banner near the top
Reduce form height
Show generated lot code immediately after submission
```

---

## Current Technical Issues / Cleanup Needed

### 1. Normal Route Still Needs Duplicate Protection

Update:

```text
apps/web/app/api/lots/route.ts
```

Required change:

```text
Replace normal upsert behavior with:
1. Generate lot code.
2. Check if lot exists.
3. If it exists, redirect with duplicate warning.
4. If it does not exist, create lot.
5. Redirect with success message.
```

---

### 2. Seed Route Can Keep Upsert

Keep `upsert` in:

```text
apps/web/app/api/lots/seed/route.ts
```

Reason:

Demo records should not duplicate every time the seed button is clicked.

---

### 3. Page Language Must Be Renamed

Update visible text in:

```text
apps/web/app/receive/lots/page.tsx
```

From:

```text
Receive → Lots
Receiving / Lot Control
Receive Lot
```

To something like:

```text
Production → Lot Codes
Production Lot Code Generator
Generate Production Lot Code
Production Lots
```

---

### 4. Old Server Action Functions May Still Need Removal

Earlier grep showed old functions may still exist in:

```text
apps/web/app/receive/lots/page.tsx
```

Remove unused functions if still present:

```text
seedDemoLots
createReceivedLot
"use server"
```

Forms should submit to API routes:

```tsx
<form action="/api/lots" method="post">
<form action="/api/lots/seed" method="post">
```

---

## Files Created / Changed This Session

Likely touched:

```text
apps/web/lib/prisma.ts
apps/web/lib/lot-engine.ts
apps/web/app/api/lots/route.ts
apps/web/app/api/lots/seed/route.ts
apps/web/app/receive/lots/page.tsx
apps/web/app/receive/page.tsx
apps/web/next.config.ts
apps/web/global.d.ts
docs/build-sessions/Start_Build_Session_20260525.md
```

Need to verify with:

```bash
cd /workspaces/OmniLytix
git status --short
```

---

## Commands / Checks Used

Useful commands from this session:

```bash
cd /workspaces/OmniLytix
git status --short
```

```bash
npx prisma generate
```

```bash
npx prisma migrate deploy
```

```bash
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | grep -i "omnilytix\|postgres"
```

```bash
docker exec omnilytix-postgres pg_isready -U omni -d omnilytix_dev
```

Possible database verification command:

```bash
docker exec omnilytix-postgres psql -U omni -d omnilytix_dev -c "select lot_code, status, received_at from lot order by created_at desc;"
```

---

## Known Working State

The page:

```text
/receive/lots
```

currently loads and displays the cipher-based form.

Records were generated and visible in the lower table section.

The system has proven:

```text
UI can render.
Database can connect.
API route can write records.
Page can read records.
Lot-code cipher can generate valid production lot codes.
```

---

## Exact Next Start Point

Next session should begin with:

```bash
cd /workspaces/OmniLytix
git status --short
git pull
cd apps/web
npm run dev
```

Then open:

```text
https://bug-free-memory-vpp5w6r7q76hwx7q-3001.app.github.dev/receive/lots
```

Then verify current files:

```bash
cd /workspaces/OmniLytix
git status --short
grep -n "upsert\|createReceivedLot\|seedDemoLots\|/api/lots" apps/web/app/receive/lots/page.tsx apps/web/app/api/lots/route.ts apps/web/app/api/lots/seed/route.ts
```

---

## Next Build Order

Recommended next order:

```text
1. Rename visible UI language from Receive Lots to Production Lot Codes.
2. Update /api/lots route so normal lot creation is create-only and rejects duplicates.
3. Keep /api/lots/seed using upsert for demo data only.
4. Add success/error redirect banners.
5. Move the results table higher or make recent lots immediately visible.
6. Remove unused Server Action functions from page.tsx.
7. Polish form layout and buttons.
8. Build the individual Lot Passport detail page.
9. Later: separate Goods Receiving module.
```

---

## Brundle Notes

Brundle should understand that the current module is being reframed.

Do not call this feature Receive Lots long-term.

Correct concept:

```text
Production Lot Code Generator
```

Separate future concept:

```text
Goods Receiving
```

Lot-code governance is a core OmniLytix foundation:

```text
System-generated only.
Cipher enforced.
No duplicates.
No silent overwrite.
Corrections through controlled audit workflow only.
```

---

## Closing Position

This was a productive session. The platform moved from placeholder Lot Passport pages toward a functioning production lot-code generator.

However, the session also revealed that naming conventions and module boundaries must be protected early. Mislabeling production lot codes as receiving lots could create confusion later, especially when the true Goods Receiving module is built.

Next session should focus on tightening terminology and governance before adding more features.