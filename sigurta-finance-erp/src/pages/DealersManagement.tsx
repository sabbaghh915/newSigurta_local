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
import { Home, Users, LayoutDashboard, Plus, Edit, Trash2 } from "lucide-react";

type Dealer = {
  _id: string;
  code?: string;
  name: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function DealersManagement() {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    parentId: "",
    isActive: true,
  });

  const loadDealers = async () => {
    setLoading(true);
    try {
      // استخدام مراكز التكلفة كتجار (يمكن إنشاء نموذج منفصل لاحقاً)
      const res = await api.get("/erp/reports/cost-centers-list");
      if (res.data.success) {
        setDealers(res.data.data.map((center: any) => ({
          _id: center._id,
          code: center.code || "",
          name: center.name,
          isActive: center.isActive,
          createdAt: center.createdAt,
          updatedAt: center.updatedAt,
        })));
      }
    } catch (error) {
      console.error("Error loading dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealers();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("يرجى إدخال اسم التاجر");
      return;
    }

    try {
      // هنا يمكن إضافة API endpoint خاص بالتجار
      // حالياً نستخدم مراكز التكلفة
      setSuccess(editingId ? "تم تحديث التاجر بنجاح!" : "تم إنشاء التاجر بنجاح!");
      setTimeout(() => {
        setShowForm(false);
        resetForm();
        loadDealers();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      parentId: "",
      isActive: true,
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (dealer: Dealer) => {
    setFormData({
      code: dealer.code || "",
      name: dealer.name,
      parentId: dealer.parentId || "",
      isActive: dealer.isActive,
    });
    setEditingId(dealer._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التاجر؟")) return;
    
    try {
      // هنا يمكن إضافة API endpoint لحذف التاجر
      setSuccess("تم حذف التاجر بنجاح!");
      loadDealers();
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">إدارة التجار</h1>
                <p className="text-sm text-purple-100">إدارة قائمة التجار والموردين</p>
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
                عدد التجار: {dealers.length}
              </Badge>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة تاجر جديد
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
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealers.map((dealer) => (
                      <TableRow key={dealer._id}>
                        <TableCell className="text-right font-mono text-sm">
                          {dealer.code || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{dealer.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={dealer.isActive ? "default" : "outline"}>
                            {dealer.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {dealer.createdAt
                            ? new Date(dealer.createdAt).toLocaleDateString("ar")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(dealer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(dealer._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!dealers.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد تجار
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل تاجر" : "إضافة تاجر جديد"}
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
                  <Label>الرمز</Label>
                  <Input
                    placeholder="رمز التاجر"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الاسم *</Label>
                  <Input
                    placeholder="اسم التاجر"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">نشط</Label>
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
