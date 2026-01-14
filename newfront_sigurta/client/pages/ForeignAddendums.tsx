import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Globe,
  Search,
  Filter,
  Calendar,
  FileText,
  Plus,
  Home,
  FileCheck,
  Loader2,
  Building2,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface Addendum {
  _id?: string;
  vehicleId?: string | { _id?: string; plateNumber?: string; ownerName?: string };
  addendumType: string;
  addendumNumber: string;
  description?: string;
  notes?: string;
  amount?: number;
  issuedAt: string;
  effectiveDate?: string;
  status: "active" | "cancelled" | "revoked";
  createdBy?: string | { username?: string; fullName?: string };
  center?: string | { name?: string; code?: string };
}

const getAddendumTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    copy: "صورة طبق الأصل",
    info_update: "تعديل معلومات",
    financial: "مالي",
    stamp_payment: "إستيفاء طابع",
    correction: "تصحيح",
    admin_cancellation: "إلغاء إداري",
    full_cancellation: "إلغاء تام",
    revoke_admin_cancellation: "إلغاء ملحق الإلغاء الإداري",
  };
  return labels[type] || type;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 text-white">ساري المفعول</Badge>;
    case "cancelled":
      return <Badge className="bg-red-500 text-white">ملغي</Badge>;
    case "revoked":
      return <Badge className="bg-gray-500 text-white">ملغي</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const formatMoney = (value?: number) => {
  if (!value || value === 0) return "—";
  return new Intl.NumberFormat("ar-SY").format(value) + " ل.س";
};

// ✅ API helper
const API_BASE_URL = (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "http://localhost:3000/api";

export default function ForeignAddendums() {
  const navigate = useNavigate();
  const [addendums, setAddendums] = useState<Addendum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addendumTypeFilter, setAddendumTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    loadAddendums();
  }, []);

  const loadAddendums = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/addendums?vehicleType=foreign`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("فشل تحميل الملاحق");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAddendums(data.data);
      } else {
        setAddendums([]);
      }
    } catch (err: any) {
      console.error("Error loading addendums:", err);
      setError(err.message || "حدث خطأ أثناء تحميل الملاحق");
      setAddendums([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAddendums = useMemo(() => {
    let filtered = [...addendums];

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((addendum) => {
        const vehicle = typeof addendum.vehicleId === "object" ? addendum.vehicleId : null;
        const plateNumber = vehicle?.plateNumber || "";
        const ownerName = vehicle?.ownerName || "";
        const addendumNumber = addendum.addendumNumber || "";
        const description = addendum.description || "";
        return (
          plateNumber.toLowerCase().includes(search) ||
          ownerName.toLowerCase().includes(search) ||
          addendumNumber.toLowerCase().includes(search) ||
          description.toLowerCase().includes(search)
        );
      });
    }

    // Filter by addendum type
    if (addendumTypeFilter !== "all") {
      filtered = filtered.filter((addendum) => addendum.addendumType === addendumTypeFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((addendum) => addendum.status === statusFilter);
    }

    return filtered;
  }, [addendums, searchTerm, addendumTypeFilter, statusFilter]);

  const paginatedAddendums = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAddendums.slice(start, start + pageSize);
  }, [filteredAddendums, page, pageSize]);

  const totalPages = Math.ceil(filteredAddendums.length / pageSize);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">الملاحق الأجنبية</h1>
                <p className="text-sm text-gray-800">عرض وإدارة ملاحق السيارات الأجنبية</p>
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
                    <FileText className="w-4 h-4 ml-2" />
                    السجلات السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-records")} className="text-right cursor-pointer">
                    <Globe className="w-4 h-4 ml-2" />
                    السجلات الأجنبية
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
                    <FileText className="w-4 h-4 ml-2" />
                    جدول التسعير
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-orange-800">إجراءات سريعة</h3>
                  <p className="text-orange-600">إضافة ملحق جديد للسيارات الأجنبية</p>
                </div>
                <Button
                  onClick={() => navigate("/addendum")}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة ملحق جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-600" />
              الفلاتر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث برقم اللوحة، المالك، رقم الملحق..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نوع الملحق</label>
                <Select value={addendumTypeFilter} onValueChange={(value) => {
                  setAddendumTypeFilter(value);
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="copy">صورة طبق الأصل</SelectItem>
                    <SelectItem value="info_update">تعديل معلومات</SelectItem>
                    <SelectItem value="financial">مالي</SelectItem>
                    <SelectItem value="stamp_payment">إستيفاء طابع</SelectItem>
                    <SelectItem value="correction">تصحيح</SelectItem>
                    <SelectItem value="admin_cancellation">إلغاء إداري</SelectItem>
                    <SelectItem value="full_cancellation">إلغاء تام</SelectItem>
                    <SelectItem value="revoke_admin_cancellation">إلغاء ملحق الإلغاء الإداري</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">ساري المفعول</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                    <SelectItem value="revoked">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الملاحق</p>
                  <p className="text-2xl font-bold text-orange-600">{addendums.length}</p>
                </div>
                <FileCheck className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ساري المفعول</p>
                  <p className="text-2xl font-bold text-green-600">
                    {addendums.filter((a) => a.status === "active").length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">النتائج المفلترة</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredAddendums.length}</p>
                </div>
                <Filter className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-orange-600" />
              الملاحق الأجنبية ({filteredAddendums.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-10 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                <span className="text-gray-700">جاري تحميل البيانات...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto rounded-lg border-2 border-orange-300 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-100">
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">#</TableHead>
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">رقم الملحق</TableHead>
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">نوع الملحق</TableHead>
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">رقم اللوحة</TableHead>
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">المالك</TableHead>
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">المبلغ</TableHead>
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">تاريخ الإصدار</TableHead>
                      <TableHead className="text-right font-bold text-orange-900 bg-orange-100 border-r-2 border-orange-300">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAddendums.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                          لا توجد ملاحق
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAddendums.map((addendum, idx) => {
                        const vehicle = typeof addendum.vehicleId === "object" ? addendum.vehicleId : null;
                        const globalIndex = (page - 1) * pageSize + idx + 1;
                        return (
                          <TableRow key={addendum._id || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'} hover:bg-orange-100 border-b-2 border-orange-300`}>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-center">{globalIndex}</TableCell>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-right font-mono">{addendum.addendumNumber || "—"}</TableCell>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-right">{getAddendumTypeLabel(addendum.addendumType)}</TableCell>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-right">{vehicle?.plateNumber || "—"}</TableCell>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-right">{vehicle?.ownerName || "—"}</TableCell>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-right">{formatMoney(addendum.amount)}</TableCell>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-right">{formatDate(addendum.issuedAt)}</TableCell>
                            <TableCell className="text-sm border-r-2 border-orange-300 text-center">{getStatusBadge(addendum.status)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => setPage(p)}
                          isActive={p === page}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
