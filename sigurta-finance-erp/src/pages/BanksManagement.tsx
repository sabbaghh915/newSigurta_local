import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Home, Building2, LayoutDashboard, Plus, Edit, Trash2 } from "lucide-react";

type Bank = {
  _id: string;
  bankId?: string;
  name?: string;
  branch?: string;
  accountId?: string;
  bankReport?: string;
  currency?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  category5?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function BanksManagement() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    bankId: "",
    name: "",
    branch: "",
    accountId: "",
    bankReport: "",
    currency: "SYP",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
  });

  const loadBanks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual banks API endpoint
      // const res = await api.get("/erp/banks");
      // if (res.data.success) {
      //   setBanks(res.data.data);
      // }
      setBanks([]); // Placeholder
    } catch (error) {
      console.error("Error loading banks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.name?.trim()) {
      setError("يرجى إدخال اسم البنك");
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      setSuccess(editingId ? "تم تحديث البنك بنجاح!" : "تم إنشاء البنك بنجاح!");
      setTimeout(() => {
        setShowForm(false);
        resetForm();
        loadBanks();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({
      bankId: "",
      name: "",
      branch: "",
      accountId: "",
      bankReport: "",
      currency: "SYP",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (bank: Bank) => {
    setFormData({
      bankId: bank.bankId || "",
      name: bank.name || "",
      branch: bank.branch || "",
      accountId: bank.accountId || "",
      bankReport: bank.bankReport || "",
      currency: bank.currency || "SYP",
      category1: bank.category1 || "",
      category2: bank.category2 || "",
      category3: bank.category3 || "",
      category4: bank.category4 || "",
      category5: bank.category5 || "",
    });
    setEditingId(bank._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البنك؟")) return;
    
    try {
      // TODO: Replace with actual API endpoint
      setSuccess("تم حذف البنك بنجاح!");
      loadBanks();
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg text-white flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">إدارة البنوك</h1>
                <p className="text-sm text-purple-100">إدارة قائمة البنوك والحسابات البنكية</p>
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
        {/* Actions */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-base px-4 py-2">
                عدد البنوك: {banks.length}
              </Badge>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة بنك جديد
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
                      <TableHead className="text-right">الرمز</TableHead>
                      <TableHead className="text-right">اسم البنك</TableHead>
                      <TableHead className="text-right">الفرع</TableHead>
                      <TableHead className="text-right">رقم الحساب</TableHead>
                      <TableHead className="text-right">العملة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banks.map((bank) => (
                      <TableRow key={bank._id}>
                        <TableCell className="text-right font-mono text-sm">
                          {bank.bankId || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{bank.name || "—"}</TableCell>
                        <TableCell className="text-right">{bank.branch || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{bank.accountId || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{bank.currency || "SYP"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(bank)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(bank._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!banks.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد بنوك
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل بنك" : "إضافة بنك جديد"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز البنك</Label>
                  <Input
                    placeholder="رمز البنك"
                    value={formData.bankId}
                    onChange={(e) => setFormData({...formData, bankId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم البنك *</Label>
                  <Input
                    placeholder="اسم البنك"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>الفرع</Label>
                  <Input
                    placeholder="اسم الفرع"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم الحساب</Label>
                  <Input
                    placeholder="رقم الحساب البنكي"
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>تقرير البنك</Label>
                  <Input
                    placeholder="تقرير البنك"
                    value={formData.bankReport}
                    onChange={(e) => setFormData({...formData, bankReport: e.target.value})}
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

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  إلغاء
                </Button>
                <Button onClick={handleSubmit}>
                  {editingId ? "تحديث" : "حفظ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
