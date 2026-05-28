import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import {
  generateLotCode,
  parseDate,
  type LotClass,
  type SimpleProcessType,
} from "../../../lib/lot-engine";
function redirectToLots() {
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/receive/lots",
    },
  });
}
async function getOrCreateSupplier(partyName: string) {
  if (!partyName) return null;

  const existingSupplier = await prisma.party.findFirst({
    where: {
      partyName,
      partyType: "SUPPLIER",
    },
  });

  if (existingSupplier) return existingSupplier;

  return prisma.party.create({
    data: {
      partyName,
      partyType: "SUPPLIER",
    },
  });
}

async function getOrCreateIngredientType({
  canonicalName,
  lotClass,
  processType,
}: {
  canonicalName: string;
  lotClass: LotClass;
  processType?: SimpleProcessType;
}) {
  const defaultForm =
    lotClass === "FINISHED" ? "SAUCE" : processType === "P" ? "PUREE" : "MASH";

  return prisma.ingredientType.upsert({
    where: {
      canonicalName,
    },
    update: {
      defaultForm,
      active: true,
      isPepper: lotClass === "SIMPLE",
    },
    create: {
      canonicalName,
      defaultForm,
      isPepper: lotClass === "SIMPLE",
    },
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const rawLotClass = String(formData.get("lotClass") ?? "").trim();
    const lotClass: LotClass =
      rawLotClass === "FINISHED" ? "FINISHED" : "SIMPLE";

    const rawProcessType = String(formData.get("processType") ?? "").trim();
    const processType: SimpleProcessType =
      rawProcessType === "P" ? "P" : "M";

    const facilityCode = String(formData.get("facilityCode") ?? "").trim();
    const productCode = String(formData.get("productCode") ?? "").trim();
    const productName = String(formData.get("productName") ?? "").trim();
    const supplierName = String(formData.get("supplierName") ?? "").trim();
    const expirationDate = String(formData.get("expirationDate") ?? "").trim();
    const productionDate = String(formData.get("productionDate") ?? "").trim();
    const productionTime = String(formData.get("productionTime") ?? "").trim();
    const lineCode = String(formData.get("lineCode") ?? "").trim();

    if (!facilityCode || !productCode || !productName) {
      return NextResponse.json(
        {
          error: "Facility code, product code, and product name are required.",
        },
        { status: 400 }
      );
    }

    const lotCode = generateLotCode({
      lotClass,
      facilityCode,
      productCode,
      processType: lotClass === "SIMPLE" ? processType : undefined,
      expirationDate,
      productionDate,
      productionTime,
      lineCode: lotClass === "FINISHED" ? lineCode : undefined,
    });

    const ingredientType = await getOrCreateIngredientType({
      canonicalName: productName,
      lotClass,
      processType: lotClass === "SIMPLE" ? processType : undefined,
    });

    const supplier = await getOrCreateSupplier(supplierName);

    const existingLot = await prisma.lot.findUnique({
  where: {
    lotCode,
  },
});

if (existingLot) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/receive/lots?status=duplicate&lotCode=${encodeURIComponent(lotCode)}`,
    },
  });
}

await prisma.lot.create({
  data: {
    lotCode,
    ingredientTypeId: ingredientType.ingredientTypeId,
    supplierId: supplier?.partyId ?? null,
    receivedAt: parseDate(productionDate),
    status: "QUARANTINE",
  },
});



return redirectToLots();
  } catch (error) {
    console.error("Failed to create a Production Lot Code", error);

    return NextResponse.json(
      {
        error: "Failed to create Production lot code.",
      },
      { status: 500 }
    );
  }
}