import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Home, DollarSign } from "lucide-react";

type Summary = {
  count: number;
  amountTotal: number;
  governmentTotal: number;
  servicesTotal: number;
  federationTotal: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary>({
    count: 0,
    amountTotal: 0,
    governmentTotal: 0,
    servicesTotal: 0,
    federationTotal: 0,
  });

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/erp/summary", { params: { from, to } });
      setSummary(res.data.summary || summary);
    } catch (error) {
      console.error("Error loading summary:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("auth_token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">لوحة المالية (ERP)</h1>
                <p className="text-sm text-purple-100">الاتحاد السوري لشركات التأمين</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* زر الرئيسية */}
              <Button
                variant="outline"
                onClick={() => navigate("/finance-dashboard")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
              >
                <Home className="w-4 h-4 ml-2" />
                النظام المالي الجديد
              </Button>
              <Link to="/ledger">
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium">
                  دفتر اليومية
                </Button>
              </Link>
              <Link to="/finance">
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium">
                  المالية
                </Button>
              </Link>
              <Link to="/finance-distribution">
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium">
                  التوزيع المالي
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium">
                  التقارير
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleLogout} className="h-9 font-medium">
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">

        {/* Date Filter */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">من تاريخ</label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <Button onClick={load} disabled={loading} className="px-8">
                {loading ? "جاري التحميل..." : "تطبيق"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="عدد العمليات"
            value={summary.count}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatsCard
            title="إجمالي المبالغ"
            value={summary.amountTotal}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <StatsCard
            title="رسوم حكومية"
            value={summary.governmentTotal}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          />
          <StatsCard
            title="رسوم خدمات"
            value={summary.servicesTotal}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            }
          />
          <StatsCard
            title="رسوم الاتحاد/الجهات"
            value={summary.federationTotal}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
        </div>
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className="text-2xl font-bold text-foreground">
          {Number(value || 0).toLocaleString("en-US")}
        </div>
      </CardContent>
    </Card>
  );
}
