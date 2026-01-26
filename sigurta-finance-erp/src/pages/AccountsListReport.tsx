import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select } from "../components/ui/select";
import { Home, FolderTree, LayoutDashboard, Download, Printer } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

type AccountListItem = {
  _id: string;
  code: string;
  name: string;
  nameEn?: string;
  type: string;
  mainType?: string;
  typeName?: string;
  mainTypeName?: string;
  finalReportName?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  cat4?: string;
  cat5?: string;
  isActive: boolean;
  isDaily?: boolean;
  limits?: number;
  balance: number;
  debitBalance: number;
  creditBalance: number;
};

export default function AccountsListReport() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<string>("all");
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalBalance: 0,
  });

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (reportType !== "all") params.reportType = reportType;

      const res = await api.get("/erp/accounts", { params });
      if (res.data.success) {
        const data = res.data.data || [];
        setAccounts(data);

        // حساب الإجماليات
        const totals = data.reduce(
          (acc: any, account: AccountListItem) => ({
            totalAccounts: acc.totalAccounts + 1,
            activeAccounts: acc.activeAccounts + (account.isActive ? 1 : 0),
            totalBalance: acc.totalBalance + (account.balance || 0),
          }),
          { totalAccounts: 0, activeAccounts: 0, totalBalance: 0 }
        );
        setSummary(totals);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = [
      "رمز الحساب",
      "اسم الحساب",
      "اسم الحساب (EN)",
      "النوع",
      "النوع الرئيسي",
      "التقرير النهائي",
      "الفئة 1",
      "الفئة 2",
      "الفئة 3",
      "الفئة 4",
      "الفئة 5",
      "نشط",
      "يومي",
      "الحدود",
      "الرصيد",
      "رصيد مدين",
      "رصيد دائن",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    accounts.forEach((acc) => {
      lines.push(
        [
          esc(acc.code),
          esc(acc.name),
          esc(acc.nameEn || ""),
          esc(acc.typeName || acc.type),
          esc(acc.mainTypeName || ""),
          esc(acc.finalReportName || ""),
          esc(acc.cat1 || ""),
          esc(acc.cat2 || ""),
          esc(acc.cat3 || ""),
          esc(acc.cat4 || ""),
          esc(acc.cat5 || ""),
          acc.isActive ? "نعم" : "لا",
          acc.isDaily ? "نعم" : "لا",
          String(acc.limits || 0),
          String(acc.balance || 0),
          String(acc.debitBalance || 0),
          String(acc.creditBalance || 0),
        ].join(",")
      );
    });

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts_list_${reportType || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      asset: { variant: "default", label: "أصل" },
      liability: { variant: "destructive", label: "خصم" },
      equity: { variant: "outline", label: "حقوق ملكية" },
      revenue: { variant: "default", label: "إيراد" },
      expense: { variant: "secondary", label: "مصروف" },
    };
    const item = config[type] || config.asset;
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  // تجميع الحسابات حسب التقرير النهائي
  const groupedByReport = accounts.reduce((acc, account) => {
    const key = account.finalReportName || "غير محدد";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(account);
    return acc;
  }, {} as Record<string, AccountListItem[]>);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">قائمة الحسابات</h1>
                <p className="text-sm text-gray-800">قائمة شاملة بجميع الحسابات المحاسبية</p>
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
                <Label>نوع التقرير</Label>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  disabled={loading}
                  className="w-full"
                >
                  <option value="all">الكل</option>
                  <option value="income-statement">قائمة الدخل</option>
                  <option value="balance-sheet">الميزانية</option>
                  <option value="other">أخرى</option>
                </Select>
              </div>

              <div className="flex items-end gap-2 md:col-span-2">
                <Button
                  className="flex-1"
                  onClick={loadAccounts}
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  disabled={loading || !accounts.length}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={loading || !accounts.length}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Badge variant="secondary" className="text-base px-4 py-2">
                إجمالي الحسابات: {summary.totalAccounts}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                الحسابات النشطة: {summary.activeAccounts}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي الرصيد: {formatCurrency(summary.totalBalance)}
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
                {Object.entries(groupedByReport).map(([reportName, reportAccounts]) => (
                  <div key={reportName} className="mb-8">
                    {/* Group Header */}
                    <div className="bg-primary-100 p-3 mb-2 rounded-t-lg">
                      <h3 className="text-lg font-bold text-primary-900">
                        {reportName || "غير محدد"}
                      </h3>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">رمز الحساب</TableHead>
                          <TableHead className="text-right">اسم الحساب</TableHead>
                          <TableHead className="text-right">النوع</TableHead>
                          <TableHead className="text-right">النوع الرئيسي</TableHead>
                          <TableHead className="text-right">الفئة 1</TableHead>
                          <TableHead className="text-right">الفئة 2</TableHead>
                          <TableHead className="text-right">الفئة 3</TableHead>
                          <TableHead className="text-right">الفئة 4</TableHead>
                          <TableHead className="text-right">نشط</TableHead>
                          <TableHead className="text-right">يومي</TableHead>
                          <TableHead className="text-right">الحدود</TableHead>
                          <TableHead className="text-right">الرصيد</TableHead>
                          <TableHead className="text-right">رصيد مدين</TableHead>
                          <TableHead className="text-right">رصيد دائن</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportAccounts.map((acc) => (
                          <TableRow key={acc._id}>
                            <TableCell className="text-right font-mono text-sm">{acc.code}</TableCell>
                            <TableCell className="text-right font-medium">{acc.name}</TableCell>
                            <TableCell className="text-right">{getTypeBadge(acc.type)}</TableCell>
                            <TableCell className="text-right">{acc.mainTypeName || "—"}</TableCell>
                            <TableCell className="text-right">{acc.cat1 || "—"}</TableCell>
                            <TableCell className="text-right">{acc.cat2 || "—"}</TableCell>
                            <TableCell className="text-right">{acc.cat3 || "—"}</TableCell>
                            <TableCell className="text-right">{acc.cat4 || "—"}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={acc.isActive ? "default" : "secondary"}>
                                {acc.isActive ? "نعم" : "لا"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {acc.isDaily ? (
                                <Badge variant="outline">نعم</Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {acc.limits ? formatCurrency(acc.limits) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(acc.balance)}
                            </TableCell>
                            <TableCell className="text-right">
                              {acc.debitBalance > 0 ? formatCurrency(acc.debitBalance) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {acc.creditBalance > 0 ? formatCurrency(acc.creditBalance) : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}

                {!accounts.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد حسابات
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
