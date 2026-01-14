import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { 
  Car, 
  Globe, 
  FileText, 
  Users, 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Info,
  MapPin,
  IdCard,
  Phone,
  Calendar,
  Bookmark,
  Home as HomeIcon,
  Search,
  Palette,
  Building2,
  DollarSign,
  ChevronDown,
  Menu,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { vehicleApi, paymentApi } from "../services/api";

interface HomeStats {
  todayPolicies: number;
  foreignVehicles: number;
  completed: number;
  pending: number;
}

export default function Home() {
  const navigate = useNavigate();
  
  const employeeName = localStorage.getItem("employeeName") || "الموظف";
  const centerName = localStorage.getItem("centerName") || "";
  
  const [stats, setStats] = useState<HomeStats>({
    todayPolicies: 0,
    foreignVehicles: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // قائمة الصور - يمكن تعديل المسارات حسب أسماء الملفات الفعلية
  const images = [
    "/insurance-hero-1.jpg",
    "/insurance-hero-2.jpg",
    "/insurance-hero-3.jpg",
    "/insurance-hero-4.jpg",
    "/insurance-hero-5.jpg",
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // حساب تاريخ اليوم (بداية اليوم ونهايته)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      // جلب جميع المدفوعات
      const paymentsRes = await paymentApi.getAll().catch(() => ({ data: [] }));
      const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : [];

      // جلب جميع المركبات الأجنبية
      const foreignVehiclesRes = await vehicleApi.getAll({ vehicleType: "foreign" }).catch(() => ({ data: [] }));
      const foreignVehicles = Array.isArray(foreignVehiclesRes?.data) ? foreignVehiclesRes.data : [];

      // حساب بوليصات اليوم (المدفوعات المكتملة اليوم)
      const todayPoliciesCount = payments.filter((p: any) => {
        if (p.paymentStatus !== "completed") return false;
        // استخدام paymentDate أو createdAt كبديل
        const paymentDate = p.paymentDate || p.createdAt || p.policyCreatedAt;
        if (!paymentDate) return false;
        const date = new Date(paymentDate);
        return date >= today && date <= todayEnd;
      }).length;

      // حساب المكتملة (جميع المدفوعات المكتملة)
      const completedCount = payments.filter((p: any) => p.paymentStatus === "completed").length;

      // حساب قيد المعالجة (الدفعات غير المكتملة)
      const pendingCount = payments.filter((p: any) => 
        p.paymentStatus !== "completed" && p.paymentStatus !== "failed" && p.paymentStatus !== "cancelled"
      ).length;

      setStats({
        todayPolicies: todayPoliciesCount,
        foreignVehicles: foreignVehicles.length,
        completed: completedCount,
        pending: pendingCount,
      });
    } catch (err: any) {
      console.error("Error loading stats:", err);
      setError(err?.message || "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-md border-b">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
             <img 
  src="/2006EB2A-87F3-4A19-998F-B1A7CBB9DABA.png" 
  alt="Logo"
  className="w-[68px] h-[68px] object-contain"
/>

              <div className="flex flex-col">
  <h1 className="text-xl font-bold text-gray-800">
    منصة التأمين الإلزامي
  </h1>

  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
    <span>
      مرحباً <strong>{employeeName}</strong>
    </span>

    <span className="w-px h-4 bg-gray-300"></span>

    <span>
      مركز: <strong>{centerName}</strong>
    </span>
  </div>
</div>

            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* زر الرئيسية */}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700"
              >
                <HomeIcon className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>

              {/* السجلات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700">
                    <FileText className="w-4 h-4 ml-2" />
                    السجلات
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>السجلات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/records")} className="text-right cursor-pointer">
                    <FileText className="w-4 h-4 ml-2" />
                    جميع السجلات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/syrian-records")} className="text-right cursor-pointer">
                    <Car className="w-4 h-4 ml-2" />
                    السجلات السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-records")} className="text-right cursor-pointer">
                    <Globe className="w-4 h-4 ml-2" />
                    السجلات الأجنبية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/reserved-vehicles")} className="text-right cursor-pointer">
                    <Bookmark className="w-4 h-4 ml-2" />
                    السيارات المحجوزة
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/syrian-addendums")} className="text-right cursor-pointer">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-addendums")} className="text-right cursor-pointer">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق الأجنبية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الأدلة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700">
                    <Search className="w-4 h-4 ml-2" />
                    الأدلة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الأدلة المرجعية</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/vehicle-types-guide")} className="text-right cursor-pointer">
                    <Search className="w-4 h-4 ml-2" />
                    دليل النوع والموديل
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/colors-guide")} className="text-right cursor-pointer">
                    <Palette className="w-4 h-4 ml-2" />
                    دليل الألوان
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الإدارة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700">
                    <Building2 className="w-4 h-4 ml-2" />
                    الإدارة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الإدارة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/companies")} className="text-right cursor-pointer">
                    <Building2 className="w-4 h-4 ml-2" />
                    شركات التأمين
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/pricing-table")} className="text-right cursor-pointer">
                    <DollarSign className="w-4 h-4 ml-2" />
                    جدول التسعير
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* زر تسجيل الخروج */}
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("username");
                  localStorage.removeItem("employeeName");
                  navigate("/login");
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 max-w-[1600px] mx-auto px-4 py-8">
        {/* Sidebar with Images - Vertical Stack (Right Side in RTL) */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-8 space-y-4">
            
            {/* Images Stack - Vertical */}
            <div className="space-y-4">
              {images.map((image, index) => (
                <Card key={index} className="shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    <img
                      src={image}
                      alt={`صورة ${index + 1} - منصة التأمين الإلزامي`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // في حالة عدم وجود الصورة، نعرض placeholder
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3Eصورة ${index + 1}%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
        {/* Welcome Section */}
        <div className="mb-8">
          <Alert className="bg-gray-100 border-gray-300">
            <Info className="w-5 h-5 text-gray-700" />
            <AlertDescription className="text-gray-900 text-righ">
              <strong>مرحباً بك في منصة التأمين الإلزامي للمركبات</strong><br />
              اختر نوع المركبة التي تريد إصدار تأمين لها واتبع التعليمات المناسبة
            </AlertDescription>
          </Alert>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Syrian Vehicles */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-primary-700">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-primary-800">تأمين المركبات السورية</CardTitle>
              <CardDescription className="text-lg">
                للمركبات المسجلة في الجمهورية العربية السورية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className=" p-4 rounded-lg">
                <h4 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  الوثائق المطلوبة:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <IdCard className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                    <span>الهوية الشخصية لمالك المركبة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                    <span>رخصة سير المركبة (ميكانيك) / بيان قيد مركبة حديث</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                    <span>التأمين السابق إن وجد</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Car className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                    <span>شهادة تسجيل المركبة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                    <span>شهادة الفحص الفني (إن وجدت)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  معلومات مهمة:
                </h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• يجب التأكد من صحة رقم اللوحة ورقم الهيكل</li>
                  <li>• التحقق من تطابق البيانات مع الوثائق الرسمية</li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate("/syrian-vehicles")}
                className="w-full h-12 text-lg bg-primary-700 hover:bg-primary-800"
              >
                إصدار تأمين للمركبات السورية
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Foreign Vehicles */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-syrian-red">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-syrian-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-orange-700">تأمين المركبات الأجنبية</CardTitle>
              <CardDescription className="text-lg">
                للمركبات الأجنبية العابرة أو المؤقتة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className=" p-4 rounded-lg">
                <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  الوثائق المطلوبة:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <IdCard className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0" />
                    <span>جواز السفر أو الهوية الشخصية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0" />
                    <span>رخصة القيادة الدولية أو المحلية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Car className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0" />
                    <span>شهادة تسجيل المركبة من بلد المنشأ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0" />
                    <span>أوراق العبور الجمركي</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  تنبيهات هامة:
                </h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• التأكد من صحة ترجمة الوثائق الأجنبية</li>
                  <li>• التحقق من صلاحية أوراق العبور</li>
                  <li>• تحديد مدة الإقامة المؤقتة بدقة</li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate("/foreign-vehicles")}
                className="w-full h-12 text-lg bg-syrian-red hover:bg-orange-700"
              >
                إصدار تأمين للمركبات الأجنبية
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Section */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              تعليمات عامة للموظفين
            </CardTitle>
            <CardDescription>
              إرشادات مهمة لضمان دقة وسلامة عملية إصدار البوليصات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  خطوات العمل:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mr-4">
                  <li>التحقق من هوية العميل والوثائق المطلوبة</li>
                  <li>مراجعة صحة البيانات وتطابقها مع الوثائق</li>
                  <li>إدخال البيانات بدقة في النظام</li>
                  <li>مراجعة المعلومات قبل المتابعة للدفع</li>
                  <li>التأكد من إتمام عملية الدفع بنجاح</li>
                  <li>طباعة البوليصة وتسليمها للعميل</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  نقاط مهمة:
                </h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 mr-4">
                  <li>عدم قبول الوثائق المنتهية الصلاحية</li>
                  <li>التأكد من وضوح الصور والنسخ</li>
                  <li>مراجعة أرقام الهواتف للتواصل</li>
                  <li>التحقق من دقة عنوان العميل</li>
                  <li>حفظ نسخ من الوثائق المهمة</li>
                  <li>إبلاغ المشرف في الية الشك</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">الإحصائيات السريعة</h2>
          <Button
            onClick={loadStats}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
        {error && (
          <Alert className="bg-red-50 border-red-300 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-primary-700">بوليصات اليوم</h3>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.todayPolicies}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-syrian-red rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-orange-700">مركبات أجنبية</h3>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.foreignVehicles}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-green-700">مكتملة</h3>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.completed}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-red-600">قيد المعالجة</h3>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.pending}
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
