import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, Calendar, LayoutDashboard, Download, Printer } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

const monthNames = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

type MonthlyBalance = {
  debit: number;
  credit: number;
  balance: number;
};

type YearlyTrialBalanceItem = {
  _id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  finalReportName?: string;
  openingBalance: MonthlyBalance;
  months: MonthlyBalance[];
  total: MonthlyBalance;
};

export default function YearlyTrialBalanceReport() {
  const navigate = useNavigate();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [items, setItems] = useState<YearlyTrialBalanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalOpeningDebit: 0,
    totalOpeningCredit: 0,
    totalOpeningBalance: 0,
    monthlyTotals: Array(12).fill(null).map(() => ({ debit: 0, credit: 0, balance: 0 })),
    totalDebit: 0,
    totalCredit: 0,
    totalBalance: 0,
    isBalanced: false,
  });

  const loadYearlyTrialBalance = async () => {
    setLoading(true);
    try {
      const res = await api.get("/erp/reports/yearly-trial-balance", {
        params: { year },
      });
      if (res.data.success) {
        const data = res.data.data || [];
        setItems(data);

        // حساب الإجماليات
        const totals = data.reduce(
          (acc: any, item: YearlyTrialBalanceItem) => {
            const monthly = Array(12).fill(null).map(() => ({ debit: 0, credit: 0, balance: 0 }));
            
            item.months.forEach((month, idx) => {
              monthly[idx].debit += month.debit || 0;
              monthly[idx].credit += month.credit || 0;
              monthly[idx].balance += month.balance || 0;
            });

            return {
              totalOpeningDebit: acc.totalOpeningDebit + (item.openingBalance.debit || 0),
              totalOpeningCredit: acc.totalOpeningCredit + (item.openingBalance.credit || 0),
              totalOpeningBalance: acc.totalOpeningBalance + (item.openingBalance.balance || 0),
              monthlyTotals: acc.monthlyTotals.map((m: MonthlyBalance, idx: number) => ({
                debit: m.debit + monthly[idx].debit,
                credit: m.credit + monthly[idx].credit,
                balance: m.balance + monthly[idx].balance,
              })),
              totalDebit: acc.totalDebit + (item.total.debit || 0),
              totalCredit: acc.totalCredit + (item.total.credit || 0),
              totalBalance: acc.totalBalance + (item.total.balance || 0),
            };
          },
          {
            totalOpeningDebit: 0,
            totalOpeningCredit: 0,
            totalOpeningBalance: 0,
            monthlyTotals: Array(12).fill(null).map(() => ({ debit: 0, credit: 0, balance: 0 })),
            totalDebit: 0,
            totalCredit: 0,
            totalBalance: 0,
          }
        );

        // التحقق من التوازن
        const isBalanced = Math.abs(totals.totalDebit - totals.totalCredit) < 0.01;

        setSummary({
          ...totals,
          isBalanced,
        });
      }
    } catch (error) {
      console.error("Error loading yearly trial balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYearlyTrialBalance();
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
      ...monthNames.flatMap((m) => [`${m} مدين`, `${m} دائن`, `${m} رصيد`]),
      "إجمالي مدين",
      "إجمالي دائن",
      "إجمالي رصيد",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    items.forEach((item) => {
      const monthData = item.months.flatMap((m) => [
        String(m.debit || 0),
        String(m.credit || 0),
        String(m.balance || 0),
      ]);
      lines.push(
        [
          esc(item.accountCode),
          esc(item.accountName),
          esc(item.finalReportName || ""),
          String(item.openingBalance.debit || 0),
          String(item.openingBalance.credit || 0),
          String(item.openingBalance.balance || 0),
          ...monthData,
          String(item.total.debit || 0),
          String(item.total.credit || 0),
          String(item.total.balance || 0),
        ].join(",")
      );
    });

    // إضافة الإجماليات
    const summaryMonthData = summary.monthlyTotals.flatMap((m) => [
      String(m.debit),
      String(m.credit),
      String(m.balance),
    ]);
    lines.push([
      esc("الإجمالي"),
      "",
      "",
      String(summary.totalOpeningDebit),
      String(summary.totalOpeningCredit),
      String(summary.totalOpeningBalance),
      ...summaryMonthData,
      String(summary.totalDebit),
      String(summary.totalCredit),
      String(summary.totalBalance),
    ].join(","));

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `yearly_trial_balance_${year}.csv`;
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
  }, {} as Record<string, YearlyTrialBalanceItem[]>);

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
                <h1 className="text-xl font-bold text-gray-800">ميزان المراجعة السنوي</h1>
                <p className="text-sm text-gray-800">ميزان المراجعة الشامل على مدار السنة</p>
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
                <Label>السنة</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={loading}
                  min="2000"
                  max="2100"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  className="flex-1"
                  onClick={loadYearlyTrialBalance}
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
                إجمالي مدين: {formatCurrency(summary.totalDebit)}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي دائن: {formatCurrency(summary.totalCredit)}
              </Badge>
              <Badge
                variant={summary.isBalanced ? "default" : "destructive"}
                className="text-base px-4 py-2"
              >
                {summary.isBalanced ? "✓ متوازن" : "✗ غير متوازن"}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                الفرق: {formatCurrency(Math.abs(summary.totalDebit - summary.totalCredit))}
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

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right sticky right-0 bg-white z-10 min-w-[100px]">
                              رمز الحساب
                            </TableHead>
                            <TableHead className="text-right sticky right-[100px] bg-white z-10 min-w-[200px]">
                              اسم الحساب
                            </TableHead>
                            <TableHead className="text-right min-w-[80px]">المدور مدين</TableHead>
                            <TableHead className="text-right min-w-[80px]">المدور دائن</TableHead>
                            <TableHead className="text-right min-w-[80px]">المدور رصيد</TableHead>
                            {monthNames.map((month, idx) => (
                              <React.Fragment key={idx}>
                                <TableHead className="text-right min-w-[70px]">{month} مدين</TableHead>
                                <TableHead className="text-right min-w-[70px]">{month} دائن</TableHead>
                                <TableHead className="text-right min-w-[70px]">{month} رصيد</TableHead>
                              </React.Fragment>
                            ))}
                            <TableHead className="text-right min-w-[80px]">إجمالي مدين</TableHead>
                            <TableHead className="text-right min-w-[80px]">إجمالي دائن</TableHead>
                            <TableHead className="text-right min-w-[80px]">إجمالي رصيد</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportItems.map((item) => (
                            <TableRow key={item._id}>
                              <TableCell className="text-right font-mono text-sm sticky right-0 bg-white z-10">
                                {item.accountCode}
                              </TableCell>
                              <TableCell className="text-right font-medium sticky right-[100px] bg-white z-10">
                                {item.accountName}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.openingBalance.debit > 0 ? formatCurrency(item.openingBalance.debit) : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.openingBalance.credit > 0 ? formatCurrency(item.openingBalance.credit) : "—"}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(item.openingBalance.balance)}
                              </TableCell>
                              {item.months.map((month, idx) => (
                                <React.Fragment key={idx}>
                                  <TableCell className="text-right text-xs">
                                    {month.debit > 0 ? formatCurrency(month.debit) : "—"}
                                  </TableCell>
                                  <TableCell className="text-right text-xs">
                                    {month.credit > 0 ? formatCurrency(month.credit) : "—"}
                                  </TableCell>
                                  <TableCell className="text-right text-xs font-bold">
                                    {formatCurrency(month.balance)}
                                  </TableCell>
                                </React.Fragment>
                              ))}
                              <TableCell className="text-right font-bold text-primary-700">
                                {formatCurrency(item.total.debit)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary-700">
                                {formatCurrency(item.total.credit)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary-700">
                                {formatCurrency(item.total.balance)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary-50 font-bold">
                            <TableHead colSpan={2} className="text-right sticky right-0 bg-primary-50 z-10">
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
                            {summary.monthlyTotals.map((month, idx) => (
                              <React.Fragment key={idx}>
                                <TableHead className="text-right font-bold text-primary-700 text-xs">
                                  {formatCurrency(month.debit)}
                                </TableHead>
                                <TableHead className="text-right font-bold text-primary-700 text-xs">
                                  {formatCurrency(month.credit)}
                                </TableHead>
                                <TableHead className="text-right font-bold text-primary-700 text-xs">
                                  {formatCurrency(month.balance)}
                                </TableHead>
                              </React.Fragment>
                            ))}
                            <TableHead className="text-right font-bold text-primary-700">
                              {formatCurrency(summary.totalDebit)}
                            </TableHead>
                            <TableHead className="text-right font-bold text-primary-700">
                              {formatCurrency(summary.totalCredit)}
                            </TableHead>
                            <TableHead className="text-right font-bold text-primary-700">
                              {formatCurrency(summary.totalBalance)}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                      </Table>
                    </div>
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
