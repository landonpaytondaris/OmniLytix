-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'BOTH', 'INTERNAL');

-- CreateEnum
CREATE TYPE "PartyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('PEPPER_MASH', 'PEPPER_PUREE', 'HOT_SAUCE');

-- CreateEnum
CREATE TYPE "IntendedUse" AS ENUM ('INGREDIENT', 'INTERMEDIATE', 'FINISHED_GOOD');

-- CreateEnum
CREATE TYPE "RegulatoryClass" AS ENUM ('RAW', 'FERMENTED', 'ACIDIFIED', 'SHELF_STABLE', 'REFRIGERATED', 'FROZEN');

-- CreateEnum
CREATE TYPE "ProductForm" AS ENUM ('MASH', 'PUREE', 'SAUCE', 'DRY', 'LIQUID');

-- CreateEnum
CREATE TYPE "SpecProfileStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "FormulaStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('QUARANTINE', 'RELEASED', 'HOLD', 'REJECTED', 'CONSUMED');

-- CreateEnum
CREATE TYPE "FormulaBasis" AS ENUM ('PERCENT', 'WEIGHT');

-- CreateEnum
CREATE TYPE "FormulaLineRole" AS ENUM ('PEPPER_COMPONENT', 'SALT_COMPONENT', 'ACID_COMPONENT', 'WATER_COMPONENT', 'OTHER');

-- CreateEnum
CREATE TYPE "SpecMetric" AS ENUM ('PH', 'SALT_PCT', 'PEPPER_SOLIDS_PCT', 'TOTAL_SOLIDS_PCT', 'BOSTWICK', 'VISCOSITY');

-- CreateEnum
CREATE TYPE "EnforcementStage" AS ENUM ('RECEIVING', 'IN_PROCESS', 'FINAL_RELEASE');

-- CreateTable
CREATE TABLE "party" (
    "party_id" TEXT NOT NULL,
    "party_name" TEXT NOT NULL,
    "party_type" "PartyType" NOT NULL,
    "status" "PartyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "party_pkey" PRIMARY KEY ("party_id")
);

-- CreateTable
CREATE TABLE "ingredient_type" (
    "ingredient_type_id" TEXT NOT NULL,
    "canonical_name" TEXT NOT NULL,
    "species" TEXT,
    "heat_class" TEXT,
    "color_class" TEXT,
    "default_form" "ProductForm" NOT NULL DEFAULT 'MASH',
    "is_pepper" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_type_pkey" PRIMARY KEY ("ingredient_type_id")
);

-- CreateTable
CREATE TABLE "ingredient_alias" (
    "ingredient_alias_id" TEXT NOT NULL,
    "ingredient_type_id" TEXT NOT NULL,
    "alias_name" TEXT NOT NULL,

    CONSTRAINT "ingredient_alias_pkey" PRIMARY KEY ("ingredient_alias_id")
);

-- CreateTable
CREATE TABLE "product_type" (
    "product_type_id" TEXT NOT NULL,
    "canonical_name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "intended_use" "IntendedUse" NOT NULL,
    "regulatory_class_default" "RegulatoryClass" NOT NULL,
    "default_form" "ProductForm" NOT NULL,
    "sellable" BOOLEAN NOT NULL DEFAULT true,
    "versioning_enabled" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("product_type_id")
);

-- CreateTable
CREATE TABLE "spec_profile" (
    "spec_profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applies_to_category" "ProductCategory" NOT NULL,
    "status" "SpecProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spec_profile_pkey" PRIMARY KEY ("spec_profile_id")
);

-- CreateTable
CREATE TABLE "spec_profile_version" (
    "spec_profile_version_id" TEXT NOT NULL,
    "spec_profile_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "spec_profile_version_pkey" PRIMARY KEY ("spec_profile_version_id")
);

-- CreateTable
CREATE TABLE "spec_item" (
    "spec_item_id" TEXT NOT NULL,
    "spec_profile_version_id" TEXT NOT NULL,
    "metric" "SpecMetric" NOT NULL,
    "target_min" DECIMAL(12,4),
    "target_max" DECIMAL(12,4),
    "unit" TEXT NOT NULL,
    "enforcement_stage" "EnforcementStage" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "test_method_ref" TEXT,

    CONSTRAINT "spec_item_pkey" PRIMARY KEY ("spec_item_id")
);

-- CreateTable
CREATE TABLE "formula" (
    "formula_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basis" "FormulaBasis" NOT NULL,
    "status" "FormulaStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formula_pkey" PRIMARY KEY ("formula_id")
);

-- CreateTable
CREATE TABLE "formula_version" (
    "formula_version_id" TEXT NOT NULL,
    "formula_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "formula_version_pkey" PRIMARY KEY ("formula_version_id")
);

-- CreateTable
CREATE TABLE "formula_line" (
    "formula_line_id" TEXT NOT NULL,
    "formula_version_id" TEXT NOT NULL,
    "ingredient_type_id" TEXT NOT NULL,
    "line_role" "FormulaLineRole" NOT NULL,
    "amount" DECIMAL(14,6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "formula_line_pkey" PRIMARY KEY ("formula_line_id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "product_variant_id" TEXT NOT NULL,
    "product_type_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "variant_name" TEXT NOT NULL,
    "status" "VariantStatus" NOT NULL DEFAULT 'DRAFT',
    "default_spec_profile_id" TEXT,
    "default_formula_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("product_variant_id")
);

-- CreateTable
CREATE TABLE "lot" (
    "lot_id" TEXT NOT NULL,
    "lot_code" TEXT NOT NULL,
    "ingredient_type_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "received_at" TIMESTAMP(3),
    "status" "LotStatus" NOT NULL DEFAULT 'QUARANTINE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_pkey" PRIMARY KEY ("lot_id")
);

-- CreateIndex
CREATE INDEX "idx_party_type" ON "party"("party_type");

-- CreateIndex
CREATE INDEX "idx_party_status" ON "party"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_type_canonical_name_key" ON "ingredient_type"("canonical_name");

-- CreateIndex
CREATE INDEX "idx_ingredient_is_pepper" ON "ingredient_type"("is_pepper");

-- CreateIndex
CREATE INDEX "idx_ingredient_active" ON "ingredient_type"("active");

-- CreateIndex
CREATE INDEX "idx_alias_name" ON "ingredient_alias"("alias_name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_alias_per_type" ON "ingredient_alias"("ingredient_type_id", "alias_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_canonical_name_key" ON "product_type"("canonical_name");

-- CreateIndex
CREATE INDEX "idx_product_type_category" ON "product_type"("category");

-- CreateIndex
CREATE INDEX "idx_product_type_active" ON "product_type"("active");

-- CreateIndex
CREATE INDEX "idx_spec_profile_category" ON "spec_profile"("applies_to_category");

-- CreateIndex
CREATE INDEX "idx_spec_profile_status" ON "spec_profile"("status");

-- CreateIndex
CREATE INDEX "idx_spec_version_effective_from" ON "spec_profile_version"("effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "uq_spec_profile_version" ON "spec_profile_version"("spec_profile_id", "version_no");

-- CreateIndex
CREATE INDEX "idx_spec_item_metric" ON "spec_item"("metric");

-- CreateIndex
CREATE INDEX "idx_spec_item_stage" ON "spec_item"("enforcement_stage");

-- CreateIndex
CREATE INDEX "idx_formula_status" ON "formula"("status");

-- CreateIndex
CREATE INDEX "idx_formula_version_effective_from" ON "formula_version"("effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "uq_formula_version" ON "formula_version"("formula_id", "version_no");

-- CreateIndex
CREATE INDEX "idx_formula_line_ingredient" ON "formula_line"("ingredient_type_id");

-- CreateIndex
CREATE INDEX "idx_formula_line_role" ON "formula_line"("line_role");

-- CreateIndex
CREATE INDEX "idx_variant_product_type" ON "product_variant"("product_type_id");

-- CreateIndex
CREATE INDEX "idx_variant_customer" ON "product_variant"("customer_id");

-- CreateIndex
CREATE INDEX "idx_variant_status" ON "product_variant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "lot_lot_code_key" ON "lot"("lot_code");

-- CreateIndex
CREATE INDEX "idx_lot_ingredient_type" ON "lot"("ingredient_type_id");

-- CreateIndex
CREATE INDEX "idx_lot_status" ON "lot"("status");

-- AddForeignKey
ALTER TABLE "ingredient_alias" ADD CONSTRAINT "ingredient_alias_ingredient_type_id_fkey" FOREIGN KEY ("ingredient_type_id") REFERENCES "ingredient_type"("ingredient_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec_profile_version" ADD CONSTRAINT "spec_profile_version_spec_profile_id_fkey" FOREIGN KEY ("spec_profile_id") REFERENCES "spec_profile"("spec_profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec_item" ADD CONSTRAINT "spec_item_spec_profile_version_id_fkey" FOREIGN KEY ("spec_profile_version_id") REFERENCES "spec_profile_version"("spec_profile_version_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_version" ADD CONSTRAINT "formula_version_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formula"("formula_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_line" ADD CONSTRAINT "formula_line_formula_version_id_fkey" FOREIGN KEY ("formula_version_id") REFERENCES "formula_version"("formula_version_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_line" ADD CONSTRAINT "formula_line_ingredient_type_id_fkey" FOREIGN KEY ("ingredient_type_id") REFERENCES "ingredient_type"("ingredient_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "product_type"("product_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "party"("party_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_default_spec_profile_id_fkey" FOREIGN KEY ("default_spec_profile_id") REFERENCES "spec_profile"("spec_profile_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_default_formula_id_fkey" FOREIGN KEY ("default_formula_id") REFERENCES "formula"("formula_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot" ADD CONSTRAINT "lot_ingredient_type_id_fkey" FOREIGN KEY ("ingredient_type_id") REFERENCES "ingredient_type"("ingredient_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot" ADD CONSTRAINT "lot_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "party"("party_id") ON DELETE SET NULL ON UPDATE CASCADE;
