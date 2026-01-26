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
import { Home, Users, LayoutDashboard, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

type User = {
  _id: string;
  userId?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  email?: string;
  mobile?: string;
  password?: string;
  groupId?: string;
  groupName?: string;
  level?: number;
  isMaster?: boolean;
  isActive?: boolean;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  category5?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    userId: "",
    nameAr: "",
    nameEn: "",
    email: "",
    mobile: "",
    password: "",
    groupId: "",
    level: 1,
    isMaster: false,
    isActive: true,
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual users API endpoint
      // const res = await api.get("/erp/users");
      // if (res.data.success) {
      //   setUsers(res.data.data);
      // }
      setUsers([]); // Placeholder
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.nameAr?.trim()) {
      setError("يرجى إدخال اسم المستخدم بالعربي");
      return;
    }

    if (!formData.userId?.trim()) {
      setError("يرجى إدخال رمز المستخدم");
      return;
    }

    if (!editingId && !formData.password?.trim()) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      // const payload: any = {
      //   userId: formData.userId,
      //   nameAr: formData.nameAr,
      //   nameEn: formData.nameEn,
      //   email: formData.email,
      //   mobile: formData.mobile,
      //   groupId: formData.groupId || undefined,
      //   level: formData.level,
      //   isMaster: formData.isMaster,
      //   isActive: formData.isActive,
      //   category1: formData.category1 || undefined,
      //   category2: formData.category2 || undefined,
      //   category3: formData.category3 || undefined,
      //   category4: formData.category4 || undefined,
      //   category5: formData.category5 || undefined,
      // };
      // 
      // if (!editingId && formData.password) {
      //   payload.password = formData.password;
      // }
      // 
      // if (editingId) {
      //   await api.put(`/erp/users/${editingId}`, payload);
      // } else {
      //   await api.post("/erp/users", payload);
      // }

      setSuccess(editingId ? "تم تحديث المستخدم بنجاح!" : "تم إنشاء المستخدم بنجاح!");
      setTimeout(() => {
        setShowForm(false);
        resetForm();
        loadUsers();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      nameAr: "",
      nameEn: "",
      email: "",
      mobile: "",
      password: "",
      groupId: "",
      level: 1,
      isMaster: false,
      isActive: true,
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      userId: user.userId || "",
      nameAr: user.nameAr || "",
      nameEn: user.nameEn || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      groupId: user.groupId || "",
      level: user.level || 1,
      isMaster: user.isMaster || false,
      isActive: user.isActive !== false,
      category1: user.category1 || "",
      category2: user.category2 || "",
      category3: user.category3 || "",
      category4: user.category4 || "",
      category5: user.category5 || "",
    });
    setEditingId(user._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    
    try {
      // TODO: Replace with actual API endpoint
      // await api.delete(`/erp/users/${id}`);
      setSuccess("تم حذف المستخدم بنجاح!");
      loadUsers();
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
                <h1 className="text-xl font-bold text-white">إدارة المستخدمين</h1>
                <p className="text-sm text-purple-100">إدارة المستخدمين والصلاحيات</p>
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
        {/* Actions */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-base px-4 py-2">
                عدد المستخدمين: {users.length}
              </Badge>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مستخدم جديد
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
                      <TableHead className="text-right">الاسم بالعربي</TableHead>
                      <TableHead className="text-right">الاسم بالإنجليزي</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">المستوى</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="text-right font-mono text-sm">
                          {user.userId || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{user.nameAr || "—"}</TableCell>
                        <TableCell className="text-right">{user.nameEn || "—"}</TableCell>
                        <TableCell className="text-right text-sm">{user.email || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">مستوى {user.level || 1}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={user.isActive !== false ? "default" : "outline"}>
                            {user.isActive !== false ? "نشط" : "غير نشط"}
                          </Badge>
                          {user.isMaster && (
                            <Badge variant="secondary" className="mr-2">رئيسي</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!users.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا يوجد مستخدمون
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
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

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز المستخدم *</Label>
                  <Input
                    placeholder="رمز المستخدم"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم المستخدم بالعربي *</Label>
                  <Input
                    placeholder="اسم المستخدم بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم المستخدم بالإنجليزي</Label>
                  <Input
                    placeholder="User Name (English)"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الجوال</Label>
                  <Input
                    placeholder="09xxxxxxxx"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>كلمة المرور {!editingId && "*"}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingId}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>رمز المجموعة</Label>
                  <Input
                    placeholder="رمز المجموعة"
                    value={formData.groupId}
                    onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>مستوى المستخدم</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: Number(e.target.value) || 1})}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isMaster"
                    checked={formData.isMaster}
                    onChange={(e) => setFormData({...formData, isMaster: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isMaster">مستخدم رئيسي</Label>
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

              {/* Actions */}
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
