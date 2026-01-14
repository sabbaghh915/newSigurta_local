// server/routes/autofill.ts
import { Router } from "express";
import mongoose from "mongoose";

import SyrianVehicle from "../models/SyrianVehicle";
import VehicleRegistry from "../models/VehicleRegistry";
import { normArabicName, normKey, normPlate } from "../utils/normalize";

const router = Router();

function clean(v: any) {
  return String(v ?? "").trim();
}

function isUseless(v: string) {
  const s = clean(v);
  return !s || s === "لايوجد" || s === "لا يوجد";
}

function score(input: any, doc: any) {
  let s = 0;

  const chRaw = clean(input.chassisNumber);
  const enRaw = clean(input.engineNumber);
  const plRaw = clean(input.plateNumber);

  const nat = clean(input.nationalId);
  const nm = clean(input.ownerName);

  // ✅ chassis: key OR raw
  if (chRaw && (doc.chassisKey === normKey(chRaw) || clean(doc.chassisNumber) === chRaw)) s += 100;

  // ✅ engine: key OR raw
  if (enRaw && (doc.engineKey === normKey(enRaw) || clean(doc.engineNumber) === enRaw)) s += 90;

  // ✅ plate: رقم اللوحة فقط يعطي نقاط قليلة + plateKey يعطي نقاط قوية
  if (plRaw) {
    if (doc.plateNumberKey === normKey(plRaw) || clean(doc.plateNumber) === plRaw) s += 30;

    const regionOrCountry = clean(input.plateRegion || input.plateCountry); // registry uses plateRegion, syrian uses plateCountry
    if (regionOrCountry) {
      const pk = normPlate(regionOrCountry, plRaw);
      if (doc.plateKey === pk) s += 70;
    }

    // ✅ تطابق (plateNumber + plateCountry) مفيد لسجلات syrian_vehicles
    const pc = clean(input.plateCountry);
    if (pc && clean(doc.plateCountry) === pc && clean(doc.plateNumber) === plRaw) s += 70;
  }

  // ✅ nationalId
  if (nat && nat === clean(doc.nationalId)) s += 40;

  // ✅ ownerName (ضعيف لأنه يتكرر)
  if (nm && doc.ownerNameKey && doc.ownerNameKey === normArabicName(nm)) s += 20;

  return s;
}

function toPatch(d: any) {
  return {
    ownerName: d.ownerName ?? "",
    nationalId: d.nationalId ?? "",
    phoneNumber: d.phoneNumber ?? "",
    address: d.address ?? "",

    plateNumber: d.plateNumber ?? "",
    // في السجلات السورية: plateCountry موجود. في registry غالباً plateRegion موجود.
    plateCountry: d.plateCountry ?? "SY",
    plateRegion: d.plateRegion ?? "",

    chassisNumber: d.chassisNumber ?? "",
    engineNumber: d.engineNumber ?? "",

    brand: d.brand ?? "",
    model: d.model ?? "",
    year: d.year ?? undefined,

    color: d.color ?? "",
    fuelType: d.fuelType ?? "",
    engineCapacity: d.engineCapacity ?? "",
  };
}

/**
 * GET /api/autofill
 * Query params (أي واحد منهم يكفي):
 * - chassisNumber
 * - engineNumber
 * - plateNumber (+ اختياري plateRegion أو plateCountry)
 * - nationalId
 * - ownerName
 * - excludeId (اختياري عند تعديل سجل موجود)
 */
router.get("/autofill", async (req, res) => {
  try {
    const input = {
      plateNumber: clean(req.query.plateNumber),
      plateCountry: clean(req.query.plateCountry || "SY"),
      plateRegion: clean(req.query.plateRegion),
      chassisNumber: clean(req.query.chassisNumber),
      engineNumber: clean(req.query.engineNumber),
      ownerName: clean(req.query.ownerName),
      nationalId: clean(req.query.nationalId),
      excludeId: clean(req.query.excludeId),
    };

    // تنظيف القيم عديمة الفائدة
    if (isUseless(input.nationalId)) input.nationalId = "";
    if (isUseless(input.ownerName)) input.ownerName = "";

    const or: any[] = [];

    // ✅ chassis: key + raw
    if (input.chassisNumber) {
      const raw = input.chassisNumber;
      or.push({ chassisKey: normKey(raw) });
      or.push({ chassisNumber: raw }); // <-- هذا يجعل السجلات القديمة تتطابق فوراً
    }

    // ✅ engine: key + raw
    if (input.engineNumber) {
      const raw = input.engineNumber;
      or.push({ engineKey: normKey(raw) });
      or.push({ engineNumber: raw });
    }

    // ✅ plate: رقم فقط + مع region/country + (plateNumber+plateCountry للسوري)
    if (input.plateNumber) {
      const raw = input.plateNumber;
      or.push({ plateNumberKey: normKey(raw) });
      or.push({ plateNumber: raw });

      const regionOrCountry = input.plateRegion || input.plateCountry;
      if (regionOrCountry) {
        or.push({ plateKey: normPlate(regionOrCountry, raw) });
      }

      if (input.plateCountry) {
        or.push({ plateNumber: raw, plateCountry: input.plateCountry }); // مفيد للسوري
      }
    }

    // ✅ nationalId + ownerNameKey + ownerName raw
    if (input.nationalId) or.push({ nationalId: input.nationalId });

    if (input.ownerName) {
      or.push({ ownerNameKey: normArabicName(input.ownerName) });
      or.push({ ownerName: input.ownerName }); // fallback
    }

    if (!or.length) {
      return res.json({ success: true, match: null, candidates: [] });
    }

    // 1) ابحث في سجلات المنصة الحالية (SyrianVehicle)
    const qSy: any = { $or: or };
    if (input.excludeId) qSy._id = { $ne: input.excludeId };

    const sy = await SyrianVehicle.find(qSy).limit(10).lean();

    // 2) ابحث في registry المستورد من الإكسل
    const reg = await VehicleRegistry.find({ $or: or }).limit(10).lean();

    // دمج + حساب score + تصفية score>0
    const all = [...sy, ...reg]
      .map((d: any) => ({
        d,
        s: score(input, d),
        from: d.vehicleType ? "syrian_vehicles" : "vehicle_registry",
      }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);

    const candidates = all.slice(0, 5).map((x) => ({
      from: x.from,
      score: x.s,
      preview: {
        ownerName: x.d.ownerName,
        plateNumber: x.d.plateNumber,
        plateRegion: x.d.plateRegion,
        plateCountry: x.d.plateCountry,
        chassisNumber: x.d.chassisNumber,
        engineNumber: x.d.engineNumber,
        nationalId: x.d.nationalId,
        brand: x.d.brand,
        model: x.d.model,
        year: x.d.year,
      },
      patch: toPatch(x.d),
    }));

    // ✅ شرط الأمان: لا نعمل تعبئة تلقائية إلا إذا التطابق قوي
    // - chassis (100) أو engine (90) أو plate+country/region (>=70)
    const best = all[0];
    const bestScore = best?.s ?? 0;

    const match = bestScore >= 70 ? toPatch(best.d) : null;

    return res.json({ success: true, match, candidates });
  } catch (e: any) {
    console.error("autofill error:", e);
    return res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/**
 * Endpoint مساعد للتأكد من القاعدة ووجود بيانات registry
 * GET /api/autofill/health
 */
router.get("/autofill/health", async (_req, res) => {
  const dbName = mongoose.connection?.db?.databaseName;
  const regCount = await VehicleRegistry.estimatedDocumentCount();
  const sample = await VehicleRegistry.findOne(
    {},
    { chassisNumber: 1, chassisKey: 1, engineNumber: 1, engineKey: 1, plateKey: 1, plateNumberKey: 1 }
  ).lean();

  res.json({ dbName, regCount, sample });
});

export default router;
