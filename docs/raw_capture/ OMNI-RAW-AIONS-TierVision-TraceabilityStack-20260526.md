# OmniLytix Raw Vision Notes — AIONS, Base Tier, Traceability Stack, and Module Expansion

## Date

2026-05-26

## Note Type

Raw Capture / Vision Draft

## Purpose

This note captures the raw thinking around the deeper OmniLytix vision, including the base quality/traceability layer, Production Lot Code Generator, batch sheet connection, FIFO ingredient scanning, QC hold/testing, product configuration logic, AIONS intelligence tiers, and future module expansion.

This is intentionally detailed and raw so the mindset is not lost. It can later be distilled into Brundle-approved knowledge files, platform architecture documents, product-tier strategy, and development roadmap notes.

---

# 1. Core Realization

OmniLytix is not just a lot-code generator.

OmniLytix is a quality operating system for a facility.

The power is not only in creating a production lot code. The power is in what that production lot code connects to:

- Production schedule
- Batch sheet
- Batch number
- Formula/BOM
- Product master
- Component requirements
- Ingredient lots
- FIFO inventory logic
- COAs
- QC results
- Production line
- Pallets
- Shipments
- Vendor/source records
- Recall traceability
- Customer/vendor document records
- Training, calibration, sanitation, environmental monitoring, and other daily quality records

The Production Lot Code is the key that opens the full history of the product.

The Lot Passport is not just a detail page. It is the complete record of what happened.

---

# 2. Fruit-to-Seed Traceability Analogy

The base power of OmniLytix is the ability to take a finished product and trace it all the way back through its history.

Analogy:

```text
Fruit in hand
→ tree
→ leaf
→ branch
→ root
→ seed
```

OmniLytix version:

```text
Finished product lot
→ pallet
→ production run
→ production order / PO
→ batch sheet
→ batch number
→ formula version
→ component lots
→ supplier/manufacturer lots
→ COAs
→ receiving records
→ source/vendor history
```

This is the base tier.

Base OmniLytix should be able to answer:

```text
What is this product?
What lot is this?
When was it produced?
Where was it produced?
What line produced it?
What batch sheet created it?
What batch number was assigned?
What formula version was used?
What ingredients/components were consumed?
What vendor lots were involved?
What COAs support those materials?
What QC results were recorded?
Was the product on hold or released?
What pallet did it go to?
What customer/shipment received it?
If one ingredient lot has an issue, what else is affected?
```

This is the core quality layer.

---

# 3. Base Tier vs Higher Tiers

## Base Tier — Reactive Truth System

The base tier is the operational/quality foundation.

It captures what happened.

It should manage and answer questions about daily facility activities:

- Production lot codes
- Goods receiving lots
- Batch sheets
- Batch numbers
- Ingredient/component consumption
- FIFO lot usage
- QC results
- Lot passports
- COAs
- Pallets
- Shipments
- Traceability
- Recall support
- Environmental monitoring records
- Calibration records
- QC data entry
- Sanitation program entries
- Other daily facility quality records

Base tier statement:

```text
Base OmniLytix tells the truth about what happened.
```

Base tier functions:

```text
Capture
Trace
Verify
Prove
Hold
Release
Record
Retrieve
```

Base tier is reactive, but it is not weak. It is the record of reality.

---

## Higher Tiers — Proactive Intelligence Layers

Higher tiers use the data captured by the base tier to become proactive.

Higher-tier capabilities include:

- SpecOps Engine
- AIONS optimization
- Predictive analysis
- Document control
- Training management
- Management review alerts
- Vendor/customer document package workflows
- R&D / new flavor development
- Formula prediction
- Batch correction recommendations
- Run setup optimization
- Yield improvement suggestions

Higher-tier statement:

```text
Higher-tier OmniLytix uses the truth to guide what should happen next.
```

Another clean phrase:

```text
Base OmniLytix is the record of reality.
AIONS is the intelligence built on top of reality.
```

---

# 4. Reactive vs Proactive Tier Philosophy

## Base Tier

Base tier answers daily operational questions:

```text
What happened?
Where did it happen?
When did it happen?
Who recorded it?
What lot was involved?
What document supports it?
What result was recorded?
What status was assigned?
What product or shipment was affected?
```

## High Tier / AIONS

High tier answers proactive or predictive questions:

```text
What should happen next?
What could go wrong?
What batch adjustment is likely needed?
What risk is forming?
What yield opportunity exists?
What future event could happen if this data pattern continues?
What formula direction should R&D try?
What document or training gap could create audit exposure?
```

The base tier captures facts.

The high tier predicts, optimizes, guides, and prevents.

---

# 5. Production Lot Codes vs Goods Receiving Lots

A major terminology correction was identified.

The current work should not be called “Receive Lots.”

Receiving implies inbound vendor/supplier material.

The current feature is production lot-code generation.

## Production Lot Codes

Purpose:

- Generate internal lot codes for internally produced products.
- Used for mash, puree, finished sauce, bottled product, finished beverage, etc.
- Must be system-generated.
- Must follow a cipher.
- Must prevent duplicates.
- Must not allow users to manually create arbitrary lot codes.

Examples:

```text
OMRJM280525A1749
OMRJP280525A1759
OMDS280525A1800L2
```

## Goods Receiving

Purpose:

- Receive inbound materials from vendors/suppliers.
- Capture vendor lot codes.
- Capture manufacturer lot codes.
- Capture COAs.
- Capture receiving date.
- Capture PO/BOL.
- Capture QA hold/release status.
- Connect received raw material lots to future production consumption.

Goods Receiving is a separate high-importance module and must not be confused with Production Lot Code Generation.

Future module naming should keep these separate:

```text
Production Lot Code Generator
Goods Receiving
```

---

# 6. Production Lot Code Cipher

Production lot codes must be generated by the system only.

Users should enter structured data. OmniLytix generates the code.

## Simple Mash / Puree / Ingredient Production Lots

Structure:

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

Process type examples:

```text
M = Mash
P = Puree
```

Day code:

```text
A = Monday
B = Tuesday
C = Wednesday
D = Thursday
E = Friday
F = Saturday
G = Sunday
```

## Finished Sauce / Finished Product Lots

Structure:

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

Finished products include line code at the end.

---

# 7. Lot Code Governance

Lot codes are controlled traceability identities.

Rules:

```text
Users cannot manually create lot codes.
Users cannot break the cipher.
Users cannot create duplicates.
Users cannot silently overwrite existing lots.
Normal production lot creation must be create-only.
Duplicate generated lot code must be rejected.
```

Seed/demo route can use `upsert` because demo records should not duplicate every time seed is clicked.

Normal production route should not use `upsert`.

Correct rule:

```text
/api/lots = create-only with duplicate protection
/api/lots/seed = upsert allowed for demo data only
```

## Lot Code Corrections

In the real world, lot codes may sometimes need correction.

But corrections must be controlled.

Do not directly edit or overwrite original lot-code identity.

Future correction workflow:

```text
Original lot code is preserved.
Correction reason is required.
Original lot may be marked voided, corrected, or superseded.
Replacement lot is system-generated.
Replacement lot is linked back to the original lot.
Audit trail records who corrected it, when, and why.
```

---

# 8. Product Master and Controlled Product Selection

The product/ingredient name should not be free manual text long term.

The user should select from controlled master data.

Example for pepper world:

```text
Frontend Label:
Red Jalapeno Pepper Mash

Backend Key:
RED_JALAPENO_PEPPER_MASH

Lot Code Product Code:
RJ
```

Example for beverage world:

```text
Frontend Label:
Sprite

Backend Key:
SPRITE

Lot Code Product Code:
SP or SPR
```

OmniLytix should distinguish:

```text
Display Name = user-facing label
System Key = stable backend identifier
Lot Code Product Code = short cipher code used in lot code
```

Potential product master structure:

```text
displayName: Red Jalapeno Pepper Mash
systemKey: RED_JALAPENO_PEPPER_MASH
productCode: RJ
productForm: MASH
productCategory: PEPPER_MASH
```

For Sprite:

```text
displayName: Sprite
systemKey: SPRITE
productCode: SP
productForm: LIQUID
productCategory: BEVERAGE
```

The user selects the product from a list. OmniLytix pulls the metadata.

---

# 9. Product Master, Formula, and BOM Connection

A product can be simple or complex.

## Simple Product Example

Customer mash may be one primary production product.

Example:

```text
Red Jalapeno Pepper Mash
→ production lot code
→ one primary product identity
```

## Complex Finished Product Example

Sprite is not a single raw product.

Sprite has:

- Water
- HFCS / sugar
- Flavoring Part 1 - liquid
- Citric Acid Part 2 - dry
- Other controlled parts/components

When a Sprite production lot code is generated, it should pull:

- Product master
- Product configuration
- Formula/BOM
- Component requirements
- Component configurations
- Required quantities
- FIFO-eligible inventory lots
- QC requirements
- Finished product identity

The production lot code should not be a disconnected record.

It should become the key to the entire production event.

---

# 10. Production Schedule to Batch Sheet Flow

Example:

```text
Production schedule:
Sprite — 6000 lb
```

Batcher generates batch sheet.

OmniLytix assigns:

```text
Batch Number: 0001
```

The batch sheet pulls:

- Product
- Target amount
- Formula version
- Required ingredients
- Required amounts
- Batch number
- Production schedule code / PO-style code
- Required QC checks
- Required component scanning steps

The batch sheet becomes a structured production record, not just a static document.

Every ingredient on the batch sheet should eventually be clickable.

Clicking an ingredient should show:

- Component name
- Required amount
- Scanned lot code
- Supplier/manufacturer lot code if applicable
- COA
- Receiving/creation date
- Expiration date
- FIFO status
- QA status
- Consumption amount
- Remaining requirement
- Remaining inventory impact

---

# 11. Kit / Configuration-Based Batching

Batching may involve kit/configuration logic.

Sprite example:

```text
Product configurations:
5-unit configuration
60-unit configuration
```

A batch may require:

```text
120 units
```

If using 60-unit drums:

```text
Scan Drum 1 = 60 units
Remaining = 60 units

Scan Drum 2 = 60 units
Remaining = 0 units
Component complete
```

The scanner is not just logging a lot code.

The scanner is:

```text
Validating the component
Validating the lot
Checking FIFO
Checking configuration
Decrementing required quantity
Completing the formula line
```

This creates live batching control.

---

# 12. Universal Component Configuration Clarification

Universal configuration does not mean globally universal across all products.

Sprite example:

Sprite may have two product configurations:

```text
5-unit Sprite configuration
60-unit Sprite configuration
```

But citric acid may remain configured as:

```text
5-unit bags
```

So the citric acid part is universal within Sprite configurations because both Sprite configurations use the same 5-unit citric acid bags.

Correct distinction:

```text
Product configuration size
vs.
Component configuration unit
```

Example:

```text
Product: Sprite

Product Configurations:
- 5-unit Sprite configuration
- 60-unit Sprite configuration

Component:
- Citric Acid Part 2

Component Configuration:
- 5-unit bag

Universal Rule:
- Citric Acid 5-unit bag applies across both Sprite configurations.
```

This is not the same as saying citric acid is universal across every product.

It is universal within the relevant product/configuration family.

---

# 13. Consumption Models

Different products and ingredients require different consumption models.

OmniLytix should support more than one method.

Possible consumption methods:

```text
METERED
SCANNED_CONTAINER
KIT_UNIT
WEIGHT_BASED
MANUAL_VERIFIED
```

## Beverage Example

```text
Water = metered
HFCS/Sugar = metered or source-controlled
Flavoring = scanned container / kit unit
Citric Acid = scanned bag / unit configuration
```

## Pepper / Sauce Example

```text
Pepper mash/puree = large quantity, possibly metered or weight-based
Water = metered
Vinegar = metered or weight-based
Salt/dry additives = weight-based or scanned container
Pails/drums/totes = container-based
```

The formula line should define how the ingredient is consumed.

---

# 14. FIFO-Controlled Lot Scanning

FIFO is critical.

Ingredients may be grouped by expiration date, with multiple lots under each expiration group.

Example:

```text
Citric Acid

Expiration Date: 2026-07-01
- Lot A
- Lot B
- Lot C

Expiration Date: 2026-09-01
- Lot D
- Lot E

Expiration Date: 2026-12-01
- Lot F
```

The system does not need to force one exact lot if multiple lots exist under the oldest eligible expiration group.

But the system should require consumption of the oldest eligible expiration group before moving to newer expiration groups.

If a batcher scans a newer lot while older eligible lots exist, OmniLytix should warn or block.

Example warning:

```text
FIFO hold: older eligible lots exist for this ingredient.
Use available lots expiring 2026-07-01 before using lots expiring 2026-09-01.
```

This protects:

- Quality
- Inventory discipline
- Rotation control
- Recall accuracy
- Traceability integrity

---

# 15. QC Hold and Quality Testing

Once the batch is completed, the finished product should go onto QC hold.

QC hold triggers testing.

Sprite example QC testing:

```text
Brix
Assay
pH
HPLC
```

QC enters results into OmniLytix and also records them on the hard-copy batch sheet if required.

OmniLytix should hold:

- Structured QC data
- Hard-copy record reference
- QC disposition
- Hold/release status
- Review history

The QC results become part of the finished production lot passport.

---

# 16. Run Setup and Optimization Tier

Important tier clarification:

Recommended run setup or blend-rate advice is not base tier.

Base tier captures results and records what happened.

AIONS / top-tier optimization can analyze results and suggest actions.

Example:

If Sprite assay is:

```text
101.2
```

QA may decide there is room to add more water during the run to improve syrup yield.

AIONS could eventually flag:

```text
Assay is above target center.
Recommended run setup may allow increased water blend rate to improve syrup yield.
QA review required before adjustment.
```

This is decision support, not mandatory action.

It belongs in the high-tier optimization layer.

---

# 17. Production Schedule / PO Overlay

The production schedule should assign a code to a scheduled batch/run.

This could function like a PO-style production code.

Example:

```text
Production Schedule Code / PO: SPR-PO-0001
Product: Sprite
Amount: 6000 lb
```

Production uses this code.

Production selects the schedule/PO code and assigns or generates the finished production lot code.

This creates an overlay:

```text
Production Schedule / PO Code
+
Finished Production Lot Code
```

This is crucial because it protects the integrity of lot generation.

The finished lot code should not float by itself. It should be tied to the scheduled production event.

---

# 18. Finished Product Lot Passport

A finished production lot code should connect:

- Product master
- Formula version
- Batch number
- Batch sheet
- Component lots consumed
- QC results
- Production order / PO
- Facility
- Production line
- Production date/time
- Finished goods inventory
- Pallets
- Shipments/customers

The finished product lot code is the identity layer for the production event.

Example:

```text
OMSP280525A1800L2
```

A user should be able to trace from this code backward into all supporting records.

---

# 19. Store Shelf Trace-Back Example

A user picks up a can of Sprite and reads the lot code on the bottom.

OmniLytix should answer:

```text
What product is this?
What facility produced it?
What production line produced it?
What day and time was it produced?
What batch number was used?
What production schedule/PO was it tied to?
What formula version was active?
What component lots were consumed?
What COAs were tied to those ingredients?
What were the water results when this batch was made?
What were the QC results?
What pallet was this product placed on?
Where was it shipped?
Were any universal parts used in other batches?
What other products could be affected if one component lot has an issue?
```

This is the traceability “time machine.”

---

# 20. AIONS / OSI Stack Analogy

OmniLytix AIONS behaves like an information stack.

At lower layers, it captures facts:

```text
Product
Batch
Lot
Ingredient
Date
Time
Line
```

As the product moves through the system, more layers are added:

```text
Formula
Component lots
FIFO checks
QC results
Production order
Finished lot code
Pallets
Shipments
Customer impact
Recall intelligence
```

Like the OSI model, each higher layer adds richer meaning.

At the base layer, the lot code identifies.

At the higher layers, the lot code explains.

---

# 21. Module Expansion — Base Operational Quality Layer

Additional OmniLytix modules should belong to the base operational/quality layer.

These modules capture daily facility activity and strengthen the data foundation.

Important modules include:

## Environmental Monitoring Program

Potential functions:

- Sample point management
- Zone classification
- Sample scheduling
- Results entry
- Trend tracking
- Positive result escalation
- CAPA linkage
- Corrective action records
- Historical environmental monitoring view

## Calibration Program

Potential functions:

- Instrument register
- Calibration frequency
- Last calibration date
- Next due date
- Calibration status
- Certificate upload/reference
- Out-of-calibration alerts
- Instrument usage impact
- Maintenance/calibration history

## QC Data Entry

Potential functions:

- Product-specific QC result entry
- pH
- Brix
- Salt
- Assay
- HPLC
- Moisture
- Water activity
- Other product-specific tests
- Hold/release disposition
- Spec comparison
- QC review status

## Sanitation Program Entry

Potential functions:

- Master sanitation schedule
- Area-specific sanitation records
- Pre-op checks
- Post-op checks
- Chemical concentration checks
- Allergen/sulfite cleaning verification
- Equipment sanitation records
- Missed entry alerts
- CAPA linkage

## Other Facility Daily-Activity Modules

Potential modules:

- Pre-op inspection
- Post-op verification
- Chemical control
- Pest control
- Water testing
- Maintenance records
- Internal audits
- Non-conformance records
- CAPA records
- Document control
- Training records

All of these strengthen the base system because they capture facility reality.

---

# 22. Document Control and Training Tiers

Document control and training management are higher-tier compliance layers.

Potential capabilities:

```text
Document register
Revision control
Review due dates
Document owner
Department assignment
Management alerts
Training matrix
Training completion records
Department-specific training gaps
Review reminders
Audit evidence package support
```

These modules help manage the quality system itself.

---

# 23. Vendor / Customer Document Exchange Layer

OmniLytix can eventually support a vendor/customer document package workflow.

This can compete with systems like TraceGains, but with stronger connection to production and traceability.

Potential workflow:

```text
User selects vendor or customer.
User selects document package type.
OmniLytix asks what documents/forms are needed.
User selects documents.
System generates/sends/tracks package.
System records what was sent, when, to whom, and which revision.
```

Documents may include:

```text
COA
SDS
Allergen statement
Non-GMO
Kosher
Halal
Country of Origin
Product specification
Letter of guarantee
Continuing guarantee
Questionnaire
Insurance certificate
```

The system should track:

```text
Who requested it
What was requested
What was sent
When it was sent
Which revision was sent
Who sent it
Whether it is complete
Whether follow-up is needed
```

This connects document control with vendor/customer communication instead of leaving it scattered across email.

---

# 24. SpecOps Engine

SpecOps is a high-tier quality/R&D intelligence layer.

It exists because:

```text
Quality is paramount.
Human error is inevitable.
The system should guide, verify, predict, and warn.
```

SpecOps can support:

```text
Specification management
Recipe/formula development
New flavor/R&D builds
Prediction mode
Adjustment recommendations
Spec compliance checks
Batch correction guidance
Quality risk alerts
```

Base OmniLytix answers what happened.

SpecOps helps determine what is needed to fix or improve what happened.

AIONS predicts what could happen next.

Clean phrase:

```text
OmniLytix base proves what happened.
SpecOps helps prevent what should not happen.
AIONS helps optimize what could happen next.
```

---

# 25. High-Tier R&D Layer

R&D is another premium intelligence layer.

Potential functions:

```text
New flavor development
Formula modeling
Ingredient substitution analysis
Spec prediction
Cost/yield impact
Batch trial records
Sensory notes
Formula versioning
Product development history
```

This ties directly into SpecOps because new recipes and flavors need controlled specification logic.

---

# 26. Final Alignment Statement

Do not build OmniLytix as disconnected screens.

Build it as a connected production-control and quality-traceability system.

The current Production Lot Code Generator is not the final product.

It is the identity layer for production events.

The Batch Sheet is not just a form.

It is the bridge between formula requirements, ingredient consumption, QC results, production scheduling, and finished goods traceability.

The Lot Passport is not just a page.

It is the complete historical record of the product.

The base tier captures reality.

The high tiers use reality to guide, predict, optimize, and prevent.

---

# 27. Future Brundle Instruction

Brundle should understand that this vision is central to OmniLytix.

Brundle should preserve these relationships:

```text
Product Master
Product Configuration
Formula/BOM
Batch Sheet
Batch Number
Production Schedule / PO
Component Lots
FIFO Inventory
QC Hold
QC Results
Production Lot Code
Finished Goods
Pallets
Shipments
Recall
Environmental Monitoring
Calibration
QC Data Entry
Sanitation
Document Control
Training
SpecOps
AIONS
```

Brundle should not treat Production Lot Codes, Goods Receiving, Batch Sheets, QC, Inventory, Environmental Monitoring, Calibration, Sanitation, Document Control, Training, SpecOps, or Traceability as isolated features.

They are parts of one connected OmniLytix operating system.

---

# 28. Closing Thought

OmniLytix is a system that lets a facility see through time.

From the finished product in hand, the user should be able to trace backward through every layer of truth:

```text
Finished good
→ pallet
→ production lot
→ batch sheet
→ batch number
→ formula
→ ingredient lots
→ supplier records
→ COAs
→ QC results
→ facility records
→ source history
```

That is the core of the OmniLytix world.