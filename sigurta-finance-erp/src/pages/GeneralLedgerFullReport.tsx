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
import { Home, BookOpen, LayoutDashboard, Download, Printer } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";
const formatDate = (date: string) => new Date(date).toLocaleDateString("ar");

type GeneralLedgerEntry = {
  _id: string;
  entryNumber: string;
  date: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  runningBalance: number;
  sourceType?: string;
  sourceDocType?: string;
  sourceDocNo?: string;
  costCenterId?: string;
  costCenterName?: string;
  dealerId?: string;
  dealerName?: string;
  notes?: string;
};

export default function GeneralLedgerFullReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<GeneralLedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    openingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0,
  });

  const loadAccounts = async () => {
    try {
      const res = await api.get("/erp/accounts");
      if (res.data.success) {
        setAccounts(res.data.data || []);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  const loadLedger = async () => {
    if (!accountId) {
      alert("يرجى اختيار حساب");
      return;
    }

    setLoading(true);
    try {
      const params: any = { accountId };
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/erp/reports/general-ledger-full", { params });
      if (res.data.success) {
        const data = res.data.data || [];
        
        // حساب الرصيد الجاري
        let runningBalance = res.data.openingBalance || 0;
        const processedEntries = data.map((entry: any) => {
          if (entry.debit > 0) {
            runningBalance += entry.debit;
          } else if (entry.credit > 0) {
            runningBalance -= entry.credit;
          }
          return {
            ...entry,
            runningBalance,
          };
        });

        setEntries(processedEntries);

        // حساب الإجماليات
        const totals = processedEntries.reduce(
          (acc: any, entry: any) => ({
            totalDebit: acc.totalDebit + (entry.debit || 0),
            totalCredit: acc.totalCredit + (entry.credit || 0),
          }),
          { totalDebit: 0, totalCredit: 0 }
        );

        setSummary({
          openingBalance: res.data.openingBalance || 0,
          totalDebit: totals.totalDebit,
          totalCredit: totals.totalCredit,
          closingBalance: runningBalance,
        });
      }
    } catch (error) {
      console.error("Error loading general ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const exportCSV = () => {
    const header = [
      "التاريخ",
      "رقم القيد",
      "نوع المستند",
      "رقم المستند",
      "الوصف",
      "مركز التكلفة",
      "التاجر",
      "مدين",
      "دائن",
      "الرصيد الجاري",
      "ملاحظات",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    entries.forEach((entry) => {
      lines.push(
        [
          formatDate(entry.date),
          esc(entry.entryNumber),
          esc(entry.sourceDocType || ""),
          esc(entry.sourceDocNo || ""),
          esc(entry.description),
          esc(entry.costCenterName || ""),
          esc(entry.dealerName || ""),
          String(entry.debit || 0),
          String(entry.credit || 0),
          String(entry.runningBalance || 0),
          esc(entry.notes || ""),
        ].join(",")
      );
    });

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `general_ledger_full_${accountId}_${from || "all"}_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedAccount = accounts.find((a) => a._id === accountId);

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
                <h1 className="text-xl font-bold text-gray-800">دفتر الأستاذ الكامل</h1>
                <p className="text-sm text-gray-800">دفتر الأستاذ الشامل مع جميع التفاصيل</p>
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
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>الحساب</Label>
                <Select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={loading}
                  className="w-full"
                >
                  <option value="">اختر الحساب</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  className="flex-1"
                  onClick={loadLedger}
                  disabled={loading || !accountId}
                >
                  {loading ? "جاري التحميل..." : "تحديث"}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  disabled={loading || !entries.length}
                >
                  <Download className="w-4 h-4 ml-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={loading || !entries.length}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>

            {/* Account Info */}
            {selectedAccount && (
              <div className="pt-4 border-t">
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    الحساب: {selectedAccount.code} - {selectedAccount.name}
                  </Badge>
                  <Badge variant="default" className="text-base px-4 py-2">
                    النوع: {selectedAccount.type}
                  </Badge>
                </div>
              </div>
            )}

            {/* Summary */}
            {entries.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  الرصيد الافتتاحي: {formatCurrency(summary.openingBalance)}
                </Badge>
                <Badge variant="default" className="text-base px-4 py-2">
                  إجمالي مدين: {formatCurrency(summary.totalDebit)}
                </Badge>
                <Badge variant="default" className="text-base px-4 py-2">
                  إجمالي دائن: {formatCurrency(summary.totalCredit)}
                </Badge>
                <Badge variant="default" className="text-base px-4 py-2">
                  الرصيد الختامي: {formatCurrency(summary.closingBalance)}
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  عدد الحركات: {entries.length}
                </Badge>
              </div>
            )}
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
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">رقم القيد</TableHead>
                      <TableHead className="text-right">نوع المستند</TableHead>
                      <TableHead className="text-right">رقم المستند</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">مركز التكلفة</TableHead>
                      <TableHead className="text-right">التاجر</TableHead>
                      <TableHead className="text-right">مدين</TableHead>
                      <TableHead className="text-right">دائن</TableHead>
                      <TableHead className="text-right">الرصيد الجاري</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="text-right">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {entry.entryNumber}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {entry.sourceDocType || "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {entry.sourceDocNo || "—"}
                        </TableCell>
                        <TableCell className="text-right">{entry.description}</TableCell>
                        <TableCell className="text-right text-xs">
                          {entry.costCenterName || "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {entry.dealerName || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(entry.runningBalance)}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {entry.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!entries.length && accountId && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد حركات لهذا الحساب في الفترة المحددة
                  </div>
                )}

                {!accountId && (
                  <div className="text-center text-muted-foreground py-10">
                    يرجى اختيار حساب لعرض دفتر الأستاذ
                  </div>
                )}

                {/* Totals Row */}
                {entries.length > 0 && (
                  <div className="mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary-50 font-bold">
                          <TableHead colSpan={7} className="text-right">
                            الإجمالي
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalDebit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.totalCredit)}
                          </TableHead>
                          <TableHead className="text-right font-bold text-primary-700">
                            {formatCurrency(summary.closingBalance)}
                          </TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
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
