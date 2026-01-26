import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Home, FolderTree, Plus, LayoutDashboard } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import PageHeader from "../components/PageHeader";

type Account = {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  children?: Account[];
};

const formatCurrency = (n: number) => (Number(n || 0)).toLocaleString("ar") + " ل.س";

export default function ChartOfAccounts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameEn: "",
    type: "asset" as "asset" | "liability" | "equity" | "revenue" | "expense",
    parentId: "",
    description: "",
    centerId: "",
    finalReportName: "",
    finalReportNameEn: "",
    finalReports: 0,
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
  });

  const [centers, setCenters] = useState<any[]>([]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/erp/accounts");
      if (res.data.success) {
        // تحويل البيانات من MongoDB (_id) إلى Frontend (id)
        const convertAccount = (acc: any): Account => ({
          id: acc._id,
          code: acc.code,
          name: acc.name,
          type: acc.type,
          balance: acc.balance || 0,
          children: acc.children?.map((child: any) => convertAccount(child)) || [],
        });
        
        const convertedAccounts = res.data.data.map((acc: any) => convertAccount(acc));
        setAccounts(convertedAccounts);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setLoading(false);
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
    if (!formData.code.trim()) {
      setError("يرجى إدخال رمز الحساب");
      return;
    }
    
    if (!formData.name.trim()) {
      setError("يرجى إدخال اسم الحساب");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        code: formData.code,
        name: formData.name,
        nameEn: formData.nameEn,
        type: formData.type,
        parentId: formData.parentId || undefined,
        description: formData.description,
      };

      if (formData.centerId) payload.centerId = formData.centerId;
      if (formData.finalReportName) payload.finalReportName = formData.finalReportName;
      if (formData.finalReportNameEn) payload.finalReportNameEn = formData.finalReportNameEn;
      if (formData.finalReports) payload.finalReports = formData.finalReports;
      if (formData.category1) payload.category1 = formData.category1;
      if (formData.category2) payload.category2 = formData.category2;
      if (formData.category3) payload.category3 = formData.category3;
      if (formData.category4) payload.category4 = formData.category4;
      if (formData.category5) payload.category5 = formData.category5;

      const res = await api.post("/erp/accounts", payload);

      if (res.data.success) {
        setSuccess("تم إنشاء الحساب بنجاح!");
        setTimeout(() => {
          setShowForm(false);
          setSuccess("");
          resetForm();
          loadAccounts();
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      nameEn: "",
      type: "asset",
      parentId: "",
      description: "",
      centerId: "",
      finalReportName: "",
      finalReportNameEn: "",
      finalReports: 0,
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
    });
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline"; label: string; color: string }> = {
      asset: { variant: "default", label: t("account.type.asset"), color: "bg-green-500" },
      liability: { variant: "secondary", label: t("account.type.liability"), color: "bg-red-500" },
      equity: { variant: "outline", label: t("account.type.equity"), color: "bg-blue-500" },
      revenue: { variant: "default", label: t("account.type.revenue"), color: "bg-purple-500" },
      expense: { variant: "secondary", label: t("account.type.expense"), color: "bg-orange-500" },
    };
    const item = config[type] || config.asset;
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  const AccountRow = ({ account, level = 0 }: { account: Account; level?: number }) => (
    <>
      <div 
        className={`flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors`}
        style={{ paddingRight: `${level * 2 + 1}rem` }}
      >
        <div className="flex items-center gap-4 flex-1">
          <span className="font-mono text-sm text-muted-foreground w-20">{account.code}</span>
          <span className="font-medium">{account.name}</span>
          {getTypeBadge(account.type)}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">{formatCurrency(account.balance)}</span>
        </div>
      </div>
      {account.children?.map((child) => (
        <AccountRow key={child.id} account={child} level={level + 1} />
      ))}
    </>
  );

  return (
    <div className="min-h-screen" dir="rtl">
      <PageHeader
        title={t("account.title")}
        subtitle="دليل الحسابات الكامل"
        icon={<FolderTree className="w-6 h-6 text-white" />}
        actions={
          <>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
            >
              <Plus className="w-4 h-4 ml-2" />
              {t("account.create")}
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="h-9">
              {t("action.logout")}
            </Button>
          </>
        }
      />

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
                <h4 className="font-semibold text-blue-900 mb-2">تعليمات شجرة الحسابات</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>الأصول (1000-1999)</strong>: كل ما تمتلكه الشركة (نقدية، بنوك، عملاء)</li>
                  <li><strong>الخصوم (2000-2999)</strong>: التزامات الشركة (موردين، قروض)</li>
                  <li><strong>حقوق الملكية (3000-3999)</strong>: رأس المال والأرباح المحتجزة</li>
                  <li><strong>الإيرادات (4000-4999)</strong>: المبيعات والدخل</li>
                  <li><strong>المصروفات (5000-5999)</strong>: التكاليف والمصاريف</li>
                  <li>يمكنك إنشاء حسابات فرعية تحت أي حساب رئيسي</li>
                  <li>استخدم أرقام متسلسلة لتنظيم أفضل</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Tree */}
        <Card>
          <CardContent className="p-0" dir="rtl">
            {loading && (
              <div className="text-center py-10">جاري التحميل...</div>
            )}
            {!loading && accounts.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                لا توجد حسابات. اضغط "إضافة حساب جديد" للبدء.
              </div>
            )}
            {!loading && accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </CardContent>
        </Card>

        {/* Create Account Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">إضافة حساب جديد</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الحساب الجديد في دليل الحسابات
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

              {/* Account Code and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز الحساب *</Label>
                  <Input 
                    placeholder="مثال: 1100"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    استخدم نظام ترقيم منطقي (1000 للأصول، 2000 للخصوم، الخ)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>اسم الحساب *</Label>
                  <Input 
                    placeholder="مثال: النقدية بالصندوق"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>نوع الحساب *</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="asset">أصل (Asset) - 1000-1999</option>
                  <option value="liability">خصم (Liability) - 2000-2999</option>
                  <option value="equity">حقوق ملكية (Equity) - 3000-3999</option>
                  <option value="revenue">إيراد (Revenue) - 4000-4999</option>
                  <option value="expense">مصروف (Expense) - 5000-5999</option>
                </select>
              </div>

              {/* Parent Account (Optional) */}
              <div className="space-y-2">
                <Label>الحساب الأب (اختياري)</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                >
                  <option value="">لا يوجد (حساب رئيسي)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  اختر حساباً رئيسياً إذا كان هذا حساباً فرعياً
                </p>
              </div>

              {/* English Name (Optional) */}
              <div className="space-y-2">
                <Label>الاسم بالإنجليزية (اختياري)</Label>
                <Input 
                  placeholder="Example: Cash on Hand"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>الوصف (اختياري)</Label>
                <Input 
                  placeholder="وصف تفصيلي للحساب"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Additional Fields */}
              <div className="grid md:grid-cols-2 gap-4">
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
                  <Label>اسم التقرير النهائي</Label>
                  <Input 
                    placeholder="مثل: قائمة الدخل، الميزانية..."
                    value={formData.finalReportName}
                    onChange={(e) => setFormData({...formData, finalReportName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم التقرير النهائي (إنجليزي)</Label>
                  <Input 
                    placeholder="Final Report Name"
                    value={formData.finalReportNameEn}
                    onChange={(e) => setFormData({...formData, finalReportNameEn: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم التقرير النهائي</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={formData.finalReports || ""}
                    onChange={(e) => setFormData({...formData, finalReports: Number(e.target.value) || 0})}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="grid md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>الفئة 1</Label>
                  <Input 
                    placeholder="الفئة 1"
                    value={formData.category1}
                    onChange={(e) => setFormData({...formData, category1: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفئة 2</Label>
                  <Input 
                    placeholder="الفئة 2"
                    value={formData.category2}
                    onChange={(e) => setFormData({...formData, category2: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفئة 3</Label>
                  <Input 
                    placeholder="الفئة 3"
                    value={formData.category3}
                    onChange={(e) => setFormData({...formData, category3: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفئة 4</Label>
                  <Input 
                    placeholder="الفئة 4"
                    value={formData.category4}
                    onChange={(e) => setFormData({...formData, category4: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفئة 5</Label>
                  <Input 
                    placeholder="الفئة 5"
                    value={formData.category5}
                    onChange={(e) => setFormData({...formData, category5: e.target.value})}
                  />
                </div>
              </div>

              {/* Helper Text */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                    <p className="text-sm text-yellow-800">
                      <strong>نصيحة:</strong> استخدم رموز متسلسلة ومنطقية لسهولة التنظيم والبحث لاحقاً.
                      مثال: 1100 للنقدية، 1110 للنقدية بالصندوق، 1120 للنقدية بالبنك.
                    </p>
                  </div>
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
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "جاري الحفظ..." : "حفظ الحساب"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
