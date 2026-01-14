/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Authentication Types
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role?: 'admin' | 'employee';
  employeeId?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    employeeId?: string;
  };
  message?: string;
}

/**
 * Vehicle Types
 */
export interface Vehicle {
  _id?: string;
  vehicleType: 'syrian' | 'foreign';
  ownerName: string;
  nationalId: string;
  phoneNumber: string;
  address: string;
  plateNumber: string;
  chassisNumber: string;
  engineNumber?: string;
  
  // ✅ حقول جديدة للسجلات السورية
  licenseNumber?: string; // رقم الرخصة
  licenseExpiryDate?: Date; // صلاحية الرخصة
  classification?: string; // التصنيف
  vehicleCode?: string; // النوع (نوع المركبة)
  category?: string; // الفئة
  governorate?: string; // المحافظة
  
  engineCapacity?: string; // سعة المحرك
  seatsNumber?: number; // عدد الركاب
  
  brand: string; // الصانع (manufacturer)
  model: string; // الطراز
  year: number;
  color?: string;
  fuelType?: string;
  
  // ✅ خدمات
  electronicCard?: boolean; // خدمة البطاقة البلاستيكية
  rescueService?: boolean; // خدمة الإنقاذ
  
  // foreign fields
  passportNumber?: string;
  nationality?: string;
  entryDate?: Date;
  exitDate?: Date;
  customsDocument?: string;
  entryPoint?: string;
  
  policyNumber?: string;
  policyDuration?: string;
  // ✅ إزالة coverage (نوع التغطية)
  notes: string; // ✅ ملاحظات أصبحت إجبارية
  status?: 'active' | 'expired' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payment Types
 */
export interface Payment {
  _id?: string;
  vehicleId: string;
  policyNumber: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'check';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptNumber: string;
  paidBy: string;
  payerPhone?: string;
  notes?: string;
  paymentDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Addendum Types
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

export interface Addendum {
  _id?: string;
  vehicleId: string;
  vehicleModel: "SyrianVehicle" | "ForeignVehicle";
  addendumType: AddendumType;
  addendumNumber: string;
  description?: string;
  notes?: string;
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
  updatedFields?: Record<string, any>;
  issuedAt: Date | string;
  effectiveDate?: Date | string;
  status: "active" | "cancelled" | "revoked";
  createdBy?: string;
  center?: string;
  policyId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}
