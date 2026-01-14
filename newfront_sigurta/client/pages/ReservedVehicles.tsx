import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
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
  Bookmark,
  Car,
  User,
  Calendar,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Home,
  FileText,
  CheckCircle,
  Clock,
  Search,
  Palette,
  Building2,
  DollarSign,
  ChevronDown,
  Globe,
} from "lucide-react";
import { vehicleApi } from "../services/api";

interface ReservedVehicle {
  _id?: string;
  ownerName: string;
  nationalId?: string;
  passportNumber?: string;
  phoneNumber: string;
  governorate: string;
  address: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
  color?: string;
  engineCapacity?: string;
  reservationDate: string;
  reservationNotes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt?: string;
}

export default function ReservedVehicles() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [reservationData, setReservationData] = useState<ReservedVehicle>({
    ownerName: "",
    nationalId: "",
    phoneNumber: "",
    governorate: "",
    address: "",
    plateNumber: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    engineCapacity: "",
    reservationDate: "",
    reservationNotes: "",
    status: "pending",
  });

  const SYRIAN_GOVERNORATES = [
    { value: "damascus", label: "دمشق" },
    { value: "aleppo", label: "حلب" },
    { value: "homs", label: "حمص" },
    { value: "lattakia", label: "اللاذقية" },
    { value: "hama", label: "حماة" },
    { value: "tartus", label: "طرطوس" },
    { value: "idlib", label: "إدلب" },
    { value: "deir-ez-zor", label: "دير الزور" },
    { value: "hasakah", label: "الحسكة" },
    { value: "raqqa", label: "الرقة" },
    { value: "daraa", label: "درعا" },
    { value: "sweida", label: "السويداء" },
    { value: "quneitra", label: "القنيطرة" },
  ];

  const ENGINE_CAPACITIES = [
    { value: "600", label: "600 سي سي" },
    { value: "800", label: "800 سي سي" },
    { value: "1000", label: "1000 سي سي" },
    { value: "1200", label: "1200 سي سي" },
    { value: "1300", label: "1300 سي سي" },
    { value: "1400", label: "1400 سي سي" },
    { value: "1500", label: "1500 سي سي" },
    { value: "1600", label: "1600 سي سي" },
    { value: "1800", label: "1800 سي سي" },
    { value: "2000", label: "2000 سي سي" },
    { value: "2200", label: "2200 سي سي" },
    { value: "2400", label: "2400 سي سي" },
    { value: "2500", label: "2500 سي سي" },
    { value: "3000", label: "3000 سي سي" },
    { value: "3500", label: "3500 سي سي" },
    { value: "4000", label: "4000 سي سي" },
    { value: "4500", label: "4500 سي سي" },
    { value: "5000", label: "5000 سي سي" },
    { value: "6000", label: "6000 سي سي" },
    { value: "other", label: "أخرى" },
  ];

  // Load reservations from localStorage (يمكن استبدالها بـ API)
  useEffect(() => {
    const savedReservations = localStorage.getItem("reservedVehicles");
    if (savedReservations) {
      try {
        setReservations(JSON.parse(savedReservations));
      } catch (e) {
        console.error("Error loading reservations:", e);
      }
    }
  }, []);

  const handleInputChange = (field: keyof ReservedVehicle, value: string) => {
    setReservationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (
        !reservationData.ownerName ||
        !reservationData.phoneNumber ||
        !reservationData.governorate ||
        !reservationData.address ||
        !reservationData.plateNumber ||
        !reservationData.brand ||
        !reservationData.model ||
        !reservationData.year ||
        !reservationData.reservationDate
      ) {
        setError("الرجاء ملء جميع الحقول المطلوبة");
        setIsLoading(false);
        return;
      }

      const newReservation: ReservedVehicle = {
        ...reservationData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      const updatedReservations = [...reservations, newReservation];
      setReservations(updatedReservations);
      localStorage.setItem("reservedVehicles", JSON.stringify(updatedReservations));

      setSuccess("تم حجز التأمين بنجاح!");
      setShowForm(false);
      setReservationData({
        ownerName: "",
        nationalId: "",
        phoneNumber: "",
        governorate: "",
        address: "",
        plateNumber: "",
        brand: "",
        model: "",
        year: "",
        color: "",
        engineCapacity: "",
        reservationDate: "",
        reservationNotes: "",
        status: "pending",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Reservation error:", err);
      setError(err?.message || "حدث خطأ في حجز التأمين");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحجز؟")) {
      const updatedReservations = reservations.filter((r) => r._id !== id);
      setReservations(updatedReservations);
      localStorage.setItem("reservedVehicles", JSON.stringify(updatedReservations));
      setSuccess("تم حذف الحجز بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleStatusChange = (id: string, newStatus: ReservedVehicle["status"]) => {
    const updatedReservations = reservations.map((r) =>
      r._id === id ? { ...r, status: newStatus } : r
    );
    setReservations(updatedReservations);
    localStorage.setItem("reservedVehicles", JSON.stringify(updatedReservations));
  };

  const getStatusBadge = (status: ReservedVehicle["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">قيد الانتظار</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">مؤكد</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">مكتمل</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-SY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const employeeName = localStorage.getItem("employeeName") || "";
  const centerName = localStorage.getItem("centerName") || "";

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">السيارات المحجوزة</h1>
                <p className="text-sm text-gray-800">إدارة حجوزات التأمين</p>
              </div>
            </div>

            <div className="text-right text-gray-800">
              <div className="text-sm font-semibold">المركز: <span className="text-primary-700">{centerName || "—"}</span></div>
              <div className="text-xs text-gray-600 mt-1">الموظف: {employeeName || "—"}</div>
            </div>

            <div className="flex items-center gap-2">
              {/* زر حجز جديد */}
              <Button
                variant="outline"
                onClick={() => setShowForm(!showForm)}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 h-9"
              >
                <Plus className="w-4 h-4 ml-2" />
                حجز جديد
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
                  <Button variant="outline" className="bg-primary-600 hover:bg-primary-700 text-white border-primary-600 h-9">
                    <Building2 className="w-4 h-4 ml-2" />
                    الإدارة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الإدارة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/companies")} className="text-right cursor-pointer">
                    <Building2 className="w-4 h-4 ml-2" />
                    شركات التأمين
                  </DropdownMenuItem>
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

        {/* Reservation Form */}
        {showForm && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-6 h-6" />
                حجز تأمين جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* بيانات المالك */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      بيانات المالك
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">اسم المالك الكامل *</Label>
                    <Input
                      id="ownerName"
                      value={reservationData.ownerName}
                      onChange={(e) => handleInputChange("ownerName", e.target.value)}
                      placeholder="اسم المالك"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId">الرقم الوطني / جواز السفر</Label>
                    <Input
                      id="nationalId"
                      value={reservationData.nationalId}
                      onChange={(e) => handleInputChange("nationalId", e.target.value)}
                      placeholder="الرقم الوطني أو رقم جواز السفر"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">رقم الهاتف *</Label>
                    <Input
                      id="phoneNumber"
                      value={reservationData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="رقم الهاتف"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="governorate">المحافظة *</Label>
                    <Select
                      value={reservationData.governorate}
                      onValueChange={(value) => handleInputChange("governorate", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {SYRIAN_GOVERNORATES.map((gov) => (
                          <SelectItem key={gov.value} value={gov.value}>
                            {gov.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">العنوان التفصيلي *</Label>
                    <Input
                      id="address"
                      value={reservationData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="المدينة، الحي، الشارع"
                      className="text-right"
                      required
                    />
                  </div>

                  {/* بيانات المركبة */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      بيانات المركبة
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plateNumber">رقم اللوحة *</Label>
                    <Input
                      id="plateNumber"
                      value={reservationData.plateNumber}
                      onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                      placeholder="رقم لوحة السيارة"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">الماركة *</Label>
                    <Input
                      id="brand"
                      value={reservationData.brand}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                      placeholder="ماركة السيارة"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">الموديل *</Label>
                    <Input
                      id="model"
                      value={reservationData.model}
                      onChange={(e) => handleInputChange("model", e.target.value)}
                      placeholder="موديل السيارة"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">سنة الصنع *</Label>
                    <Input
                      id="year"
                      value={reservationData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      placeholder="سنة الصنع"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">اللون</Label>
                    <Input
                      id="color"
                      value={reservationData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      placeholder="لون السيارة"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engineCapacity">سعة المحرك</Label>
                    <Select
                      value={reservationData.engineCapacity}
                      onValueChange={(value) => handleInputChange("engineCapacity", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر سعة المحرك" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENGINE_CAPACITIES.map((cap) => (
                          <SelectItem key={cap.value} value={cap.value}>
                            {cap.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* بيانات الحجز */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      بيانات الحجز
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reservationDate">تاريخ الحجز *</Label>
                    <Input
                      id="reservationDate"
                      type="date"
                      value={reservationData.reservationDate}
                      onChange={(e) => handleInputChange("reservationDate", e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="reservationNotes">ملاحظات</Label>
                    <Textarea
                      id="reservationNotes"
                      value={reservationData.reservationNotes}
                      onChange={(e) => handleInputChange("reservationNotes", e.target.value)}
                      placeholder="أي ملاحظات إضافية حول الحجز..."
                      className="text-right min-h-[100px]"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                        جارٍ الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 ml-2" />
                        حفظ الحجز
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reservations List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="w-6 h-6" />
              قائمة الحجوزات ({reservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد حجوزات حالياً</p>
                <p className="text-sm mt-2">اضغط على "حجز جديد" لإضافة حجز جديد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المالك</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>رقم اللوحة</TableHead>
                      <TableHead>المركبة</TableHead>
                      <TableHead>المحافظة</TableHead>
                      <TableHead>تاريخ الحجز</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation) => (
                      <TableRow key={reservation._id}>
                        <TableCell className="font-medium">{reservation.ownerName}</TableCell>
                        <TableCell dir="ltr">{reservation.phoneNumber}</TableCell>
                        <TableCell dir="ltr">{reservation.plateNumber}</TableCell>
                        <TableCell>
                          {reservation.brand} {reservation.model} {reservation.year}
                        </TableCell>
                        <TableCell>
                          {SYRIAN_GOVERNORATES.find((g) => g.value === reservation.governorate)?.label || "-"}
                        </TableCell>
                        <TableCell>{formatDate(reservation.reservationDate)}</TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={reservation.status}
                              onValueChange={(value) =>
                                handleStatusChange(reservation._id!, value as ReservedVehicle["status"])
                              }
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="confirmed">مؤكد</SelectItem>
                                <SelectItem value="completed">مكتمل</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(reservation._id!)}
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
