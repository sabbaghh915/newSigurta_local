import { Router, Response } from "express";
import mongoose from "mongoose";
import Addendum, { AddendumType, IAddendum } from "../models/Addendum";
import SyrianVehicle from "../models/SyrianVehicle";
import ForeignVehicle from "../models/ForeignVehicle";
import { protect } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// Helper functions
const s = (v: any): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const toIntOrDefault = (v: any, def: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// ✅ GET all addendums (with filters)
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId, vehicleType, addendumType, status, from, to } = req.query;

    const filter: any = {};

    if (vehicleId && mongoose.isValidObjectId(vehicleId)) {
      filter.vehicleId = vehicleId;
    }

    if (vehicleType) {
      filter.vehicleModel = vehicleType === "syrian" ? "SyrianVehicle" : "ForeignVehicle";
    }

    if (addendumType && Object.values(AddendumType).includes(addendumType as AddendumType)) {
      filter.addendumType = addendumType;
    }

    if (status) {
      filter.status = status;
    }

    if (from || to) {
      filter.issuedAt = {};
      if (from) filter.issuedAt.$gte = new Date(from as string);
      if (to) filter.issuedAt.$lte = new Date(to as string);
    }

    // Center scope for non-admin users
    if (req.user.role !== "admin" && req.user.centerId) {
      filter.center = req.user.centerId;
    }

    const addendums = await Addendum.find(filter)
      .populate("vehicleId", "plateNumber ownerName")
      .populate("createdBy", "username fullName")
      .populate("center", "name code")
      .sort({ issuedAt: -1 })
      .lean();

    res.json({ success: true, data: addendums, count: addendums.length });
  } catch (e: any) {
    console.error("Get addendums error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

// ✅ GET addendums by vehicle ID
router.get("/vehicle/:vehicleId", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params;
    if (!mongoose.isValidObjectId(vehicleId)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
    }

    const addendums = await Addendum.find({ vehicleId })
      .populate("createdBy", "username fullName")
      .populate("center", "name code")
      .sort({ issuedAt: -1 })
      .lean();

    res.json({ success: true, data: addendums, count: addendums.length });
  } catch (e: any) {
    console.error("Get vehicle addendums error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

// ✅ GET single addendum by ID
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid addendum ID" });
    }

    const addendum = await Addendum.findById(id)
      .populate("vehicleId")
      .populate("createdBy", "username fullName")
      .populate("center", "name code")
      .lean();

    if (!addendum) {
      return res.status(404).json({ success: false, message: "Addendum not found" });
    }

    res.json({ success: true, data: addendum });
  } catch (e: any) {
    console.error("Get addendum error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

// ✅ CREATE addendum
router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId, vehicleType, addendumType, description, notes, amount, breakdown, updatedFields, effectiveDate, policyId } = req.body;

    if (!vehicleId || !mongoose.isValidObjectId(vehicleId)) {
      return res.status(400).json({ success: false, message: "Valid vehicleId is required" });
    }

    if (!addendumType || !Object.values(AddendumType).includes(addendumType)) {
      return res.status(400).json({ success: false, message: "Valid addendumType is required" });
    }

    const vType = s(vehicleType) || "syrian";
    const Model = vType === "syrian" ? SyrianVehicle : ForeignVehicle;

    // Verify vehicle exists
    const vehicle = await Model.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    // التحقق من req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Prepare addendum data
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    const addendumData: any = {
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      vehicleModel: vType === "syrian" ? "SyrianVehicle" : "ForeignVehicle",
      addendumType,
      description: s(description),
      notes: s(notes),
      issuedAt: new Date(),
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      createdBy: new mongoose.Types.ObjectId(String(userId)),
      status: "active",
    };

    // Center scope
    if (req.user.role !== "admin" && req.user.centerId) {
      addendumData.center = new mongoose.Types.ObjectId(String(req.user.centerId));
    } else if (req.body.centerId && mongoose.isValidObjectId(req.body.centerId)) {
      addendumData.center = new mongoose.Types.ObjectId(req.body.centerId);
    }

    // Financial addendum
    if (addendumType === AddendumType.FINANCIAL) {
      if (amount !== undefined) addendumData.amount = toIntOrDefault(amount, 0);
      if (breakdown) {
        addendumData.breakdown = {
          netPremium: toIntOrDefault(breakdown.netPremium, 0),
          stampFee: toIntOrDefault(breakdown.stampFee, 0),
          warEffort: toIntOrDefault(breakdown.warEffort, 0),
          martyrFund: toIntOrDefault(breakdown.martyrFund, 0),
          localAdministration: toIntOrDefault(breakdown.localAdministration, 0),
          reconstruction: toIntOrDefault(breakdown.reconstruction, 0),
          total: toIntOrDefault(breakdown.total, amount || 0),
        };
      }
    }

    // Info update addendum
    if (addendumType === AddendumType.INFO_UPDATE && updatedFields) {
      addendumData.updatedFields = updatedFields;
    }

    // Policy reference
    if (policyId && mongoose.isValidObjectId(policyId)) {
      addendumData.policyId = new mongoose.Types.ObjectId(policyId);
    }

    // توليد رقم الملحق قبل الحفظ
    if (!addendumData.addendumNumber) {
      const prefix = "ADD";
      const year = new Date().getFullYear();
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);
      
      const count = await Addendum.countDocuments({
        issuedAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      });
      
      addendumData.addendumNumber = `${prefix}-${year}-${String(count + 1).padStart(6, "0")}`;
    }

    // Auto-generate addendum number (handled by pre-save hook)
    const addendum = await Addendum.create(addendumData);

    // Populate للعودة ببيانات كاملة
    const populated = await Addendum.findById(addendum._id)
      .populate("vehicleId", "plateNumber ownerName")
      .populate("createdBy", "username fullName")
      .populate("center", "name code")
      .lean();

    res.status(201).json({ success: true, data: populated || addendum });
  } catch (e: any) {
    console.error("Create addendum error:", e);
    // إرجاع رسالة خطأ أكثر تفصيلاً
    const errorMessage = e.message || "Server error";
    if (e.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ success: false, message: "رقم الملحق موجود مسبقاً" });
    }
    res.status(500).json({ success: false, message: errorMessage, details: process.env.NODE_ENV === "development" ? e.stack : undefined });
  }
});

// ✅ UPDATE addendum
router.put("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid addendum ID" });
    }

    const addendum = await Addendum.findById(id);
    if (!addendum) {
      return res.status(404).json({ success: false, message: "Addendum not found" });
    }

    // Only admin or creator can update
    if (req.user.role !== "admin" && String(addendum.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this addendum" });
    }

    // Update allowed fields
    if (req.body.description !== undefined) addendum.description = s(req.body.description);
    if (req.body.notes !== undefined) addendum.notes = s(req.body.notes);
    if (req.body.status && ["active", "cancelled", "revoked"].includes(req.body.status)) {
      addendum.status = req.body.status;
    }
    if (req.body.effectiveDate) addendum.effectiveDate = new Date(req.body.effectiveDate);
    if (req.body.amount !== undefined) addendum.amount = toIntOrDefault(req.body.amount, 0);
    if (req.body.breakdown) {
      addendum.breakdown = {
        netPremium: toIntOrDefault(req.body.breakdown.netPremium, 0),
        stampFee: toIntOrDefault(req.body.breakdown.stampFee, 0),
        warEffort: toIntOrDefault(req.body.breakdown.warEffort, 0),
        martyrFund: toIntOrDefault(req.body.breakdown.martyrFund, 0),
        localAdministration: toIntOrDefault(req.body.breakdown.localAdministration, 0),
        reconstruction: toIntOrDefault(req.body.breakdown.reconstruction, 0),
        total: toIntOrDefault(req.body.breakdown.total, addendum.amount || 0),
      };
    }
    if (req.body.updatedFields) addendum.updatedFields = req.body.updatedFields;

    await addendum.save();

    res.json({ success: true, data: addendum });
  } catch (e: any) {
    console.error("Update addendum error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

// ✅ DELETE addendum (soft delete by setting status to cancelled)
router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid addendum ID" });
    }

    const addendum = await Addendum.findById(id);
    if (!addendum) {
      return res.status(404).json({ success: false, message: "Addendum not found" });
    }

    // Only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can delete addendums" });
    }

    addendum.status = "cancelled";
    await addendum.save();

    res.json({ success: true, message: "Addendum cancelled successfully" });
  } catch (e: any) {
    console.error("Delete addendum error:", e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
});

export default router;
