# OmniLytix Build Session Closing Notes  
## Production Lot Code Generator Cleanup / Controlled Lot Artifact Direction

**Date:** 2026-05-27  
**Session Type:** Build Session / Cleanup / Architecture Alignment  
**Primary Area:** Production Lot Code Generator, Lot Passport MVP, API cleanup, controlled lot-code governance

---

## 1. Session Purpose

The purpose of this session was to resume the OmniLytix build cleanly and continue correcting the Lot Passport / Production Lot Code Generator MVP.

The major focus was to clean up the confusing “Receive Lots” language, stabilize the API route behavior, remove dead Server Action code, confirm database/API functionality, and clarify the future direction of lot-code governance.

A major architecture decision also emerged during the session:

> A production lot code should be treated as a **Controlled Lot Artifact**, not a normal editable field.

---

## 2. Current Build Status

The current route is still temporarily:

```text
/receive/lots
## Product Commercialization and Shelf-Life Rule Connection

Shelf-life rules should be part of the product/flavor commercialization process.

When a product or flavor is commercialized, OmniLytix should define the controlled production identity for that product, including:

- Front-facing product/flavor name
- Backend system key
- Lot-code product code
- Approved formula/BOM
- Product configuration
- Eligible production lines
- QC requirements
- Shelf-life rule
- Expiration calculation method
- Lot-code generation rule

The shelf-life rule directly affects the Controlled Lot Artifact because the expiration date is embedded into the lot code.

Example:

```text
Product: Sprite
Shelf Life: 26 weeks
Production Date: 2026-05-25
Expiration Date: production date + 26 weeks
Lot Code: generated using the approved expiration result