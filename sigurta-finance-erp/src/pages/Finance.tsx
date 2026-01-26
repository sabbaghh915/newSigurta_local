import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { api } from "../lib/api";
import { Home, Building2, LayoutDashboard } from "lucide-react";

type FinanceBreakdownRow = {
  centerId: string;
  centerName?: string;
  centerCode?: string;
  centerIp?: string;
  province?: string;
  totalAmount: number;
  paymentsCount: number;
  martyrTotal: number;
  warTotal: number;
  stampTotal: number;
  agesTotal: number;
  localTotal: number;
  proposedTotal: number;
  stateShareTotal: number;
  federationTotal: number;
  companyShareTotal: number;
};

type FinanceBreakdownResponse = {
  success: boolean;
  from: string;
  to: string;
  data: FinanceBreakdownRow[];
  grand: {
    grandTotal?: number;
    grandCount?: number;
    martyrTotal?: number;
    warTotal?: number;
    stampTotal?: number;
    agesTotal?: number;
    localTotal?: number;
    proposedTotal?: number;
    stateShareTotal?: number;
    federationTotal?: number;
    companyShareTotal?: number;
  };
};

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatNumber = (n: number) => Number(n || 0).toLocaleString("ar");

export default function Finance() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [rows, setRows] = useState<FinanceBreakdownRow[]>([]);
  const [grand, setGrand] = useState<FinanceBreakdownResponse["grand"]>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const rangeLabel = useMemo(() => {
    if (!from && !to) return "جميع الفترات";
    if (!from || !to) return "فترة مفتوحة";
    const fromLabel = new Date(from + "T00:00:00").toLocaleDateString("ar");
    const toLabel = new Date(to + "T00:00:00").toLocaleDateString("ar");
    return `من ${fromLabel} إلى ${toLabel}`;
  }, [from, to]);

  const loadFinance = async () => {
    setError("");
    setLoading(true);
    try {
      // إذا لم يتم اختيار تواريخ، نرسل تواريخ تغطي كل البيانات
      const params: any = {};
      if (from && to) {
        params.from = from;
        params.to = to;
      } else if (from) {
        params.from = from;
        params.to = new Date().toISOString().slice(0, 10); // حتى اليوم
      } else if (to) {
        params.from = "2000-01-01"; // من بداية النظام
        params.to = to;
      }
      // إذا لم يتم اختيار أي تاريخ، لا نرسل معاملات التاريخ (Backend يجلب كل البيانات)

      const res = await api.get("/admin/finance/breakdown-by-center", {
        params: Object.keys(params).length > 0 ? params : undefined,
      });

      setRows(res.data?.data || []);
      setGrand(res.data?.grand || {});
    } catch (e: any) {
      console.error("Error loading finance breakdown:", e);
      setError(e?.response?.data?.message || "فشل تحميل البيانات المالية التفصيلية");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const header = [
      "المركز",
      "المحافظة",
      "IP",
      "عدد الدفعات",
      "الإجمالي",
      "طابع الشهيد",
      "المجهود الحربي",
      "رسم الطابع",
      "رسم الأعمار",
      "الإدارة المحلية",
      "البدل المقترح",
      "حصة الدولة",
      "حصة الاتحاد",
      "حصة الشركات",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    for (const r of rows) {
      const centerLabel = r.centerName || r.centerCode || r.centerId;
      lines.push(
        [
          esc(centerLabel),
          esc(r.province || ""),
          esc(r.centerIp || ""),
          String(r.paymentsCount || 0),
          String(r.totalAmount || 0),
          String(r.martyrTotal || 0),
          String(r.warTotal || 0),
          String(r.stampTotal || 0),
          String(r.agesTotal || 0),
          String(r.localTotal || 0),
          String(r.proposedTotal || 0),
          String(r.stateShareTotal || 0),
          String(r.federationTotal || 0),
          String(r.companyShareTotal || 0),
        ].join(",")
      );
    }

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_breakdown_by_center_${from}_to_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // تحميل جميع البيانات عند فتح الصفحة
  useEffect(() => {
    loadFinance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // لا نقوم بتحميل البيانات تلقائياً عند فتح الصفحة
  // المستخدم يختار التواريخ ثم يضغط على زر "تحديث"

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">المالية — تفصيل الرسوم حسب المراكز</h1>
                <p className="text-sm text-gray-800">{rangeLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/finance-dashboard")}
                className="bg-primary-50 hover:bg-primary-100 text-gray-800 border-primary-300 h-9 font-medium"
              >
                <LayoutDashboard className="w-4 h-4 ml-2" />
                لوحة التحكم
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-primary-50 hover:bg-primary-100 text-gray-800 border-primary-300 h-9 font-medium"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="h-9">
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>الفلاتر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>من (اختياري)</Label>
                <Input 
                  type="date" 
                  value={from} 
                  onChange={(e) => setFrom(e.target.value)} 
                  disabled={loading}
                  placeholder="اختر تاريخ البداية"
                />
                <p className="text-xs text-muted-foreground">اتركه فارغاً لعرض كل البيانات</p>
              </div>

              <div className="space-y-2">
                <Label>إلى (اختياري)</Label>
                <Input 
                  type="date" 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)} 
                  disabled={loading}
                  placeholder="اختر تاريخ النهاية"
                />
                <p className="text-xs text-muted-foreground">اتركه فارغاً لعرض كل البيانات</p>
              </div>

              <div className="flex items-end md:col-span-2 gap-2">
                <Button 
                  className="flex-1" 
                  onClick={loadFinance} 
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button variant="outline" onClick={exportCSV} disabled={loading || !rows.length}>
                  تصدير CSV
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">الإجمالي: {formatCurrency(grand.grandTotal || 0)}</Badge>
              <Badge variant="secondary">عدد الدفعات: {formatNumber(grand.grandCount || 0)}</Badge>
              <Badge>حصة الدولة: {formatCurrency(grand.stateShareTotal || 0)}</Badge>
              <Badge>حصة الاتحاد: {formatCurrency(grand.federationTotal || 0)}</Badge>
              <Badge>حصة الشركات: {formatCurrency(grand.companyShareTotal || 0)}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">طابع الشهيد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(grand.martyrTotal || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المجهود الحربي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(grand.warTotal || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">رسم الطابع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(grand.stampTotal || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">رسم الأعمار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(grand.agesTotal || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الإدارة المحلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(grand.localTotal || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">البدل المقترح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(grand.proposedTotal || 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">جاري تحميل البيانات...</span>
              </div>
            )}

            {!loading && (
              <div className="overflow-auto" dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">#</TableHead>
                      <TableHead className="text-right">المركز</TableHead>
                      <TableHead className="text-right">المحافظة</TableHead>
                      <TableHead className="text-right">IP</TableHead>
                      <TableHead className="text-right">عدد الدفعات</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">طابع الشهيد</TableHead>
                      <TableHead className="text-right">المجهود الحربي</TableHead>
                      <TableHead className="text-right">رسم الطابع</TableHead>
                      <TableHead className="text-right">رسم الأعمار</TableHead>
                      <TableHead className="text-right">الإدارة المحلية</TableHead>
                      <TableHead className="text-right">البدل المقترح</TableHead>
                      <TableHead className="text-right">حصة الدولة</TableHead>
                      <TableHead className="text-right">حصة الاتحاد</TableHead>
                      <TableHead className="text-right">حصة الشركات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={String(r.centerId)}>
                        <TableCell className="font-bold text-center text-primary">{idx + 1}</TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold">{r.centerName || r.centerCode || String(r.centerId)}</div>
                          {r.centerCode && <div className="text-xs text-muted-foreground">كود: {r.centerCode}</div>}
                        </TableCell>
                        <TableCell className="text-right">{r.province || "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-right">{r.centerIp || "—"}</TableCell>
                        <TableCell className="text-right">{formatNumber(r.paymentsCount || 0)}</TableCell>
                        <TableCell className="font-bold text-right">{formatCurrency(r.totalAmount || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.martyrTotal || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.warTotal || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.stampTotal || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.agesTotal || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.localTotal || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.proposedTotal || 0)}</TableCell>
                        <TableCell className="font-bold text-right">{formatCurrency(r.stateShareTotal || 0)}</TableCell>
                        <TableCell className="font-bold text-right">{formatCurrency(r.federationTotal || 0)}</TableCell>
                        <TableCell className="font-bold text-right">{formatCurrency(r.companyShareTotal || 0)}</TableCell>
                      </TableRow>
                    ))}
                    {!rows.length && (
                      <TableRow>
                        <TableCell colSpan={15} className="text-center text-muted-foreground py-10">
                          لا يوجد بيانات ضمن هذه الفترة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
