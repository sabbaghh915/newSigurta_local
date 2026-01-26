import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Home, BookOpen, LayoutDashboard } from "lucide-react";

type FinanceRow = {
  _id: string;
  paymentDate: string;
  receiptNumber: string;
  policyNumber: string;
  amount: number;
  paymentStatus: string;
  governmentTotal: number;
  servicesTotal: number;
  federationTotal: number;
  ownerSnapshot?: { ownerName?: string; nationalId?: string };
  vehicleSnapshot?: { plateNumber?: string; brand?: string; model?: string };
  breakdown?: any;
};

export default function Ledger() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FinanceRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await api.get("/erp/ledger", {
        params: { page: p, limit: 20, q, status, from, to },
      });
      setItems(res.data.items || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (error) {
      console.error("Error loading ledger:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      completed: { label: "مكتمل", className: "bg-green-100 text-green-800" },
      pending: { label: "معلق", className: "bg-yellow-100 text-yellow-800" },
      failed: { label: "فاشل", className: "bg-red-100 text-red-800" },
      refunded: { label: "مردود", className: "bg-gray-100 text-gray-800" },
    };
    const info = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.className}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">دفتر اليومية</h1>
                <p className="text-sm text-gray-800">سجل العمليات المالية</p>
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
              <Link to="/">
                <Button
                  variant="outline"
                  className="bg-primary-50 hover:bg-primary-100 text-gray-800 border-primary-300 h-9 font-medium"
                >
                  <Home className="w-4 h-4 ml-2" />
                  الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">

        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">بحث</label>
                <Input
                  placeholder="إيصال / بوليصة / لوحة / اسم"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="text-right"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium mb-2 block">الحالة</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">كل الحالات</option>
                  <option value="completed">مكتمل</option>
                  <option value="pending">معلق</option>
                  <option value="failed">فاشل</option>
                  <option value="refunded">مردود</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium mb-2 block">من تاريخ</label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <Button onClick={() => load(1)} disabled={loading}>
                {loading ? "جاري البحث..." : "تطبيق"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-md">
          <div className="overflow-auto" dir="rtl">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr className="text-right">
                  <th className="p-4 font-semibold">التاريخ</th>
                  <th className="p-4 font-semibold">الإيصال</th>
                  <th className="p-4 font-semibold">البوليصة</th>
                  <th className="p-4 font-semibold">المالك</th>
                  <th className="p-4 font-semibold">المركبة</th>
                  <th className="p-4 font-semibold">المبلغ</th>
                  <th className="p-4 font-semibold">حكومي</th>
                  <th className="p-4 font-semibold">خدمات</th>
                  <th className="p-4 font-semibold">اتحاد</th>
                  <th className="p-4 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x, idx) => (
                  <tr
                    key={x._id}
                    className={`border-b hover:bg-muted/30 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-muted/5"
                    }`}
                  >
                    <td className="p-4 text-right">
                      {new Date(x.paymentDate).toLocaleDateString("ar-SY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right font-medium">{x.receiptNumber}</td>
                    <td className="p-4 text-right">{x.policyNumber}</td>
                    <td className="p-4 text-right">
                      <div>{x.ownerSnapshot?.ownerName || "-"}</div>
                      {x.ownerSnapshot?.nationalId && (
                        <div className="text-xs text-muted-foreground">
                          {x.ownerSnapshot.nationalId}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium">{x.vehicleSnapshot?.plateNumber || "-"}</div>
                      {(x.vehicleSnapshot?.brand || x.vehicleSnapshot?.model) && (
                        <div className="text-xs text-muted-foreground">
                          {x.vehicleSnapshot?.brand} {x.vehicleSnapshot?.model}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {Number(x.amount || 0).toLocaleString("en-US")}
                    </td>
                    <td className="p-4 text-right">{Number(x.governmentTotal || 0).toLocaleString("en-US")}</td>
                    <td className="p-4 text-right">{Number(x.servicesTotal || 0).toLocaleString("en-US")}</td>
                    <td className="p-4 text-right">{Number(x.federationTotal || 0).toLocaleString("en-US")}</td>
                    <td className="p-4 text-center">{getStatusBadge(x.paymentStatus)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="p-8 text-center text-muted-foreground" colSpan={10}>
                      {loading ? "جاري تحميل البيانات..." : "لا توجد بيانات"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {pages > 1 && (
          <Card className="shadow-md">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  صفحة {page} من {pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => load(page - 1)}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= pages}
                    onClick={() => load(page + 1)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
