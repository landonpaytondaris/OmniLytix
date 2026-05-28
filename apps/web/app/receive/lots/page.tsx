import Link from "next/link";

import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

type LotClass = "SIMPLE" | "FINISHED";
type SimpleProcessType = "M" | "P";

function formatDate(value: Date | null) {
  if (!value) return "Not recorded";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);
}

function parseDate(value: string) {
  if (!value) return null;
  return new Date(`${value}T12:00:00.000Z`);
}

function getDayCode(date: Date) {
  const dayMap: Record<number, string> = {
    1: "A", // Monday
    2: "B", // Tuesday
    3: "C", // Wednesday
    4: "D", // Thursday
    5: "E", // Friday
    6: "F", // Saturday
    0: "G", // Sunday
  };

  return dayMap[date.getUTCDay()];
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeLineCode(value: string) {
  const cleaned = normalizeCode(value);

  if (!cleaned) return "";
  if (/^\d+$/.test(cleaned)) return `L${cleaned}`;

  return cleaned;
}

function formatExpirationCode(expirationDate: string) {
  const [year, month, day] = expirationDate.split("-");

  if (!year || !month || !day) {
    throw new Error("Expiration date is required to generate a lot code.");
  }

  return `${year.slice(2)}${month}${day}`;
}

function formatTimeCode(productionTime: string) {
  const cleaned = productionTime.replace(":", "").trim();

  if (!/^\d{4}$/.test(cleaned)) {
    throw new Error("Production time must be provided in HH:mm format.");
  }

  return cleaned;
}

function generateLotCode({
  lotClass,
  facilityCode,
  productCode,
  processType,
  expirationDate,
  productionDate,
  productionTime,
  lineCode,
}: {
  lotClass: LotClass;
  facilityCode: string;
  productCode: string;
  processType?: SimpleProcessType;
  expirationDate: string;
  productionDate: string;
  productionTime: string;
  lineCode?: string;
}) {
  const facility = normalizeCode(facilityCode);
  const product = normalizeCode(productCode);
  const expiration = formatExpirationCode(expirationDate);
  const productionDateValue = parseDate(productionDate);
  const time = formatTimeCode(productionTime);

  if (!facility || !product || !productionDateValue) {
    throw new Error("Missing required lot code inputs.");
  }

  const dayCode = getDayCode(productionDateValue);

  if (lotClass === "FINISHED") {
    const line = normalizeLineCode(lineCode ?? "");

    if (!line) {
      throw new Error("Finished sauce lots require a production line code.");
    }

    return `${facility}${product}${expiration}${dayCode}${time}${line}`;
  }

  if (!processType) {
    throw new Error("Simple ingredient lots require a process type.");
  }

  return `${facility}${product}${processType}${expiration}${dayCode}${time}`;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "RELEASED":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
    case "QUARANTINE":
      return "border-yellow-400/40 bg-yellow-400/10 text-yellow-200";
    case "HOLD":
      return "border-orange-400/40 bg-orange-400/10 text-orange-200";
    case "REJECTED":
      return "border-red-400/40 bg-red-400/10 text-red-200";
    case "CONSUMED":
      return "border-slate-400/40 bg-slate-400/10 text-slate-200";
    case "RECEIVED":
    default:
      return "border-blue-400/40 bg-blue-400/10 text-blue-200";
  }
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

async function getLots() {
  try {
    const lots = await prisma.lot.findMany({
      orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
      include: {
        supplier: true,
        ingredientType: true,
      },
      take: 50,
    });

    return { lots, error: null };
  } catch (error) {
    console.error("Failed to load lots", error);

    return {
      lots: [],
      error:
        "Database query failed. The Lot Passport page is connected to Prisma, but the database connection or migration may not be ready yet.",
    };
  }
}

export default async function ProductionLotsPage() {
  

  const { lots, error } = await getLots();

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            Production / Lot Control
          </p>

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Production → Lots</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/55">
                Lot codes are generated by OmniLytix. Users enter structured
                production data; the system creates the lot code cipher.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
              Showing <span className="text-white">{lots.length}</span> lot
              records
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_260px]">
          <form
            action= "/api/lots" method = "post"
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <h2 className="text-lg font-semibold">
              Generate Production Lot Code
            </h2>
            <p className="mt-1 text-sm text-white/45">
              The user cannot manually create the lot code. OmniLytix generates
              it from the locked cipher.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Lot Type
                <select
                  name="lotClass"
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white/30"
                >
                  <option value="SIMPLE">Mash / Puree</option>
                  <option value="FINISHED">Finished Sauce</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Facility Code
                <input
                  name="facilityCode"
                  required
                  defaultValue="OM"
                  maxLength={4}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm uppercase tracking-normal text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Product Code
                <input
                  name="productCode"
                  required
                  placeholder="RJ or DS"
                  maxLength={6}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm uppercase tracking-normal text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Process Type
                <select
                  name="processType"
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white/30"
                >
                  <option value="M">Mash</option>
                  <option value="P">Puree</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Product / Ingredient Name
                <input
                  name="productName"
                  required
                  placeholder="Red Jalapeno Mash"
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Supplier
                <input
                  name="supplierName"
                  placeholder="Supplier or Internal Production"
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Expiration Date
                <input
                  name="expirationDate"
                  type="date"
                  required
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white/30"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Production Date
                <input
                  name="productionDate"
                  type="date"
                  required
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white/30"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Production Time
                <input
                  name="productionTime"
                  type="time"
                  required
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-white/30"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
                Line Code
                <input
                  name="lineCode"
                  placeholder="L2 for finished sauce"
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm uppercase tracking-normal text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/45">
              <p>
                Simple example:{" "}
                <span className="text-white">OMRJM280525A1749</span>
              </p>
              <p className="mt-1">
                Finished example:{" "}
                <span className="text-white">OMDS280525A1800L2</span>
              </p>
            </div>

            <button
              type="submit"
              className="mt-5 rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Generate Production Lot Code
            </button>
          </form>

          <form
            action= "/api/lots/seed" method = "post"
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <h2 className="text-lg font-semibold">Demo Data</h2>
            <p className="mt-1 text-sm text-white/45">
              Add sample lots using the locked OmniLytix lot-code cipher.
            </p>

            <button
              type="submit"
              className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              Seed Cipher Demo Lots
            </button>
          </form>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40">
          <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.2em] text-white/35">
            <div className="col-span-3">Lot Code</div>
            <div className="col-span-3">Product / Ingredient</div>
            <div className="col-span-2">Supplier</div>
            <div className="col-span-2">Produced</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {lots.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-medium text-white">
                No production lots found yet.
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Use the form above or seed cipher demo lots to begin testing Lot
                Passport records.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {lots.map((lot) => (
                <Link
                  key={lot.lotId}
                  href={`/receive/lots/${lot.lotId}`}
                  className="grid grid-cols-12 items-center px-5 py-4 text-sm transition hover:bg-white/[0.05]"
                >
                  <div className="col-span-3">
                    <p className="font-medium text-white">{lot.lotCode}</p>
                    <p className="mt-1 text-xs text-white/35">
                      ID: {lot.lotId.slice(0, 8)}...
                    </p>
                  </div>

                  <div className="col-span-3">
                    <p className="text-white/80">
                      {lot.ingredientType.canonicalName}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {lot.ingredientType.defaultForm}
                    </p>
                  </div>

                  <div className="col-span-2 text-white/70">
                    {lot.supplier?.partyName ?? "No supplier linked"}
                  </div>

                  <div className="col-span-2 text-white/60">
                    {formatDate(lot.receivedAt)}
                  </div>

                  <div className="col-span-2 text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass(
                        lot.status
                      )}`}
                    >
                      {lot.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}