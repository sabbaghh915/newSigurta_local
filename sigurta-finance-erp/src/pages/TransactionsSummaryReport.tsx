import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, FileBarChart, LayoutDashboard, Download } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatDate = (date: string) => new Date(date).toLocaleDateString("ar");

type TransactionSummary = {
  _id: string;
  date: string;
  month: number;
  week: number;
  quarter: number;
  sourceType: string;
  sourceTypeName: string;
  sourceDocType: string;
  sourceDocNo: string;
  sumDb: number;
  sumCr: number;
  sumBal: number;
  count: number;
};

export default function TransactionsSummaryReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [summaries, setSummaries] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSummary, setTotalSummary] = useState({
    totalDb: 0,
    totalCr: 0,
    totalBal: 0,
    totalCount: 0,
  });

  const loadSummary = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/erp/reports/transactions-summary", { params });
      if (res.data.success) {
        const data = res.data.data || [];
        
        // تجميع حسب التاريخ
        const groupedByDate: Record<string, TransactionSummary> = {};
        
        data.forEach((item: any) => {
          const dateKey = new Date(item.date).toISOString().split('T')[0];
          const entryDate = new Date(item.date);
          const month = entryDate.getMonth() + 1;
          const quarter = Math.floor(month / 3) + 1;
          const week = Math.ceil(entryDate.getDate() / 7);

          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {
              _id: dateKey,
              date: dateKey,
              month,
              week,
              quarter,
              sourceType: item.sourceType || "",
              sourceTypeName: item.sourceTypeName || "",
              sourceDocType: item.sourceDocType || "",
              sourceDocNo: item.sourceDocNo || "",
              sumDb: 0,
              sumCr: 0,
              sumBal: 0,
              count: 0,
            };
          }

          groupedByDate[dateKey].sumDb += item.debit || 0;
          groupedByDate[dateKey].sumCr += item.credit || 0;
          groupedByDate[dateKey].count += 1;
        });

        // حساب الرصيد لكل تاريخ
        Object.values(groupedByDate).forEach((summary) => {
          summary.sumBal = summary.sumDb - summary.sumCr;
        });

        // ترتيب حسب التاريخ
        const sorted = Object.values(groupedByDate).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setSummaries(sorted);

        // حساب الإجماليات
        const totals = sorted.reduce(
          (acc, item) => ({
            totalDb: acc.totalDb + item.sumDb,
            totalCr: acc.totalCr + item.sumCr,
            totalBal: acc.totalBal + item.sumBal,
            totalCount: acc.totalCount + item.count,
          }),
          { totalDb: 0, totalCr: 0, totalBal: 0, totalCount: 0 }
        );
        setTotalSummary(totals);
      }
    } catch (error) {
      console.error("Error loading transactions summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = [
      "التاريخ",
      "الشهر",
      "الربع",
      "الأسبوع",
      "نوع المصدر",
      "نوع المستند",
      "رقم المستند",
      "إجمالي مدين",
      "إجمالي دائن",
      "الرصيد",
      "عدد المعاملات",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    summaries.forEach((s) => {
      lines.push(
        [
          esc(formatDate(s.date)),
          String(s.month),
          String(s.quarter),
          String(s.week),
          esc(s.sourceTypeName),
          esc(s.sourceDocType),
          esc(s.sourceDocNo),
          String(s.sumDb || 0),
          String(s.sumCr || 0),
          String(s.sumBal || 0),
          String(s.count),
        ].join(",")
      );
    });

    // إضافة الإجماليات
    lines.push([
      esc("الإجمالي"),
      "",
      "",
      "",
      "",
      "",
      "",
      String(totalSummary.totalDb),
      String(totalSummary.totalCr),
      String(totalSummary.totalBal),
      String(totalSummary.totalCount),
    ].join(","));

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_summary_${from || "all"}_${to || "all"}.csv`;
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
                <h1 className="text-xl font-bold text-gray-800">ملخص المعاملات</h1>
                <p className="text-sm text-gray-800">ملخص المعاملات المحاسبية مجمعة حسب التاريخ</p>
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
            <div className="grid md:grid-cols-3 gap-4">
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

              <div className="flex items-end gap-2">
                <Button
                  className="flex-1"
                  onClick={loadSummary}
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  disabled={loading || !summaries.length}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Badge variant="secondary" className="text-base px-4 py-2">
                عدد الأيام: {summaries.length}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي مدين: {formatCurrency(totalSummary.totalDb)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي دائن: {formatCurrency(totalSummary.totalCr)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي الرصيد: {formatCurrency(totalSummary.totalBal)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي المعاملات: {totalSummary.totalCount}
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
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الشهر</TableHead>
                      <TableHead className="text-right">الربع</TableHead>
                      <TableHead className="text-right">الأسبوع</TableHead>
                      <TableHead className="text-right">نوع المصدر</TableHead>
                      <TableHead className="text-right">نوع المستند</TableHead>
                      <TableHead className="text-right">رقم المستند</TableHead>
                      <TableHead className="text-right">إجمالي مدين</TableHead>
                      <TableHead className="text-right">إجمالي دائن</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                      <TableHead className="text-right">عدد المعاملات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries.map((s) => (
                      <TableRow key={s._id} className="hover:bg-gray-50">
                        <TableCell className="text-right font-medium">{formatDate(s.date)}</TableCell>
                        <TableCell className="text-right">{s.month}</TableCell>
                        <TableCell className="text-right">{s.quarter}</TableCell>
                        <TableCell className="text-right">{s.week}</TableCell>
                        <TableCell className="text-right">{s.sourceTypeName || "—"}</TableCell>
                        <TableCell className="text-right">{s.sourceDocType || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{s.sourceDocNo || "—"}</TableCell>
                        <TableCell className="text-right font-bold">
                          {s.sumDb > 0 ? formatCurrency(s.sumDb) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {s.sumCr > 0 ? formatCurrency(s.sumCr) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(s.sumBal)}
                        </TableCell>
                        <TableCell className="text-right">{s.count}</TableCell>
                      </TableRow>
                    ))}
                    {!summaries.length && (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground py-10">
                          لا توجد بيانات ضمن هذه الفترة
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Totals Row */}
                    {summaries.length > 0 && (
                      <TableRow className="bg-primary-50 font-bold">
                        <TableCell colSpan={7} className="text-right">
                          الإجمالي
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary-700">
                          {formatCurrency(totalSummary.totalDb)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary-700">
                          {formatCurrency(totalSummary.totalCr)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary-700">
                          {formatCurrency(totalSummary.totalBal)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary-700">
                          {totalSummary.totalCount}
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
