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

type LedgerEntry = {
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
  entryType?: string;
  notes?: string;
};

export default function DailyLedgerReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
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

      const res = await api.get("/erp/reports/daily-ledger", { params });
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
      console.error("Error loading ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const exportCSV = () => {
    const selectedAccount = accounts.find((a) => a._id === accountId);
    const header = [
      "التاريخ",
      "رقم القيد",
      "الوصف",
      "مدين",
      "دائن",
      "الرصيد الجاري",
    ];
    const lines = [header.join(",")];

    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    lines.push([esc("الرصيد الافتتاحي"), "", "", "", "", String(summary.openingBalance)].join(","));

    entries.forEach((e) => {
      lines.push(
        [
          esc(formatDate(e.date)),
          esc(e.entryNumber),
          esc(e.description),
          String(e.debit || 0),
          String(e.credit || 0),
          String(e.runningBalance || 0),
        ].join(",")
      );
    });

    lines.push([esc("الإجمالي"), "", "", String(summary.totalDebit), String(summary.totalCredit), ""].join(","));
    lines.push([esc("الرصيد الختامي"), "", "", "", "", String(summary.closingBalance)].join(","));

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_ledger_${selectedAccount?.code || accountId}_${from || "all"}_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
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
                <h1 className="text-xl font-bold text-gray-800">تقرير دفتر اليومية</h1>
                <p className="text-sm text-gray-800">دفتر اليومية لحساب محدد</p>
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
                <Label>الحساب *</Label>
                <Select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={loading}
                  className="w-full"
                >
                  <option value="">اختر الحساب</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.code} - {acc.name}
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

            {!loading && entries.length === 0 && accountId && (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">لا توجد معاملات ضمن هذه الفترة</span>
              </div>
            )}

            {!loading && !accountId && (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">يرجى اختيار حساب لعرض دفتر اليومية</span>
              </div>
            )}

            {!loading && entries.length > 0 && (
              <div className="overflow-auto" dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">رقم القيد</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">مدين</TableHead>
                      <TableHead className="text-right">دائن</TableHead>
                      <TableHead className="text-right">الرصيد الجاري</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Opening Balance Row */}
                    <TableRow className="bg-gray-50 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        الرصيد الافتتاحي
                      </TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(summary.openingBalance)}
                      </TableCell>
                    </TableRow>

                    {/* Entries */}
                    {entries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="text-right">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-right font-mono">{entry.entryNumber}</TableCell>
                        <TableCell className="text-right">{entry.description}</TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(entry.runningBalance)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Totals Row */}
                    <TableRow className="bg-gray-50 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        الإجمالي
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(summary.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(summary.totalCredit)}
                      </TableCell>
                      <TableCell className="text-right">—</TableCell>
                    </TableRow>

                    {/* Closing Balance Row */}
                    <TableRow className="bg-primary-50 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        الرصيد الختامي
                      </TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right font-bold text-primary-700">
                        {formatCurrency(summary.closingBalance)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
