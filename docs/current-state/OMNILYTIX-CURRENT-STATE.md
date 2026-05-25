# OmniLytix Current State

## Last Updated

2026-05-24

## Current Build Position

OmniLytix is running in GitHub Codespaces through VS Code Desktop.

The UI runs from the `apps/web` app using:

cd /workspaces/OmniLytix
cd apps/web
npm run dev

The app opens through port 3001.

## Current Confirmed State

- OmniLytix repository is active and connected to GitHub.
- Codespace is active.
- VS Code Desktop can connect to the Codespace.
- OmniLytix UI launches successfully.
- Current UI has the command-center module launcher.
- Prisma schema exists.
- Lot model exists in Prisma.
- Receive Lots route exists.
- Lot Passport dynamic route exists.
- Receive Lots page is currently placeholder-level.
- Lot Passport page is currently placeholder-level.

## Last Safe Commit

Commit: 8e76b48

Message: Checkpoint working OmniLytix UI dependencies

## Current Main Build Focus

Lot Passport MVP

## Next Build Objective

Turn the Lot Passport foundation into a real MVP screen connected to the existing Lot model.

## Known Routes

- /
- /receive
- /receive/lots
- /receive/lots/[lotId]
- /trace
- /inventory
- /lab

## Known Core Files

- apps/web/app/page.tsx
- apps/web/app/receive/page.tsx
- apps/web/app/receive/lots/page.tsx
- apps/web/app/receive/lots/[lotId]/page.tsx
- apps/web/app/trace/page.tsx
- apps/web/app/inventory/page.tsx
- apps/web/app/lab/page.tsx
- prisma/schema.prisma

## Next Session Should Start With

cd /workspaces/OmniLytix
git status --short
git pull
cd apps/web
npm run dev