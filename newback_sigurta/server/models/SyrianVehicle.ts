import mongoose, { Schema } from "mongoose";
import { normArabicName, normKey, normPlate } from "../utils/normalize";

const QuoteSchema = new Schema(
  {
    netPremium: { type: Number, default: 0 },
    stampFee: { type: Number, default: 0 },
    warEffort: { type: Number, default: 0 },
    martyrFund: { type: Number, default: 0 },
    localAdministration: { type: Number, default: 0 },
    reconstruction: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const PricingSchema = new Schema(
  {
    insuranceType: { type: String, enum: ["internal", "border"] },
    vehicleCode: { type: String, default: "" },
    category: { type: String, default: "" },
    classification: { type: String, default: "0" },
    months: { type: Number, default: 12 },
    borderVehicleType: { type: String, default: "" },
    quote: { type: QuoteSchema, default: () => ({}) },
  },
  { _id: false }
);

const SyrianVehicleSchema = new Schema(
  {
    vehicleType: { type: String, default: "syrian" },

    ownerName: { type: String, required: true },
    nationalId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },

    plateNumber: { type: String, required: true },
    plateCountry: { type: String, default: "SY" },

    // ✅ حقول جديدة للسجلات السورية
    licenseNumber: { type: String, trim: true }, // رقم الرخصة
    licenseExpiryDate: { type: Date }, // صلاحية الرخصة (تاريخ نهاية التأمين)
    classification: { type: String, trim: true, default: "0" }, // التصنيف
    vehicleCode: { type: String, trim: true }, // النوع (نوع المركبة)
    category: { type: String, trim: true }, // الفئة
    governorate: { type: String, trim: true, default: "" },

    chassisNumber: { type: String, required: true },
    engineNumber: { type: String },
    engineCapacity: { type: String, trim: true, default: "" },
    seatsNumber: { type: Number, min: 1, max: 60, default: undefined },

    brand: { type: String, required: true }, // الصانع (manufacturer)
    model: { type: String, required: true }, // الطراز
    year: { type: Number, required: true },

    color: { type: String },
    fuelType: { type: String },

    // ✅ خدمات
    electronicCard: { type: Boolean, default: true }, // خدمة البطاقة البلاستيكية (مفعلة تلقائياً)
    rescueService: { type: Boolean, default: false }, // خدمة الإنقاذ

    policyDuration: { type: String },
    // ✅ إزالة coverage (نوع التغطية)
    notes: { type: String, required: true }, // ✅ ملاحظات أصبحت إجبارية

    pricing: { type: PricingSchema, required: true },

    plateKey: { type: String, index: true },      // مشتقة من plateCountry + plateNumber
    chassisKey: { type: String, index: true },    // مشتقة من chassisNumber
    engineKey: { type: String, index: true },     // مشتقة من engineNumber
    ownerNameKey: { type: String, index: true },  // مشتقة من ownerName



    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
  },
  { timestamps: true, collection: "syrian_vehicles" }
);

SyrianVehicleSchema.index({ plateNumber: 1, plateCountry: 1 }, { unique: true });

SyrianVehicleSchema.pre("validate", function (this: any, next: (err?: any) => void) {
  this.plateKey = normPlate(this.plateCountry, this.plateNumber);
  this.chassisKey = normKey(this.chassisNumber);
  this.engineKey = normKey(this.engineNumber);
  this.ownerNameKey = normArabicName(this.ownerName);
  if (typeof next === "function") next();
});

SyrianVehicleSchema.index({ chassisKey: 1 });
SyrianVehicleSchema.index({ engineKey: 1 });
SyrianVehicleSchema.index({ nationalId: 1 });
SyrianVehicleSchema.index({ ownerNameKey: 1 });



export default mongoose.model("SyrianVehicle", SyrianVehicleSchema);
