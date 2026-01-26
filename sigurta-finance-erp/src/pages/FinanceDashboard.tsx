import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import { Home, TrendingUp } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatNumber = (n: number) => Number(n || 0).toLocaleString("ar");

type FinancialSummary = {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalPayments: number;
  totalPolicies: number;
  averagePayment: number;
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
};

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  colorClass = "bg-primary"
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: React.ReactNode;
  trend?: { value: string; isPositive: boolean };
  colorClass?: string;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      <div className="flex">
        <div className="flex-1 p-6">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold mb-2">{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`w-20 ${colorClass} flex items-center justify-center`}>
          <div className="text-white scale-150">
            {icon}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const defaultSummary: FinancialSummary = {
  totalRevenue: 0,
  totalExpenses: 0,
  netIncome: 0,
  totalPayments: 0,
  totalPolicies: 0,
  averagePayment: 0,
  todayRevenue: 0,
  monthRevenue: 0,
  yearRevenue: 0,
};

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinancialSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        const res = await api.get("/erp/summary");
        console.log("📊 ERP Summary Response:", res.data);
        if (res.data.success && res.data.data) {
          setSummary(res.data.data);
          console.log("✅ Summary loaded:", res.data.data);
        } else {
          console.warn("⚠️ No data in response:", res.data);
          setSummary(defaultSummary);
        }
      } catch (error: any) {
        console.error("❌ Error loading ERP summary:", error);
        console.error("Error details:", error.response?.data || error.message);
        setSummary(defaultSummary);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">لوحة التحكم المالية</h1>
                <p className="text-sm text-purple-100">نظرة شاملة على الوضع المالي للشركة</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* زر الرئيسية */}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="h-9 font-medium bg-red-500 hover:bg-red-600 text-white">
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">

        {/* Quick Stats - Row 1 */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        )}

        {!loading && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي الإيرادات"
            value={formatCurrency(summary?.totalRevenue || 0)}
            subtitle={`للعام ${new Date().getFullYear()}`}
            colorClass="bg-gradient-to-br from-green-500 to-green-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />

          <StatCard
            title="إجمالي المصروفات"
            value={formatCurrency(summary?.totalExpenses || 0)}
            subtitle={`للعام ${new Date().getFullYear()}`}
            colorClass="bg-gradient-to-br from-red-500 to-red-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            }
          />

          <StatCard
            title="صافي الربح"
            value={formatCurrency(summary?.netIncome || 0)}
            subtitle={`للعام ${new Date().getFullYear()}`}
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />

          <StatCard
            title="متوسط الدفعة"
            value={formatCurrency(summary?.averagePayment || 0)}
            subtitle={`من ${formatNumber(summary.totalPayments || 0)} دفعة`}
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            }
          />
        </div>

        {/* Quick Stats - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="إيرادات اليوم"
            value={formatCurrency(summary?.todayRevenue || 0)}
            subtitle="اليوم"
            colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            }
          />

          <StatCard
            title="إيرادات الشهر"
            value={formatCurrency(summary?.monthRevenue || 0)}
            subtitle="الشهر الحالي"
            colorClass="bg-gradient-to-br from-teal-500 to-teal-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            }
          />

          <StatCard
            title="عدد البوليصات"
            value={formatNumber(summary?.totalPolicies || 0)}
            subtitle="بوليصة نشطة"
            colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
              إدارة النظام المالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/journal-entries")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span className="text-sm font-medium">القيود المحاسبية</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/quick-journal-entry")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
                <span className="text-sm font-medium">إدخال سريع</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/dealers-management")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm font-medium">إدارة التجار</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/users-management")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6" />
                  <path d="M23 11h-6" />
                </svg>
                <span className="text-sm font-medium">إدارة المستخدمين</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/banks-management")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span className="text-sm font-medium">إدارة البنوك</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/currencies-management")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="text-sm font-medium">إدارة العملات</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/chart-of-accounts")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a7 7 0 1 0 10 10" />
                </svg>
                <span className="text-sm font-medium">شجرة الحسابات</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/financial-reports")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <line x1="12" x2="12" y1="20" y2="10" />
                  <line x1="18" x2="18" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="16" />
                </svg>
                <span className="text-sm font-medium">التقارير المالية</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/expenses")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span className="text-sm font-medium">المصروفات</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/finance-distribution")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                <span className="text-sm font-medium">التوزيع المالي</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/finance")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-sm font-medium">تفصيل الرسوم</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/ledger")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="text-sm font-medium">دفتر اليومية</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/reports")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-sm font-medium">التقارير</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/transactions-by-date")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span className="text-sm font-medium">المعاملات حسب التاريخ</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/account-balances-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span className="text-sm font-medium">أرصدة الحسابات</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/daily-ledger-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="text-sm font-medium">دفتر اليومية</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/transactions-summary-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span className="text-sm font-medium">ملخص المعاملات</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/accounts-list-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span className="text-sm font-medium">قائمة الحسابات</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/trial-balance-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M3 3v18h18" />
                  <path d="M18 7H8" />
                  <path d="M13 12H8" />
                  <path d="M13 17H8" />
                  <path d="M18 12h-4" />
                  <path d="M18 17h-4" />
                </svg>
                <span className="text-sm font-medium">ميزان المراجعة</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/yearly-trial-balance-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                  <path d="M16 18h.01" />
                </svg>
                <span className="text-sm font-medium">ميزان المراجعة السنوي</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/transactions-summary-by-week-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-sm font-medium">ملخص المعاملات حسب الأسبوع</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/cost-centers-list-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span className="text-sm font-medium">قائمة مراكز التكلفة</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/general-ledger-full-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span className="text-sm font-medium">دفتر الأستاذ الكامل</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/general-ledger-by-dealer-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm font-medium">دفتر الأستاذ حسب التاجر</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/depreciation-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span className="text-sm font-medium">تقرير الإهلاك</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/final-cost-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-sm font-medium">التكلفة النهائية</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/final-profit-report")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="text-sm font-medium">الربح النهائي</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">نظام ERP مالي متكامل</h4>
                <p className="text-sm text-blue-700">
                  هذا النظام يوفر لك إدارة شاملة للعمليات المالية، من القيود المحاسبية إلى التقارير التفصيلية. 
                  يمكنك إدارة الحسابات، تتبع المصروفات، وإصدار التقارير المالية بكل سهولة.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </div>
  );
}
