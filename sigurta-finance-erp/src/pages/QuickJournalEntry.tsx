import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Home, Zap, LayoutDashboard, Save } from "lucide-react";
import { Select } from "../components/ui/select";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

export default function QuickJournalEntry() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    docType: "",
    docNo: "",
    description: "",
    descriptionEn: "",
    accountDebit: "",
    accountCredit: "",
    amount: 0,
    dealerId: "",
    costCenterId: "",
    currency: "SYP",
    currencyRate: 1,
    dueDate: "",
    tax: false,
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    notesAr: "",
    notesEn: "",
  });

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
    loadAccounts();
    loadCenters();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!formData.description.trim()) {
      setError("يرجى إدخال الوصف");
      return;
    }

    if (!formData.accountDebit || !formData.accountCredit) {
      setError("يرجى اختيار الحساب المدين والحساب الدائن");
      return;
    }

    if (formData.accountDebit === formData.accountCredit) {
      setError("الحساب المدين والدائن يجب أن يكونا مختلفين");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError("يرجى إدخال مبلغ صحيح");
      return;
    }

    setSubmitting(true);
    try {
      const debitAccount = accounts.find(a => a._id === formData.accountDebit);
      const creditAccount = accounts.find(a => a._id === formData.accountCredit);

      const payload: any = {
        date: formData.date,
        description: formData.description,
        notes: formData.notesAr,
        lines: [
          {
            accountId: formData.accountDebit,
            accountName: debitAccount?.name || "",
            accountCode: debitAccount?.code || "",
            debit: formData.amount,
            credit: 0,
            description: formData.description,
            dealerId: formData.dealerId || undefined,
            costCenterId: formData.costCenterId || undefined,
            dueDate: formData.dueDate || undefined,
            category1: formData.category1 || undefined,
            category2: formData.category2 || undefined,
            category3: formData.category3 || undefined,
            category4: formData.category4 || undefined,
            category5: formData.category5 || undefined,
          },
          {
            accountId: formData.accountCredit,
            accountName: creditAccount?.name || "",
            accountCode: creditAccount?.code || "",
            debit: 0,
            credit: formData.amount,
            description: formData.description,
            dealerId: formData.dealerId || undefined,
            costCenterId: formData.costCenterId || undefined,
            dueDate: formData.dueDate || undefined,
            category1: formData.category1 || undefined,
            category2: formData.category2 || undefined,
            category3: formData.category3 || undefined,
            category4: formData.category4 || undefined,
            category5: formData.category5 || undefined,
          },
        ],
      };

      if (formData.docType) payload.docType = formData.docType;
      if (formData.docNo) payload.docNo = formData.docNo;
      if (formData.dealerId) payload.dealerId = formData.dealerId;
      if (formData.costCenterId) payload.centerId = formData.costCenterId;
      if (formData.dueDate) payload.dueDate = formData.dueDate;
      if (formData.currency) payload.currency = formData.currency;
      if (formData.currencyRate) payload.currencyRate = formData.currencyRate;
      if (formData.category1) payload.category1 = formData.category1;
      if (formData.category2) payload.category2 = formData.category2;
      if (formData.category3) payload.category3 = formData.category3;
      if (formData.category4) payload.category4 = formData.category4;
      if (formData.category5) payload.category5 = formData.category5;

      const res = await api.post("/erp/journal-entries", payload);

      if (res.data.success) {
        setSuccess("تم إنشاء القيد المحاسبي بنجاح!");
        setTimeout(() => {
          resetForm();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error creating journal entry:", error);
      setError(error.response?.data?.message || "حدث خطأ أثناء إنشاء القيد");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      docType: "",
      docNo: "",
      description: "",
      descriptionEn: "",
      accountDebit: "",
      accountCredit: "",
      amount: 0,
      dealerId: "",
      costCenterId: "",
      currency: "SYP",
      currencyRate: 1,
      dueDate: "",
      tax: false,
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
      notesAr: "",
      notesEn: "",
    });
    setError("");
    setSuccess("");
  };

  const debitAccount = accounts.find(a => a._id === formData.accountDebit);
  const creditAccount = accounts.find(a => a._id === formData.accountCredit);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg text-white flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">إدخال قيد محاسبي سريع</h1>
                <p className="text-sm text-purple-100">إدخال قيد محاسبي بسيط (سطرين: مدين ودائن)</p>
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

      <div className="container mx-auto p-6">
        <Card className="shadow-md max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>إدخال قيد محاسبي سريع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>التاريخ *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
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
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>الوصف *</Label>
              <Input
                placeholder="وصف القيد المحاسبي"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            {/* Accounts and Amount */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الحساب المدين *</Label>
                <Select
                  value={formData.accountDebit}
                  onChange={(e) => setFormData({...formData, accountDebit: e.target.value})}
                  className="w-full"
                >
                  <option value="">اختر حساب مدين...</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </Select>
                {debitAccount && (
                  <p className="text-xs text-muted-foreground">
                    النوع: {debitAccount.type}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>الحساب الدائن *</Label>
                <Select
                  value={formData.accountCredit}
                  onChange={(e) => setFormData({...formData, accountCredit: e.target.value})}
                  className="w-full"
                >
                  <option value="">اختر حساب دائن...</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </Select>
                {creditAccount && (
                  <p className="text-xs text-muted-foreground">
                    النوع: {creditAccount.type}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>المبلغ *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value) || 0})}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.amount > 0 && formatCurrency(formData.amount)}
                </p>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>التاجر</Label>
                <Select
                  value={formData.dealerId}
                  onChange={(e) => setFormData({...formData, dealerId: e.target.value})}
                  className="w-full"
                >
                  <option value="">اختر التاجر...</option>
                  {centers.map(center => (
                    <option key={center._id} value={center._id}>
                      {center.code || center.name} - {center.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>مركز التكلفة</Label>
                <Select
                  value={formData.costCenterId}
                  onChange={(e) => setFormData({...formData, costCenterId: e.target.value})}
                  className="w-full"
                >
                  <option value="">اختر مركز التكلفة...</option>
                  {centers.map(center => (
                    <option key={center._id} value={center._id}>
                      {center.code || center.name} - {center.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
            </div>

            {/* Currency */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العملة</Label>
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full"
                >
                  <option value="SYP">ليرة سورية (SYP)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>سعر الصرف</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.currencyRate}
                  onChange={(e) => setFormData({...formData, currencyRate: Number(e.target.value) || 1})}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <textarea
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="ملاحظات إضافية..."
                value={formData.notesAr}
                onChange={(e) => setFormData({...formData, notesAr: e.target.value})}
              />
            </div>

            {/* Summary */}
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">المدين</p>
                    <p className="text-xl font-bold text-primary-700">
                      {debitAccount ? `${debitAccount.code} - ${debitAccount.name}` : "—"}
                    </p>
                    <p className="text-lg font-semibold">{formatCurrency(formData.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الدائن</p>
                    <p className="text-xl font-bold text-primary-700">
                      {creditAccount ? `${creditAccount.code} - ${creditAccount.name}` : "—"}
                    </p>
                    <p className="text-lg font-semibold">{formatCurrency(formData.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">التوازن</p>
                    <Badge variant="default" className="text-lg px-4 py-2">
                      ✓ متوازن
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm} disabled={submitting}>
                إعادة تعيين
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !formData.description || !formData.accountDebit || !formData.accountCredit || !formData.amount}>
                <Save className="w-4 h-4 ml-2" />
                {submitting ? "جاري الحفظ..." : "حفظ القيد"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
