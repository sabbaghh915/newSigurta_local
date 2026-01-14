import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { adminApi } from "../../services/adminApi";
import { Building2, Download, Printer, AlertCircle, PieChart, Loader2 } from "lucide-react";

type Center = {
  _id: string;
  name: string;
  ip?: string;
  province?: string;
  isActive?: boolean;
};

type DistributionRow = {
  insuranceCompanyId: string;
  insuranceCompanyName: string;

  paymentsCount: number;
  totalAmount: number;

  stateShareTotal: number;
  federationTotal: number;
  companyShareTotal: number;

  // تفصيل الرسوم (يُفترض أن الباك يرجّعها)
  martyrTotal: number;
  warTotal: number;
  stampTotal: number;
  agesTotal: number;
  localTotal: number;
  proposedTotal: number;

  // لو عندك "إعادة إعمار" بالباك، ممكن تضيفها هون لاحقاً
  // reconstructionTotal?: number;
};

type DistributionResponse = {
  success: boolean;
  from: string;
  to: string;
  data: DistributionRow[];
  grand: {
    grandTotal?: number;
    grandCount?: number;
    stateShareTotal?: number;
    federationTotal?: number;
    companyShareTotal?: number;

    martyrTotal?: number;
    warTotal?: number;
    stampTotal?: number;
    agesTotal?: number;
    localTotal?: number;
    proposedTotal?: number;
  };
};

const toYMD = (d: Date) => d.toISOString().slice(0, 10);
const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatNumber = (n: number) => Number(n || 0).toLocaleString("ar");

export default function AdminFinanceDistribution() {
  const [from, setFrom] = useState(() => toYMD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [to, setTo] = useState(() => toYMD(new Date()));

  const [centers, setCenters] = useState<Center[]>([]);
  const [centerId, setCenterId] = useState<string>("all");

  const [rows, setRows] = useState<DistributionRow[]>([]);
  const [grand, setGrand] = useState<DistributionResponse["grand"]>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const selectedCenter = useMemo(() => {
    if (centerId === "all") return null;
    return centers.find((c) => c._id === centerId) || null;
  }, [centerId, centers]);

  const rangeLabel = useMemo(() => {
    const fromLabel = new Date(from + "T00:00:00").toLocaleDateString("ar");
    const toLabel = new Date(to + "T00:00:00").toLocaleDateString("ar");
    return `من ${fromLabel} إلى ${toLabel}`;
  }, [from, to]);

  const loadCenters = async () => {
    const list = await adminApi.getCenters();
    const active = Array.isArray(list) ? list.filter((c: any) => c.isActive !== false) : [];
    setCenters(active);
  };

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      const res = (await adminApi.getFinanceDistributionByCompany(
        from,
        to,
        centerId === "all" ? undefined : centerId
      )) as DistributionResponse;

      setRows(res?.data || []);
      setGrand(res?.grand || {});
    } catch (e: any) {
      setError(e?.message || "فشل تحميل توزيع المبالغ");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const header = [
      "شركة التأمين",
      "عدد الدفعات",
      "الإجمالي",
      "حصة الدولة",
      "حصة الاتحاد",
      "حصة الشركة",
      "طابع الشهيد",
      "المجهود الحربي",
      "رسم الطابع",
      "رسم الأعمار",
      "الإدارة المحلية",
      "البدل المقترح",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    for (const r of rows) {
      lines.push(
        [
          esc(r.insuranceCompanyName),
          String(r.paymentsCount || 0),
          String(r.totalAmount || 0),
          String(r.stateShareTotal || 0),
          String(r.federationTotal || 0),
          String(r.companyShareTotal || 0),
          String(r.martyrTotal || 0),
          String(r.warTotal || 0),
          String(r.stampTotal || 0),
          String(r.agesTotal || 0),
          String(r.localTotal || 0),
          String(r.proposedTotal || 0),
        ].join(",")
      );
    }

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_distribution_${from}_to_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const title = "توزيع المبالغ على شركات التأمين + تفصيل الرسوم";
    const centerFilter = selectedCenter ? `المركز: ${selectedCenter.name}` : "كل المراكز";

    const rowHtml = rows
      .map(
        (r) => `
        <tr>
          <td>${r.insuranceCompanyName}</td>
          <td>${formatNumber(r.paymentsCount || 0)}</td>
          <td><b>${formatCurrency(r.totalAmount || 0)}</b></td>
          <td>${formatCurrency(r.stateShareTotal || 0)}</td>
          <td>${formatCurrency(r.federationTotal || 0)}</td>
          <td><b>${formatCurrency(r.companyShareTotal || 0)}</b></td>
          <td>${formatCurrency(r.martyrTotal || 0)}</td>
          <td>${formatCurrency(r.warTotal || 0)}</td>
          <td>${formatCurrency(r.stampTotal || 0)}</td>
          <td>${formatCurrency(r.agesTotal || 0)}</td>
          <td>${formatCurrency(r.localTotal || 0)}</td>
          <td>${formatCurrency(r.proposedTotal || 0)}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h1 { margin: 0 0 8px; font-size: 18px; }
          .meta { margin: 0 0 12px; color: #444; font-size: 12px; }
          .cards { display: flex; gap: 12px; flex-wrap: wrap; margin: 12px 0 16px; }
          .card { border: 1px solid #ddd; border-radius: 10px; padding: 10px 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; vertical-align: top; }
          th { background: #f5f5f5; }
          @media print { .noprint { display: none; } }
        </style>
      </head>
      <body>
        <div class="noprint" style="margin-bottom:10px;">
          <button onclick="window.print()">طباعة / حفظ PDF</button>
        </div>
        <h1>${title}</h1>
        <div class="meta">${rangeLabel} — ${centerFilter}</div>

        <div class="cards">
          <div class="card"><div>الإجمالي</div><div><b>${formatCurrency(grand.grandTotal || 0)}</b></div></div>
          <div class="card"><div>حصة الدولة</div><div><b>${formatCurrency(grand.stateShareTotal || 0)}</b></div></div>
          <div class="card"><div>حصة الاتحاد</div><div><b>${formatCurrency(grand.federationTotal || 0)}</b></div></div>
          <div class="card"><div>حصة الشركات</div><div><b>${formatCurrency(grand.companyShareTotal || 0)}</b></div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>شركة التأمين</th>
              <th>عدد الدفعات</th>
              <th>الإجمالي</th>
              <th>حصة الدولة</th>
              <th>حصة الاتحاد</th>
              <th>حصة الشركة</th>
              <th>طابع الشهيد</th>
              <th>المجهود الحربي</th>
              <th>رسم الطابع</th>
              <th>رسم الأعمار</th>
              <th>الإدارة المحلية</th>
              <th>البدل المقترح</th>
            </tr>
          </thead>
          <tbody>
            ${rowHtml || `<tr><td colspan="12">لا يوجد بيانات</td></tr>`}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=1200,height=750");
    if (!w) return alert("المتصفح منع فتح نافذة جديدة للطباعة");
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  useEffect(() => {
    loadCenters().catch(() => {});
    loadData().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div dir="rtl" className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold">توزيع المبالغ على شركات التأمين</div>
            <div className="text-sm text-muted-foreground">{rangeLabel}</div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportCSV} disabled={loading || !rows.length} variant="secondary">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button onClick={printPDF} disabled={loading || !rows.length} variant="secondary">
            <Printer className="h-4 w-4 ml-2" />
            طباعة / PDF
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white/90 backdrop-blur border-violet-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            الفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>من</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>إلى</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>المركز</Label>
              <Select value={centerId} onValueChange={setCenterId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مركز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المراكز</SelectItem>
                  {centers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} {c.ip ? `— ${c.ip}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={loadData} disabled={loading}>
                {loading ? "جاري التحميل..." : "تحديث"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary">الإجمالي: {formatCurrency(grand.grandTotal || 0)}</Badge>
            <Badge variant="secondary">عدد الدفعات: {formatNumber(grand.grandCount || 0)}</Badge>
            <Badge>حصة الدولة: {formatCurrency(grand.stateShareTotal || 0)}</Badge>
            <Badge>حصة الاتحاد: {formatCurrency(grand.federationTotal || 0)}</Badge>
            <Badge>حصة الشركات: {formatCurrency(grand.companyShareTotal || 0)}</Badge>
          </div>

          {/* تفصيل الرسوم */}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline">طابع الشهيد: {formatCurrency(grand.martyrTotal || 0)}</Badge>
            <Badge variant="outline">المجهود الحربي: {formatCurrency(grand.warTotal || 0)}</Badge>
            <Badge variant="outline">رسم الطابع: {formatCurrency(grand.stampTotal || 0)}</Badge>
            <Badge variant="outline">رسم الأعمار: {formatCurrency(grand.agesTotal || 0)}</Badge>
            <Badge variant="outline">الإدارة المحلية: {formatCurrency(grand.localTotal || 0)}</Badge>
            <Badge variant="outline">البدل المقترح: {formatCurrency(grand.proposedTotal || 0)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur shadow-xl">
        <div className="h-2 bg-gradient-to-r from-purple-300 via-purple-200 to-purple-300" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-start gap-3 text-slate-900">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-300 to-purple-200 flex items-center justify-center mt-0.5" style={{color: "#5b21b6"}}>
              <PieChart className="w-5 h-5 text-white" />
            </span>
            <div className="flex-1">
              <span className="text-lg font-extrabold">التوزيع حسب شركة التأمين</span>
              <span className="text-sm font-normal text-slate-600 block">({rows.length}) شركة</span>
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

          {!loading && (
            <div className="rounded-2xl border border-slate-200/70 bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-12">#</TableHead>
                    <TableHead className="text-right">شركة التأمين</TableHead>
                    <TableHead className="text-right">عدد الدفعات</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">حصة الدولة</TableHead>
                    <TableHead className="text-right">حصة الاتحاد</TableHead>
                    <TableHead className="text-right">حصة الشركة</TableHead>
                    <TableHead className="text-right">طابع الشهيد</TableHead>
                    <TableHead className="text-right">الحرب</TableHead>
                    <TableHead className="text-right">الطابع</TableHead>
                    <TableHead className="text-right">الأعمار</TableHead>
                    <TableHead className="text-right">محلية</TableHead>
                    <TableHead className="text-right">بدل مقترح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, idx) => (
                    <TableRow key={String(r.insuranceCompanyId)}>
                      <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                      <TableCell className="font-semibold">{r.insuranceCompanyName}</TableCell>
                      <TableCell>{formatNumber(r.paymentsCount || 0)}</TableCell>
                      <TableCell className="font-extrabold">{formatCurrency(r.totalAmount || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.stateShareTotal || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.federationTotal || 0)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(r.companyShareTotal || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.martyrTotal || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.warTotal || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.stampTotal || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.agesTotal || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.localTotal || 0)}</TableCell>
                      <TableCell>{formatCurrency(r.proposedTotal || 0)}</TableCell>
                    </TableRow>
                ))}
                  {!rows.length && !loading && (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center text-muted-foreground py-10">
                      لا يوجد بيانات ضمن هذه الفترة
                      </TableCell>
                    </TableRow>
                )}
                </TableBody>
              </Table>
          </div>
          )}

          {!loading && (
          <div className="text-xs text-muted-foreground mt-3">
            ملاحظة: "حصة الدولة" هي مجموع الرسوم. "حصة الشركة" = الإجمالي - (حصة الدولة + حصة الاتحاد).
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
