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
import { Home, Coins, LayoutDashboard, Plus, Edit, Trash2 } from "lucide-react";

type Currency = {
  _id: string;
  currencyId?: string;
  nameAr?: string;
  nameEn?: string;
  rate?: number;
  symbol?: string;
  one?: string;
  two?: string;
  more?: string;
  mini?: string;
  countOne?: string;
  countTwo?: string;
  countMore?: string;
  sex?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  category5?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function CurrenciesManagement() {
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    currencyId: "",
    nameAr: "",
    nameEn: "",
    rate: 1,
    symbol: "",
    one: "",
    two: "",
    more: "",
    mini: "",
    countOne: "",
    countTwo: "",
    countMore: "",
    sex: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
  });

  const loadCurrencies = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual currencies API endpoint
      // const res = await api.get("/erp/currencies");
      // if (res.data.success) {
      //   setCurrencies(res.data.data);
      // }
      setCurrencies([]); // Placeholder
    } catch (error) {
      console.error("Error loading currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.nameAr?.trim()) {
      setError("يرجى إدخال اسم العملة بالعربي");
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      setSuccess(editingId ? "تم تحديث العملة بنجاح!" : "تم إنشاء العملة بنجاح!");
      setTimeout(() => {
        setShowForm(false);
        resetForm();
        loadCurrencies();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({
      currencyId: "",
      nameAr: "",
      nameEn: "",
      rate: 1,
      symbol: "",
      one: "",
      two: "",
      more: "",
      mini: "",
      countOne: "",
      countTwo: "",
      countMore: "",
      sex: "",
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

  const handleEdit = (currency: Currency) => {
    setFormData({
      currencyId: currency.currencyId || "",
      nameAr: currency.nameAr || "",
      nameEn: currency.nameEn || "",
      rate: currency.rate || 1,
      symbol: currency.symbol || "",
      one: currency.one || "",
      two: currency.two || "",
      more: currency.more || "",
      mini: currency.mini || "",
      countOne: currency.countOne || "",
      countTwo: currency.countTwo || "",
      countMore: currency.countMore || "",
      sex: currency.sex || "",
      category1: currency.category1 || "",
      category2: currency.category2 || "",
      category3: currency.category3 || "",
      category4: currency.category4 || "",
      category5: currency.category5 || "",
    });
    setEditingId(currency._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه العملة؟")) return;
    
    try {
      // TODO: Replace with actual API endpoint
      setSuccess("تم حذف العملة بنجاح!");
      loadCurrencies();
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
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">إدارة العملات</h1>
                <p className="text-sm text-purple-100">إدارة قائمة العملات وأسعار الصرف</p>
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
                عدد العملات: {currencies.length}
              </Badge>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة عملة جديدة
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
                      <TableHead className="text-right">سعر الصرف</TableHead>
                      <TableHead className="text-right">الرمز</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency._id}>
                        <TableCell className="text-right font-mono text-sm">
                          {currency.currencyId || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{currency.nameAr || "—"}</TableCell>
                        <TableCell className="text-right">{currency.nameEn || "—"}</TableCell>
                        <TableCell className="text-right font-mono">
                          {currency.rate ? currency.rate.toLocaleString("ar") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{currency.symbol || "—"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(currency)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(currency._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!currencies.length && (
                  <div className="text-center text-muted-foreground py-10">
                    لا توجد عملات
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
                {editingId ? "تعديل عملة" : "إضافة عملة جديدة"}
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
                  <Label>رمز العملة</Label>
                  <Input
                    placeholder="رمز العملة"
                    value={formData.currencyId}
                    onChange={(e) => setFormData({...formData, currencyId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم العملة بالعربي *</Label>
                  <Input
                    placeholder="اسم العملة بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم العملة بالإنجليزي</Label>
                  <Input
                    placeholder="Currency Name (English)"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>سعر الصرف</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: Number(e.target.value) || 1})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الرمز</Label>
                  <Input
                    placeholder="مثل: SYP, USD, EUR"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>واحد</Label>
                  <Input
                    placeholder="مثل: ليرة"
                    value={formData.one}
                    onChange={(e) => setFormData({...formData, one: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>اثنان</Label>
                  <Input
                    placeholder="مثل: ليرتان"
                    value={formData.two}
                    onChange={(e) => setFormData({...formData, two: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>أكثر</Label>
                  <Input
                    placeholder="مثل: ليرات"
                    value={formData.more}
                    onChange={(e) => setFormData({...formData, more: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>صغير</Label>
                  <Input
                    placeholder="مثل: قرش"
                    value={formData.mini}
                    onChange={(e) => setFormData({...formData, mini: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الجنس</Label>
                  <Input
                    placeholder="الجنس"
                    value={formData.sex}
                    onChange={(e) => setFormData({...formData, sex: e.target.value})}
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
