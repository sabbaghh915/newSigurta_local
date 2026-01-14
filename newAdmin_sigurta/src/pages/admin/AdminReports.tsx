import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import ReportViewer from "../../components/reports/ReportViewer";
import {
  BarChart3,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  PieChart,
  DollarSign,
  Car,
  Shield,
  FileCheck,
  AlertCircle,
  Download,
  Search,
  Printer,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Database,
  CreditCard,
  MapPin,
  FileBarChart,
  Receipt,
  UserCheck,
  Globe,
  Layers,
  BarChart,
  LineChart,
} from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "distribution" | "financial" | "contracts" | "operations" | "export";
}

const REPORTS: ReportItem[] = [
  // توزيعات
  {
    id: "contracts-by-month",
    title: "توزع عدد العقود على أشهر السنة",
    description: "عرض عدد العقود المصدرة لكل شهر",
    icon: <Calendar className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-category",
    title: "توزع العقود حسب الفئة",
    description: "توزيع العقود حسب فئة المركبة (خاصة/عامة/حكومية/تأجير)",
    icon: <Layers className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-nationality",
    title: "توزع العقود حسب جنسية المركبة",
    description: "توزيع العقود بين المركبات السورية والأجنبية",
    icon: <Globe className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-classification",
    title: "توزع العقود حسب التصنيف",
    description: "توزيع العقود حسب التصنيف (غير حكومية/حكومية/حسم طابع/إعفاء طابع)",
    icon: <FileCheck className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-manufacturer",
    title: "توزع العقود حسب الصانع",
    description: "توزيع العقود حسب صانع المركبة",
    icon: <Car className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-company",
    title: "توزع العقود حسب الشركة المصدرة",
    description: "توزيع العقود حسب شركة التأمين",
    icon: <Building2 className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-period",
    title: "توزع العقود حسب الفترة",
    description: "توزيع العقود حسب فترة التأمين (3/6/12 شهر)",
    icon: <Clock className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-employee",
    title: "توزع العقود حسب الموظف",
    description: "توزيع العقود حسب الموظف المصدر",
    icon: <Users className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "revenue-by-company",
    title: "توزع الإيرادات على الشركات",
    description: "توزيع الإيرادات حسب شركة التأمين",
    icon: <DollarSign className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "revenue-by-center",
    title: "توزع الإيرادات على المراكز",
    description: "توزيع الإيرادات حسب المركز",
    icon: <MapPin className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "revenue-by-center-monthly",
    title: "توزع الإيرادات / مراكز شهرياً",
    description: "توزيع الإيرادات حسب المركز شهرياً",
    icon: <BarChart className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "revenue-by-center-company",
    title: "توزع الإيرادات / مراكز / شركات",
    description: "توزيع الإيرادات حسب المركز والشركة",
    icon: <PieChart className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "revenue-by-company-monthly",
    title: "توزع الإيرادات / شركات",
    description: "توزيع الإيرادات حسب الشركة شهرياً",
    icon: <LineChart className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "federation-share-by-company",
    title: "حصة الاتحاد حسب الشركة",
    description: "حصة الاتحاد (5%) موزعة حسب الشركة",
    icon: <Shield className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "federation-share-by-center",
    title: "حصة الاتحاد حسب المراكز",
    description: "حصة الاتحاد (5%) موزعة حسب المركز",
    icon: <Shield className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "federation-share-by-year",
    title: "حصة الاتحاد حسب السنة",
    description: "حصة الاتحاد (5%) موزعة حسب السنة",
    icon: <Shield className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "federation-share-by-month",
    title: "حصة الاتحاد حسب الشهر",
    description: "حصة الاتحاد (5%) موزعة حسب الشهر",
    icon: <Shield className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "federation-share-by-center-monthly",
    title: "توزع حصة الاتحاد / مراكز شهرياً",
    description: "حصة الاتحاد (5%) موزعة حسب المركز شهرياً",
    icon: <Shield className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "contracts-by-center-monthly",
    title: "توزع عدد عقود مراكز شهرياً",
    description: "عدد العقود موزعة حسب المركز شهرياً",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-type-company",
    title: "توزع الإصدارات حسب النوع / شركة",
    description: "توزيع الإصدارات حسب نوع المركبة والشركة",
    icon: <FileBarChart className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-type-center",
    title: "توزع الإصدارات حسب النوع / مركز",
    description: "توزيع الإصدارات حسب نوع المركبة والمركز",
    icon: <FileBarChart className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "contracts-by-company-center",
    title: "توزع عدد عقود التأمين شركات / مراكز",
    description: "عدد العقود موزعة حسب الشركة والمركز",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "distribution",
  },
  {
    id: "share-by-company-center",
    title: "توزع حصة شركات / مراكز",
    description: "حصة الشركات والمراكز من الإيرادات",
    icon: <PieChart className="w-5 h-5" />,
    category: "financial",
  },
  // تقارير مالية
  {
    id: "payment-orders-by-province",
    title: "تقرير أوامر الدفع حسب المحافظات",
    description: "أوامر الدفع موزعة حسب المحافظة",
    icon: <MapPin className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "electronic-card-revenue-by-center",
    title: "جدول إيرادات البطاقة الإلكترونية / حسب المراكز",
    description: "إيرادات البطاقة الإلكترونية حسب المركز",
    icon: <CreditCard className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "electronic-card-revenue-main",
    title: "جدول إيرادات البطاقة الإلكترونية رئيسي",
    description: "إجمالي إيرادات البطاقة الإلكترونية",
    icon: <CreditCard className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "rescue-service-by-center",
    title: "جداول خدمة الإنقاذ / حسب المراكز",
    description: "إيرادات خدمة الإنقاذ حسب المركز",
    icon: <Activity className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "rescue-service-main",
    title: "جداول خدمة الإنقاذ رئيسي",
    description: "إجمالي إيرادات خدمة الإنقاذ",
    icon: <Activity className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "payment-orders-report",
    title: "تقارير أوامر الدفع",
    description: "تقارير شاملة لأوامر الدفع",
    icon: <Receipt className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "employees-report",
    title: "تقارير الموظفين",
    description: "تقارير أداء الموظفين",
    icon: <UserCheck className="w-5 h-5" />,
    category: "operations",
  },
  // عمليات
  {
    id: "contract-analysis",
    title: "تحليل العقود وإظهار أي فروقات",
    description: "تحليل شامل للعقود والكشف عن الفروقات",
    icon: <AlertCircle className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "contract-sequence-audit",
    title: "تدقيق تسلسل العقود",
    description: "التحقق من تسلسل أرقام العقود",
    icon: <CheckCircle className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "assign-contract-to-company",
    title: "إعطاء عقد لشركة",
    description: "تعيين عقد لشركة تأمين محددة",
    icon: <Shield className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "delayed-vehicles",
    title: "شاشة السيارات المتأخرة",
    description: "عرض المركبات المتأخرة في الدفع",
    icon: <Clock className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "cancel-contracts",
    title: "إلغاء العقود",
    description: "إدارة إلغاء العقود",
    icon: <XCircle className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "contracts-status",
    title: "الوضع الحالي للعقود",
    description: "حالة جميع العقود الحالية",
    icon: <Activity className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "general-statistics",
    title: "الإحصاء العام",
    description: "إحصائيات شاملة للنظام",
    icon: <TrendingUp className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "general-inquiry",
    title: "الاستعلام العام",
    description: "استعلام شامل عن البيانات",
    icon: <Search className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "ui-customization",
    title: "تعديل تصميم الواجهات",
    description: "تخصيص تصميم الواجهات",
    icon: <Settings className="w-5 h-5" />,
    category: "operations",
  },
  {
    id: "print-electronic-card",
    title: "طباعة البطاقة الإلكترونية",
    description: "طباعة البطاقات الإلكترونية",
    icon: <Printer className="w-5 h-5" />,
    category: "operations",
  },
  // تقارير الطباعة
  {
    id: "print-contracts-report",
    title: "تقرير طباعة العقود",
    description: "تقرير عن العقود المطبوعة",
    icon: <FileText className="w-5 h-5" />,
    category: "export",
  },
  {
    id: "print-addendums-report",
    title: "تقرير طباعة الملاحق",
    description: "تقرير عن الملاحق المطبوعة",
    icon: <FileCheck className="w-5 h-5" />,
    category: "export",
  },
  {
    id: "print-electronic-cards-report",
    title: "تقارير طباعة البطاقة الإلكترونية",
    description: "تقرير عن البطاقات الإلكترونية المطبوعة",
    icon: <CreditCard className="w-5 h-5" />,
    category: "export",
  },
  {
    id: "export-data",
    title: "تصدير البيانات",
    description: "تصدير البيانات إلى ملفات Excel/CSV",
    icon: <Download className="w-5 h-5" />,
    category: "export",
  },
  {
    id: "financial-entries",
    title: "كتابة القيود المالية",
    description: "إنشاء القيود المالية",
    icon: <Database className="w-5 h-5" />,
    category: "financial",
  },
  {
    id: "payment-orders-issue",
    title: "إصدار أوامر الدفع",
    description: "إنشاء وإصدار أوامر الدفع",
    icon: <CreditCard className="w-5 h-5" />,
    category: "financial",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  distribution: "التوزيعات",
  financial: "المالية",
  contracts: "العقود",
  operations: "العمليات",
  export: "التصدير",
};

export default function AdminReports() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredReports = REPORTS.filter((report) => {
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    const matchesSearch =
      report.title.includes(searchTerm) || report.description.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", ...Object.keys(CATEGORY_LABELS)];

  const handleReportClick = (reportId: string) => {
    const report = REPORTS.find((r) => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const [showReportViewer, setShowReportViewer] = useState(false);

  const handleGenerateReport = () => {
    if (selectedReport) {
      setDialogOpen(false);
      setShowReportViewer(true);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Report Viewer في الأعلى إذا كان مفتوحاً */}
      {showReportViewer && selectedReport && (
        <ReportViewer
          reportId={selectedReport.id}
          reportTitle={selectedReport.title}
          onClose={() => {
            setShowReportViewer(false);
            setSelectedReport(null);
          }}
        />
      )}

      {!showReportViewer && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تقارير العمل الأولية</h1>
              <p className="text-muted-foreground mt-2">
                إدارة وعرض جميع التقارير المتاحة في النظام
              </p>
            </div>
          </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="بحث في التقارير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="text-sm"
                >
                  {cat === "all" ? "الكل" : CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleReportClick(report.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <div className="text-primary">{report.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[report.category]}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">لا توجد تقارير مطابقة للبحث</p>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground text-center">
        إجمالي التقارير المتاحة: {REPORTS.length} | المعروضة: {filteredReports.length}
      </div>
        </>
      )}

      {/* Dialog for Report Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="text-primary">{selectedReport?.icon}</div>
              <span>{selectedReport?.title}</span>
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {selectedReport?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Report Category */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">الفئة:</span>
              <Badge variant="secondary">
                {selectedReport ? CATEGORY_LABELS[selectedReport.category] : ""}
              </Badge>
            </div>

            {/* Report ID */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">معرف التقرير:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{selectedReport?.id}</code>
            </div>

            {/* Report Details Section */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">تفاصيل التقرير:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  هذا التقرير يقدم تحليلاً شاملاً للبيانات المتعلقة بـ{" "}
                  <strong className="text-foreground">{selectedReport?.title}</strong>.
                </p>
                <p>
                  يمكنك استخدام هذا التقرير لمراجعة الإحصائيات والبيانات المتعلقة بهذا المجال.
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">المميزات:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>عرض البيانات بشكل منظم وواضح</li>
                <li>إمكانية التصدير إلى Excel أو PDF</li>
                <li>فلترة البيانات حسب الفترة الزمنية</li>
                <li>عرض الرسوم البيانية والإحصائيات</li>
              </ul>
            </div>

            {/* Usage Instructions */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">كيفية الاستخدام:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>انقر على زر "إنشاء التقرير" أدناه</li>
                <li>اختر الفترة الزمنية المطلوبة (إن وجدت)</li>
                <li>اختر الفلاتر الإضافية (إن وجدت)</li>
                <li>ستظهر البيانات في صفحة منفصلة أو يمكن تصديرها</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              إلغاء
            </Button>
            <Button onClick={handleGenerateReport} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              إنشاء التقرير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
