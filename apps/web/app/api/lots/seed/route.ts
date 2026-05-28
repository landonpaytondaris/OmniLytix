import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  cipherDemoLots,
  generateLotCode,
  parseDate,
  type LotClass,
  type SimpleProcessType,
} from "../../../../lib/lot-engine";
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
    for (const demoLot of cipherDemoLots) {
      const lotCode = generateLotCode(demoLot);

      const ingredientType = await getOrCreateIngredientType({
        canonicalName: demoLot.productName,
        lotClass: demoLot.lotClass,
        processType:
          demoLot.lotClass === "SIMPLE" ? demoLot.processType : undefined,
      });

      const supplier = await getOrCreateSupplier(demoLot.supplierName);

      await prisma.lot.upsert({
        where: {
          lotCode,
        },
        update: {
          ingredientTypeId: ingredientType.ingredientTypeId,
          supplierId: supplier?.partyId ?? null,
          receivedAt: parseDate(demoLot.productionDate),
          status: "QUARANTINE",
        },
        create: {
          lotCode,
          ingredientTypeId: ingredientType.ingredientTypeId,
          supplierId: supplier?.partyId ?? null,
          receivedAt: parseDate(demoLot.productionDate),
          status: "QUARANTINE",
        },
      });
    }

const origin =
  request.headers.get("origin") ??
  (request.headers.get("x-forwarded-host")
    ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get(
        "x-forwarded-host"
      )}`
    : request.url);

return redirectToLots();
  } catch (error) {
    console.error("Failed to seed cipher demo lots", error);

    return NextResponse.json(
      {
        error: "Failed to seed cipher demo lots.",
      },
      { status: 500 }
    );
  }
}