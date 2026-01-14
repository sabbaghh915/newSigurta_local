import { Router, Response } from "express";
import mongoose from "mongoose";
import SyrianVehicle from "../models/SyrianVehicle";
import ForeignVehicle from "../models/ForeignVehicle";
import { protect, AuthRequest } from "../middleware/auth";
import { upsertRecordFromVehicle } from "../utils/recordsSync";

const router = Router();

function s(v: any) {
  return String(v ?? "").trim();
}

function toIntOrUndef(v: any): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toIntOrDefault(v: any, def: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}


const pickModel = (vehicleType?: string) => {
  return vehicleType === "foreign" ? ForeignVehicle : SyrianVehicle;
};

// CREATE (or UPSERT)
router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const vehicleType = s(req.body.vehicleType) || "syrian";
    const Model = pickModel(vehicleType);

    // ✅ تجهيز pricing إذا غير موجود (حتى لا يفشل validation)
    if (!req.body.pricing) {
      const pIn = req.body.pricingInput || req.body.pricing || {};
      req.body.pricing = {
        insuranceType: pIn.insuranceType || "internal",
        vehicleCode: pIn.vehicleCode || vehicleType || "04",
        category: pIn.category || "01",
        classification: String(pIn.classification ?? "0"),
        months: Number(pIn.months ?? 12),
        borderVehicleType: pIn.borderVehicleType || "",
        quote: pIn.quote || req.body.quote || req.body.breakdown || { total: req.body.amount || 0 },
      };
    }

    // ✅ Center scope
    if (req.user.role !== "admin") {
      req.body.centerId = req.user.centerId;
    }

    // ✅ Normalize + Required fields
    const plateNumber = s(req.body.plateNumber);
    const plateCountry = s(req.body.plateCountry || (vehicleType === "foreign" ? "" : "SY"));

    if (!plateNumber || !plateCountry) {
      return res.status(400).json({ success: false, message: "plateNumber و plateCountry مطلوبة" });
    }

    // ✅ حقول مطلوبة للسوري حسب الفرونت
    if (vehicleType !== "foreign") {
      const ownerName = s(req.body.ownerName);
      const nationalId = s(req.body.nationalId);
      const phoneNumber = s(req.body.phoneNumber);
      const governorate = s(req.body.governorate);
      const address = s(req.body.address);

      const chassisNumber = s(req.body.chassisNumber);
      const brand = req.body.brand; // قد يكون ObjectId أو String
      const model = s(req.body.model);
      const yearNum = toIntOrDefault(req.body.year, new Date().getFullYear());

      if (!chassisNumber || !brand || !model || !yearNum) {
        return res.status(400).json({
          success: false,
          message: "حقول المركبة المطلوبة ناقصة: chassisNumber / brand / model / year",
        });
      }

      if (!ownerName || !nationalId || !phoneNumber || !governorate || !address) {
        return res.status(400).json({
          success: false,
          message: "حقول المالك المطلوبة ناقصة: ownerName / nationalId / phoneNumber / governorate / address",
        });
      }

      // (اختياري) رقم وطني 11 رقم
      if (nationalId.length !== 11) {
        return res.status(400).json({ success: false, message: "nationalId يجب أن يكون 11 رقم" });
      }

      // ✅ تحويلات الأنواع (مهم جداً)
      req.body.year = yearNum;

      const seats = toIntOrUndef(req.body.seatsNumber);
      if (seats !== undefined && (seats < 1 || seats > 60)) {
        return res.status(400).json({ success: false, message: "seatsNumber يجب أن تكون بين 1 و 60" });
      }
      req.body.seatsNumber = seats;

      // ✅ تنظيف نصوص الحقول الجديدة
      req.body.governorate = governorate;
      req.body.address = address;
      req.body.engineCapacity = s(req.body.engineCapacity);

      // ✅ الحقول الجديدة للسجلات السورية
      req.body.licenseNumber = s(req.body.licenseNumber);
      req.body.licenseExpiryDate = req.body.licenseExpiryDate ? new Date(req.body.licenseExpiryDate) : undefined;
      req.body.classification = s(req.body.classification) || "0";
      req.body.vehicleCode = s(req.body.vehicleCode);
      req.body.category = s(req.body.category);
      
      // ✅ الخدمات
      req.body.electronicCard = req.body.electronicCard !== undefined ? Boolean(req.body.electronicCard) : true; // default true
      req.body.rescueService = req.body.rescueService !== undefined ? Boolean(req.body.rescueService) : false;
      
      // ✅ ملاحظات إجبارية
      if (!req.body.notes || !s(req.body.notes)) {
        return res.status(400).json({
          success: false,
          message: "حقل الملاحظات مطلوب",
        });
      }
      req.body.notes = s(req.body.notes);
      
      // ✅ إزالة coverage إذا تم إرساله (لم يعد موجوداً)
      if (req.body.coverage !== undefined) {
        delete req.body.coverage;
      }
    } else {
      // ✅ للـ foreign: على الأقل plateNumber/plateCountry موجودين
      // إذا عندك حقول إضافية للأجنبي ضيفها هنا
      req.body.year = toIntOrDefault(req.body.year, new Date().getFullYear());
      const seats = toIntOrUndef(req.body.seatsNumber);
      req.body.seatsNumber = seats;
      req.body.engineCapacity = s(req.body.engineCapacity);
      req.body.governorate = s(req.body.governorate);
      req.body.address = s(req.body.address);
    }

    const filter = { plateNumber, plateCountry };

    const vehicle = await Model.findOneAndUpdate(
      filter,
      {
        $set: {
          ...req.body,
          plateNumber,
          plateCountry,
          pricing: req.body.pricing ?? { months: 12, quote: {} },
        },
        $setOnInsert: {
          createdBy: req.user.id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    const recordModel: "SyrianVehicle" | "ForeignVehicle" =
      String(Model.modelName).toLowerCase().includes("foreign") ? "ForeignVehicle" : "SyrianVehicle";

    await upsertRecordFromVehicle(recordModel, vehicle);

    return res.status(200).json({ success: true, data: vehicle, upserted: true });
  } catch (e: any) {
    console.error("Create vehicle error:", e);
    return res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});



// LIST
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleType, status, search } = req.query as any;

    const buildQuery = () => {
      const q: any = {};
      if (status) q.status = status;

      if (search) {
        q.$or = [
          { plateNumber: { $regex: search, $options: "i" } },
          { ownerName: { $regex: search, $options: "i" } },
          { nationalId: { $regex: search, $options: "i" } },
        ];
      }
      return q;
    };

    const q = buildQuery();

    if (vehicleType === "foreign") {
      const items = await ForeignVehicle.find(q).populate("createdBy", "username fullName").sort({ createdAt: -1 });
      return res.json({ success: true, count: items.length, data: items });
    }

    if (vehicleType === "syrian") {
      const items = await SyrianVehicle.find(q).populate("createdBy", "username fullName").sort({ createdAt: -1 });
      return res.json({ success: true, count: items.length, data: items });
    }

    // بدون فلتر: رجّع الاثنين مع بعض
    const [sy, fr] = await Promise.all([
      SyrianVehicle.find(q).populate("createdBy", "username fullName"),
      ForeignVehicle.find(q).populate("createdBy", "username fullName"),
    ]);

    const merged = [...sy, ...fr].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ success: true, count: merged.length, data: merged });
  } catch (e: any) {
    console.error("Get vehicles error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

// GET BY ID (يحاول بالـ Syrian ثم Foreign)
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle id" });
    }

    let vehicle = await SyrianVehicle.findById(id).populate("createdBy", "username fullName");
    if (!vehicle) vehicle = await ForeignVehicle.findById(id).populate("createdBy", "username fullName");

    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    res.json({ success: true, data: vehicle });
  } catch (e: any) {
    console.error("Get vehicle error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

// UPDATE
router.put("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid vehicle id" });

    // ✅ تحويلات قبل التحديث
    if (req.body.year !== undefined) req.body.year = toIntOrDefault(req.body.year, new Date().getFullYear());
    if (req.body.seatsNumber !== undefined) req.body.seatsNumber = toIntOrUndef(req.body.seatsNumber);
    if (req.body.engineCapacity !== undefined) req.body.engineCapacity = s(req.body.engineCapacity);
    if (req.body.governorate !== undefined) req.body.governorate = s(req.body.governorate);
    if (req.body.address !== undefined) req.body.address = s(req.body.address);

    let updated = await SyrianVehicle.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) updated = await ForeignVehicle.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) return res.status(404).json({ success: false, message: "Vehicle not found" });

    res.json({ success: true, data: updated });
  } catch (e: any) {
    console.error("Update vehicle error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});


// DELETE
router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid vehicle id" });

    const sy = await SyrianVehicle.findById(id);
    if (sy) {
      await sy.deleteOne();
      return res.json({ success: true, data: {} });
    }

    const fr = await ForeignVehicle.findById(id);
    if (fr) {
      await fr.deleteOne();
      return res.json({ success: true, data: {} });
    }

    res.status(404).json({ success: false, message: "Vehicle not found" });
  } catch (e: any) {
    console.error("Delete vehicle error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

export default router;
