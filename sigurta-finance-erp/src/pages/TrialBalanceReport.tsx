import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, Scale, LayoutDashboard, Download, Printer } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

type TrialBalanceItem = {
  _id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  finalReportName?: string;
  openingDebit: number;
  openingCredit: number;
  openingBalance: number;
  currentDebit: number;
  currentCredit: number;
  currentBalance: number;
  closingDebit: number;
  closingCredit: number;
  closingBalance: number;
  lastDebitDate?: string;
  lastCreditDate?: string;
};

export default function TrialBalanceReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState<TrialBalanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalOpeningDebit: 0,
    totalOpeningCredit: 0,
    totalOpeningBalance: 0,
    totalCurrentDebit: 0,
    totalCurrentCredit: 0,
    totalCurrentBalance: 0,
    totalClosingDebit: 0,
    totalClosingCredit: 0,
    totalClosingBalance: 0,
    isBalanced: false,
  });

  const loadTrialBalance = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/erp/reports/trial-balance", { params });
      if (res.data.success) {
        const data = res.data.data || [];
        setItems(data);

        // حساب الإجماليات
        const totals = data.reduce(
          (acc: any, item: TrialBalanceItem) => ({
            totalOpeningDebit: acc.totalOpeningDebit + (item.openingDebit || 0),
            totalOpeningCredit: acc.totalOpeningCredit + (item.openingCredit || 0),
            totalOpeningBalance: acc.totalOpeningBalance + (item.openingBalance || 0),
            totalCurrentDebit: acc.totalCurrentDebit + (item.currentDebit || 0),
            totalCurrentCredit: acc.totalCurrentCredit + (item.currentCredit || 0),
            totalCurrentBalance: acc.totalCurrentBalance + (item.currentBalance || 0),
            totalClosingDebit: acc.totalClosingDebit + (item.closingDebit || 0),
            totalClosingCredit: acc.totalClosingCredit + (item.closingCredit || 0),
            totalClosingBalance: acc.totalClosingBalance + (item.closingBalance || 0),
          }),
          {
            totalOpeningDebit: 0,
            totalOpeningCredit: 0,
            totalOpeningBalance: 0,
            totalCurrentDebit: 0,
            totalCurrentCredit: 0,
            totalCurrentBalance: 0,
            totalClosingDebit: 0,
            totalClosingCredit: 0,
            totalClosingBalance: 0,
          }
        );

        // التحقق من التوازن
        const isBalanced =
          Math.abs(totals.totalCurrentDebit - totals.totalCurrentCredit) < 0.01;

        setSummary({
          ...totals,
          isBalanced,
        });
      }
    } catch (error) {
      console.error("Error loading trial balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrialBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = [
      "رمز الحساب",
      "اسم الحساب",
      "التقرير النهائي",
      "رصيد افتتاحي مدين",
      "رصيد افتتاحي دائن",
      "رصيد افتتاحي",
      "حركات مدين",
      "حركات دائن",
      "رصيد حالي",
      "رصيد ختامي مدين",
      "رصيد ختامي دائن",
      "رصيد ختامي",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    items.forEach((item) => {
      lines.push(
        [
          esc(item.accountCode),
          esc(item.accountName),
          esc(item.finalReportName || ""),
          String(item.openingDebit || 0),
          String(item.openingCredit || 0),
          String(item.openingBalance || 0),
          String(item.currentDebit || 0),
          String(item.currentCredit || 0),
          String(item.currentBalance || 0),
          String(item.closingDebit || 0),
          String(item.closingCredit || 0),
          String(item.closingBalance || 0),
        ].join(",")
      );
    });

    // إضافة الإجماليات
    lines.push([
      esc("الإجمالي"),
      "",
      "",
      String(summary.totalOpeningDebit),
      String(summary.totalOpeningCredit),
      String(summary.totalOpeningBalance),
      String(summary.totalCurrentDebit),
      String(summary.totalCurrentCredit),
      String(summary.totalCurrentBalance),
      String(summary.totalClosingDebit),
      String(summary.totalClosingCredit),
      String(summary.totalClosingBalance),
    ].join(","));

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `trial_balance_${from || "all"}_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // تجميع حسب التقرير النهائي
  const groupedByReport = items.reduce((acc, item) => {
    const key = item.finalReportName || "غير محدد";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, TrialBalanceItem[]>);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ميزان المراجعة</h1>
                <p className="text-sm text-gray-800">ميزان المراجعة الشامل لجميع الحسابات</p>
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
                  onClick={loadTrialBalance}
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  disabled={loading || !items.length}
                >
                  <Download className="w-4 h-4 ml-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={loading || !items.length}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Badge variant="secondary" className="text-base px-4 py-2">
                عدد الحسابات: {items.length}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي مدين: {formatCurrency(summary.totalCurrentDebit)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي دائن: {formatCurrency(summary.totalCurrentCredit)}
              </Badge>
              <Badge
                variant={summary.isBalanced ? "default" : "destructive"}
                className="text-base px-4 py-2"
              >
                {summary.isBalanced ? "✓ متوازن" : "✗ غير متوازن"}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                الفرق: {formatCurrency(Math.abs(summary.totalCurrentDebit - summary.totalCurrentCredit))}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Table - Grouped by Final Report Name */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">جاري تحميل البيانات...</span>
              </div>
            )}

            {!loading && (
              <div className="overflow-auto" dir="rtl">
                {Object.entries(groupedByReport).map(([reportName, reportItems]) => (
                  <div key={reportName} className="mb-8">
                    {/* Group Header */}
                    <div className="bg-primary-100 p-3 mb-2 rounded-t-lg">
                      <h3 className="text-lg font-bold text-primary-900">
                        {reportName || "غير محدد"}
                      </h3>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">رمز الحساب</TableHead>
                          <TableHead className="text-right">اسم الحساب</TableHead>
                          <TableHead className="text-right">رصيد افتتاحي مدين</TableHead>
                          <TableHead className="text-right">رصيد افتتاحي دائن</TableHead>
                          <TableHead className="text-right">رصيد افتتاحي</TableHead>
                          <TableHead className="text-right">حركات مدين</TableHead>
                          <TableHead className="text-right">حركات دائن</TableHead>
                          <TableHead className="text-right">رصيد حالي</TableHead>
                          <TableHead className="text-right">رصيد ختامي مدين</TableHead>
                          <TableHead className="text-right">رصيد ختامي دائن</TableHead>
                          <TableHead className="text-right">رصيد ختامي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell className="text-right font-mono text-sm">{item.accountCode}</TableCell>
                            <TableCell className="text-right font-medium">{item.accountName}</TableCell>
                            <TableCell className="text-right">
                              {item.openingDebit > 0 ? formatCurrency(item.openingDebit) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.openingCredit > 0 ? formatCurrency(item.openingCredit) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(item.openingBalance)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.currentDebit > 0 ? formatCurrency(item.currentDebit) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.currentCredit > 0 ? formatCurrency(item.currentCredit) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(item.currentBalance)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.closingDebit > 0 ? formatCurrency(item.closingDebit) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.closingCredit > 0 ? formatCurrency(item.closingCredit) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary-700">
                              {formatCurrency(item.closingBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}

                {!items.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد بيانات
                  </div>
                )}

                {/* Totals Row */}
                {items.length > 0 && (
                  <div className="mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary-50 font-bold">
                          <TableHead colSpan={2} className="text-right">
                            الإجمالي
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalOpeningDebit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalOpeningCredit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalOpeningBalance)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalCurrentDebit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalCurrentCredit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalCurrentBalance)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalClosingDebit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalClosingCredit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalClosingBalance)}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
