import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileCheck, ArrowRight, Loader2, Home, ArrowRight as ArrowLeft } from "lucide-react";

// ✅ أنواع الملاحق
const ADDENDUM_TYPES = [
  { value: "copy", label: "ملحق صورة طبق الأصل" },
  { value: "info_update", label: "ملحق تعديل معلومات" },
  { value: "financial", label: "ملحق مالي" },
  { value: "stamp_payment", label: "ملحق إستيفاء طابع" },
  { value: "correction", label: "ملحق تصحيح" },
  { value: "admin_cancellation", label: "ملحق إلغاء إداري" },
  { value: "full_cancellation", label: "ملحق إلغاء تام" },
  { value: "revoke_admin_cancellation", label: "إلغاء ملحق الإلغاء الإداري" },
];

export default function AddAddendum() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdParam = searchParams.get("vehicleId") || "";
  const [vehicleId, setVehicleId] = useState(vehicleIdParam);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchingVehicle, setSearchingVehicle] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [vehicleType, setVehicleType] = useState<"syrian" | "foreign" | null>(null);

  // تحديث vehicleId عند تغيير الـ URL parameter
  useEffect(() => {
    const newVehicleId = searchParams.get("vehicleId") || "";
    if (newVehicleId) {
      setVehicleId(newVehicleId);
      // إذا كان ObjectId صحيح، جلب معلومات المركبة
      if (newVehicleId.length === 24 && /^[0-9a-fA-F]{24}$/.test(newVehicleId)) {
        loadVehicleInfo(newVehicleId);
      }
    }
  }, [searchParams]);

  // دالة للبحث عن المركبة برقم اللوحة أو ObjectId
  const searchVehicle = async () => {
    if (!vehicleId || vehicleId.trim() === "") {
      setError("يرجى إدخال رقم المركبة أو رقم اللوحة");
      return;
    }

    setSearchingVehicle(true);
    setError("");
    setVehicleInfo(null);

    try {
      const token = localStorage.getItem("authToken");
      
      // إذا كان ObjectId صحيح (24 حرف hex)
      if (vehicleId.length === 24 && /^[0-9a-fA-F]{24}$/.test(vehicleId)) {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const vehicle = data.data;
            setVehicleInfo(vehicle);
            // محاولة تحديد نوع المركبة - إذا كان vehicleType موجودًا في response
            if (vehicle.vehicleType) {
              setVehicleType(vehicle.vehicleType === "foreign" ? "foreign" : "syrian");
            } else {
              // محاولة تحديد النوع من خلال محاولة البحث في كلا النوعين
              // (سنتعامل مع هذا لاحقًا إذا لزم الأمر)
              setVehicleType("syrian"); // افتراضي
            }
            setError("");
          } else {
            setError("لم يتم العثور على المركبة بهذا الرقم");
          }
        } else {
          setError("لم يتم العثور على المركبة بهذا الرقم");
        }
      } else {
        // البحث برقم اللوحة - البحث في كلا النوعين
        const [syrianResponse, foreignResponse] = await Promise.all([
          fetch(`/api/vehicles?vehicleType=syrian&search=${encodeURIComponent(vehicleId)}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
          fetch(`/api/vehicles?vehicleType=foreign&search=${encodeURIComponent(vehicleId)}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
        ]);

        const syrianData = syrianResponse.ok ? await syrianResponse.json() : null;
        const foreignData = foreignResponse.ok ? await foreignResponse.json() : null;

        let foundVehicle: any = null;
        let detectedType: "syrian" | "foreign" | null = null;

        // التحقق من السيارات السورية أولاً
        if (syrianData?.success && syrianData.data && syrianData.data.length > 0) {
          foundVehicle = syrianData.data[0];
          detectedType = "syrian";
        } else if (foreignData?.success && foreignData.data && foreignData.data.length > 0) {
          foundVehicle = foreignData.data[0];
          detectedType = "foreign";
        }

        if (foundVehicle) {
          setVehicleId(foundVehicle._id);
          setVehicleInfo(foundVehicle);
          setVehicleType(detectedType);
          setError("");
        } else {
          setError("لم يتم العثور على مركبة برقم اللوحة: " + vehicleId);
        }
      }
    } catch (err: any) {
      console.error("Search vehicle error:", err);
      setError("حدث خطأ في البحث عن المركبة: " + err.message);
    } finally {
      setSearchingVehicle(false);
    }
  };

  // دالة لجلب معلومات المركبة بـ ObjectId
  const loadVehicleInfo = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/vehicles/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const vehicle = data.data;
          setVehicleInfo(vehicle);
          // محاولة تحديد نوع المركبة
          if (vehicle.vehicleType) {
            setVehicleType(vehicle.vehicleType === "foreign" ? "foreign" : "syrian");
          } else {
            setVehicleType("syrian"); // افتراضي
          }
        }
      }
    } catch (err) {
      console.error("Load vehicle info error:", err);
    }
  };

  const [formData, setFormData] = useState({
    addendumType: "",
    description: "",
    notes: "",
    amount: "",
    effectiveDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!vehicleId) {
      setError("رقم المركبة مطلوب");
      return;
    }

    if (!formData.addendumType) {
      setError("نوع الملحق مطلوب");
      return;
    }

    // التحقق من أن vehicleId هو ObjectId صحيح
    let finalVehicleId = vehicleInfo?._id || vehicleId.trim();
    
    // إذا لم يكن ObjectId صحيح، حاول البحث أولاً
    if (!finalVehicleId || finalVehicleId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(finalVehicleId)) {
      if (!vehicleInfo) {
        setError("يرجى البحث عن المركبة أولاً أو إدخال ObjectId صحيح (24 حرف)");
        return;
      }
      finalVehicleId = vehicleInfo._id;
    }

    if (!finalVehicleId || finalVehicleId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(finalVehicleId)) {
      setError("رقم المركبة غير صحيح. يرجى البحث عن المركبة أولاً");
      return;
    }

    // تحديد نوع المركبة
    let detectedVehicleType: "syrian" | "foreign" = vehicleType || "syrian";
    
    // إذا لم يكن نوع المركبة محددًا، حاول تحديده من vehicleInfo
    if (!vehicleType && vehicleInfo) {
      // محاولة تحديد النوع من خلال الحقول المميزة
      // السيارات الأجنبية عادةً لها passportNumber وليست لها plateCountry="SY"
      if (vehicleInfo.passportNumber || (!vehicleInfo.plateCountry || vehicleInfo.plateCountry !== "SY")) {
        detectedVehicleType = "foreign";
      } else {
        detectedVehicleType = "syrian";
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/addendums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          vehicleId: finalVehicleId,
          vehicleType: detectedVehicleType,
          addendumType: formData.addendumType,
          description: formData.description || undefined,
          notes: formData.notes || undefined,
          amount: formData.amount ? Number(formData.amount) : undefined,
          effectiveDate: formData.effectiveDate || new Date().toISOString(),
        }),
      });

      // التحقق من نوع الاستجابة
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        setError("حدث خطأ في الخادم. يرجى التحقق من أن رقم المركبة صحيح وأن الخادم يعمل بشكل صحيح.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          // التوجيه إلى الصفحة المناسبة بناءً على نوع المركبة
          if (detectedVehicleType === "foreign") {
            navigate("/foreign-records");
          } else {
            navigate("/syrian-records");
          }
        }, 2000);
      } else {
        setError(data.message || "حدث خطأ في إضافة الملحق");
      }
    } catch (err: any) {
      console.error("Add addendum error:", err);
      if (err.message && err.message.includes("JSON")) {
        setError("حدث خطأ في الخادم. يرجى التحقق من أن رقم المركبة صحيح وأن الخادم يعمل بشكل صحيح.");
      } else {
        setError(err?.message || "حدث خطأ في إضافة الملحق");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">إضافة ملحق جديد</h1>
                <p className="text-sm text-gray-800">إضافة ملحق لبوليصة تأمين</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/syrian-records")}
                className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700 h-9"
              >
                <Home className="w-4 h-4 ml-2" />
                السجلات
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700 h-9"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-primary" />
              إضافة ملحق جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  تم إضافة الملحق بنجاح! سيتم إعادة التوجيه إلى صفحة السجلات...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>رقم المركبة أو رقم اللوحة *</Label>
                <div className="flex gap-2">
                  <Input 
                    value={vehicleId} 
                    onChange={(e) => {
                      setVehicleId(e.target.value);
                      setVehicleInfo(null);
                      setVehicleType(null);
                      setError("");
                    }}
                    placeholder="أدخل رقم المركبة (ObjectId) أو رقم اللوحة"
                    className="text-right font-mono flex-1"
                    dir="ltr"
                    required
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchVehicle();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={searchVehicle}
                    disabled={searchingVehicle || !vehicleId.trim()}
                    variant="outline"
                    className="bg-primary-50 hover:bg-primary-100"
                  >
                    {searchingVehicle ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "بحث"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  يمكنك إدخال رقم المركبة (ObjectId) أو رقم اللوحة للبحث
                </p>
                {vehicleInfo && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-semibold text-green-800">✓ تم العثور على المركبة:</p>
                    <p className="text-xs text-green-700">المالك: {vehicleInfo.ownerName}</p>
                    <p className="text-xs text-green-700">رقم اللوحة: {vehicleInfo.plateNumber}</p>
                    <p className="text-xs text-green-700">رقم الهوية: {vehicleInfo.nationalId || vehicleInfo.passportNumber || "—"}</p>
                    <p className="text-xs text-green-700">النوع: {vehicleType === "foreign" ? "أجنبية" : "سورية"}</p>
                    <p className="text-xs text-mono text-green-600">ID: {vehicleInfo._id}</p>
                  </div>
                )}
                {vehicleId && vehicleId.length === 24 && /^[0-9a-fA-F]{24}$/.test(vehicleId) && !vehicleInfo && (
                  <p className="text-xs text-blue-600">
                    ℹ️ يبدو أن هذا ObjectId صحيح. اضغط "بحث" للتحقق من وجود المركبة.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>نوع الملحق *</Label>
                <Select
                  value={formData.addendumType}
                  onValueChange={(value) => setFormData({ ...formData, addendumType: value })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع الملحق" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDENDUM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الملحق..."
                  className="text-right"
                  rows={3}
                />
              </div>

              {formData.addendumType === "financial" && (
                <div className="space-y-2">
                  <Label>المبلغ (ل.س)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="المبلغ"
                    className="text-right"
                    dir="ltr"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>تاريخ السريان</Label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية..."
                  className="text-right"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading || !formData.addendumType || !vehicleId || !vehicleInfo}
                  className="flex-1 bg-primary hover:bg-primary-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 ml-2" />
                      إضافة الملحق
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/syrian-records")}
                  className="flex items-center gap-2"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
