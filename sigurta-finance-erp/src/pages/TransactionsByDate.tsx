import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, Calendar, LayoutDashboard, Download } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatDate = (date: string) => new Date(date).toLocaleDateString("ar");

type TransactionLine = {
  _id: string;
  entryNumber: string;
  date: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  entryDescription: string;
  status: string;
  month: number;
  quarter: number;
  week: number;
};

export default function TransactionsByDate() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transactions, setTransactions] = useState<TransactionLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalDebit: 0,
    totalCredit: 0,
    count: 0,
  });

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 10000 }; // حد كبير لجلب جميع البيانات
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/erp/journal-entries", { params });
      if (res.data.success) {
        // تحويل القيود إلى سطور معاملات
        const lines: TransactionLine[] = [];
        res.data.data.forEach((entry: any) => {
          const entryDate = new Date(entry.date);
          const month = entryDate.getMonth() + 1;
          const quarter = Math.floor(month / 3) + 1;
          const week = Math.ceil(entryDate.getDate() / 7);

          entry.lines?.forEach((line: any, idx: number) => {
            // الحصول على بيانات الحساب من line (يحتوي على accountCode و accountName مباشرة)
            // أو من line.accountId إذا كان populated
            const accountCode = line.account?.code || line.accountCode || "";
            const accountName = line.account?.name || line.accountName || "";
            
            lines.push({
              _id: `${entry._id}_${idx}`,
              entryNumber: entry.entryNumber,
              date: entry.date,
              accountCode,
              accountName,
              description: line.description || "",
              debit: line.debit || 0,
              credit: line.credit || 0,
              entryDescription: entry.description || "",
              status: entry.status,
              month,
              quarter,
              week,
            });
          });
        });

        // ترتيب حسب التاريخ
        lines.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(lines);

        // حساب الإجماليات
        const totals = lines.reduce(
          (acc, line) => ({
            totalDebit: acc.totalDebit + (line.debit || 0),
            totalCredit: acc.totalCredit + (line.credit || 0),
            count: acc.count + 1,
          }),
          { totalDebit: 0, totalCredit: 0, count: 0 }
        );
        setSummary(totals);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = [
      "رقم القيد",
      "التاريخ",
      "الشهر",
      "الربع",
      "الأسبوع",
      "رمز الحساب",
      "اسم الحساب",
      "الوصف",
      "مدين",
      "دائن",
      "حالة القيد",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    transactions.forEach((t) => {
      lines.push(
        [
          esc(t.entryNumber),
          esc(formatDate(t.date)),
          esc(t.month),
          esc(t.quarter),
          esc(t.week),
          esc(t.accountCode),
          esc(t.accountName),
          esc(t.description),
          String(t.debit || 0),
          String(t.credit || 0),
          esc(t.status === "approved" ? "معتمد" : t.status === "pending" ? "معلق" : "مرفوض"),
        ].join(",")
      );
    });

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_by_date_${from || "all"}_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      approved: { variant: "default", label: "معتمد" },
      pending: { variant: "secondary", label: "معلق" },
      rejected: { variant: "destructive", label: "مرفوض" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">تقرير المعاملات حسب التاريخ</h1>
                <p className="text-sm text-gray-800">جميع المعاملات المحاسبية مع التفاصيل</p>
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

              <div className="flex items-end gap-2 md:col-span-2">
                <Button
                  className="flex-1"
                  onClick={loadTransactions}
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  disabled={loading || !transactions.length}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Badge variant="secondary" className="text-base px-4 py-2">
                عدد السطور: {summary.count}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي المدين: {formatCurrency(summary.totalDebit)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي الدائن: {formatCurrency(summary.totalCredit)}
              </Badge>
              <Badge
                variant={Math.abs(summary.totalDebit - summary.totalCredit) < 0.01 ? "default" : "destructive"}
                className="text-base px-4 py-2"
              >
                الفرق: {formatCurrency(Math.abs(summary.totalDebit - summary.totalCredit))}
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
                      <TableHead className="text-center">#</TableHead>
                      <TableHead className="text-right">رقم القيد</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الشهر</TableHead>
                      <TableHead className="text-right">الربع</TableHead>
                      <TableHead className="text-right">الأسبوع</TableHead>
                      <TableHead className="text-right">رمز الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">مدين</TableHead>
                      <TableHead className="text-right">دائن</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t, idx) => (
                      <TableRow key={t._id}>
                        <TableCell className="font-bold text-center text-primary">{idx + 1}</TableCell>
                        <TableCell className="text-right font-mono">{t.entryNumber}</TableCell>
                        <TableCell className="text-right">{formatDate(t.date)}</TableCell>
                        <TableCell className="text-right">{t.month}</TableCell>
                        <TableCell className="text-right">{t.quarter}</TableCell>
                        <TableCell className="text-right">{t.week}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{t.accountCode}</TableCell>
                        <TableCell className="text-right font-medium">{t.accountName}</TableCell>
                        <TableCell className="text-right">{t.description || t.entryDescription}</TableCell>
                        <TableCell className="text-right font-bold">
                          {t.debit > 0 ? formatCurrency(t.debit) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {t.credit > 0 ? formatCurrency(t.credit) : "—"}
                        </TableCell>
                        <TableCell className="text-right">{getStatusBadge(t.status)}</TableCell>
                      </TableRow>
                    ))}
                    {!transactions.length && (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center text-muted-foreground py-10">
                          لا توجد معاملات ضمن هذه الفترة
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
