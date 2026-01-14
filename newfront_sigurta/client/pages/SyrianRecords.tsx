import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Car,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  Plus,
  Home,
  Globe,
  Pencil,
  Trash2,
  Loader2,
  Bookmark,
  Building2,
  DollarSign,
  ChevronDown,
  Palette,
  User,
  FileCheck,
} from "lucide-react";
import { SYRIAN_GOVERNORATES, CLASSIFICATIONS, INSURANCE_CATEGORIES } from "@/constants/insuranceOptions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Addendum {
  _id?: string;
  addendumType: string;
  addendumNumber: string;
  description?: string;
  notes?: string;
  amount?: number;
  issuedAt: string;
  effectiveDate?: string;
  status: "active" | "cancelled" | "revoked";
}

interface SyrianPolicyRecord {
  id: string;
  /** ✅ id الخاص بسجل الدفعة/البوليصة (إن وجد) لاستخدامه في PDF */
  policyId?: string;
  policyNumber: string;
  receiptNumber?: string;
  ownerName: string;
  nationalId: string;
  plateNumber: string;
  licenseNumber?: string; // رقم الرخصة
  licenseExpiryDate?: string; // صلاحية الرخصة
  classification?: string; // التصنيف
  vehicleCode?: string; // النوع (نوع المركبة)
  category?: string; // الفئة
  brand: string; // الصانع (manufacturer)
  model: string; // الطراز
  year: string;
  color?: string;
  chassisNumber?: string; // رقم الهيكل
  engineNumber?: string; // رقم المحرك
  governorate?: string; // المحافظة
  startDate: string;
  endDate: string;
  premium: number;
  paymentStatus?: string;
  paymentMethod?: string;
  paidBy?: string;
  payerPhone?: string;
  center?: string;
  insuranceCompany?: string;
  status: "active" | "expired" | "cancelled";
  createdAt: string;
  vehicleType: "syrian";
  addendums?: Addendum[]; // الملاحق
}

// ✅ API helper (يدعم VITE_API_URL + JWT)
const API_BASE_URL = (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "http://localhost:3000/api";

async function apiGet<T>(path: string): Promise<T> {
  const token =
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken") ||
  sessionStorage.getItem("token") ||
  sessionStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(token ? { "x-auth-token": token } : {}),
  },
   credentials: "omit",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data as T;
}

async function apiGetFirst<T>(paths: string[]): Promise<T> {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      return await apiGet<T>(p);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No endpoint matched");
}

// ✅ Payments normalization (مثل صفحة AdminPayments)
type PaymentDoc = {
  _id?: string;
  vehicleModel?: string;
  vehicleId?: string;
  policyNumber?: string;
  receiptNumber?: string;
  amount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paidBy?: string;
  payerPhone?: string;
  center?: any;
  insuranceCompany?: any;
  processedBy?: any;
  issuedAt?: string;
  policyStartAt?: string;
  policyEndAt?: string;
  pricingInput?: any;
  breakdown?: any;
  paymentDate?: string;
  createdAt?: string;
};

const extractArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.payments)) return res.payments;
  return [];
};

const oid = (v: any) => (typeof v === "string" ? v : v?.$oid ? String(v.$oid) : undefined);
const dt = (v: any) => (typeof v === "string" ? v : v?.$date ? new Date(v.$date).toISOString() : undefined);

const normalizePayment = (raw: any): PaymentDoc => {
  if (!raw || typeof raw !== "object") return {};
  return {
    _id: oid(raw._id) || raw._id || raw.id,
    vehicleModel: raw.vehicleModel,
    vehicleId: oid(raw.vehicleId) || raw.vehicleId,
    policyNumber: raw.policyNumber,
    receiptNumber: raw.receiptNumber ?? raw.reference,
    amount: raw.amount ?? raw.total ?? raw.breakdown?.total,
    paymentMethod: raw.paymentMethod ?? raw.method,
    paymentStatus: raw.paymentStatus ?? raw.status,
    paidBy: raw.paidBy,
    payerPhone: raw.payerPhone,
    center: raw.center,
    insuranceCompany: raw.insuranceCompany,
    processedBy: raw.processedBy,
    issuedAt: dt(raw.issuedAt) ?? raw.issuedAt,
    policyStartAt: dt(raw.policyStartAt) ?? raw.policyStartAt,
    policyEndAt: dt(raw.policyEndAt) ?? raw.policyEndAt,
    pricingInput: raw.pricingInput,
    breakdown: raw.breakdown,
    paymentDate: dt(raw.paymentDate) ?? raw.paymentDate,
    createdAt: dt(raw.createdAt) ?? raw.createdAt,
  };
};

const displayRef = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  const name = v?.name || v?.title || v?.code;
  const id = oid(v?._id) || v?._id || v?.id;
  return String(name || id || "");
};

const shortId = (s?: string) => {
  if (!s) return "—";
  return s.length > 18 ? `${s.slice(0, 10)}…${s.slice(-4)}` : s;
};

export default function SyrianRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<SyrianPolicyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SyrianPolicyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SyrianPolicyRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Addendum dialog state
  const [addendumDialogOpen, setAddendumDialogOpen] = useState(false);
  const [vehicleIdInput, setVehicleIdInput] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const { vehicleApi } = await import("../services/api");

        // ✅ حاول جلب الدفعات/البوليصات والملاحق من السيرفر
        const token = localStorage.getItem("authToken");
        const [vehiclesRes, paymentsRes, addendumsRes] = await Promise.all([
          vehicleApi.getAll({ vehicleType: "syrian" }),
          apiGetFirst<any>(["/payments", "/payments/list", "/admin/payments"]).catch(() => ({ data: [] })),
          fetch("/api/addendums?vehicleType=syrian", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
            .then((r) => {
              if (!r.ok) return { success: false, data: [] };
              return r.json();
            })
            .then((d) => (d.success ? d.data || [] : []))
            .catch(() => []),
        ]);

        const vehicles = Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [];
        const payments = extractArray(paymentsRes).map(normalizePayment);
        const addendums = Array.isArray(addendumsRes) ? addendumsRes : [];

        // ✅ خريطة: الملاحق لكل مركبة
        const addendumsByVehicle = new Map<string, Addendum[]>();
        for (const addendum of addendums) {
          const vid = String(addendum.vehicleId || "");
          if (!vid) continue;
          if (!addendumsByVehicle.has(vid)) {
            addendumsByVehicle.set(vid, []);
          }
          addendumsByVehicle.get(vid)!.push(addendum);
        }

        // ✅ خريطة: آخر دفعة لكل مركبة سورية
        const latestByVehicle = new Map<string, PaymentDoc>();
        const latestTs = new Map<string, number>();
        for (const p of payments) {
          const vid = p.vehicleId;
          if (!vid) continue;
          const isSyrian = /syrian/i.test(String(p.vehicleModel || ""));
          if (!isSyrian) continue;
          const t = new Date(p.createdAt || p.paymentDate || p.issuedAt || 0).getTime();
          const prev = latestTs.get(vid) ?? -1;
          if (t >= prev) {
            latestByVehicle.set(vid, p);
            latestTs.set(vid, t);
          }
        }

        const transformedRecords: SyrianPolicyRecord[] = vehicles.map((vehicle: any) => {
          const vehicleId = String(vehicle?._id || "");
          const pay = latestByVehicle.get(vehicleId);

          const createdAtIso = vehicle?.createdAt || pay?.createdAt || pay?.paymentDate || new Date().toISOString();

          const startRaw = pay?.policyStartAt || vehicle?.startDate || pay?.issuedAt || vehicle?.createdAt;
          const endRaw = pay?.policyEndAt || vehicle?.endDate;

          const startDate = startRaw ? new Date(startRaw).toISOString().split("T")[0] : "";
          const endDate = endRaw
            ? new Date(endRaw).toISOString().split("T")[0]
            : startRaw
            ? new Date(new Date(startRaw).setFullYear(new Date(startRaw).getFullYear() + 1)).toISOString().split("T")[0]
            : "";

          // ✅ الحالة: أولوية لتواريخ البوليصة
          let status: "active" | "expired" | "cancelled" = vehicle?.status || "active";
          if (status !== "cancelled" && endDate) {
            status = new Date(endDate) < new Date() ? "expired" : "active";
          }

          const premium =
            (typeof pay?.amount === "number" ? pay.amount : undefined) ??
            (typeof pay?.breakdown?.total === "number" ? pay.breakdown.total : undefined) ??
            (vehicle?.insurance?.total ?? vehicle?.insuranceTotal ?? vehicle?.premium ?? 0);

          const coverage =
            pay?.pricingInput?.insuranceType || vehicle?.coverage || (vehicle?.insuranceType ? String(vehicle.insuranceType) : "third-party");

          const color = vehicle?.color?.name || vehicle?.colorName || vehicle?.color || vehicle?.carColor?.name || "";
          const manufacturer = vehicle?.manufacturer || vehicle?.manufacturerName || vehicle?.make?.manufacturer || vehicle?.maker || vehicle?.producer || vehicle?.brand || "";
          const centerDisp = displayRef(pay?.center || vehicle?.center);
          const companyDisp = displayRef(pay?.insuranceCompany || vehicle?.insuranceCompany);

          return {
            id: vehicleId,
            policyId: pay?._id || vehicleId,
            policyNumber: pay?.policyNumber || vehicle?.policyNumber || "N/A",
            receiptNumber: pay?.receiptNumber,
            ownerName: vehicle?.ownerName || "",
            nationalId: vehicle?.nationalId || "",
            plateNumber: vehicle?.plateNumber || "",
            licenseNumber: vehicle?.licenseNumber || "",
            licenseExpiryDate: vehicle?.licenseExpiryDate || "",
            classification: vehicle?.classification || "",
            vehicleCode: vehicle?.vehicleCode || "",
            category: vehicle?.category || "",
            brand: vehicle?.brand || manufacturer || "",
            model: vehicle?.model || "",
            addendums: addendumsByVehicle.get(vehicleId) || [],
            year: vehicle?.year?.toString?.() || "",
            color,
            chassisNumber: vehicle?.chassisNumber || "",
            engineNumber: vehicle?.engineNumber || "",
            governorate: vehicle?.governorate || "",
            startDate,
            endDate,
            premium: Number(premium || 0),
            paymentStatus: pay?.paymentStatus,
            paymentMethod: pay?.paymentMethod,
            paidBy: pay?.paidBy,
            payerPhone: pay?.payerPhone,
            center: centerDisp,
            insuranceCompany: companyDisp,
            status,
            createdAt: createdAtIso,
            vehicleType: "syrian",
          };
        });

        // ✅ الأحدث أولاً
        transformedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setRecords(transformedRecords);
        setFilteredRecords(transformedRecords);
      } catch (error) {
        console.error("Error loading records:", error);
        setRecords([]);
        setFilteredRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    // Search (case-insensitive)
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((r) => {
        const owner = (r.ownerName || "").toLowerCase();
        const pol = (r.policyNumber || "").toLowerCase();
        const rcp = (r.receiptNumber || "").toLowerCase();
        const plate = (r.plateNumber || "").toLowerCase();
        const nid = (r.nationalId || "").toLowerCase();
        const licenseNum = (r.licenseNumber || "").toLowerCase();
        const chassis = (r.chassisNumber || "").toLowerCase();
        const engine = (r.engineNumber || "").toLowerCase();
        const brandModel = ((r.brand || "") + " " + (r.model || "")).toLowerCase();
        return (
          owner.includes(term) ||
          pol.includes(term) ||
          rcp.includes(term) ||
          plate.includes(term) ||
          nid.includes(term) ||
          licenseNum.includes(term) ||
          chassis.includes(term) ||
          engine.includes(term) ||
          brandModel.includes(term)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter((r) => {
        const recordDate = new Date(r.createdAt);
        switch (dateFilter) {
          case "today":
            return recordDate.toDateString() === today.toDateString();
          case "week": {
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return recordDate >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            return recordDate >= monthAgo;
          }
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [records, searchTerm, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = records.length;
    const active = records.filter((r) => r.status === "active").length;
    const expired = records.filter((r) => r.status === "expired").length;
    const totalPremium = records.reduce((sum, r) => sum + (r.premium || 0), 0);
    return { total, active, expired, totalPremium };
  }, [records]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "ساري المفعول", variant: "default" as const },
      expired: { label: "منتهي الصلاحية", variant: "destructive" as const },
      cancelled: { label: "ملغي", variant: "secondary" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (st?: string) => {
    const s = String(st || "").toLowerCase();
    if (!s) return <Badge variant="outline">—</Badge>;
    const map: Record<string, { label: string; variant: any }> = {
      completed: { label: "مكتمل", variant: "default" },
      paid: { label: "مدفوع", variant: "default" },
      pending: { label: "معلق", variant: "secondary" },
      unpaid: { label: "غير مدفوع", variant: "secondary" },
      failed: { label: "فشل", variant: "destructive" },
      cancelled: { label: "ملغي", variant: "destructive" },
    };
    const cfg = map[s] || { label: st || "—", variant: "outline" };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const getClassificationLabel = (classification?: string) => {
    if (!classification) return "—";
    const matched = CLASSIFICATIONS.find((c) => c.value === classification);
    return matched?.label || classification;
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return "—";
    const matched = INSURANCE_CATEGORIES.find((c) => c.value === category);
    return matched?.label || category;
  };

  const getGovernorateLabel = (governorate?: string) => {
    if (!governorate) return "—";
    if (governorate === "syrian") return "سورية";
    const matched = SYRIAN_GOVERNORATES.find((g) => g.value === governorate);
    return matched?.label || governorate;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ar-SY", { style: "currency", currency: "SYP", minimumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (dateString: string) => (dateString ? new Date(dateString).toLocaleDateString("ar-SY") : "-");

  // ✅ Export to Excel
  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    try {
      // تحضير البيانات للتصدير
      const excelData = filteredRecords.map((record, index) => ({
        "الرقم": index + 1,
        "رقم البوليصة": record.policyNumber || "—",
        "رقم الإيصال": record.receiptNumber || "—",
        "القسط": record.premium || 0,
        "حالة الدفع": record.paymentStatus === "completed" || record.paymentStatus === "paid" ? "مدفوع" : record.paymentStatus === "pending" ? "معلق" : record.paymentStatus === "unpaid" ? "غير مدفوع" : record.paymentStatus || "—",
        "طريقة الدفع": record.paymentMethod || "—",
        "الدافع": record.paidBy || "—",
        "الهاتف": record.payerPhone || "—",
        "المركز": record.center || "—",
        "شركة التأمين": record.insuranceCompany || "—",
        "المؤمن له": record.ownerName || "—",
        "الرقم الوطني": record.nationalId || "—",
        "المحافظة": getGovernorateLabel(record.governorate),
        "رقم الرخصة": record.licenseNumber || "—",
        "صلاحية الرخصة": record.licenseExpiryDate ? formatDate(record.licenseExpiryDate) : "—",
        "التصنيف": getClassificationLabel(record.classification),
        "النوع": record.vehicleCode || "—",
        "الفئة": getCategoryLabel(record.category),
        "الصانع": record.brand || "—",
        "الطراز": record.model || "—",
        "سنة الصنع": record.year || "—",
        "اللون": record.color || "—",
        "رقم اللوحة": record.plateNumber || "—",
        "رقم الهيكل": record.chassisNumber || "—",
        "رقم المحرك": record.engineNumber || "—",
        "تاريخ البداية": formatDate(record.startDate),
        "تاريخ الانتهاء": formatDate(record.endDate),
        "الملاحق": record.addendums && record.addendums.length > 0 
          ? record.addendums.map(a => 
              a.addendumType === "copy" ? "صورة" :
              a.addendumType === "info_update" ? "تعديل" :
              a.addendumType === "financial" ? "مالي" :
              a.addendumType === "stamp_payment" ? "طابع" :
              a.addendumType === "correction" ? "تصحيح" :
              a.addendumType === "admin_cancellation" ? "إلغاء إداري" :
              a.addendumType === "full_cancellation" ? "إلغاء تام" :
              a.addendumType === "revoke_admin_cancellation" ? "إلغاء إلغاء" :
              a.addendumType
            ).join(", ")
          : "—",
        "الحالة": record.status === "active" ? "ساري المفعول" : record.status === "expired" ? "منتهي الصلاحية" : record.status === "cancelled" ? "ملغي" : "—",
      }));

      // إنشاء workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // تعديل عرض الأعمدة
      const colWidths = [
        { wch: 6 },  // الرقم
        { wch: 15 }, // رقم البوليصة
        { wch: 15 }, // رقم الإيصال
        { wch: 12 }, // القسط
        { wch: 12 }, // حالة الدفع
        { wch: 12 }, // طريقة الدفع
        { wch: 15 }, // الدافع
        { wch: 12 }, // الهاتف
        { wch: 15 }, // المركز
        { wch: 15 }, // شركة التأمين
        { wch: 20 }, // المؤمن له
        { wch: 15 }, // الرقم الوطني
        { wch: 12 }, // المحافظة
        { wch: 15 }, // رقم الرخصة
        { wch: 15 }, // صلاحية الرخصة
        { wch: 12 }, // التصنيف
        { wch: 10 }, // النوع
        { wch: 12 }, // الفئة
        { wch: 15 }, // الصانع
        { wch: 15 }, // الطراز
        { wch: 10 }, // سنة الصنع
        { wch: 10 }, // اللون
        { wch: 15 }, // رقم اللوحة
        { wch: 20 }, // رقم الهيكل
        { wch: 20 }, // رقم المحرك
        { wch: 12 }, // تاريخ البداية
        { wch: 12 }, // تاريخ الانتهاء
        { wch: 20 }, // الملاحق
        { wch: 12 }, // الحالة
      ];
      ws["!cols"] = colWidths;

      // إضافة ورقة العمل إلى workbook
      XLSX.utils.book_append_sheet(wb, ws, "سجلات السيارات السورية");

      // إنشاء اسم الملف
      const fileName = `سجلات_السيارات_السورية_${new Date().toISOString().split("T")[0]}.xlsx`;

      // حفظ الملف
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى.");
    }
  };

  // ✅ Actions
  const handlePreview = (policyId: string) => {
    // معاينة داخل التطبيق
    navigate(`/pdf?policy=${policyId}`);
  };

  const handleDownload = (policyId: string) => {
    // تحميل (حسب صفحة pdf عندك)
    // ممكن تخليه window.open ليفتح تبويب جديد
    window.open(`/pdf?policy=${policyId}&download=true`, "_blank");
  };

  const handleEdit = (id: string) => {
    // يفتح صفحة Dashboard بوضع edit
    navigate(`/?edit=${id}`);
  };

  const handleAddAddendum = (vehicleId: string) => {
    // يفتح صفحة إضافة ملحق
    navigate(`/addendum?vehicleId=${vehicleId}`);
  };

  const openDeleteDialog = (record: SyrianPolicyRecord) => {
    setDeleteTarget(record);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setIsDeleting(true);
    try {
      const { vehicleApi } = await import("../services/api");

      // دعم أسماء مختلفة للدالة حسب مشروعك
      const delFn =
        (vehicleApi as any).delete ||
        (vehicleApi as any).remove ||
        (vehicleApi as any).deleteOne ||
        (vehicleApi as any).deleteById;

      if (!delFn) {
        throw new Error("delete/remove api method not found in vehicleApi");
      }

      const res = await delFn(deleteTarget.id);

      if (res?.success === false) {
        throw new Error(res?.message || "فشل حذف البوليصة");
      }

      // تحديث الواجهة مباشرة
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setFilteredRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));

      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      console.error("Delete error:", e);
      alert("تعذر حذف البوليصة. تحقق من السيرفر أو الصلاحيات.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white0 shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">سجلات السيارات السورية</h1>
                <p className="text-sm text-gray-800">تأمين المركبات المسجلة في سوريا</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* زر الرئيسية */}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>

              {/* السجلات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700 h-9">
                    <FileText className="w-4 h-4 ml-2" />
                    السجلات
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>السجلات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/records")} className="text-right cursor-pointer">
                    <FileText className="w-4 h-4 ml-2" />
                    جميع السجلات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-records")} className="text-right cursor-pointer">
                    <Globe className="w-4 h-4 ml-2" />
                    السجلات الأجنبية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/reserved-vehicles")} className="text-right cursor-pointer">
                    <Bookmark className="w-4 h-4 ml-2" />
                    السيارات المحجوزة
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/syrian-addendums")} className="text-right cursor-pointer bg-primary-50">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-addendums")} className="text-right cursor-pointer">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق الأجنبية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الأدلة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9">
                    <Search className="w-4 h-4 ml-2" />
                    الأدلة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الأدلة المرجعية</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/vehicle-types-guide")} className="text-right cursor-pointer">
                    <Search className="w-4 h-4 ml-2" />
                    دليل النوع والموديل
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/colors-guide")} className="text-right cursor-pointer">
                    <Palette className="w-4 h-4 ml-2" />
                    دليل الألوان
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الإدارة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9">
                    <Building2 className="w-4 h-4 ml-2" />
                    الإدارة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الإدارة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/companies")} className="text-right cursor-pointer">
                    <Building2 className="w-4 h-4 ml-2" />
                    شركات التأمين
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/pricing-table")} className="text-right cursor-pointer">
                    <DollarSign className="w-4 h-4 ml-2" />
                    جدول التسعير
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Images Sidebar */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Right Side - Images (1 column) - appears on right in RTL */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            {/* Images Card */}
            <Card className="border-primary-200 sticky top-4">
              <CardHeader>
               
                <CardDescription className="text-primary-600">
                
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Gallery */}
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { src: "/insurance-hero-17.jpg", alt: "تأمين السيارات" },
                    { src: "/insurance-hero-18.jpg", alt: "حماية المركبات" },
                    { src: "/insurance-hero-19.jpg", alt: "خدمات التأمين" },
                    { src: "/insurance-hero-20.jpg", alt: "تأمين شامل" },
                  ].map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group overflow-hidden rounded-lg border-2 border-primary-200 hover:border-primary-400 transition-all duration-300"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to placeholder if image doesn't exist
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium text-right">{img.alt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Info Card */}
                <Card className="bg-primary-50 border-primary-200">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-primary-800 mb-2">معلومات مهمة</h4>
                    <ul className="text-sm text-primary-700 space-y-2 list-disc list-inside">
                      <li>تأمين شامل للمركبات</li>
                      <li>حماية ضد الحوادث</li>
                      <li>خدمات سريعة وفعالة</li>
                      <li>دعم على مدار الساعة</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
                  <CardContent className="p-4">
                    <h4 className="font-bold mb-3">إحصائيات سريعة</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-primary-100">إجمالي السجلات</span>
                        <span className="font-bold text-lg">{stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary-100">ساري المفعول</span>
                        <span className="font-bold text-lg">{stats.active}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary-100">إجمالي الأقساط</span>
                        <span className="font-bold text-lg">{formatCurrency(stats.totalPremium).split(" ")[0]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Left Side - Main Content (3 columns) */}
          <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
            {/* Filters */}
            <Card className="border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-800">
              <Filter className="w-5 h-5" />
              البحث والتصفية - السيارات السورية
            </CardTitle>
            <CardDescription className="text-primary-600">ابحث وصفي بوليصات السيارات السورية حسب المعايير المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="اسم المالك، رقم البوليصة، رقم اللوحة، الرقم الوطني، رقم الرخصة، رقم الهيكل، رقم المحرك..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 pr-10 text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">ساري المفعول</SelectItem>
                    <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تاريخ الإنشاء</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التواريخ</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">آخر أسبوع</SelectItem>
                    <SelectItem value="month">آخر شهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تصدير</label>
                <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleExportExcel} disabled={filteredRecords.length === 0}>
                  <Download className="w-4 h-4" />
                  تصدير Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary-800">إجراءات سريعة</h3>
                  <p className="text-primary-600">إضافة بوليصة جديدة أو إدارة السجلات</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary-600">
                    <Plus className="w-4 h-4 ml-2" />
                    بوليصة سورية جديدة
                  </Button>
                  <Button 
                    onClick={() => {
                      setVehicleIdInput("");
                      setAddendumDialogOpen(true);
                    }} 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary-50"
                  >
                    <FileCheck className="w-4 h-4 ml-2" />
                    إضافة ملحق
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي البوليصات السورية</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <Car className="w-8 h-8 text-primary-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ساري المفعول</p>
                  <p className="text-2xl font-bold text-success">{stats.active}</p>
                </div>
                <Badge className="w-8 h-8 rounded-full bg-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">منتهي الصلاحية</p>
                  <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
                </div>
                <Calendar className="w-8 h-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الأقساط</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalPremium)}</p>
                </div>
                <FileText className="w-8 h-8 text-primary-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              سجلات السيارات السورية ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">جارٍ تحميل السجلات...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد سجلات سيارات سورية مطابقة للمعايير المحددة</p>
                  <Button onClick={() => navigate("/")} className="mt-4 bg-primary hover:bg-primary-600">
                    إضافة بوليصة جديدة
                  </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border-2 border-primary-300 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary-100">
                      <TableHead className="text-center font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300 w-12">رقم</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300 min-w-32">رقم البوليصة</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">رقم الإيصال</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">القسط</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">حالة الدفع</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">طريقة الدفع</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">الدافع</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">الهاتف</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">المركز</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">شركة التأمين</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">المؤمن له</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">الرقم الوطني</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">المحافظة</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">رقم الرخصة</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">صلاحية الرخصة</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">التصنيف</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">النوع</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">الفئة</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">الصانع/الطراز</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">سنة الصنع</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">اللون</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">رقم اللوحة</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">رقم الهيكل</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">رقم المحرك</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">تاريخ البداية</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">تاريخ الانتهاء</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">الملاحق</TableHead>
                      <TableHead className="text-right font-bold text-primary-900 bg-primary-100 border-r-2 border-primary-300">الحالة</TableHead>
                      <TableHead className="text-center font-bold text-primary-900 bg-primary-100">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record, idx) => (
                      <TableRow
                        key={record.id}
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'} hover:bg-primary-100 border-b-2 border-primary-300`}
                      >
                        <TableCell className="text-center font-bold text-primary-700 border-r-2 border-primary-300 w-12">{startIndex + idx + 1}</TableCell>
                        <TableCell className="text-sm font-bold text-primary border-r-2 border-primary-300 text-right min-w-32">{record.policyNumber}</TableCell>
                        <TableCell className="text-xs font-mono border-r-2 border-primary-300 text-right">{record.receiptNumber || "—"}</TableCell>
                        <TableCell className="text-sm font-bold text-primary border-r-2 border-primary-300 text-right">{formatCurrency(record.premium)}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-center">{getPaymentStatusBadge(record.paymentStatus)}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{record.paymentMethod || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{record.paidBy || "—"}</TableCell>
                        <TableCell className="text-sm font-mono border-r-2 border-primary-300 text-right">{record.payerPhone || "—"}</TableCell>
                        <TableCell className="text-xs border-r-2 border-primary-300 text-right truncate" title={record.center || ""}>{shortId(record.center)}</TableCell>
                        <TableCell className="text-xs border-r-2 border-primary-300 text-right truncate" title={record.insuranceCompany || ""}>{shortId(record.insuranceCompany)}</TableCell>
                        <TableCell className="text-sm font-medium border-r-2 border-primary-300 text-right">{record.ownerName}</TableCell>
                        <TableCell className="text-sm font-mono border-r-2 border-primary-300 text-right">{record.nationalId}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{getGovernorateLabel(record.governorate)}</TableCell>
                        <TableCell className="text-sm font-mono border-r-2 border-primary-300 text-right">{record.licenseNumber || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{record.licenseExpiryDate ? formatDate(record.licenseExpiryDate) : "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">
                          <Badge variant="outline" className="text-xs">{getClassificationLabel(record.classification)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{record.vehicleCode || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">
                          <Badge variant="outline" className="text-xs">{getCategoryLabel(record.category)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium border-r-2 border-primary-300 text-right">{record.brand || "—"} {record.model || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{record.year || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{record.color || "—"}</TableCell>
                        <TableCell className="text-sm font-bold text-primary border-r-2 border-primary-300 text-right">{record.plateNumber}</TableCell>
                        <TableCell className="text-sm font-mono border-r-2 border-primary-300 text-right">{record.chassisNumber || "—"}</TableCell>
                        <TableCell className="text-sm font-mono border-r-2 border-primary-300 text-right">{record.engineNumber || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{formatDate(record.startDate)}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">{formatDate(record.endDate)}</TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-right">
                          {record.addendums && record.addendums.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {record.addendums.map((add, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {add.addendumType === "copy" ? "صورة" :
                                   add.addendumType === "info_update" ? "تعديل" :
                                   add.addendumType === "financial" ? "مالي" :
                                   add.addendumType === "stamp_payment" ? "طابع" :
                                   add.addendumType === "correction" ? "تصحيح" :
                                   add.addendumType === "admin_cancellation" ? "إلغاء إداري" :
                                   add.addendumType === "full_cancellation" ? "إلغاء تام" :
                                   add.addendumType === "revoke_admin_cancellation" ? "إلغاء إلغاء" :
                                   add.addendumType}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm border-r-2 border-primary-300 text-center">{getStatusBadge(record.status)}</TableCell>
                        {/* ✅ Actions */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* معاينة */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreview(record.policyId || record.id)}
                              title="معاينة PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* تحميل */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(record.policyId || record.id)}
                              title="تحميل PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>

                            {/* تعديل */}
                            <Button size="sm" variant="outline" onClick={() => handleEdit(record.id)} title="تعديل البوليصة">
                              <Pencil className="w-4 h-4" />
                            </Button>

                            {/* إضافة ملحق */}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleAddAddendum(record.id)} 
                              title="إضافة ملحق"
                              className="text-primary border-primary hover:bg-primary-50"
                            >
                              <FileCheck className="w-4 h-4" />
                            </Button>

                            {/* حذف */}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteDialog(record)}
                              title="حذف البوليصة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredRecords.length > 0 && totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.max(1, prev - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page as number);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="text-center mt-4 text-sm text-gray-600">
                  عرض {startIndex + 1} - {Math.min(endIndex, filteredRecords.length)} من {filteredRecords.length} سجل
                </div>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>

      {/* ✅ Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذه البوليصة؟
              <br />
              <span className="font-bold">
                {deleteTarget ? `${deleteTarget.policyNumber} - ${deleteTarget.ownerName}` : ""}
              </span>
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الحذف...
                </span>
              ) : (
                "نعم، احذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog لإدخال رقم المركبة لإضافة ملحق */}
      <Dialog open={addendumDialogOpen} onOpenChange={setAddendumDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة ملحق جديد</DialogTitle>
            <DialogDescription>
              أدخل رقم المركبة (ID) لإضافة ملحق جديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">رقم المركبة (ID) *</Label>
              <Input
                id="vehicleId"
                value={vehicleIdInput}
                onChange={(e) => setVehicleIdInput(e.target.value)}
                placeholder="أدخل رقم المركبة"
                className="text-right"
                dir="ltr"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && vehicleIdInput.trim()) {
                    navigate(`/addendum?vehicleId=${vehicleIdInput.trim()}`);
                    setAddendumDialogOpen(false);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddendumDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (vehicleIdInput.trim()) {
                  navigate(`/addendum?vehicleId=${vehicleIdInput.trim()}`);
                  setAddendumDialogOpen(false);
                }
              }}
              disabled={!vehicleIdInput.trim()}
              className="bg-primary hover:bg-primary-600"
            >
              متابعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
