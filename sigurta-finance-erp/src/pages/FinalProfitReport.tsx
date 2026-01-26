import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, TrendingUp, LayoutDashboard, Download, Printer } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

type ProfitItem = {
  _id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accDaily: boolean;
  accAmt: number;
  accDBCR: boolean;
};

export default function FinalProfitReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [revenue, setRevenue] = useState<ProfitItem[]>([]);
  const [expenses, setExpenses] = useState<ProfitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
  });

  const loadProfit = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/erp/reports/final-profit", { params });
      if (res.data.success) {
        const data = res.data.data || {};
        setRevenue(data.revenue || []);
        setExpenses(data.expenses || []);
        setSummary({
          totalRevenue: data.totalRevenue || 0,
          totalExpense: data.totalExpense || 0,
          netProfit: data.netProfit || 0,
        });
      }
    } catch (error) {
      console.error("Error loading final profit:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = ["رمز الحساب", "اسم الحساب", "المبلغ", "نوع"];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    lines.push(esc("=== الإيرادات ==="));
    revenue.forEach((item) => {
      lines.push(
        [
          esc(item.accountCode),
          esc(item.accountName),
          String(item.accAmt || 0),
          esc("إيراد"),
        ].join(",")
      );
    });

    lines.push(esc("=== المصروفات ==="));
    expenses.forEach((item) => {
      lines.push(
        [
          esc(item.accountCode),
          esc(item.accountName),
          String(item.accAmt || 0),
          esc("مصروف"),
        ].join(",")
      );
    });

    lines.push(esc("=== الإجماليات ==="));
    lines.push([esc("إجمالي الإيرادات"), "", String(summary.totalRevenue), ""].join(","));
    lines.push([esc("إجمالي المصروفات"), "", String(summary.totalExpense), ""].join(","));
    lines.push([esc("صافي الربح"), "", String(summary.netProfit), ""].join(","));

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `final_profit_${from || "all"}_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">تقرير الربح النهائي</h1>
                <p className="text-sm text-gray-800">تقرير الربح النهائي (الإيرادات والمصروفات)</p>
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
                  onClick={loadProfit}
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  disabled={loading || (!revenue.length && !expenses.length)}
                >
                  <Download className="w-4 h-4 ml-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={loading || (!revenue.length && !expenses.length)}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Badge variant="default" className="text-base px-4 py-2 bg-green-100 text-green-800">
                إجمالي الإيرادات: {formatCurrency(summary.totalRevenue)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2 bg-red-100 text-red-800">
                إجمالي المصروفات: {formatCurrency(summary.totalExpense)}
              </Badge>
              <Badge
                variant={summary.netProfit >= 0 ? "default" : "destructive"}
                className="text-base px-4 py-2"
              >
                صافي الربح: {formatCurrency(summary.netProfit)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-green-700">الإيرادات</CardTitle>
          </CardHeader>
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
                      <TableHead className="text-right">رمز الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenue.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="text-right font-mono text-sm">{item.accountCode}</TableCell>
                        <TableCell className="text-right font-medium">{item.accountName}</TableCell>
                        <TableCell className="text-right font-bold text-green-700">
                          {formatCurrency(item.accAmt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!revenue.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد إيرادات
                  </div>
                )}

                {revenue.length > 0 && (
                  <div className="mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-50 font-bold">
                          <TableHead colSpan={2} className="text-right">
                            إجمالي الإيرادات
                          </TableHead>
                          <TableHead className="text-right font-bold text-green-700">
                            {formatCurrency(summary.totalRevenue)}
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

        {/* Expenses Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-red-700">المصروفات</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!loading && (
              <div className="overflow-auto" dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رمز الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="text-right font-mono text-sm">{item.accountCode}</TableCell>
                        <TableCell className="text-right font-medium">{item.accountName}</TableCell>
                        <TableCell className="text-right font-bold text-red-700">
                          {formatCurrency(item.accAmt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!expenses.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد مصروفات
                  </div>
                )}

                {expenses.length > 0 && (
                  <div className="mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-50 font-bold">
                          <TableHead colSpan={2} className="text-right">
                            إجمالي المصروفات
                          </TableHead>
                          <TableHead className="text-right font-bold text-red-700">
                            {formatCurrency(summary.totalExpense)}
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

        {/* Net Profit Summary */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="text-center p-6 bg-primary-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">صافي الربح</h3>
              <p
                className={`text-4xl font-bold ${
                  summary.netProfit >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {formatCurrency(summary.netProfit)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
