export type LotClass = "SIMPLE" | "FINISHED";
export type SimpleProcessType = "M" | "P";

export type GenerateLotCodeInput = {
  lotClass: LotClass;
  facilityCode: string;
  productCode: string;
  processType?: SimpleProcessType;
  expirationDate: string;
  productionDate: string;
  productionTime: string;
  lineCode?: string;
};

export function parseDate(value: string) {
  if (!value) return null;
  return new Date(`${value}T12:00:00.000Z`);
}

export function getDayCode(date: Date) {
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

export function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function normalizeLineCode(value: string) {
  const cleaned = normalizeCode(value);

  if (!cleaned) return "";
  if (/^\d+$/.test(cleaned)) return `L${cleaned}`;

  return cleaned;
}

export function formatExpirationCode(expirationDate: string) {
  const [year, month, day] = expirationDate.split("-");

  if (!year || !month || !day) {
    throw new Error("Expiration date is required to generate a lot code.");
  }

  return `${year.slice(2)}${month}${day}`;
}

export function formatTimeCode(productionTime: string) {
  const cleaned = productionTime.replace(":", "").trim();

  if (!/^\d{4}$/.test(cleaned)) {
    throw new Error("Production time must be provided in HH:mm format.");
  }

  return cleaned;
}

export function generateLotCode(input: GenerateLotCodeInput) {
  const facility = normalizeCode(input.facilityCode);
  const product = normalizeCode(input.productCode);
  const expiration = formatExpirationCode(input.expirationDate);
  const productionDateValue = parseDate(input.productionDate);
  const time = formatTimeCode(input.productionTime);

  if (!facility || !product || !productionDateValue) {
    throw new Error("Missing required lot code inputs.");
  }

  const dayCode = getDayCode(productionDateValue);

  if (input.lotClass === "FINISHED") {
    const line = normalizeLineCode(input.lineCode ?? "");

    if (!line) {
      throw new Error("Finished sauce lots require a production line code.");
    }

    return `${facility}${product}${expiration}${dayCode}${time}${line}`;
  }

  if (!input.processType) {
    throw new Error("Simple ingredient lots require a process type.");
  }

  return `${facility}${product}${input.processType}${expiration}${dayCode}${time}`;
}

export const cipherDemoLots = [
  {
    lotClass: "SIMPLE",
    facilityCode: "OM",
    productCode: "RJ",
    processType: "M",
    productName: "Red Jalapeno Mash",
    supplierName: "Demo Pepper Supplier",
    expirationDate: "2028-05-25",
    productionDate: "2026-05-25",
    productionTime: "17:49",
  },
  {
    lotClass: "SIMPLE",
    facilityCode: "OM",
    productCode: "RJ",
    processType: "P",
    productName: "Red Jalapeno Puree",
    supplierName: "Demo Pepper Supplier",
    expirationDate: "2028-05-25",
    productionDate: "2026-05-25",
    productionTime: "17:59",
  },
  {
    lotClass: "FINISHED",
    facilityCode: "OM",
    productCode: "DS",
    productName: "Demon Slayer Hot Sauce",
    supplierName: "Internal Production",
    expirationDate: "2028-05-25",
    productionDate: "2026-05-25",
    productionTime: "18:00",
    lineCode: "L2",
  },
] as const;