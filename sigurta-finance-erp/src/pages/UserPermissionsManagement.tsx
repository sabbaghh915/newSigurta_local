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
import { Home, Shield, LayoutDashboard, Plus, Edit, Trash2 } from "lucide-react";

type Permission = {
  _id: string;
  userId?: string;
  userName?: string;
  groupId?: string;
  groupName?: string;
  permissionId?: string;
  permissionName?: string;
  allowed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function UserPermissionsManagement() {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [permissionTypes, setPermissionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    userId: "",
    groupId: "",
    permissionId: "",
    allowed: true,
  });

  const loadPermissions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual permissions API endpoint
      // const res = await api.get("/erp/user-permissions");
      // if (res.data.success) {
      //   setPermissions(res.data.data);
      // }
      setPermissions([]); // Placeholder
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // TODO: Replace with actual users API endpoint
      // const res = await api.get("/erp/users");
      // if (res.data.success) {
      //   setUsers(res.data.data);
      // }
      setUsers([]); // Placeholder
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadPermissionTypes = async () => {
    try {
      // TODO: Replace with actual permission types API endpoint
      // const res = await api.get("/erp/permission-types");
      // if (res.data.success) {
      //   setPermissionTypes(res.data.data);
      // }
      setPermissionTypes([
        { _id: "1", name: "إنشاء قيود محاسبية" },
        { _id: "2", name: "تعديل قيود محاسبية" },
        { _id: "3", name: "حذف قيود محاسبية" },
        { _id: "4", name: "الموافقة على القيود" },
        { _id: "5", name: "عرض التقارير" },
        { _id: "6", name: "تصدير التقارير" },
        { _id: "7", name: "إدارة الحسابات" },
        { _id: "8", name: "إدارة المستخدمين" },
      ]); // Placeholder
    } catch (error) {
      console.error("Error loading permission types:", error);
    }
  };

  useEffect(() => {
    loadPermissions();
    loadUsers();
    loadPermissionTypes();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.userId && !formData.groupId) {
      setError("يرجى اختيار مستخدم أو مجموعة");
      return;
    }

    if (!formData.permissionId) {
      setError("يرجى اختيار الصلاحية");
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      setSuccess(editingId ? "تم تحديث الصلاحية بنجاح!" : "تم إنشاء الصلاحية بنجاح!");
      setTimeout(() => {
        setShowForm(false);
        resetForm();
        loadPermissions();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      groupId: "",
      permissionId: "",
      allowed: true,
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (permission: Permission) => {
    setFormData({
      userId: permission.userId || "",
      groupId: permission.groupId || "",
      permissionId: permission.permissionId || "",
      allowed: permission.allowed !== false,
    });
    setEditingId(permission._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصلاحية؟")) return;
    
    try {
      // TODO: Replace with actual API endpoint
      setSuccess("تم حذف الصلاحية بنجاح!");
      loadPermissions();
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
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">إدارة صلاحيات المستخدمين</h1>
                <p className="text-sm text-purple-100">إدارة صلاحيات المستخدمين والمجموعات</p>
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
                عدد الصلاحيات: {permissions.length}
              </Badge>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة صلاحية جديدة
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
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">المجموعة</TableHead>
                      <TableHead className="text-right">الصلاحية</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission._id}>
                        <TableCell className="text-right">
                          {permission.userName || permission.userId || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {permission.groupName || permission.groupId || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {permission.permissionName || permission.permissionId || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={permission.allowed !== false ? "default" : "destructive"}>
                            {permission.allowed !== false ? "مسموح" : "ممنوع"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(permission)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(permission._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!permissions.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد صلاحيات
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
                {editingId ? "تعديل صلاحية" : "إضافة صلاحية جديدة"}
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
                  <Label>المستخدم</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value, groupId: ""})}
                  >
                    <option value="">اختر مستخدم...</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.nameAr || user.name || user.userId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>المجموعة</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.groupId}
                    onChange={(e) => setFormData({...formData, groupId: e.target.value, userId: ""})}
                  >
                    <option value="">اختر مجموعة...</option>
                    {/* TODO: Load groups */}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>الصلاحية *</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.permissionId}
                    onChange={(e) => setFormData({...formData, permissionId: e.target.value})}
                    required
                  >
                    <option value="">اختر صلاحية...</option>
                    {permissionTypes.map(perm => (
                      <option key={perm._id} value={perm._id}>
                        {perm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="allowed"
                    checked={formData.allowed}
                    onChange={(e) => setFormData({...formData, allowed: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="allowed">مسموح</Label>
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
