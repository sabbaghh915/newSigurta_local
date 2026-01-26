import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select } from "../components/ui/select";
import { Home, FileBarChart, LayoutDashboard, Download } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

type AccountBalance = {
  _id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  cat4?: string;
  finalReportName?: string;
  sumDb: number;
  sumCr: number;
  sumBal: number;
  sumBalDb: number;
  sumBalCr: number;
};

export default function AccountBalancesReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reportType, setReportType] = useState<string>("all");
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalDb: 0,
    totalCr: 0,
    totalBal: 0,
    totalBalDb: 0,
    totalBalCr: 0,
  });

  const loadBalances = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (reportType !== "all") params.reportType = reportType;

      const res = await api.get("/erp/reports/account-balances", { params });
      if (res.data.success) {
        setBalances(res.data.data || []);

        // حساب الإجماليات
        const totals = res.data.data.reduce(
          (acc: any, item: AccountBalance) => ({
            totalDb: acc.totalDb + (item.sumDb || 0),
            totalCr: acc.totalCr + (item.sumCr || 0),
            totalBal: acc.totalBal + (item.sumBal || 0),
            totalBalDb: acc.totalBalDb + (item.sumBalDb || 0),
            totalBalCr: acc.totalBalCr + (item.sumBalCr || 0),
          }),
          { totalDb: 0, totalCr: 0, totalBal: 0, totalBalDb: 0, totalBalCr: 0 }
        );
        setSummary(totals);
      }
    } catch (error) {
      console.error("Error loading account balances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = [
      "الفئة 1",
      "الفئة 2",
      "الفئة 3",
      "الفئة 4",
      "رمز الحساب",
      "اسم الحساب",
      "التقرير النهائي",
      "إجمالي مدين",
      "إجمالي دائن",
      "الرصيد",
      "رصيد مدين",
      "رصيد دائن",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    balances.forEach((b) => {
      lines.push(
        [
          esc(b.cat1 || ""),
          esc(b.cat2 || ""),
          esc(b.cat3 || ""),
          esc(b.cat4 || ""),
          esc(b.accountCode),
          esc(b.accountName),
          esc(b.finalReportName || ""),
          String(b.sumDb || 0),
          String(b.sumCr || 0),
          String(b.sumBal || 0),
          String(b.sumBalDb || 0),
          String(b.sumBalCr || 0),
        ].join(",")
      );
    });

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `account_balances_${from || "all"}_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <FileBarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">تقرير أرصدة الحسابات</h1>
                <p className="text-sm text-gray-800">أرصدة الحسابات مع التفاصيل والفئات</p>
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
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>الفلاتر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>نوع التقرير</Label>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  disabled={loading}
                  className="w-full"
                >
                  <option value="all">الكل</option>
                  <option value="income-statement">قائمة الدخل</option>
                  <option value="balance-sheet">الميزانية</option>
                  <option value="other">أخرى</option>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  className="flex-1"
                  onClick={loadBalances}
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  disabled={loading || !balances.length}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Badge variant="secondary" className="text-base px-4 py-2">
                عدد الحسابات: {balances.length}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي مدين: {formatCurrency(summary.totalDb)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي دائن: {formatCurrency(summary.totalCr)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي الرصيد: {formatCurrency(summary.totalBal)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                رصيد مدين: {formatCurrency(summary.totalBalDb)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                رصيد دائن: {formatCurrency(summary.totalBalCr)}
              </Badge>
            </div>
          </CardContent>
        </Card>

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
                      <TableHead className="text-right">الفئة 1</TableHead>
                      <TableHead className="text-right">الفئة 2</TableHead>
                      <TableHead className="text-right">الفئة 3</TableHead>
                      <TableHead className="text-right">الفئة 4</TableHead>
                      <TableHead className="text-right">رمز الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">التقرير النهائي</TableHead>
                      <TableHead className="text-right">إجمالي مدين</TableHead>
                      <TableHead className="text-right">إجمالي دائن</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                      <TableHead className="text-right">رصيد مدين</TableHead>
                      <TableHead className="text-right">رصيد دائن</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((b) => (
                      <TableRow key={b._id}>
                        <TableCell className="text-right">{b.cat1 || "—"}</TableCell>
                        <TableCell className="text-right">{b.cat2 || "—"}</TableCell>
                        <TableCell className="text-right">{b.cat3 || "—"}</TableCell>
                        <TableCell className="text-right">{b.cat4 || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{b.accountCode}</TableCell>
                        <TableCell className="text-right font-medium">{b.accountName}</TableCell>
                        <TableCell className="text-right">{b.finalReportName || "—"}</TableCell>
                        <TableCell className="text-right font-bold">
                          {b.sumDb > 0 ? formatCurrency(b.sumDb) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {b.sumCr > 0 ? formatCurrency(b.sumCr) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(b.sumBal)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {b.sumBalDb > 0 ? formatCurrency(b.sumBalDb) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {b.sumBalCr > 0 ? formatCurrency(b.sumBalCr) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!balances.length && (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center text-muted-foreground py-10">
                          لا توجد بيانات ضمن هذه الفترة
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
