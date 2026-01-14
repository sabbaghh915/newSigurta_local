import mongoose, { Schema, Document } from "mongoose";

/**
 * ✅ أنواع الملاحق المتاحة
 */
export enum AddendumType {
  COPY = "copy", // ملحق صورة طبق الأصل
  INFO_UPDATE = "info_update", // ملحق تعديل معلومات
  FINANCIAL = "financial", // ملحق مالي
  STAMP_PAYMENT = "stamp_payment", // ملحق إستيفاء طابع
  CORRECTION = "correction", // ملحق تصحيح
  ADMIN_CANCELLATION = "admin_cancellation", // ملحق إلغاء إداري
  FULL_CANCELLATION = "full_cancellation", // ملحق إلغاء تام
  REVOKE_ADMIN_CANCELLATION = "revoke_admin_cancellation", // إلغاء ملحق الإلغاء الإداري
}

/**
 * ✅ Addendum Document Interface
 */
export interface IAddendum extends Document {
  vehicleId: mongoose.Types.ObjectId;
  vehicleModel: "SyrianVehicle" | "ForeignVehicle";
  
  addendumType: AddendumType;
  addendumNumber: string; // رقم الملحق
  
  // بيانات الملحق
  description?: string; // وصف الملحق
  notes?: string; // ملاحظات
  
  // بيانات مالية (للملحق المالي)
  amount?: number;
  breakdown?: {
    netPremium?: number;
    stampFee?: number;
    warEffort?: number;
    martyrFund?: number;
    localAdministration?: number;
    reconstruction?: number;
    total?: number;
  };
  
  // بيانات التعديل (لملحق تعديل المعلومات)
  updatedFields?: Record<string, any>; // الحقول المعدلة
  
  // تاريخ الإصدار
  issuedAt: Date;
  effectiveDate?: Date; // تاريخ السريان
  
  // حالة الملحق
  status: "active" | "cancelled" | "revoked";
  
  // من أصدر الملحق
  createdBy: mongoose.Types.ObjectId;
  center?: mongoose.Types.ObjectId;
  
  // مرجع للبوليصة الأصلية
  policyId?: mongoose.Types.ObjectId; // ID من جدول Payment أو MandatoryPolicy
  
  createdAt: Date;
  updatedAt: Date;
}

const AddendumSchema = new Schema<IAddendum>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "vehicleModel",
    },
    vehicleModel: {
      type: String,
      enum: ["SyrianVehicle", "ForeignVehicle"],
      required: true,
    },
    
    addendumType: {
      type: String,
      enum: Object.values(AddendumType),
      required: true,
    },
    addendumNumber: {
      type: String,
      required: false, // ✅ سيتم توليده تلقائياً في pre-save hook
      trim: true,
      unique: true,
      index: true,
    },
    
    description: { type: String, trim: true },
    notes: { type: String, trim: true },
    
    amount: { type: Number },
    breakdown: {
      netPremium: { type: Number, default: 0 },
      stampFee: { type: Number, default: 0 },
      warEffort: { type: Number, default: 0 },
      martyrFund: { type: Number, default: 0 },
      localAdministration: { type: Number, default: 0 },
      reconstruction: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    
    updatedFields: { type: Schema.Types.Mixed, default: {} },
    
    issuedAt: { type: Date, required: true, default: Date.now },
    effectiveDate: { type: Date },
    
    status: {
      type: String,
      enum: ["active", "cancelled", "revoked"],
      default: "active",
    },
    
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    center: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      default: null,
    },
    
    policyId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true, validateBeforeSave: true }
);

// ✅ Indexes
AddendumSchema.index({ vehicleId: 1, vehicleModel: 1 });
AddendumSchema.index({ addendumNumber: 1 });
AddendumSchema.index({ addendumType: 1 });
AddendumSchema.index({ status: 1 });
AddendumSchema.index({ issuedAt: -1 });
AddendumSchema.index({ createdBy: 1 });

// ✅ Auto-generate addendum number if not provided
// يتم توليد الرقم في الـ route قبل create() لضمان وجوده
// لا حاجة لـ pre-save hook لأننا نولد الرقم مباشرة في الـ route

export default mongoose.models.Addendum || mongoose.model<IAddendum>("Addendum", AddendumSchema);
