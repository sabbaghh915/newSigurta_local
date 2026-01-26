import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { api } from "../lib/api";
import { Home, FileBarChart, LayoutDashboard } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatNumber = (n: number) => Number(n || 0).toLocaleString("ar");
const formatPercent = (n: number) => Number(n || 0).toFixed(2) + "%";

type ReportType = "income-statement" | "balance-sheet" | "cash-flow" | "expenses-by-category" | "revenue-by-period";

export default function FinancialReports() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    { 
      id: "income-statement" as ReportType, 
      title: "قائمة الدخل", 
      description: "الإيرادات والمصروفات وصافي الربح", 
      icon: "📊",
      color: "bg-green-500"
    },
    { 
      id: "balance-sheet" as ReportType, 
      title: "الميزانية العمومية", 
      description: "الأصول والخصوم وحقوق الملكية", 
      icon: "⚖️",
      color: "bg-blue-500"
    },
    { 
      id: "cash-flow" as ReportType, 
      title: "قائمة التدفقات النقدية", 
      description: "التدفقات النقدية الداخلة والخارجة", 
      icon: "💰",
      color: "bg-purple-500"
    },
    { 
      id: "expenses-by-category" as ReportType, 
      title: "المصروفات حسب الفئة", 
      description: "تحليل المصروفات حسب التصنيف", 
      icon: "📉",
      color: "bg-red-500"
    },
    { 
      id: "revenue-by-period" as ReportType, 
      title: "الإيرادات حسب الفترة", 
      description: "تحليل الإيرادات الشهري", 
      icon: "📈",
      color: "bg-yellow-500"
    },
  ];

  const loadReport = async (reportType: ReportType) => {
    setLoading(true);
    try {
      let endpoint = "";
      let params = "";

      if (from && to) {
        params = `?from=${from}&to=${to}`;
      }

      switch (reportType) {
        case "income-statement":
          endpoint = `/erp/reports/income-statement${params}`;
          break;
        case "balance-sheet":
          endpoint = `/erp/reports/balance-sheet${to ? `?date=${to}` : ""}`;
          break;
        case "cash-flow":
          endpoint = `/erp/reports/cash-flow${params}`;
          break;
        case "expenses-by-category":
          endpoint = `/erp/reports/expenses-by-category${params}`;
          break;
        case "revenue-by-period":
          endpoint = `/erp/reports/revenue-by-period${params}`;
          break;
      }

      const res = await api.get(endpoint);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (error) {
      console.error("Error loading report:", error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (reportType: ReportType) => {
    setSelectedReport(reportType);
    setReportData(null);
  };

  const handleGenerateReport = () => {
    if (selectedReport) {
      loadReport(selectedReport);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderIncomeStatement = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-green-800">الإيرادات</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>إجمالي الإيرادات:</span>
                  <span className="font-bold">{formatCurrency(reportData.revenue?.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>دخل الأقساط:</span>
                  <span>{formatCurrency(reportData.revenue?.premiumIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>دخل العمولات:</span>
                  <span>{formatCurrency(reportData.revenue?.commissionsIncome)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>عدد البوليصات:</span>
                  <span>{formatNumber(reportData.revenue?.totalPolicies)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-red-800">المصروفات</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>إجمالي المصروفات:</span>
                  <span className="font-bold">{formatCurrency(reportData.expenses?.totalExpenses)}</span>
                </div>
                <Separator />
                {reportData.expenses?.byCategory?.slice(0, 3).map((cat: any) => (
                  <div key={cat._id} className="flex justify-between text-sm">
                    <span>{cat._id}:</span>
                    <span>{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">الربحية</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>صافي الربح:</span>
                <span className="font-bold text-blue-900">{formatCurrency(reportData.profitability?.netIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>هامش الربح الصافي:</span>
                <Badge variant={reportData.profitability?.netMargin > 0 ? "default" : "destructive"}>
                  {formatPercent(reportData.profitability?.netMargin)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {reportData.expenses?.byCategory?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>تفصيل المصروفات حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">العدد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.expenses.byCategory.map((cat: any) => (
                    <TableRow key={cat._id}>
                      <TableCell className="text-right font-medium">{cat._id}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.total)}</TableCell>
                      <TableCell className="text-right">{cat.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-green-800">الأصول</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>النقدية:</span>
                  <span>{formatCurrency(reportData.assets?.cash)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>الذمم المدينة:</span>
                  <span>{formatCurrency(reportData.assets?.receivables)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>أصول أخرى:</span>
                  <span>{formatCurrency(reportData.assets?.other)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>إجمالي الأصول:</span>
                  <span>{formatCurrency(reportData.assets?.totalAssets)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-800">الخصوم</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>الذمم الدائنة:</span>
                    <span>{formatCurrency(reportData.liabilities?.payables)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>خصوم أخرى:</span>
                    <span>{formatCurrency(reportData.liabilities?.other)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>إجمالي الخصوم:</span>
                    <span>{formatCurrency(reportData.liabilities?.totalLiabilities)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">حقوق الملكية</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>رأس المال:</span>
                    <span>{formatCurrency(reportData.equity?.capital)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>الأرباح المحتجزة:</span>
                    <span>{formatCurrency(reportData.equity?.retainedEarnings)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>إجمالي حقوق الملكية:</span>
                    <span>{formatCurrency(reportData.equity?.totalEquity)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className={reportData.summary?.balanced ? "bg-green-50" : "bg-yellow-50"}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">التوازن المحاسبي</h3>
                <p className="text-sm text-muted-foreground">الأصول = الخصوم + حقوق الملكية</p>
              </div>
              <Badge variant={reportData.summary?.balanced ? "default" : "destructive"} className="text-lg px-4 py-2">
                {reportData.summary?.balanced ? "✓ متوازن" : "✗ غير متوازن"}
              </Badge>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">إجمالي الأصول</p>
                <p className="text-xl font-bold">{formatCurrency(reportData.summary?.totalAssets)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">الخصوم + حقوق الملكية</p>
                <p className="text-xl font-bold">{formatCurrency(reportData.summary?.totalLiabilitiesAndEquity)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCashFlow = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-green-800">التدفقات الداخلة</h3>
              <div className="space-y-2">
                {reportData.operatingActivities?.inflows?.map((item: any) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item._id || "نقدي"}:</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>إجمالي التدفقات الداخلة:</span>
                  <span>{formatCurrency(reportData.operatingActivities?.totalInflows)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-red-800">التدفقات الخارجة</h3>
              <div className="space-y-2">
                {reportData.operatingActivities?.outflows?.slice(0, 5).map((item: any) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item._id}:</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>إجمالي التدفقات الخارجة:</span>
                  <span>{formatCurrency(reportData.operatingActivities?.totalOutflows)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">ملخص التدفقات النقدية</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>صافي التدفق النقدي:</span>
                <Badge variant={reportData.operatingActivities?.netCashFlow >= 0 ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {formatCurrency(reportData.operatingActivities?.netCashFlow)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {reportData.operatingActivities?.outflows?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>تفصيل التدفقات الخارجة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">العدد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.operatingActivities.outflows.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell className="text-right font-medium">{item._id}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderExpensesByCategory = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6" dir="rtl">
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm text-muted-foreground">إجمالي المصروفات</h3>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(reportData.totalExpenses)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المصروفات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">النسبة</TableHead>
                  <TableHead className="text-right">المدفوع</TableHead>
                  <TableHead className="text-right">المعلق</TableHead>
                  <TableHead className="text-right">العدد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.categories?.map((cat: any) => (
                  <TableRow key={cat._id}>
                    <TableCell className="text-right font-medium">{cat._id}</TableCell>
                    <TableCell className="text-right">{formatCurrency(cat.total)}</TableCell>
                    <TableCell className="text-right">
                      <Badge>{formatPercent(cat.percentage)}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(cat.paid)}</TableCell>
                    <TableCell className="text-right text-yellow-600">{formatCurrency(cat.pending)}</TableCell>
                    <TableCell className="text-right">{cat.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRevenueByPeriod = () => {
    if (!reportData) return null;

    const monthNames = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];

    return (
      <div className="space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الشهر/السنة</TableHead>
                  <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                  <TableHead className="text-right">عدد البوليصات</TableHead>
                  <TableHead className="text-right">متوسط الدفعة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.byMonth?.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="text-right font-medium">
                      {monthNames[item._id.month - 1]} {item._id.year}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.totalPolicies)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.avgPayment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل التقرير...</p>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center py-20 text-muted-foreground">
          <p>اختر تقريراً وحدد الفترة الزمنية ثم اضغط على "إنشاء التقرير"</p>
        </div>
      );
    }

    switch (selectedReport) {
      case "income-statement":
        return renderIncomeStatement();
      case "balance-sheet":
        return renderBalanceSheet();
      case "cash-flow":
        return renderCashFlow();
      case "expenses-by-category":
        return renderExpensesByCategory();
      case "revenue-by-period":
        return renderRevenueByPeriod();
      default:
        return null;
    }
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
                <h1 className="text-xl font-bold text-gray-800">التقارير المالية</h1>
                <p className="text-sm text-gray-800">تقارير محاسبية شاملة</p>
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
              {reportData && (
                <Button onClick={handlePrint} className="print:hidden bg-primary-50 hover:bg-primary-100 text-gray-800 border-primary-300 h-9 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 ml-2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect width="12" height="8" x="6" y="14" />
                  </svg>
                  طباعة
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">

        {/* Report Selection */}
        {!selectedReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card 
                key={report.id} 
                className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                onClick={() => handleReportSelect(report.id)}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full ${report.color} flex items-center justify-center text-3xl mb-3`}>
                    {report.icon}
                  </div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  <Button className="w-full">عرض التقرير</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Report Filters and Content */}
        {selectedReport && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {reports.find(r => r.id === selectedReport)?.title}
                  </CardTitle>
                  <Button variant="outline" onClick={() => { setSelectedReport(null); setReportData(null); }}>
                    ← العودة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" dir="rtl">
                  <div className="space-y-2">
                    <Label>من تاريخ</Label>
                    <Input 
                      type="date" 
                      value={from} 
                      onChange={(e) => setFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>إلى تاريخ</Label>
                    <Input 
                      type="date" 
                      value={to} 
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2 md:col-span-2">
                    <Button onClick={handleGenerateReport} className="flex-1">
                      إنشاء التقرير
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { setFrom(""); setTo(""); setReportData(null); }}
                    >
                      إعادة تعيين
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="print:block">
              {renderReportContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
