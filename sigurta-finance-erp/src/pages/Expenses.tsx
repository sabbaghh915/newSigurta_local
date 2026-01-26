import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Home, Receipt, Plus, LayoutDashboard } from "lucide-react";

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: "draft" | "paid" | "pending";
  paymentMethod?: string;
  vendor?: string;
};

const expenseCategories = [
  "رواتب وأجور",
  "إيجار",
  "مرافق (كهرباء، ماء، غاز)",
  "صيانة",
  "قرطاسية ومطبوعات",
  "اتصالات وإنترنت",
  "نقل ومواصلات",
  "تأمينات",
  "دعاية وإعلان",
  "مصاريف إدارية",
  "مصاريف قانونية",
  "ضرائب ورسوم",
  "أخرى",
];

const paymentMethods = [
  { value: "cash", label: "نقداً" },
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "check", label: "شيك" },
  { value: "other", label: "أخرى" },
];

export default function Expenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: "",
    description: "",
    amount: "",
    status: "draft" as "draft" | "pending" | "paid",
    paymentMethod: "",
    vendor: "",
    invoiceNumber: "",
    notes: "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/erp/expenses");
      if (res.data.success) {
        setExpenses(res.data.data.map((e: any) => ({
          id: e._id,
          date: e.date,
          category: e.category,
          description: e.description,
          amount: e.amount,
          status: e.status,
          paymentMethod: e.paymentMethod,
          vendor: e.vendor,
        })));
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    
    // Validation
    if (!formData.category) {
      setError("يرجى اختيار فئة المصروف");
      return;
    }
    
    if (!formData.description.trim()) {
      setError("يرجى إدخال وصف المصروف");
      return;
    }
    
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("يرجى إدخال مبلغ صحيح");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/erp/expenses", {
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: Number(formData.amount),
        status: formData.status,
        paymentMethod: formData.paymentMethod || undefined,
        vendor: formData.vendor || undefined,
        invoiceNumber: formData.invoiceNumber || undefined,
        notes: formData.notes || undefined,
      });

      if (res.data.success) {
        setSuccess("تم إنشاء المصروف بنجاح!");
        setTimeout(() => {
          setShowForm(false);
          setSuccess("");
          resetForm();
          loadExpenses();
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ أثناء إنشاء المصروف");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: "",
      description: "",
      amount: "",
      status: "draft",
      paymentMethod: "",
      vendor: "",
      invoiceNumber: "",
      notes: "",
    });
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      paid: { variant: "default", label: "مدفوع" },
      pending: { variant: "secondary", label: "معلق" },
      draft: { variant: "outline", label: "مسودة" },
    };
    const item = config[status] || config.draft;
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">المصروفات</h1>
                <p className="text-sm text-gray-800">إدارة وتتبع المصروفات</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary-50 hover:bg-primary-100 text-gray-800 border-primary-300 h-9 font-medium"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة مصروف جديد
              </Button>
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
              <Button variant="destructive" onClick={handleLogout} className="h-9">
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">تعليمات المصروفات</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>مسودة:</strong> مصروف تم تسجيله ولم يُعتمد بعد</li>
                  <li><strong>معلق:</strong> مصروف معتمد ولكن لم يُدفع بعد</li>
                  <li><strong>مدفوع:</strong> مصروف تم دفعه بالفعل</li>
                  <li>حدد فئة المصروف بدقة لسهولة التحليل لاحقاً</li>
                  <li>أضف رقم الفاتورة واسم المورد للمصروفات الكبيرة</li>
                  <li>استخدم وصفاً واضحاً يسهل فهمه في المستقبل</li>
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
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">المورد</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        لا توجد مصروفات. اضغط "إضافة مصروف جديد" للبدء.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-right">{new Date(expense.date).toLocaleDateString("ar")}</TableCell>
                        <TableCell className="text-right font-medium">{expense.category}</TableCell>
                        <TableCell className="text-right">{expense.description}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{expense.vendor || "-"}</TableCell>
                        <TableCell className="text-right">{getStatusBadge(expense.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Create Expense Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">إضافة مصروف جديد</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل المصروف وحدد حالته
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4" dir="rtl">
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

              {/* Date and Category */}
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
                  <Label>الفئة *</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">اختر فئة...</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>الوصف *</Label>
                <Input 
                  placeholder="وصف تفصيلي للمصروف"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Amount and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المبلغ (ل.س) *</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الحالة *</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="draft">مسودة</option>
                    <option value="pending">معلق (معتمد ولم يُدفع)</option>
                    <option value="paid">مدفوع</option>
                  </select>
                </div>
              </div>

              {/* Vendor and Invoice Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المورد (اختياري)</Label>
                  <Input 
                    placeholder="اسم المورد أو الجهة"
                    value={formData.vendor}
                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم الفاتورة (اختياري)</Label>
                  <Input 
                    placeholder="رقم الفاتورة أو الإيصال"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* Payment Method (if paid) */}
              {formData.status === "paid" && (
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="">اختر طريقة الدفع...</option>
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Input 
                  placeholder="أي ملاحظات إضافية"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              {/* Summary */}
              {formData.amount && Number(formData.amount) > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(Number(formData.amount))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  إلغاء
                </Button>
                <Button variant="secondary" onClick={resetForm} disabled={submitting}>
                  إعادة تعيين
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "جاري الحفظ..." : "حفظ المصروف"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
