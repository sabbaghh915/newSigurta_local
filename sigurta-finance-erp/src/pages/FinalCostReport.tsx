import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, DollarSign, LayoutDashboard, Download, Printer } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

type CostItem = {
  accountId: string;
  accountCode: string;
  accountName: string;
  costCenterId: string;
  costCenterName: string;
  sumDb: number;
  sumCr: number;
  sumBal: number;
};

export default function FinalCostReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalDb: 0,
    totalCr: 0,
    totalBal: 0,
  });

  const loadCost = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/erp/reports/final-cost", { params });
      if (res.data.success) {
        const data = res.data.data || [];
        setItems(data);

        // حساب الإجماليات
        const totals = data.reduce(
          (acc: any, item: CostItem) => ({
            totalDb: acc.totalDb + (item.sumDb || 0),
            totalCr: acc.totalCr + (item.sumCr || 0),
            totalBal: acc.totalBal + (item.sumBal || 0),
          }),
          { totalDb: 0, totalCr: 0, totalBal: 0 }
        );
        setSummary(totals);
      }
    } catch (error) {
      console.error("Error loading final cost:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = ["رمز الحساب", "اسم الحساب", "مركز التكلفة", "مدين", "دائن", "الرصيد"];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    items.forEach((item) => {
      lines.push(
        [
          esc(item.accountCode),
          esc(item.accountName),
          esc(item.costCenterName),
          String(item.sumDb || 0),
          String(item.sumCr || 0),
          String(item.sumBal || 0),
        ].join(",")
      );
    });

    // إضافة الإجماليات
    lines.push([
      esc("الإجمالي"),
      "",
      "",
      String(summary.totalDb),
      String(summary.totalCr),
      String(summary.totalBal),
    ].join(","));

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `final_cost_${from || "all"}_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // تجميع حسب مركز التكلفة
  const groupedByCenter = items.reduce((acc, item) => {
    const key = item.costCenterName || "غير محدد";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CostItem[]>);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">تقرير التكلفة النهائية</h1>
                <p className="text-sm text-gray-800">التكلفة النهائية حسب الحساب ومركز التكلفة</p>
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
                  onClick={loadCost}
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
                عدد السجلات: {items.length}
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
            </div>
          </CardContent>
        </Card>

        {/* Table - Grouped by Cost Center */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">جاري تحميل البيانات...</span>
              </div>
            )}

            {!loading && (
              <div className="overflow-auto" dir="rtl">
                {Object.entries(groupedByCenter).map(([centerName, centerItems]) => (
                  <div key={centerName} className="mb-8">
                    {/* Group Header */}
                    <div className="bg-primary-100 p-3 mb-2 rounded-t-lg">
                      <h3 className="text-lg font-bold text-primary-900">
                        {centerName}
                      </h3>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">رمز الحساب</TableHead>
                          <TableHead className="text-right">اسم الحساب</TableHead>
                          <TableHead className="text-right">مدين</TableHead>
                          <TableHead className="text-right">دائن</TableHead>
                          <TableHead className="text-right">الرصيد</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {centerItems.map((item, idx) => (
                          <TableRow key={`${item.accountId}_${item.costCenterId}_${idx}`}>
                            <TableCell className="text-right font-mono text-sm">{item.accountCode}</TableCell>
                            <TableCell className="text-right font-medium">{item.accountName}</TableCell>
                            <TableCell className="text-right">
                              {item.sumDb > 0 ? formatCurrency(item.sumDb) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.sumCr > 0 ? formatCurrency(item.sumCr) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(item.sumBal)}
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
                            {formatCurrency(summary.totalDb)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalCr)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalBal)}
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
