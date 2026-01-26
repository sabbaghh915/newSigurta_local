import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, TrendingDown, LayoutDashboard, Download, Printer } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatDate = (date: string) => new Date(date).toLocaleDateString("ar");

type DepreciationItem = {
  _id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  seq: string;
  seh1: number;
  seh2: number;
  seh3: number;
  seh4: number;
  seh5: number;
  seh6: number;
  seh7: number;
  seh2347: number;
  seh12347: number;
  total: number;
};

export default function DepreciationReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState<DepreciationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalSeh1: 0,
    totalSeh2: 0,
    totalSeh3: 0,
    totalSeh4: 0,
    totalSeh5: 0,
    totalSeh6: 0,
    totalSeh7: 0,
    totalSeh2347: 0,
    totalSeh12347: 0,
    grandTotal: 0,
  });

  const loadDepreciation = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/erp/reports/depreciation", { params });
      if (res.data.success) {
        const data = res.data.data || [];
        setItems(data);

        // حساب الإجماليات
        const totals = data.reduce(
          (acc: any, item: DepreciationItem) => ({
            totalSeh1: acc.totalSeh1 + (item.seh1 || 0),
            totalSeh2: acc.totalSeh2 + (item.seh2 || 0),
            totalSeh3: acc.totalSeh3 + (item.seh3 || 0),
            totalSeh4: acc.totalSeh4 + (item.seh4 || 0),
            totalSeh5: acc.totalSeh5 + (item.seh5 || 0),
            totalSeh6: acc.totalSeh6 + (item.seh6 || 0),
            totalSeh7: acc.totalSeh7 + (item.seh7 || 0),
            totalSeh2347: acc.totalSeh2347 + (item.seh2347 || 0),
            totalSeh12347: acc.totalSeh12347 + (item.seh12347 || 0),
            grandTotal: acc.grandTotal + (item.total || 0),
          }),
          {
            totalSeh1: 0,
            totalSeh2: 0,
            totalSeh3: 0,
            totalSeh4: 0,
            totalSeh5: 0,
            totalSeh6: 0,
            totalSeh7: 0,
            totalSeh2347: 0,
            totalSeh12347: 0,
            grandTotal: 0,
          }
        );
        setSummary(totals);
      }
    } catch (error) {
      console.error("Error loading depreciation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepreciation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = [
      "الرمز",
      "اسم الحساب",
      "SEh1",
      "SEh2",
      "SEh3",
      "SEh4",
      "SEh5",
      "SEh6",
      "SEh7",
      "SEh2347",
      "SEh12347",
      "الإجمالي",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    items.forEach((item) => {
      lines.push(
        [
          esc(item.accountCode),
          esc(item.accountName),
          String(item.seh1 || 0),
          String(item.seh2 || 0),
          String(item.seh3 || 0),
          String(item.seh4 || 0),
          String(item.seh5 || 0),
          String(item.seh6 || 0),
          String(item.seh7 || 0),
          String(item.seh2347 || 0),
          String(item.seh12347 || 0),
          String(item.total || 0),
        ].join(",")
      );
    });

    // إضافة الإجماليات
    lines.push([
      esc("الإجمالي"),
      "",
      String(summary.totalSeh1),
      String(summary.totalSeh2),
      String(summary.totalSeh3),
      String(summary.totalSeh4),
      String(summary.totalSeh5),
      String(summary.totalSeh6),
      String(summary.totalSeh7),
      String(summary.totalSeh2347),
      String(summary.totalSeh12347),
      String(summary.grandTotal),
    ].join(","));

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `depreciation_${from || "all"}_${to || "all"}.csv`;
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
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">تقرير الإهلاك</h1>
                <p className="text-sm text-gray-800">تقرير الإهلاك الشامل لجميع الحسابات</p>
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
                  onClick={loadDepreciation}
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
                إجمالي الإهلاك: {formatCurrency(summary.grandTotal)}
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
                      <TableHead className="text-right">الرمز</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">SEh1</TableHead>
                      <TableHead className="text-right">SEh2</TableHead>
                      <TableHead className="text-right">SEh3</TableHead>
                      <TableHead className="text-right">SEh4</TableHead>
                      <TableHead className="text-right">SEh5</TableHead>
                      <TableHead className="text-right">SEh6</TableHead>
                      <TableHead className="text-right">SEh7</TableHead>
                      <TableHead className="text-right">SEh2347</TableHead>
                      <TableHead className="text-right">SEh12347</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="text-right font-mono text-sm">{item.accountCode}</TableCell>
                        <TableCell className="text-right font-medium">{item.accountName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh1)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh2)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh3)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh4)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh5)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh6)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh7)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh2347)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.seh12347)}</TableCell>
                        <TableCell className="text-right font-bold text-primary-700">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

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
                            {formatCurrency(summary.totalSeh1)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh2)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh3)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh4)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh5)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh6)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh7)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh2347)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalSeh12347)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.grandTotal)}
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
