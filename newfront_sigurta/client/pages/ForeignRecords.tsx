import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Globe,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Plus,
  Home,
  Car,
  MapPin,
  Trash2,
  Pencil,
  Bookmark,
  Building2,
  DollarSign,
  ChevronDown,
  Palette,
  FileCheck,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

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

interface ForeignPolicyRecord {
  id: string;
  /** ✅ id الخاص بسجل الدفعة/البوليصة (إن وجد) لاستخدامه في PDF */
  policyId?: string;
  policyNumber: string;
  receiptNumber?: string;
  ownerName: string;
  nationality: string;
  passportNumber: string;
  plateNumber: string;
  plateCountry: string;
  brand: string;
  model: string;
  year: string;
  color?: string;
  manufacturer?: string;
  coverage: string;
  startDate: string;
  endDate: string;
  entryDate: string;
  exitDate: string;
  entryPoint: string;
  premium: number;
  paymentStatus?: string;
  paymentMethod?: string;
  paidBy?: string;
  payerPhone?: string;
  center?: string;
  insuranceCompany?: string;
  status: "active" | "expired" | "cancelled";
  createdAt: string;
  vehicleType: "foreign";
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
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

export default function ForeignRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ForeignPolicyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ForeignPolicyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ForeignPolicyRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Addendum dialog state
  const [addendumDialogOpen, setAddendumDialogOpen] = useState(false);
  const [vehicleIdInput, setVehicleIdInput] = useState("");

  useEffect(() => {
    // Load records from API
    const loadRecords = async () => {
      try {
        const { vehicleApi } = await import("../services/api");

        // ✅ حاول جلب الدفعات/البوليصات والملاحق من السيرفر
        const token = localStorage.getItem("authToken");
        const [vehiclesRes, paymentsRes, addendumsRes] = await Promise.all([
          vehicleApi.getAll({ vehicleType: "foreign" }),
          apiGetFirst<any>(["/payments", "/payments/list", "/admin/payments"]).catch(() => ({ data: [] })),
          fetch(`${API_BASE_URL}/addendums?vehicleType=foreign`, {
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

        // ✅ خريطة: آخر دفعة لكل مركبة أجنبية
        const latestByVehicle = new Map<string, PaymentDoc>();
        const latestTs = new Map<string, number>();
        for (const p of payments) {
          const vid = p.vehicleId;
          if (!vid) continue;
          const isForeign = /foreign/i.test(String(p.vehicleModel || ""));
          if (!isForeign) continue;
          const t = new Date(p.createdAt || p.paymentDate || p.issuedAt || 0).getTime();
          const prev = latestTs.get(vid) ?? -1;
          if (t >= prev) {
            latestByVehicle.set(vid, p);
            latestTs.set(vid, t);
          }
        }

        const transformedRecords: ForeignPolicyRecord[] = vehicles.map((vehicle: any) => {
          const vehicleId = String(vehicle?._id || "");
          const pay = latestByVehicle.get(vehicleId);

          const createdAtIso = vehicle?.createdAt || pay?.createdAt || pay?.paymentDate || new Date().toISOString();

          // ✅ تواريخ: لو في policyStart/End من الدفعات نعتمدها، وإلا نعتمد entry/exit
          const entryRaw = vehicle?.entryDate;
          const exitRaw = vehicle?.exitDate;

          const startRaw = pay?.policyStartAt || vehicle?.startDate || entryRaw || pay?.issuedAt || vehicle?.createdAt;
          const endRaw = pay?.policyEndAt || vehicle?.endDate || exitRaw;

          const startDate = startRaw ? new Date(startRaw).toISOString().split("T")[0] : "";
          const endDate = endRaw ? new Date(endRaw).toISOString().split("T")[0] : "";
          const entryDate = entryRaw ? new Date(entryRaw).toISOString().split("T")[0] : "";
          const exitDate = exitRaw ? new Date(exitRaw).toISOString().split("T")[0] : "";

          // ✅ الحالة
          let status: "active" | "expired" | "cancelled" = vehicle?.status || "active";
          if (status !== "cancelled" && (endDate || exitDate)) {
            const end = endDate || exitDate;
            status = end && new Date(end) < new Date() ? "expired" : "active";
          }

          const premium =
            (typeof pay?.amount === "number" ? pay.amount : undefined) ??
            (typeof pay?.breakdown?.total === "number" ? pay.breakdown.total : undefined) ??
            (vehicle?.insurance?.total ?? vehicle?.insuranceTotal ?? vehicle?.premium ?? 0);

          const coverage = pay?.pricingInput?.insuranceType || vehicle?.coverage || "border-insurance";
          const color = vehicle?.color?.name || vehicle?.colorName || vehicle?.color || vehicle?.carColor?.name ||"";
          const manufacturer = vehicle?.manufacturer || vehicle?.manufacturerName || vehicle?.make?.manufacturer || vehicle?.maker || vehicle?.producer || "";
          const centerDisp = displayRef(pay?.center || vehicle?.center);
          const companyDisp = displayRef(pay?.insuranceCompany || vehicle?.insuranceCompany);

          return {
            id: vehicleId,
            policyId: pay?._id || vehicleId,
            policyNumber: pay?.policyNumber || vehicle?.policyNumber || "N/A",
            receiptNumber: pay?.receiptNumber,
            ownerName: vehicle?.ownerName || "",
            nationality: vehicle?.nationality || "غير محدد",
            passportNumber: vehicle?.passportNumber || vehicle?.nationalId || "",
            plateNumber: vehicle?.plateNumber || "",
            plateCountry: vehicle?.plateCountry || vehicle?.plateCountryName || vehicle?.plateCountryArabic || vehicle?.nationality || "غير محدد",
            brand: vehicle?.brand || "",
            model: vehicle?.model || "",
            year: vehicle?.year?.toString?.() || "",
            color,
            manufacturer,
            coverage,
            startDate,
            endDate,
            entryDate,
            exitDate,
            entryPoint: vehicle?.entryPoint || vehicle?.customsDocument || "غير محدد",
            premium: Number(premium || 0),
            paymentStatus: pay?.paymentStatus,
            paymentMethod: pay?.paymentMethod,
            paidBy: pay?.paidBy,
            payerPhone: pay?.payerPhone,
            center: centerDisp,
            insuranceCompany: companyDisp,
            status,
            createdAt: createdAtIso,
            vehicleType: "foreign",
            addendums: addendumsByVehicle.get(vehicleId) || [],
          };
        });

        // ✅ الأحدث أولاً
        transformedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setRecords(transformedRecords);
        setFilteredRecords(transformedRecords);
      } catch (error) {
        console.error('Error loading records:', error);
        setRecords([]);
        setFilteredRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  // Keep mock data for reference (commented out)
  /*
      const mockRecords: ForeignPolicyRecord[] = [
        {
          id: "1",
          policyNumber: "FOR-2024-001",
          ownerName: "Ahmad Khalil",
          nationality: "لبنانية",
          passportNumber: "LB1234567",
          plateNumber: "ABC123",
          plateCountry: "لبنان",
          brand: "تويوتا",
          model: "كامري",
          year: "2021",
          coverage: "border-insurance",
          startDate: "2024-01-20",
          endDate: "2024-02-20",
          entryDate: "2024-01-20",
          exitDate: "2024-02-20",
          entryPoint: "معبر العريضة",
          premium: 75000,
          status: "active",
          createdAt: "2024-01-20T08:30:00Z",
          vehicleType: "foreign"
        },
        {
          id: "2", 
          policyNumber: "FOR-2024-002",
          ownerName: "Sarah Ahmed",
          nationality: "أردنية",
          passportNumber: "JO7654321",
          plateNumber: "XYZ456",
          plateCountry: "الأردن",
          brand: "هيونداي",
          model: "سانتافي",
          year: "2020",
          coverage: "third-party",
          startDate: "2024-02-10",
          endDate: "2024-05-10",
          entryDate: "2024-02-10",
          exitDate: "2024-05-10",
          entryPoint: "معبر نصيب الحدودي",
          premium: 180000,
          status: "active",
          createdAt: "2024-02-10T14:20:00Z",
          vehicleType: "foreign"
        },
        {
          id: "3",
          policyNumber: "FOR-2024-003", 
          ownerName: "Mehmet Özkan",
          nationality: "تركية",
          passportNumber: "TR9876543",
          plateNumber: "34ABC789",
          plateCountry: "تركيا",
          brand: "رينو",
          model: "ميغان",
          year: "2019",
          coverage: "comprehensive",
          startDate: "2023-12-15",
          endDate: "2024-01-15",
          entryDate: "2023-12-15",
          exitDate: "2024-01-15",
          entryPoint: "معبر باب الهوى",
          premium: 120000,
          status: "expired",
          createdAt: "2023-12-15T10:15:00Z",
          vehicleType: "foreign"
        },
        {
          id: "4",
          policyNumber: "FOR-2024-004",
          ownerName: "Omar Al-Rashid",
          nationality: "عراقية",
          passportNumber: "IQ5432167",
          plateNumber: "BGD999",
          plateCountry: "العراق",
          brand: "تويوتا",
          model: "لاندكروزر",
          year: "2022",
          coverage: "third-party",
          startDate: "2024-03-01",
          endDate: "2024-06-01",
          entryDate: "2024-03-01",
          exitDate: "2024-06-01",
          entryPoint: "معبر البوكمال",
          premium: 200000,
          status: "active",
          createdAt: "2024-03-01T16:45:00Z",
          vehicleType: "foreign"
        }
      ];
      */

  useEffect(() => {
    let filtered = records;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.ownerName.toLowerCase().includes(term) ||
        String(record.policyNumber || "").toLowerCase().includes(term) ||
        String(record.receiptNumber || "").toLowerCase().includes(term) ||
        record.plateNumber.toLowerCase().includes(term) ||
        record.passportNumber.toLowerCase().includes(term) ||
        String(record.plateCountry || "").toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filter by nationality
    if (nationalityFilter !== "all") {
      filtered = filtered.filter(record => record.nationality === nationalityFilter);
    }

    // Filter by date
    if (dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.createdAt);
        switch (dateFilter) {
          case "today":
            return recordDate.toDateString() === today.toDateString();
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return recordDate >= weekAgo;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            return recordDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [records, searchTerm, statusFilter, nationalityFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "ساري المفعول", variant: "default" as const },
      expired: { label: "منتهي الصلاحية", variant: "destructive" as const },
      cancelled: { label: "ملغي", variant: "secondary" as const }
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

  const getCoverageLabel = (coverage: string) => {
    const c = String(coverage || "").toLowerCase();
    if (c === "third-party" || c === "thirdparty") return "تأمين ضد الغير";
    if (c === "comprehensive") return "تأمين شامل";
    if (c === "internal") return "تأمين داخلي";
    if (c === "border" || c === "border-insurance") return "تأمين حدود";
    return coverage || "—";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString('ar-SY');
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
    // يفتح نفس صفحة إنشاء البوليصة لكن بوضع edit
    navigate(`/foreign-vehicles?edit=${id}`);
  };

  const handleAddAddendum = (vehicleId: string) => {
    // يفتح صفحة إضافة ملحق
    navigate(`/addendum?vehicleId=${vehicleId}`);
  };

  const openDeleteDialog = (record: ForeignPolicyRecord) => {
    setDeleteTarget(record);
    setDeleteOpen(true);
  };

  const getNationalityBadge = (nationality: string) => {
    const colors = {
      "لبنانية": "bg-green-100 text-green-800",
      "أردنية": "bg-blue-100 text-blue-800", 
      "تركية": "bg-red-100 text-red-800",
      "عراقية": "bg-yellow-100 text-yellow-800",
      "فلسطينية": "bg-purple-100 text-purple-800",
      "مصرية": "bg-indigo-100 text-indigo-800"
    };
    
    return (
      <Badge className={colors[nationality as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {nationality}
      </Badge>
    );
  };

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

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-syrian-red rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">سجلات السيارات الأجنبية</h1>
                <p className="text-sm text-gray-800">تأمين المركبات الأجنبية والعابرة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* زر الرئيسية */}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 h-9"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>

              {/* السجلات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 h-9">
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
                  <DropdownMenuItem onClick={() => navigate("/syrian-records")} className="text-right cursor-pointer">
                    <Car className="w-4 h-4 ml-2" />
                    السجلات السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/reserved-vehicles")} className="text-right cursor-pointer">
                    <Bookmark className="w-4 h-4 ml-2" />
                    السيارات المحجوزة
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/syrian-addendums")} className="text-right cursor-pointer">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-addendums")} className="text-right cursor-pointer bg-orange-50">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق الأجنبية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الأدلة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 h-9">
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
                  <Button variant="outline" className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 h-9">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Filter className="w-5 h-5" />
              البحث والتصفية - السيارات الأجنبية
            </CardTitle>
            <CardDescription className="text-orange-600">
              ابحث وصفي بوليصات السيارات الأجنبية حسب الجنسية والدولة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="اسم المالك، رقم البوليصة، رقم اللوحة، جواز السفر..."
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
                <label className="text-sm font-medium">الجنسية</label>
                <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الجنسيات</SelectItem>
                    <SelectItem value="لبنانية">لبنانية</SelectItem>
                    <SelectItem value="أردنية">أردنية</SelectItem>
                    <SelectItem value="تركية">تركية</SelectItem>
                    <SelectItem value="عراقية">عراقية</SelectItem>
                    <SelectItem value="فلسطينية">فلسطينية</SelectItem>
                    <SelectItem value="مصرية">مصرية</SelectItem>
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
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  تصدير Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-orange-800">إجراءات سريعة</h3>
                  <p className="text-orange-600">إضافة بوليصة جديدة للمركبات الأجنبية</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/foreign-vehicles")} className="bg-syrian-red hover:bg-orange-600">
                    <Plus className="w-4 h-4 ml-2" />
                    بوليصة أجنبية جديدة
                  </Button>
                  <Button 
                    onClick={() => {
                      setVehicleIdInput("");
                      setAddendumDialogOpen(true);
                    }} 
                    variant="outline" 
                    className="border-orange-600 text-orange-700 hover:bg-orange-50"
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
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي البوليصات الأجنبية</p>
                  <p className="text-2xl font-bold text-syrian-red">{records.length}</p>
                </div>
                <Globe className="w-8 h-8 text-red-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ساري المفعول</p>
                  <p className="text-2xl font-bold text-success">
                    {records.filter(r => r.status === "active").length}
                  </p>
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
                  <p className="text-2xl font-bold text-destructive">
                    {records.filter(r => r.status === "expired").length}
                  </p>
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
                  <p className="text-2xl font-bold text-syrian-red">
                    {formatCurrency(records.reduce((sum, r) => sum + r.premium, 0))}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-syrian-red" />
              سجلات السيارات الأجنبية ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-syrian-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">جارٍ تحميل السجلات...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد سجلات سيارات أجنبية مطابقة للمعايير المحددة</p>
                <Button 
                  onClick={() => navigate("/foreign-vehicles")} 
                  className="mt-4 bg-syrian-red hover:bg-orange-600"
                >
                  إضافة بوليصة جديدة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border-2 border-red-300 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-100">
                      <TableHead className="text-center font-bold text-red-900 bg-red-100 border-r-2 border-red-300 w-12">رقم</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300 min-w-32">رقم البوليصة</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">رقم الإيصال</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">حالة الدفع</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">طريقة الدفع</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">الدافع</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">الهاتف</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">المركز</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">شركة التأمين</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">المؤمن له</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">الجنسية</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">جواز السفر</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">الماركة/الموديل</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">اللون</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">الصانع</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">رقم اللوحة</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">دولة التسجيل</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">نقطة الدخول</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">فترة الإقامة</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">نوع التغطية</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">القسط</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">الملاحق</TableHead>
                      <TableHead className="text-right font-bold text-red-900 bg-red-100 border-r-2 border-red-300">الحالة</TableHead>
                      <TableHead className="text-center font-bold text-red-900 bg-red-100">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record, idx) => (
                      <TableRow
                        key={record.id}
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-red-50'} hover:bg-red-100 border-b-2 border-red-300`}
                      >
                        <TableCell className="text-center font-bold text-red-700 border-r-2 border-red-300 w-12">{startIndex + idx + 1}</TableCell>
                        <TableCell className="text-sm font-bold text-syrian-red border-r-2 border-red-300 text-right min-w-32">{record.policyNumber}</TableCell>
                        <TableCell className="text-xs font-mono border-r-2 border-red-300 text-right">{record.receiptNumber || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-center">{getPaymentStatusBadge(record.paymentStatus)}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">{record.paymentMethod || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">{record.paidBy || "—"}</TableCell>
                        <TableCell className="text-sm font-mono border-r-2 border-red-300 text-right">{record.payerPhone || "—"}</TableCell>
                        <TableCell className="text-xs border-r-2 border-red-300 text-right truncate" title={record.center || ""}>{shortId(record.center)}</TableCell>
                        <TableCell className="text-xs border-r-2 border-red-300 text-right truncate" title={record.insuranceCompany || ""}>{shortId(record.insuranceCompany)}</TableCell>
                        <TableCell className="text-sm font-medium border-r-2 border-red-300 text-right">{record.ownerName}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-center">{getNationalityBadge(record.nationality)}</TableCell>
                        <TableCell className="text-sm font-mono border-r-2 border-red-300 text-right">{record.passportNumber || "—"}</TableCell>
                        <TableCell className="text-sm font-medium border-r-2 border-red-300 text-right">{record.brand} {record.model} {record.year}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">{record.color || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">{record.manufacturer || "—"}</TableCell>
                        <TableCell className="text-sm font-bold text-syrian-red border-r-2 border-red-300 text-right">{record.plateNumber}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">{record.plateCountry || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">{record.entryPoint || "—"}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">{formatDate(record.entryDate)} → {formatDate(record.exitDate)}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">
                          <Badge variant="outline" className="text-xs">{getCoverageLabel(record.coverage)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-bold text-syrian-red border-r-2 border-red-300 text-right">{formatCurrency(record.premium)}</TableCell>
                        <TableCell className="text-sm border-r-2 border-red-300 text-right">
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
                        <TableCell className="text-sm border-r-2 border-red-300 text-center">{getStatusBadge(record.status)}</TableCell>
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
                              className="text-orange-700 border-orange-600 hover:bg-orange-50"
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
              className="bg-syrian-red hover:bg-orange-600"
            >
              متابعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
