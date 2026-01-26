import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Home, Calendar, LayoutDashboard, Download, Printer, Search } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatDate = (date: string) => new Date(date).toLocaleDateString("ar");

type Transaction = {
  _id: string;
  entryNumber?: string;
  date: string;
  docType?: string;
  docNo?: string;
  description?: string;
  accountCode?: string;
  accountName?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  dealerName?: string;
  costCenterName?: string;
  currency?: string;
  status?: string;
};

export default function TransactionsByDateReport() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/erp/journal-entries", {
        params: {
          from: fromDate,
          to: toDate,
          status: "approved",
          limit: 1000,
        },
      });

      if (res.data.success) {
        // تحويل القيود إلى معاملات مفردة (كل سطر = معاملة)
        const allTransactions: Transaction[] = [];
        
        res.data.data.forEach((entry: any) => {
          entry.lines?.forEach((line: any) => {
            allTransactions.push({
              _id: `${entry._id}_${line._id}`,
              entryNumber: entry.entryNumber,
              date: entry.date,
              docType: entry.docType,
              docNo: entry.docNo,
              description: line.description || entry.description,
              accountCode: line.accountId?.code || line.accountCode,
              accountName: line.accountId?.name || line.accountName,
              debit: line.debit || 0,
              credit: line.credit || 0,
              balance: (line.debit || 0) - (line.credit || 0),
              dealerName: entry.dealerId?.name || "",
              costCenterName: entry.centerId?.name || line.costCenterId?.name || "",
              currency: entry.currency || "SYP",
              status: entry.status,
            });
          });
        });

        // ترتيب حسب التاريخ
        allTransactions.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setTransactions(allTransactions);
      }
    } catch (error: any) {
      console.error("Error loading transactions:", error);
      setError(error.response?.data?.message || "حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleSearch = () => {
    loadTransactions();
  };

  const exportCSV = () => {
    const header = ["رقم القيد", "التاريخ", "نوع المستند", "رقم المستند", "الوصف", "رمز الحساب", "اسم الحساب", "مدين", "دائن", "الرصيد", "التاجر", "مركز التكلفة", "العملة"];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    transactions.forEach((t) => {
      lines.push(
        [
          esc(t.entryNumber || ""),
          esc(formatDate(t.date)),
          esc(t.docType || ""),
          esc(t.docNo || ""),
          esc(t.description || ""),
          esc(t.accountCode || ""),
          esc(t.accountName || ""),
          esc(t.debit || 0),
          esc(t.credit || 0),
          esc(t.balance || 0),
          esc(t.dealerName || ""),
          esc(t.costCenterName || ""),
          esc(t.currency || "SYP"),
        ].join(",")
      );
    });

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_by_date_${fromDate}_${toDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  const totalBalance = totalDebit - totalCredit;

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg text-white flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">تقرير المعاملات حسب التاريخ</h1>
                <p className="text-sm text-purple-100">عرض جميع المعاملات المحاسبية مرتبة حسب التاريخ</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/finance-dashboard")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
              >
                <LayoutDashboard className="w-4 h-4 ml-2" />
                لوحة التحكم
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
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
            <CardTitle>فلترة البيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="w-4 h-4 ml-2" />
                  بحث
                </Button>
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={exportCSV} disabled={loading || !transactions.length}>
                  <Download className="w-4 h-4 ml-2" />
                  CSV
                </Button>
                <Button variant="outline" onClick={handlePrint} disabled={loading || !transactions.length}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-base px-4 py-2">
                عدد المعاملات: {transactions.length}
              </Badge>
              <Badge variant="default" className="text-base px-4 py-2">
                إجمالي المدين: {formatCurrency(totalDebit)}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                إجمالي الدائن: {formatCurrency(totalCredit)}
              </Badge>
              <Badge variant={totalBalance === 0 ? "default" : "destructive"} className="text-base px-4 py-2">
                الرصيد: {formatCurrency(totalBalance)}
              </Badge>
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
                      <TableHead className="text-right">رقم القيد</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">نوع المستند</TableHead>
                      <TableHead className="text-right">رقم المستند</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">رمز الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">مدين</TableHead>
                      <TableHead className="text-right">دائن</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                      <TableHead className="text-right">التاجر</TableHead>
                      <TableHead className="text-right">مركز التكلفة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="text-right font-mono text-sm">
                          {transaction.entryNumber || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell className="text-right">{transaction.docType || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{transaction.docNo || "—"}</TableCell>
                        <TableCell className="text-right">{transaction.description || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {transaction.accountCode || "—"}
                        </TableCell>
                        <TableCell className="text-right">{transaction.accountName || "—"}</TableCell>
                        <TableCell className="text-right font-mono">
                          {transaction.debit ? formatCurrency(transaction.debit) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {transaction.credit ? formatCurrency(transaction.credit) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {transaction.balance ? formatCurrency(transaction.balance) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">{transaction.dealerName || "—"}</TableCell>
                        <TableCell className="text-right text-sm">{transaction.costCenterName || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!transactions.length && !loading && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد معاملات في الفترة المحددة
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
