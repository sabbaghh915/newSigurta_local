import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import { Home, FileBarChart, LayoutDashboard } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatNumber = (n: number) => Number(n || 0).toLocaleString("ar");

type ReportType = 
  | "contracts-by-month"
  | "revenue-by-company"
  | "revenue-by-centers"
  | "union-share-company"
  | "union-share-center"
  | "detailed-expenses"
  | "journal-entries"
  | "account-balances"
  | "profitability";

export default function Reports() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    {
      id: "contracts-by-month" as ReportType,
      title: "العقود حسب الأشهر",
      description: "توزيع عدد العقود على أشهر السنة",
      icon: "📅",
      color: "bg-blue-500",
      category: "إحصائيات"
    },
    {
      id: "revenue-by-company" as ReportType,
      title: "الإيرادات حسب الشركات",
      description: "توزيع الإيرادات على شركات التأمين",
      icon: "🏢",
      color: "bg-green-500",
      category: "مالي"
    },
    {
      id: "revenue-by-centers" as ReportType,
      title: "الإيرادات حسب المراكز",
      description: "توزيع الإيرادات على المراكز",
      icon: "🏪",
      color: "bg-purple-500",
      category: "مالي"
    },
    {
      id: "union-share-company" as ReportType,
      title: "حصة الاتحاد حسب الشركات",
      description: "توزيع حصة الاتحاد (5%) على الشركات",
      icon: "🤝",
      color: "bg-yellow-500",
      category: "مالي"
    },
    {
      id: "union-share-center" as ReportType,
      title: "حصة الاتحاد حسب المراكز",
      description: "توزيع حصة الاتحاد (5%) على المراكز",
      icon: "📊",
      color: "bg-orange-500",
      category: "مالي"
    },
    {
      id: "detailed-expenses" as ReportType,
      title: "تقرير المصروفات التفصيلي",
      description: "جميع المصروفات مع التفاصيل الكاملة",
      icon: "💰",
      color: "bg-red-500",
      category: "مالي"
    },
    {
      id: "journal-entries" as ReportType,
      title: "تقرير القيود المحاسبية",
      description: "جميع القيود المحاسبية المسجلة",
      icon: "📝",
      color: "bg-indigo-500",
      category: "محاسبي"
    },
    {
      id: "account-balances" as ReportType,
      title: "أرصدة الحسابات",
      description: "أرصدة جميع الحسابات في النظام",
      icon: "💵",
      color: "bg-teal-500",
      category: "محاسبي"
    },
    {
      id: "profitability" as ReportType,
      title: "تقرير الربحية",
      description: "الإيرادات والمصروفات وصافي الربح",
      icon: "📈",
      color: "bg-pink-500",
      category: "تحليلي"
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
        case "contracts-by-month":
          endpoint = `/reports/contracts-by-month${params}`;
          break;
        case "revenue-by-company":
          endpoint = `/reports/revenue-by-company${params}`;
          break;
        case "revenue-by-centers":
          endpoint = `/reports/revenue-by-centers${params}`;
          break;
        case "union-share-company":
          endpoint = `/reports/union-share${params ? params + '&' : '?'}groupBy=company`;
          break;
        case "union-share-center":
          endpoint = `/reports/union-share${params ? params + '&' : '?'}groupBy=center`;
          break;
        case "detailed-expenses":
          endpoint = `/reports/detailed-expenses${params}`;
          break;
        case "journal-entries":
          endpoint = `/reports/journal-entries${params}`;
          break;
        case "account-balances":
          endpoint = `/reports/account-balances`;
          break;
        case "profitability":
          endpoint = `/reports/profitability${params}`;
          break;
      }

      const res = await api.get(endpoint);
      if (res.data.success) {
        setReportData(res.data);
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

    // عرض التقرير حسب النوع
    return (
      <div className="space-y-4" dir="rtl">
        {renderSpecificReport()}
      </div>
    );
  };

  const renderSpecificReport = () => {
    const data = reportData.data;

    switch (selectedReport) {
      case "contracts-by-month":
        return (
          <Card>
            <CardHeader>
              <CardTitle>العقود حسب الأشهر - {reportData.year}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الشهر</TableHead>
                    <TableHead className="text-right">عدد العقود</TableHead>
                    <TableHead className="text-right">الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: any) => (
                    <TableRow key={item.monthNumber}>
                      <TableCell className="text-right font-medium">{item.month}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.count)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "revenue-by-company":
      case "revenue-by-centers":
        const titleField = selectedReport === "revenue-by-company" ? "companyName" : "centerName";
        return (
          <Card>
            <CardHeader>
              <CardTitle>{reports.find(r => r.id === selectedReport)?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                    <TableHead className="text-right">صافي القسط</TableHead>
                    <TableHead className="text-right">العمولة</TableHead>
                    <TableHead className="text-right">العدد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="text-right font-medium">{item[titleField]}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.netPremium)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.commission)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.count)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "union-share-company":
      case "union-share-center":
        return (
          <Card>
            <CardHeader>
              <CardTitle>{reports.find(r => r.id === selectedReport)?.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                الإجمالي: {formatCurrency(reportData.total)}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">حصة الاتحاد</TableHead>
                    <TableHead className="text-right">النسبة</TableHead>
                    <TableHead className="text-right">العدد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="text-right font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalUnionShare)}</TableCell>
                      <TableCell className="text-right">
                        <Badge>{item.percentage}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(item.count)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "profitability":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(data.totalRevenue)}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(data.totalExpenses)}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">صافي الربح</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(data.netProfit)}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">هامش الربح</p>
                    <Badge className="text-lg px-4 py-2">{data.profitMargin}%</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">عدد البوليصات</p>
                    <p className="text-xl font-semibold">{formatNumber(data.policiesCount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "detailed-expenses":
        return (
          <>
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                    <p className="text-xl font-bold">{formatCurrency(reportData.summary?.totalExpenses)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground text-green-700">المدفوع</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(reportData.summary?.paidExpenses)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground text-yellow-700">المعلق</p>
                    <p className="text-xl font-bold text-yellow-700">{formatCurrency(reportData.summary?.pendingExpenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>المصروفات التفصيلية</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">المُنشئ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((expense: any) => (
                      <TableRow key={expense._id}>
                        <TableCell className="text-right">{new Date(expense.date).toLocaleDateString("ar")}</TableCell>
                        <TableCell className="text-right font-medium">{expense.category}</TableCell>
                        <TableCell className="text-right">{expense.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={expense.status === "paid" ? "default" : "secondary"}>
                            {expense.status === "paid" ? "مدفوع" : expense.status === "pending" ? "معلق" : "مسودة"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{expense.createdBy?.fullName || expense.createdBy?.username || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        );

      case "journal-entries":
        return (
          <Card>
            <CardHeader>
              <CardTitle>القيود المحاسبية</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم القيد</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المدين</TableHead>
                    <TableHead className="text-right">الدائن</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">المُنشئ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((entry: any) => (
                    <TableRow key={entry._id}>
                      <TableCell className="text-right font-medium">{entry.entryNumber}</TableCell>
                      <TableCell className="text-right">{new Date(entry.date).toLocaleDateString("ar")}</TableCell>
                      <TableCell className="text-right">{entry.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.totalDebit)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.totalCredit)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          entry.status === "approved" ? "default" : 
                          entry.status === "rejected" ? "destructive" : 
                          "secondary"
                        }>
                          {entry.status === "approved" ? "معتمد" : entry.status === "rejected" ? "مرفوض" : "معلق"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{entry.createdBy?.fullName || entry.createdBy?.username || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "account-balances":
        return (
          <Card>
            <CardHeader>
              <CardTitle>أرصدة الحسابات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رمز الحساب</TableHead>
                    <TableHead className="text-right">اسم الحساب</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">رصيد مدين</TableHead>
                    <TableHead className="text-right">رصيد دائن</TableHead>
                    <TableHead className="text-right">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((account: any) => (
                    <TableRow key={account._id}>
                      <TableCell className="text-right font-mono">{account.code}</TableCell>
                      <TableCell className="text-right font-medium">{account.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {account.type === "asset" ? "أصل" : 
                           account.type === "liability" ? "خصم" :
                           account.type === "equity" ? "حقوق ملكية" :
                           account.type === "revenue" ? "إيراد" : "مصروف"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(account.debitBalance)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(account.creditBalance)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(account.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">تقرير قيد التطوير...</p>
            </CardContent>
          </Card>
        );
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
                <h1 className="text-xl font-bold text-gray-800">التقارير</h1>
                <p className="text-sm text-gray-800">تقارير شاملة للنظام</p>
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
                  <Badge variant="outline" className="w-fit">{report.category}</Badge>
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

            {renderReportContent()}
          </>
        )}
      </div>
    </div>
  );
}
