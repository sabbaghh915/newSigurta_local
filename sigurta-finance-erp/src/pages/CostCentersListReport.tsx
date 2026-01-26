import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Home, Building2, LayoutDashboard, Download, Printer } from "lucide-react";

const formatDate = (date: string) => new Date(date).toLocaleDateString("ar");

type CostCenter = {
  _id: string;
  legacyId?: number;
  name: string;
  code?: string;
  province?: string;
  ip?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function CostCentersListReport() {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCenters = async () => {
    setLoading(true);
    try {
      const res = await api.get("/erp/reports/cost-centers-list");
      if (res.data.success) {
        setCenters(res.data.data || []);
      }
    } catch (error) {
      console.error("Error loading cost centers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const exportCSV = () => {
    const header = ["الرقم", "الرمز", "الاسم", "المحافظة", "IP", "الحالة", "تاريخ الإنشاء", "تاريخ التحديث"];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    centers.forEach((center, idx) => {
      lines.push(
        [
          String(idx + 1),
          esc(center.code || ""),
          esc(center.name),
          esc(center.province || ""),
          esc(center.ip || ""),
          center.isActive ? "نشط" : "غير نشط",
          center.createdAt ? formatDate(center.createdAt) : "",
          center.updatedAt ? formatDate(center.updatedAt) : "",
        ].join(",")
      );
    });

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cost_centers_list.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeCount = centers.filter((c) => c.isActive).length;
  const inactiveCount = centers.length - activeCount;

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">قائمة مراكز التكلفة</h1>
                <p className="text-sm text-gray-800">قائمة بجميع مراكز التكلفة في النظام</p>
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
        {/* Summary */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-base px-4 py-2">
                إجمالي المراكز: {centers.length}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                نشط: {activeCount}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                غير نشط: {inactiveCount}
              </Badge>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={exportCSV}
                disabled={loading || !centers.length}
              >
                <Download className="w-4 h-4 ml-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={loading || !centers.length}
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
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
                      <TableHead className="text-right">الرقم</TableHead>
                      <TableHead className="text-right">الرمز</TableHead>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">المحافظة</TableHead>
                      <TableHead className="text-right">IP</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right">تاريخ التحديث</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centers.map((center, idx) => (
                      <TableRow key={center._id}>
                        <TableCell className="text-right">{idx + 1}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {center.code || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{center.name}</TableCell>
                        <TableCell className="text-right">{center.province || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {center.ip || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={center.isActive ? "default" : "outline"}>
                            {center.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {center.createdAt ? formatDate(center.createdAt) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {center.updatedAt ? formatDate(center.updatedAt) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!centers.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد بيانات
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
