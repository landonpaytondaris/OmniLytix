# OmniLytix Build Session Start
## Date
2026-05-25
## Session Name
Lot Passport MVP — Functional Foundation
## Current Git State
Branch: main
Latest Commit: 2e73ae7 — Add OmniLytix build session tracking docs
Git Status: Clean at session start
## Current Working Area
Receiving → Lots → Lot Passport
## Current Known State
- OmniLytix UI runs successfully in Codespaces on port 3001.
- VS Code Desktop is connected to the active Codespace.
- GitHub repo is synced with main.
- Session tracking docs have been created and committed.
- Prisma schema exists.
- LotStatus enum exists.
- Party model exists.
- IngredientType model exists.
- Lot model exists.
- Receive Lots route exists but is placeholder-level.
- Lot Passport dynamic route exists but is placeholder-level.
## Today's Objective
Build the first functional Lot Passport MVP flow.
A user should be able to:
- View a list of received lots.
- See lot code, supplier, ingredient type, received date, and status.
- Click a lot.
- Open a Lot Passport detail page with meaningful lot-level information.
## MVP Scope
- Build Receive Lots table/list.
- Build Lot Passport detail screen.
- Use the existing Lot model.
- Use existing Party and IngredientType relationships.
- Add sample/seed data only if needed.
- Keep the MVP simple and functional.
## Out of Scope
- COA upload system
- Full lab result workflow
- Authentication
- Mock recall engine
- Inventory consumption
- Finished goods linkage
- Advanced UI polish
## Files Expected to Touch
- apps/web/app/receive/lots/page.tsx
- apps/web/app/receive/lots/[lotId]/page.tsx
- possibly apps/web/lib/prisma.ts
- possibly prisma/schema.prisma
- possibly prisma/seed.ts
## Startup Commands
cd /workspaces/OmniLytix
git status --short
git pull
cd apps/web
npm run dev
## Notes Before Building
Begin by inspecting LotStatus, Party, IngredientType, Lot, and whether PrismaClient is already configured.