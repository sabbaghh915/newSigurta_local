import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { adminApi } from "../../services/adminApi";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import ExportButtons from "@/components/export/ExportButtons";
import { PaginationBar } from "../../components/ui/pagination";

/**
 * ✅ Payment document (حسب DB) — نستخدمه لإظهار "آخر وثيقة" لكل مركبة
 */
type PricingInput = {
  insuranceType?: "internal" | "border" | string;
  vehicleCode?: string;
  category?: string;
  classification?: number;
  months?: number;
  electronicCard?: boolean;
  premiumService?: boolean;
  rescueService?: boolean;
  vehicleType?: string;
  period?: number;
};

type Breakdown = {
  total?: number;
};

type PaymentDoc = {
  _id?: string;
  vehicleId?: string;
  vehicleModel?: string;

  policyNumber?: string;
  receiptNumber?: string;

  amount?: number;

  paymentStatus?: string;
  paymentMethod?: string;

  policyStartAt?: string;
  policyEndAt?: string;

  pricingInput?: PricingInput;
  breakdown?: Breakdown;

  createdAt?: string;
  paymentDate?: string;
};

const extractArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.vehicles)) return res.vehicles;
  if (Array.isArray(res?.users)) return res.users;
  return [];
};

const oid = (v: any) => (typeof v === "string" ? v : v?.$oid ? String(v.$oid) : undefined);
const dt = (v: any) =>
  typeof v === "string" ? v : v?.$date ? new Date(v.$date).toISOString() : undefined;

const normalizePayment = (raw: any): PaymentDoc => {
  if (!raw || typeof raw !== "object") return {};
  return {
    _id: oid(raw._id) || raw._id || raw.id,
    vehicleId: oid(raw.vehicleId) || raw.vehicleId,
    vehicleModel: raw.vehicleModel,

    policyNumber: raw.policyNumber,
    receiptNumber: raw.receiptNumber ?? raw.reference,

    amount: raw.amount ?? raw.total ?? raw.breakdown?.total,

    paymentStatus: raw.paymentStatus ?? raw.status,
    paymentMethod: raw.paymentMethod ?? raw.method,

    policyStartAt: dt(raw.policyStartAt) ?? raw.policyStartAt,
    policyEndAt: dt(raw.policyEndAt) ?? raw.policyEndAt,

    pricingInput: raw.pricingInput,
    breakdown: raw.breakdown,

    createdAt: dt(raw.createdAt) ?? raw.createdAt,
    paymentDate: dt(raw.paymentDate) ?? raw.paymentDate,
  };
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const formatMoney = (value?: number) => {
  const n = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("ar-SY").format(n) + " ل.س";
};

export default function AdminRecords() {
  const [tab, setTab] = useState<"syrian" | "foreign">("syrian");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ✅ خريطة: vehicleId -> آخر دفع/وثيقة
  const [latestByVehicleId, setLatestByVehicleId] = useState<Record<string, PaymentDoc>>({});

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // حمّل الدفعات مرة واحدة واصنع خريطة آخر وثيقة لكل مركبة
  useEffect(() => {
    adminApi
      .getPayments()
      .then((res) => {
        const list = extractArray(res).map(normalizePayment);

        // الأحدث أولاً
        list.sort((a, b) => {
          const ta = new Date(a.createdAt || a.paymentDate || 0).getTime();
          const tb = new Date(b.createdAt || b.paymentDate || 0).getTime();
          return tb - ta;
        });

        const map: Record<string, PaymentDoc> = {};
        for (const p of list) {
          const vid = String(p.vehicleId || "");
          if (!vid) continue;
          if (!map[vid]) map[vid] = p; // لأننا مرتبين DESC، أول عنصر هو الأحدث
        }
        setLatestByVehicleId(map);
      })
      .catch(() => {
        // حتى لو فشل تحميل الدفعات، صفحة المركبات تظل تعمل
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
    const api = tab === "syrian" ? adminApi.getSyrianVehicles() : adminApi.getForeignVehicles();
        const res = await api;
        const list = extractArray(res);

        // ✅ جلب الملاحق
        const token = localStorage.getItem("authToken");
        const addendumsRes = await fetch(`/api/addendums?vehicleType=${tab}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then((r) => r.json())
          .then((d) => (d.success ? d.data || [] : []))
          .catch(() => []);

        // ✅ ربط الملاحق بالمركبات
        const addendumsByVehicle = new Map<string, any[]>();
        for (const addendum of addendumsRes) {
          const vid = String(addendum.vehicleId || "");
          if (!vid) continue;
          if (!addendumsByVehicle.has(vid)) {
            addendumsByVehicle.set(vid, []);
          }
          addendumsByVehicle.get(vid)!.push(addendum);
        }

        // ✅ إضافة الملاحق لكل مركبة
        const itemsWithAddendums = list.map((item: any) => ({
          ...item,
          addendums: addendumsByVehicle.get(String(item._id || item.id || "")) || [],
        }));

        setItems(itemsWithAddendums);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("فشل تحميل البيانات. تأكد من تسجيل الدخول كمشرف.");
        setLoading(false);
      }
    };

    loadData();
  }, [tab]);

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const s = q.toLowerCase().trim();
    if (!s) return list;
    return list.filter((x) => {
      return (
        String(x.plateNumber || "").toLowerCase().includes(s) ||
        String(x.ownerName || "").toLowerCase().includes(s) ||
        String(x.nationalId || "").toLowerCase().includes(s) ||
        String(x.licenseNumber || "").toLowerCase().includes(s) ||
        String(x.chassisNumber || "").toLowerCase().includes(s) ||
        String(x.engineNumber || "").toLowerCase().includes(s) ||
        String((x.brand || "") + " " + (x.model || "")).toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  // Reset page when filters/tab change
  useEffect(() => {
    setPage(1);
  }, [q, tab, from, to, items.length]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    if (start >= filtered.length && page > 1) {
      return filtered.slice(0, pageSize);
    }
    return filtered.slice(start, end);
  }, [filtered, page, pageSize]);

  function TableEmptyState({ message, colSpan }: { message: string; colSpan: number }) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-10">
          {message}
        </TableCell>
      </TableRow>
    );
  }

  const colCount = tab === "syrian" ? 18 : 11;

  return (
    <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur shadow-xl">
      <div className="h-2 bg-gradient-to-r from-purple-300 via-purple-200 to-purple-300" />

      <CardHeader className="pb-3">
        <CardTitle className="flex items-start gap-3 text-slate-900">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-300 to-purple-200 flex items-center justify-center mt-0.5" style={{color: "#5b21b6"}}>
            <FileText className="w-5 h-5 text-white" />
          </span>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-lg font-extrabold">سجل المركبات</span>
                <span className="text-sm font-normal text-slate-600">({items.length}) مركبة</span>
              </div>

              <ExportButtons entity="vehicles" fileName={`vehicles_${tab}`} params={{ from, to, q }} hideIfNoPermission={false} />
            </div>

            {/* فلاتر */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant={tab === "syrian" ? "default" : "outline"} onClick={() => setTab("syrian")} size="sm">
            مركبات سورية
          </Button>
              <Button variant={tab === "foreign" ? "default" : "outline"} onClick={() => setTab("foreign")} size="sm">
            مركبات أجنبية
          </Button>
              <input
                className="h-9 rounded-md border px-3 text-sm"
                placeholder="بحث: لوحة/مالك/هوية/رخصة/هيكل/محرك/صانع..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            <input
              className="h-9 rounded-md border px-3 text-sm"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              className="h-9 rounded-md border px-3 text-sm"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-10 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
            <span className="text-slate-700">جاري تحميل البيانات...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-2xl border border-slate-200/70 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">رقم اللوحة</TableHead>
                  <TableHead className="text-right">اسم المالك</TableHead>
                  <TableHead className="text-right">رقم الهوية</TableHead>
                  {tab === "syrian" && <TableHead className="text-right">المحافظة</TableHead>}
                  {tab === "syrian" && <TableHead className="text-right">رقم الرخصة</TableHead>}
                  {tab === "syrian" && <TableHead className="text-right">التصنيف</TableHead>}
                  {tab === "syrian" && <TableHead className="text-right">النوع</TableHead>}
                  {tab === "syrian" && <TableHead className="text-right">الفئة</TableHead>}
                  <TableHead className="text-right">الصانع/الطراز</TableHead>
                  {tab === "syrian" && <TableHead className="text-right">رقم الهيكل</TableHead>}
                  {tab === "syrian" && <TableHead className="text-right">رقم المحرك</TableHead>}
                  <TableHead className="text-right">نوع المركبة</TableHead>
                  <TableHead className="text-right">آخر وثيقة</TableHead>
                  <TableHead className="text-right">آخر إيصال</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">بداية</TableHead>
                  <TableHead className="text-right">نهاية</TableHead>
                  <TableHead className="text-right">الملاحق</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paged.map((item, idx) => {
                  const vid = String(item._id || item.id || "");
                  const last = vid ? latestByVehicleId[vid] : undefined;

                  return (
                    <TableRow key={item._id || item.id || `${item.plateNumber || "row"}-${idx}`}>
                      <TableCell className="font-bold text-center text-violet-700">{(page - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{item.plateNumber || "—"}</TableCell>
                      <TableCell>{item.ownerName || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{item.nationalId || "—"}</TableCell>
                      {tab === "syrian" && (
                        <TableCell className="text-xs">
                          {item.governorate === "syrian" ? "سورية" : item.governorate || "—"}
                        </TableCell>
                      )}
                      {tab === "syrian" && <TableCell className="font-mono text-xs">{item.licenseNumber || "—"}</TableCell>}
                      {tab === "syrian" && (
                        <TableCell className="text-xs">
                          {item.classification === "0"
                            ? "غير حكومية"
                            : item.classification === "1"
                            ? "حكومية"
                            : item.classification === "2"
                            ? "تخفيض طابع"
                            : item.classification === "3"
                            ? "إعفاء طابع"
                            : item.classification || "—"}
                        </TableCell>
                      )}
                      {tab === "syrian" && <TableCell className="text-xs">{item.vehicleCode || "—"}</TableCell>}
                      {tab === "syrian" && (
                        <TableCell className="text-xs">
                          {item.category === "01"
                            ? "خاصة"
                            : item.category === "02"
                            ? "عامة"
                            : item.category === "03"
                            ? "حكومية"
                            : item.category === "04"
                            ? "تأجير"
                            : item.category || "—"}
                        </TableCell>
                      )}
                      <TableCell>
                        {(item.brand || "—") + " " + (item.model || "")} {item.year ? `(${item.year})` : ""}
                      </TableCell>
                      {tab === "syrian" && <TableCell className="font-mono text-xs">{item.chassisNumber || "—"}</TableCell>}
                      {tab === "syrian" && <TableCell className="font-mono text-xs">{item.engineNumber || "—"}</TableCell>}
                      <TableCell>{tab === "syrian" ? "سورية" : "أجنبية"}</TableCell>
                      <TableCell className="font-mono text-xs">{last?.policyNumber || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{last?.receiptNumber || "—"}</TableCell>
                      <TableCell>{last?.paymentStatus || "—"}</TableCell>
                      <TableCell className="font-extrabold">{last ? formatMoney(last.amount ?? last.breakdown?.total) : "—"}</TableCell>
                      <TableCell>{formatDate(last?.policyStartAt)}</TableCell>
                      <TableCell>{formatDate(last?.policyEndAt)}</TableCell>
                      <TableCell>
                        {item.addendums && item.addendums.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.addendums.map((add: any, idx: number) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                title={add.addendumType}
                              >
                                {add.addendumType === "copy" ? "صورة" :
                                 add.addendumType === "info_update" ? "تعديل" :
                                 add.addendumType === "financial" ? "مالي" :
                                 add.addendumType === "stamp_payment" ? "طابع" :
                                 add.addendumType === "correction" ? "تصحيح" :
                                 add.addendumType === "admin_cancellation" ? "إلغاء إداري" :
                                 add.addendumType === "full_cancellation" ? "إلغاء تام" :
                                 add.addendumType === "revoke_admin_cancellation" ? "إلغاء إلغاء" :
                                 add.addendumType}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!filtered.length && !loading && !error && (
                  <TableEmptyState message={q ? "لا توجد نتائج تطابق البحث" : "لا توجد مركبات مسجلة"} colSpan={colCount} />
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && !error && (
            <div className="text-xs text-muted-foreground mt-3">
              ملاحظة: "آخر وثيقة" مأخوذة من أحدث عملية دفع لنفس vehicleId ضمن جدول الدفعات.
            </div>
        )}

        {!loading && !error && (
            <PaginationBar
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[20, 50, 100, 200]}
            />
        )}
      </CardContent>
    </Card>
  );
}
