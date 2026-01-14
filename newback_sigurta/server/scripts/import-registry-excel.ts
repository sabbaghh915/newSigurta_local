// server/scripts/import-registry-excel.ts
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

import mongoose from "mongoose";
import xlsx from "xlsx";
import VehicleRegistry from "../models/VehicleRegistry";
import { normArabicName, normKey, normPlate } from "../utils/normalize";


function s(v: any) {
  return String(v ?? "").trim();
}

function toDate(v: any): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? undefined : d;
}

function pickPhone(r: any) {
  const a = s(r["رقم الموبايل"]);
  const b = s(r["رقم هاتفه"]);
  const clean = (x: string) => (x && x !== "لايوجد" ? x : "");
  return clean(a) || clean(b) || "";
}

async function run() {
  const filePath = process.argv[2];
  if (!filePath) throw new Error('Usage: npx tsx server/scripts/import-registry-excel.ts "file.xls|file.xlsx"');

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) throw new Error("❌ Missing MONGO_URI. Put it in .env or set it in PowerShell.");

  await mongoose.connect(uri);

  const wb = xlsx.readFile(filePath, { cellDates: true });
  const sheetName = wb.SheetNames?.[0];
  if (!sheetName) throw new Error("❌ No sheets found in this Excel file.");

  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<any>(sheet, { defval: "" });

  const ops = rows
    .map((r, i) => {
      const legacySerial = s(r["مفتاح تسلسلي"]);
      if (!legacySerial) return null;

      const plateNumber = s(r["رق المركبة"]);
      const plateRegion = s(r["جنسية المركبة"]);
      const ownerName = s(r["اسم المؤمن له"]);
      const chassisNumber = s(r["رقم الهيكل"]);
      const engineNumber = s(r["رقم المحرك"]);

      const doc = {
        legacySerial,
        legacyKey: s(r["المفتاح"]),
        contractNumber: s(r["رقم العقد"]),

        plateNumber,
        plateRegion,
        plateNumberKey: normKey(plateNumber),
        plateKey: normPlate(plateRegion, plateNumber),



        ownerName,
        ownerNameKey: normArabicName(ownerName),
        nationalId: s(r["الرقم الوطني"]),
        phoneNumber: pickPhone(r),
        address: s(r["العنوان"]),

        brand: s(r["الصانع"]),
        model: s(r["نوع السيارة"]),
        year: Number(s(r["سنة الصنع"]) || 0) || undefined,
        color: s(r["لون المركبة"]),
        fuelType: s(r["نوع الوقود"]),
        engineCapacity: s(r["حجم المحرك"]),
        enginePower: s(r["قوة المحرك"]),

        chassisNumber,
        chassisKey: normKey(chassisNumber),
        engineNumber,
        engineKey: normKey(engineNumber),

        licenseNumber: s(r["رقم الرخصة"]),
        licenseExpiryDate: toDate(r["تاريخ انتهاء العقد"]),

        source: { file: filePath, row: i + 2 },
      };

      return {
        updateOne: {
          filter: { legacySerial },
          update: { $set: doc },
          upsert: true,
        },
      };
    })
    .filter(Boolean) as any[];

  if (ops.length) {
    await VehicleRegistry.bulkWrite(ops, { ordered: false });
  }

  console.log(`✅ Imported/Upserted: ${ops.length}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
