import mongoose from "mongoose";

const VehicleRegistrySchema = new mongoose.Schema(
  {
    // مفاتيح فريدة من ملف الإكسل (ممتازة للـ upsert)
    legacySerial: { type: String, required: true, unique: true, index: true }, // "مفتاح تسلسلي"
    legacyKey: { type: String, default: "" }, // "المفتاح"
    contractNumber: { type: String, default: "" }, // "رقم العقد"

    // اللوحة
    plateNumber: { type: String, default: "" }, // "رق المركبة"
    plateRegion: { type: String, default: "" }, // "جنسية المركبة" مثل: 01- دمشق
    plateNumberKey: { type: String, index: true }, // تطبيع رقم اللوحة فقط
    plateKey: { type: String, index: true },       // region|plate

    // مالك
    ownerName: { type: String, default: "" },      // "اسم المؤمن له"
    ownerNameKey: { type: String, index: true },
    nationalId: { type: String, index: true, default: "" }, // "الرقم الوطني"
    phoneNumber: { type: String, default: "" }, // رقم الموبايل أو هاتفه
    address: { type: String, default: "" },     // "العنوان"

    // مركبة
    brand: { type: String, default: "" }, // "الصانع"
    model: { type: String, default: "" }, // "نوع السيارة"
    year: { type: Number },               // "سنة الصنع"
    color: { type: String, default: "" }, // "لون المركبة"
    fuelType: { type: String, default: "" }, // "نوع الوقود"
    engineCapacity: { type: String, default: "" }, // "حجم المحرك"
    enginePower: { type: String, default: "" },    // "قوة المحرك"

    chassisNumber: { type: String, default: "" }, // "رقم الهيكل"
    chassisKey: { type: String, index: true },
    engineNumber: { type: String, default: "" },  // "رقم المحرك"
    engineKey: { type: String, index: true },

    licenseNumber: { type: String, default: "" }, // "رقم الرخصة"
    licenseExpiryDate: { type: Date },            // "تاريخ انتهاء العقد"

    source: { file: String, row: Number },
  },
  { timestamps: true, collection: "vehicle_registry" }
);

export default mongoose.model("VehicleRegistry", VehicleRegistrySchema);
