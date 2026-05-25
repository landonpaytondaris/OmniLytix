# OmniLytix Build Session Start

## Date
2026-05-24
## Session Name
Lot Passport MVP — Functional Foundation
## Current Working Area
Receiving → Lots → Lot Passport
## Current Known State
- OmniLytix UI runs successfully in Codespaces on port 3001.
- GitHub repo is connected and protected by recent checkpoint commit.
- Prisma schema exists.
- Lot model exists in Prisma.
- Receive Lots route exists but is placeholder-level.
- Lot Passport dynamic route exists but is placeholder-level.
- Current main build focus is Lot Passport MVP.
## Today's Objective
Build the first functional Lot Passport MVP flow where a user can view received lots, click a lot, and open a Lot Passport page that displays meaningful lot-level data.
## MVP Scope
- Show received lots in a list/table.
- Display lot code, supplier, ingredient type, received date, and status.
- Link each lot to its Lot Passport page.
- Build a useful Lot Passport detail layout.
- Use existing Prisma Lot model where possible.
- Add seed/sample data if needed.
## Out of Scope for This Session
- COA upload system
- Full lab result module
- Authentication
- Mock recall engine
- Inventory consumption logic
- Finished goods traceability
- Advanced UI polish
## Files Expected to Touch
- prisma/schema.prisma
- apps/web/app/receive/lots/page.tsx
- apps/web/app/receive/lots/[lotId]/page.tsx
## Startup Commands
cd /workspaces/OmniLytix
git status --short
git pull
cd apps/web
npm run dev