import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Building2,
  Home,
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Loader2,
  Info,
  Car,
  Globe,
  Bookmark,
  Palette,
  DollarSign,
  ChevronDown,
} from "lucide-react";

interface InsuranceCompany {
  _id?: string;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: "active" | "inactive";
  notes?: string;
  createdAt?: string;
}

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<InsuranceCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);

  const [companyData, setCompanyData] = useState<InsuranceCompany>({
    name: "",
    code: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
    notes: "",
  });

  const employeeName = localStorage.getItem("employeeName") || "";
  const centerName = localStorage.getItem("centerName") || "";

  // Load companies from localStorage (يمكن استبداله بـ API)
  useEffect(() => {
    const savedCompanies = localStorage.getItem("insuranceCompanies");
    if (savedCompanies) {
      try {
        const parsed = JSON.parse(savedCompanies);
        setCompanies(parsed);
        setFilteredCompanies(parsed);
      } catch (e) {
        console.error("Error loading companies:", e);
      }
    } else {
      // بيانات تجريبية
      const defaultCompanies: InsuranceCompany[] = [
        {
          _id: "1",
          name: "شركة التأمين السورية",
          code: "SIC001",
          phone: "011-1234567",
          email: "info@sic.sy",
          address: "دمشق، شارع بغداد",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          name: "الشركة السورية للتأمين",
          code: "SIC002",
          phone: "011-2345678",
          email: "info@sst.sy",
          address: "حلب، شارع الجامع",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ];
      setCompanies(defaultCompanies);
      setFilteredCompanies(defaultCompanies);
      localStorage.setItem("insuranceCompanies", JSON.stringify(defaultCompanies));
    }
  }, []);

  // Filter companies
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(term) ||
        company.code?.toLowerCase().includes(term) ||
        company.phone?.toLowerCase().includes(term) ||
        company.email?.toLowerCase().includes(term)
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleInputChange = (field: keyof InsuranceCompany, value: string | "active" | "inactive") => {
    setCompanyData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!companyData.name.trim()) {
        setError("اسم الشركة مطلوب");
        setIsLoading(false);
        return;
      }

      let updatedCompanies: InsuranceCompany[];

      if (editingCompany?._id) {
        // Update existing
        updatedCompanies = companies.map((c) =>
          c._id === editingCompany._id
            ? { ...companyData, _id: editingCompany._id, createdAt: editingCompany.createdAt }
            : c
        );
        setSuccess("تم تحديث الشركة بنجاح!");
      } else {
        // Create new
        const newCompany: InsuranceCompany = {
          ...companyData,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        updatedCompanies = [...companies, newCompany];
        setSuccess("تم إضافة الشركة بنجاح!");
      }

      setCompanies(updatedCompanies);
      localStorage.setItem("insuranceCompanies", JSON.stringify(updatedCompanies));

      setShowForm(false);
      setEditingCompany(null);
      setCompanyData({
        name: "",
        code: "",
        phone: "",
        email: "",
        address: "",
        status: "active",
        notes: "",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Company error:", err);
      setError(err?.message || "حدث خطأ في حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (company: InsuranceCompany) => {
    setEditingCompany(company);
    setCompanyData(company);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الشركة؟")) {
      const updatedCompanies = companies.filter((c) => c._id !== id);
      setCompanies(updatedCompanies);
      localStorage.setItem("insuranceCompanies", JSON.stringify(updatedCompanies));
      setSuccess("تم حذف الشركة بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
    setCompanyData({
      name: "",
      code: "",
      phone: "",
      email: "",
      address: "",
      status: "active",
      notes: "",
    });
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">شركات التأمين</h1>
                <p className="text-sm text-gray-800">إدارة شركات التأمين</p>
              </div>
            </div>

            <div className="text-right text-gray-800">
              <div className="text-sm font-semibold">المركز: <span className="text-primary-700">{centerName || "—"}</span></div>
              <div className="text-xs text-gray-600 mt-1">الموظف: {employeeName || "—"}</div>
            </div>

            <div className="flex items-center gap-2">
              {/* زر الرئيسية */}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>

              {/* زر إضافة/تعديل */}
              <Button
                variant="outline"
                onClick={() => setShowForm(!showForm)}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 h-9"
              >
                <Plus className="w-4 h-4 ml-2" />
                {editingCompany ? "تعديل" : "إضافة شركة"}
              </Button>

              {/* السجلات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9">
                    <FileText className="w-4 h-4 ml-2" />
                    السجلات
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>السجلات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/records")} className="text-right cursor-pointer">
                    <FileText className="w-4 h-4 ml-2" />
                    جميع السجلات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/syrian-records")} className="text-right cursor-pointer">
                    <Car className="w-4 h-4 ml-2" />
                    السجلات السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-records")} className="text-right cursor-pointer">
                    <Globe className="w-4 h-4 ml-2" />
                    السجلات الأجنبية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/reserved-vehicles")} className="text-right cursor-pointer">
                    <Bookmark className="w-4 h-4 ml-2" />
                    السيارات المحجوزة
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الأدلة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9">
                    <Search className="w-4 h-4 ml-2" />
                    الأدلة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الأدلة المرجعية</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/vehicle-types-guide")} className="text-right cursor-pointer">
                    <Search className="w-4 h-4 ml-2" />
                    دليل النوع والموديل
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/colors-guide")} className="text-right cursor-pointer">
                    <Palette className="w-4 h-4 ml-2" />
                    دليل الألوان
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الإدارة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700 h-9">
                    <Building2 className="w-4 h-4 ml-2" />
                    الإدارة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الإدارة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/pricing-table")} className="text-right cursor-pointer">
                    <DollarSign className="w-4 h-4 ml-2" />
                    جدول التسعير
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* زر الرئيسية */}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
            <AlertDescription className="text-right text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              البحث عن الشركة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="ابحث بالاسم، الكود، الهاتف، أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-right"
            />
            <div className="mt-2 text-sm text-gray-600">
              تم العثور على {filteredCompanies.length} شركة من أصل {companies.length}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                {editingCompany ? "تعديل شركة" : "إضافة شركة جديدة"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الشركة *</Label>
                    <Input
                      id="name"
                      value={companyData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="اسم شركة التأمين"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">الكود</Label>
                    <Input
                      id="code"
                      value={companyData.code}
                      onChange={(e) => handleInputChange("code", e.target.value)}
                      placeholder="كود الشركة"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      value={companyData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="رقم الهاتف"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="example@company.sy"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      العنوان
                    </Label>
                    <Input
                      id="address"
                      value={companyData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="العنوان الكامل للشركة"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة</Label>
                    <select
                      id="status"
                      value={companyData.status}
                      onChange={(e) => handleInputChange("status", e.target.value as "active" | "inactive")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-right bg-white"
                    >
                      <option value="active">نشطة</option>
                      <option value="inactive">غير نشطة</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">ملاحظات</Label>
                    <textarea
                      id="notes"
                      value={companyData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="أي ملاحظات إضافية..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-right min-h-[100px]"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        جارٍ الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 ml-2" />
                        {editingCompany ? "تحديث" : "حفظ"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Companies List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              قائمة الشركات ({filteredCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد شركات متاحة</p>
                <p className="text-sm mt-2">اضغط على "إضافة شركة" لإضافة شركة جديدة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الكود</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company._id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell dir="ltr">{company.code || "—"}</TableCell>
                        <TableCell dir="ltr">{company.phone || "—"}</TableCell>
                        <TableCell dir="ltr">{company.email || "—"}</TableCell>
                        <TableCell>{company.address || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={company.status === "active" ? "default" : "secondary"}
                            className={
                              company.status === "active"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-gray-100 text-gray-700 border-gray-300"
                            }
                          >
                            {company.status === "active" ? "نشطة" : "غير نشطة"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(company)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(company._id!)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
