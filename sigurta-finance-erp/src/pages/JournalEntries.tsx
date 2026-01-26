import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Home, FileText, Plus, LayoutDashboard } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import PageHeader from "../components/PageHeader";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

type JournalEntry = {
  id: string;
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  status: "approved" | "pending" | "rejected";
  createdBy: string;
};

type JournalLine = {
  accountId: string;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  description: string;
};

export default function JournalEntries() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    notes: "",
    centerId: "",
    dealerId: "",
    docType: "",
    docNo: "",
    dueDate: "",
    currency: "SYP",
    currencyRate: 1,
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
  });
  
  const [centers, setCenters] = useState<any[]>([]);
  
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: "", accountName: "", accountCode: "", debit: 0, credit: 0, description: "" }
  ]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/erp/journal-entries");
      if (res.data.success) {
        setEntries(res.data.data.map((e: any) => ({
          id: e._id,
          date: e.date,
          entryNumber: e.entryNumber,
          description: e.description,
          debit: e.totalDebit,
          credit: e.totalCredit,
          status: e.status,
          createdBy: e.createdBy?.fullName || e.createdBy?.username || "غير معروف",
        })));
      }
    } catch (error) {
      console.error("Error loading journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const res = await api.get("/erp/accounts");
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  const loadCenters = async () => {
    try {
      const res = await api.get("/erp/reports/cost-centers-list");
      if (res.data.success) {
        setCenters(res.data.data || []);
      }
    } catch (error) {
      console.error("Error loading centers:", error);
    }
  };

  useEffect(() => {
    loadEntries();
    loadAccounts();
    loadCenters();
  }, []);

  const addLine = () => {
    setLines([...lines, { accountId: "", accountName: "", accountCode: "", debit: 0, credit: 0, description: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // إذا تم اختيار حساب، املأ التفاصيل
    if (field === "accountId" && value) {
      const account = accounts.find(a => a._id === value);
      if (account) {
        newLines[index].accountName = account.name;
        newLines[index].accountCode = account.code;
      }
    }
    
    setLines(newLines);
  };

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    return { totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    
    console.log("📝 محاولة حفظ القيد:", { formData, lines, accounts: accounts.length });
    
    // Validation
    if (!formData.description.trim()) {
      setError("يرجى إدخال وصف القيد");
      console.log("❌ خطأ: الوصف فارغ");
      return;
    }
    
    if (lines.length < 2) {
      setError("القيد يجب أن يحتوي على سطرين على الأقل");
      console.log("❌ خطأ: عدد السطور أقل من 2");
      return;
    }
    
    const hasEmptyAccounts = lines.some(line => !line.accountId);
    if (hasEmptyAccounts) {
      setError("يرجى تحديد حساب لكل سطر");
      console.log("❌ خطأ: حساب فارغ", lines);
      return;
    }
    
    const hasEmptyAmounts = lines.some(line => line.debit === 0 && line.credit === 0);
    if (hasEmptyAmounts) {
      setError("كل سطر يجب أن يحتوي على مبلغ مدين أو دائن");
      console.log("❌ خطأ: مبلغ فارغ", lines);
      return;
    }
    
    const { balanced } = calculateTotals();
    if (!balanced) {
      setError("القيد غير متوازن! المدين يجب أن يساوي الدائن");
      console.log("❌ خطأ: غير متوازن", calculateTotals());
      return;
    }

    console.log("✅ Validation نجح، جاري الإرسال للـ Backend...");
    
    setSubmitting(true);
    try {
      const payload: any = {
        date: formData.date,
        description: formData.description,
        notes: formData.notes,
        lines: lines.map(line => ({
          accountId: line.accountId,
          accountName: line.accountName,
          accountCode: line.accountCode,
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
          description: line.description,
        })),
      };
      
      // إضافة الحقول الإضافية إذا كانت موجودة
      if (formData.centerId) payload.centerId = formData.centerId;
      if (formData.dealerId) payload.dealerId = formData.dealerId;
      if (formData.docType) payload.docType = formData.docType;
      if (formData.docNo) payload.docNo = formData.docNo;
      if (formData.dueDate) payload.dueDate = formData.dueDate;
      if (formData.currency) payload.currency = formData.currency;
      if (formData.currencyRate) payload.currencyRate = formData.currencyRate;
      if (formData.category1) payload.category1 = formData.category1;
      if (formData.category2) payload.category2 = formData.category2;
      if (formData.category3) payload.category3 = formData.category3;
      if (formData.category4) payload.category4 = formData.category4;
      if (formData.category5) payload.category5 = formData.category5;
      
      console.log("📤 البيانات المُرسلة:", payload);
      
      const res = await api.post("/erp/journal-entries", payload);

      console.log("✅ استجابة Backend:", res.data);

      if (res.data.success) {
        setSuccess("تم إنشاء القيد المحاسبي بنجاح!");
        setTimeout(() => {
          setShowForm(false);
          setSuccess("");
          resetForm();
          loadEntries();
        }, 2000);
      }
    } catch (error: any) {
      console.error("❌ خطأ من Backend:", error.response?.data || error.message);
      setError(error.response?.data?.message || "حدث خطأ أثناء إنشاء القيد. تأكد من تشغيل Backend Server.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      notes: "",
      centerId: "",
      dealerId: "",
      docType: "",
      docNo: "",
      dueDate: "",
      currency: "SYP",
      currencyRate: 1,
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
    });
    setLines([
      { accountId: "", accountName: "", accountCode: "", debit: 0, credit: 0, description: "" }
    ]);
    setError("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      approved: { variant: "default", label: t("journalEntry.approved") },
      pending: { variant: "secondary", label: t("journalEntry.pending") },
      rejected: { variant: "destructive", label: t("journalEntry.rejected") },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const { totalDebit, totalCredit, balanced } = calculateTotals();

  return (
    <div className="min-h-screen" dir="rtl">
      <PageHeader
        title={t("journalEntry.title")}
        subtitle={t("journalEntry.create")}
        icon={<FileText className="w-6 h-6 text-white" />}
        actions={
          <>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
            >
              <Plus className="w-4 h-4 ml-2" />
              {t("journalEntry.create")}
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="h-9">
              {t("action.logout") || "خروج"}
            </Button>
          </>
        }
      />

      <div className="container mx-auto p-6 space-y-6">

        {/* Instructions Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">تعليمات القيود المحاسبية</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>القيد المحاسبي يجب أن يكون متوازناً (المدين = الدائن)</li>
                  <li>كل قيد يحتاج على الأقل سطرين (حساب مدين وحساب دائن)</li>
                  <li>يمكنك إضافة سطور إضافية للقيود المعقدة</li>
                  <li>القيود الجديدة تُنشأ بحالة "مسودة" ويمكن اعتمادها لاحقاً</li>
                  <li>يتم توليد رقم القيد تلقائياً</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {loading && (
              <div className="text-center py-10">جاري التحميل...</div>
            )}
            
            {!loading && (
            <div className="overflow-auto" dir="rtl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم القيد</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المدين</TableHead>
                    <TableHead className="text-right">الدائن</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">المُنشئ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        لا توجد قيود محاسبية. اضغط "إنشاء قيد جديد" للبدء.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-right font-medium">{entry.entryNumber}</TableCell>
                        <TableCell className="text-right">{new Date(entry.date).toLocaleDateString("ar")}</TableCell>
                        <TableCell className="text-right">{entry.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.debit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.credit)}</TableCell>
                        <TableCell className="text-right">{getStatusBadge(entry.status)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{entry.createdBy}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Create Journal Entry Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">إنشاء قيد محاسبي جديد</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل القيد المحاسبي. تأكد من أن المدين يساوي الدائن.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6" dir="rtl">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التاريخ *</Label>
                  <Input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف *</Label>
                  <Input 
                    placeholder="مثال: قيد افتتاحي، شراء معدات، الخ"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Input 
                  placeholder="أي ملاحظات إضافية"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <Separator />

              {/* Additional Fields */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>مركز التكلفة</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.centerId}
                    onChange={(e) => setFormData({...formData, centerId: e.target.value})}
                  >
                    <option value="">اختر مركز التكلفة...</option>
                    {centers.map(center => (
                      <option key={center._id} value={center._id}>
                        {center.code || center.name} - {center.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>التاجر</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.dealerId}
                    onChange={(e) => setFormData({...formData, dealerId: e.target.value})}
                  >
                    <option value="">اختر التاجر...</option>
                    {centers.map(center => (
                      <option key={center._id} value={center._id}>
                        {center.code || center.name} - {center.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>نوع المستند</Label>
                  <Input 
                    placeholder="مثل: فاتورة، سند..."
                    value={formData.docType}
                    onChange={(e) => setFormData({...formData, docType: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم المستند</Label>
                  <Input 
                    placeholder="رقم المستند"
                    value={formData.docNo}
                    onChange={(e) => setFormData({...formData, docNo: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ الاستحقاق</Label>
                  <Input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>العملة</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="SYP">ليرة سورية (SYP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EUR">يورو (EUR)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>سعر الصرف</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="1"
                    value={formData.currencyRate}
                    onChange={(e) => setFormData({...formData, currencyRate: Number(e.target.value) || 1})}
                  />
                </div>
              </div>

              <Separator />

              {/* Journal Lines */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">سطور القيد *</h3>
                  <Button size="sm" onClick={addLine} variant="outline">
                    + إضافة سطر
                  </Button>
                </div>

                <div className="space-y-4">
                  {lines.map((line, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-12 gap-3 items-start">
                        <div className="col-span-3 space-y-2">
                          <Label>الحساب *</Label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={line.accountId}
                            onChange={(e) => updateLine(index, "accountId", e.target.value)}
                          >
                            <option value="">اختر حساب...</option>
                            {accounts.map(acc => (
                              <option key={acc._id} value={acc._id}>
                                {acc.code} - {acc.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label>المدين</Label>
                          <Input 
                            type="number"
                            placeholder="0"
                            value={line.debit || ""}
                            onChange={(e) => updateLine(index, "debit", e.target.value)}
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label>الدائن</Label>
                          <Input 
                            type="number"
                            placeholder="0"
                            value={line.credit || ""}
                            onChange={(e) => updateLine(index, "credit", e.target.value)}
                          />
                        </div>

                        <div className="col-span-4 space-y-2">
                          <Label>البيان</Label>
                          <Input 
                            placeholder="وصف السطر (اختياري)"
                            value={line.description}
                            onChange={(e) => updateLine(index, "description", e.target.value)}
                          />
                        </div>

                        <div className="col-span-1 flex items-end">
                          {lines.length > 1 && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => removeLine(index)}
                              className="w-full"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <Card className={balanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي المدين</p>
                      <p className="text-xl font-bold">{formatCurrency(totalDebit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الدائن</p>
                      <p className="text-xl font-bold">{formatCurrency(totalCredit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">التوازن</p>
                      <Badge variant={balanced ? "default" : "destructive"} className="text-lg px-4 py-2">
                        {balanced ? "✓ متوازن" : "✗ غير متوازن"}
                      </Badge>
                    </div>
                  </div>
                  {!balanced && (
                    <p className="text-center text-red-600 text-sm mt-2">
                      الفرق: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  إلغاء
                </Button>
                <Button variant="secondary" onClick={resetForm} disabled={submitting}>
                  إعادة تعيين
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || !balanced}>
                  {submitting ? "جاري الحفظ..." : "حفظ القيد"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
