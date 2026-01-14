import { useEffect, useMemo, useState, useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import axios from "axios";
import { fetchAutofill } from "@/services/autofillApi";
import { RegistryPickerDialog } from "../components/ui/RegistryPickerDialog";



import {
  Car,
  User,
  CreditCard,
  FileText,
  Calendar,
  MapPin,
  Phone,
  IdCard,
  Home,
  Check,
  ChevronsUpDown,
  Bookmark,
  Search,
  Palette,
  Building2,
  DollarSign,
  ChevronDown,
  Globe,
  Plus,
  X,
  Trash2,
  FileCheck,
} from "lucide-react";

import { cn } from "../lib/utils";
import { metaApi } from "../services/api";
import { SYRIAN_GOVERNORATES, ENGINE_CAPACITIES, CLASSIFICATIONS, INSURANCE_CATEGORIES, INTERNAL_VEHICLE_TYPES } from "../constants/insuranceOptions";

interface VehicleData {
  ownerName: string;
  nationalId: string;
  phoneNumber: string;
  governorate: string; // المحافظة
  address: string;

  licenseNumber: string; // رقم الرخصة
  licenseExpiryDate: string; // صلاحية الرخصة (تاريخ يدوي)
  plateNumber: string;
  chassisNumber: string;
  engineNumber: string;
  engineCapacity: string; // سعة المحرك
  seatsNumber: string; // عدد الركاب

  brand: string; // نخزن _id للماركة
  model: string; // نص الموديل
  year: string;

  color: string; // اسم اللون
  fuelType: string;

  policyDuration: string;
  notes: string;
  
  // للحساب
  classification: string; // التصنيف
  vehicleCode: string; // نوع المركبة (الكود)
  category: string; // الفئة
  
  // الخدمات
  electronicCard: boolean; // البطاقة البلاستيكية (مفعلة تلقائياً)
  rescueService: boolean; // خدمة الإنقاذ
}

interface AddendumData {
  addendumType: string;
  description?: string;
  notes?: string;
  amount?: number;
  effectiveDate?: string;
}

type DbColor = { _id: string; name: string; ccid?: number };

type MakeObj = {
  _id: string;
  make: string;
  type?: string;
  legacyId?: number;
};

function normalizeMakes(input: any): MakeObj[] {
  const arr = Array.isArray(input) ? input : [];
  if (!arr.length) return [];

  // string[]
  if (typeof arr[0] === "string") {
    return arr.map((s: string) => ({ _id: s, make: s }));
  }

  // object[]
  return arr
    .map((m: any) => {
      const id = String(m?._id ?? m?.id ?? m?.make ?? m?.name ?? "");
      const make = String(m?.make ?? m?.name ?? m?._id ?? "");
      if (!id || !make) return null;
      return { _id: id, make, type: m?.type, legacyId: m?.legacyId };
    })
    .filter(Boolean) as MakeObj[];
}

function normalizeModels(input: any): string[] {
  const arr = Array.isArray(input) ? input : [];
  if (!arr.length) return [];

  let result: string[];

  // string[]
  if (typeof arr[0] === "string") {
    result = arr.filter(Boolean);
  } else {
  // object[]
    result = arr
    .map((x: any) => String(x?.name ?? x?.model ?? x?.type ?? x?._id ?? ""))
    .filter((s: string) => !!s);
  }

  // ✅ إزالة التكرار مع الحفاظ على الترتيب
  return Array.from(new Set(result));
}

function normalizeColors(input: any): DbColor[] {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((c: any) => {
      const _id = String(c?._id ?? c?.id ?? c?.name ?? "");
      const name = String(c?.name ?? "");
      if (!_id || !name) return null;
      return { _id, name, ccid: c?.ccid };
    })
    .filter(Boolean) as DbColor[];
}

function fillIfEmpty(prev: any, patch: any) {
  const next = { ...prev };
  for (const k of Object.keys(patch)) {
    if (next[k] === "" || next[k] == null) next[k] = patch[k];
  }
  return next;
}

export function useAutoFillRegistry(form: any, setForm: (fn: any) => void) {
  const tRef = useRef<any>(null);

  useEffect(() => {
    clearTimeout(tRef.current);

    const hasAnyKey =
      form.plateNumber || form.plateRegion || form.chassisNumber || form.engineNumber || form.ownerName || form.nationalId;

    if (!hasAnyKey) return;

    tRef.current = setTimeout(async () => {
      const { data } = await axios.get("/api/registry/lookup", {
        params: {
          plateNumber: form.plateNumber,
          plateRegion: form.plateRegion,
          chassisNumber: form.chassisNumber,
          engineNumber: form.engineNumber,
          ownerName: form.ownerName,
          nationalId: form.nationalId,
        },
      });

      if (data?.match) {
        const m = data.match;

        setForm((prev: any) =>
          fillIfEmpty(prev, {
            ownerName: m.ownerName,
            nationalId: m.nationalId,
            phoneNumber: m.phone,
            chassisNumber: m.chassisNumber,
            engineNumber: m.engineNumber,
            color: m.color,
            fuelType: m.fuelType,
            engineCapacity: m.engineCapacity,
            enginePower: m.enginePower,
            manufactureYear: m.manufactureYear,
            address: m.address,
          })
        );
      }
    }, 400);

    return () => clearTimeout(tRef.current);
  }, [
    form.plateNumber,
    form.plateRegion,
    form.chassisNumber,
    form.engineNumber,
    form.ownerName,
    form.nationalId,
  ]);
}





export default function Dashboard() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  const [makes, setMakes] = useState<MakeObj[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [colors, setColors] = useState<DbColor[]>([]);

  // ✅ لتحسين الأداء: لا نرسم عناصر القوائم إلا عند الفتح
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [yearSearch, setYearSearch] = useState(""); // ✅ للبحث في سنوات الصنع
  const [colorOpen, setColorOpen] = useState(false);
  const [colorSearch, setColorSearch] = useState("");
  const [governorateOpen, setGovernorateOpen] = useState(false);
  const [engineCapacityOpen, setEngineCapacityOpen] = useState(false);
  
  // ✅ لتخزين pricingCfg لجلب أنواع المركبات
  const [pricingCfg, setPricingCfg] = useState<any>(null);


  // ✅ الملاحق
  const [addendums, setAddendums] = useState<AddendumData[]>([]);
  const [showAddAddendum, setShowAddAddendum] = useState(false);
  const [newAddendum, setNewAddendum] = useState<AddendumData>({
    addendumType: "",
    description: "",
    notes: "",
    amount: undefined,
    effectiveDate: "",
  });

  // قائمة الصور - صور مختلفة لكل step
  // Step 1 - بيانات المركبة
  const step1Images = [
    "/insurance-hero-6.jpg",
    "/insurance-hero-7.jpg",
    "/insurance-hero-8.jpg",
    "/insurance-hero-10.jpg",
  ];

  // Step 2 - بيانات المالك
  const step2Images = [
    "/insurance-hero-11.jpg",
    "/insurance-hero-12.jpg",
    "/insurance-hero-13.jpg",
  ];

  // Step 3 - بيانات التأمين
  const step3Images = [
    "/insurance-hero-14.jpg",
    "/insurance-hero-15.jpg",
    "/insurance-hero-16.jpg",
    "/insurance-hero-8.jpg",
  ];

  // Step 4 - الملاحق
  const step4Images = [
    "/insurance-hero-14.jpg",
    "/insurance-hero-15.jpg",
    "/insurance-hero-16.jpg",
  ];

  // اختيار الصور حسب الخطوة الحالية
  const images = useMemo(() => {
    switch (currentStep) {
      case 1:
        return step1Images;
      case 2:
        return step2Images;
      case 3:
        return step3Images;
      case 4:
        return step4Images;
      default:
        return step1Images;
    }
  }, [currentStep]);

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    ownerName: "",
    nationalId: "",
    phoneNumber: "",
    governorate: "",
    address: "",

    licenseNumber: "",
    licenseExpiryDate: "",
    plateNumber: "",
    chassisNumber: "",
    engineNumber: "",
    engineCapacity: "",
    seatsNumber: "",

    brand: "",
    model: "",
    year: "",

    color: "",
    fuelType: "",

    policyDuration: "",
    notes: "",
    
    classification: "0",
    vehicleCode: "",
    category: "",
    
    electronicCard: true, // ✅ مفعل تلقائياً
    rescueService: false,
  });

  const handleInputChange = (field: keyof VehicleData, value: string | boolean) => {
    setVehicleData((prev) => ({ ...prev, [field]: value }));
    // مسح خطأ الحقل عند التعديل
    if (fieldErrors[field as string]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  // ✅ form state للـ autofill - مرتبط بـ vehicleData
  const form = useMemo(() => ({
    chassisNumber: vehicleData.chassisNumber || "",
    engineNumber: vehicleData.engineNumber || "",
    plateNumber: vehicleData.plateNumber || "",
    plateCountry: "", // ليس موجوداً في vehicleData
    plateRegion: "", // ليس موجوداً في vehicleData
    nationalId: vehicleData.nationalId || "",
    ownerName: vehicleData.ownerName || "",
  }), [vehicleData.chassisNumber, vehicleData.engineNumber, vehicleData.plateNumber, vehicleData.nationalId, vehicleData.ownerName]);

  const employeeName = localStorage.getItem("employeeName") || "";
  const centerName = localStorage.getItem("centerName") || "";
  const centerId = localStorage.getItem("centerId") || "";

  // ✅ ملء المحافظة تلقائياً حسب موقع المركز (مرة واحدة فقط عند تحميل الصفحة)
  useEffect(() => {
    // إذا كانت المحافظة مملوءة بالفعل، لا نفعل شيء
    if (vehicleData.governorate) {
      return;
    }

    // محاولة الحصول على المحافظة من localStorage أولاً
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const province = user?.center?.province;
        if (province) {
          // محاولة مطابقة province مع SYRIAN_GOVERNORATES
          const matched = SYRIAN_GOVERNORATES.find(
            (g) => {
              const govLabel = g.label.toLowerCase().trim();
              const provLabel = province.toLowerCase().trim();
              return govLabel === provLabel || 
                     govLabel.includes(provLabel) || 
                     provLabel.includes(govLabel) ||
                     g.value === provLabel;
            }
          );
          if (matched) {
            setVehicleData((prev) => ({ ...prev, governorate: matched.value }));
            return; // نجحنا، لا حاجة لاستدعاء API
          }
        }
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }

    // إذا لم نجد في localStorage، جرب API (فقط إذا كان centerId موجود)
    if (centerId) {
      const token = localStorage.getItem("authToken");
      fetch(`/api/centers/${centerId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((r) => {
          if (!r.ok) {
            console.warn(`Failed to fetch center ${centerId}: ${r.status}`);
            return null;
          }
          return r.json();
        })
        .then((j) => {
          if (j?.data?.province) {
            // محاولة مطابقة province مع SYRIAN_GOVERNORATES
            const matched = SYRIAN_GOVERNORATES.find(
              (g) => {
                const govLabel = g.label.toLowerCase().trim();
                const provLabel = j.data.province.toLowerCase().trim();
                return govLabel === provLabel || 
                       govLabel.includes(provLabel) || 
                       provLabel.includes(govLabel) ||
                       g.value === provLabel;
              }
            );
            if (matched) {
              setVehicleData((prev) => ({ ...prev, governorate: matched.value }));
            } else {
              console.warn(`Could not match province "${j.data.province}" with any governorate`);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching center:", err);
        });
    }
  }, [centerId]); // ✅ إزالة vehicleData.governorate من dependencies لتجنب الحلقة


  // ✅ تحميل الماركات + الألوان + pricingCfg
  useEffect(() => {
    (async () => {
      try {
        setLoadingMeta(true);

        const token = localStorage.getItem("authToken");
        const [makesRes, colorsRes, pricingRes] = await Promise.all([
          metaApi.getMakes().catch(() => []),
          metaApi.getColors().catch(() => []),
          fetch("/api/pricing/active", {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => j?.data ?? j ?? null)
            .catch(() => null),
        ]);

        setMakes(normalizeMakes(makesRes));
        setColors(normalizeColors(colorsRes));
        setPricingCfg(pricingRes);
      } catch (e) {
        console.error(e);
        setMakes([]);
        setColors([]);
        setPricingCfg(null);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  // ✅ عند تغيير الماركة
  const onMakeChange = (makeId: string) => {
    handleInputChange("brand", makeId);
    handleInputChange("model", "");
    setModels([]);
  };

  // ✅ تحميل الموديلات بعد اختيار الماركة
  useEffect(() => {
    (async () => {
      if (!vehicleData.brand) {
        setModels([]);
        return;
      }

      try {
        setLoadingModels(true);

        // بعض APIs تتوقع اسم الماركة وليس _id
        const selected =
          makes.find((m) => m._id === vehicleData.brand) ||
          makes.find((m) => m.make === vehicleData.brand);

        const makeKey = selected?.make || vehicleData.brand;

        const res = await metaApi.getModels(makeKey).catch(() => []);
        setModels(normalizeModels(res));
      } catch (e) {
        console.error(e);
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    })();
  }, [vehicleData.brand, makes]);

  const years = useMemo(
    () => Array.from({ length: 25 }, (_, i) => String(new Date().getFullYear() - i)),
    []
  );

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

  const steps = useMemo(
    () => [
      { number: 1, title: "بيانات المركبة", icon: Car },
      { number: 2, title: "بيانات المالك", icon: User },
      { number: 3, title: "بيانات التأمين", icon: FileText },
      { number: 4, title: "الملاحق", icon: FileCheck },
    ],
    []
  );

  // ✅ اسم الماركة المختارة لعرضه داخل المستطيل
  const selectedMakeName = useMemo(() => {
    const selected =
      makes.find((m) => m._id === vehicleData.brand) ||
      makes.find((m) => m.make === vehicleData.brand);
    return selected?.make || "";
  }, [makes, vehicleData.brand]);

  // ✅ Filtered makes based on search (starts with first letter)
  const filteredMakes = useMemo(() => {
    if (!brandSearch.trim()) return makes;
    const searchLower = brandSearch.trim().toLowerCase();
    return makes.filter((m) => 
      m.make.toLowerCase().startsWith(searchLower)
    );
  }, [makes, brandSearch]);

  // ✅ Filtered colors based on search (starts with first letter)
  const filteredColors = useMemo(() => {
    if (!colorSearch.trim()) return colors;
    const searchLower = colorSearch.trim().toLowerCase();
    return colors.filter((c) => 
      c.name.toLowerCase().startsWith(searchLower)
    );
  }, [colors, colorSearch]);

  // ✅ عناصر القوائم (memo)
  const makeItems = useMemo(
    () =>
      makes.map((m) => (
        <SelectItem key={m._id} value={m._id}>
          {m.make}
        </SelectItem>
      )),
    [makes]
  );

  const modelItems = useMemo(
    () =>
      models.map((name, index) => (
        <SelectItem key={`${name}-${index}`} value={name}>
          {name}
        </SelectItem>
      )),
    [models]
  );

  // ✅ Filtered years based on search
  const filteredYears = useMemo(() => {
    if (!yearSearch.trim()) return years;
    const searchLower = yearSearch.trim().toLowerCase();
    return years.filter((y) => y.includes(searchLower));
  }, [years, yearSearch]);

  // ✅ خيارات أنواع المركبات من pricingCfg مع fallback للقيم الثابتة
  const internalVehicleOptions = useMemo(() => {
    const meta = pricingCfg?.internalMeta;
    
    // إذا كان meta موجود وليس فارغاً، استخدمه
    if (meta && Object.keys(meta).length > 0) {
      const map = new Map<string, string>();
      for (const [key, m] of Object.entries(meta)) {
        const vehicleCode = key.split("-")[0];
        const group = (m as any)?.group || "";
        if (!map.has(vehicleCode) && group) map.set(vehicleCode, group);
      }

      const list = Array.from(map.entries()).map(([value, label]) => ({ value, label }));

      const rank = (v: string) => {
        if (v.startsWith("elec-")) return 9999;
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : 8888;
      };

      list.sort((a, b) => {
        const ra = rank(a.value);
        const rb = rank(b.value);
        if (ra !== rb) return ra - rb;
        return a.value.localeCompare(b.value);
      });

      return list;
    }
    
    // Fallback: استخدم القيم الثابتة من INTERNAL_VEHICLE_TYPES
    return INTERNAL_VEHICLE_TYPES.map((v) => ({ value: v.value, label: v.label }));
  }, [pricingCfg]);

  // ✅ التحقق من كون المركبة كهربائية سياحية
  const isElectricCar = useMemo(() => {
    return vehicleData.vehicleCode?.startsWith("elec-car") ?? false;
  }, [vehicleData.vehicleCode]);

  const colorItems = useMemo(
    () =>
      colors.map((c) => (
        <SelectItem key={c._id} value={c.name}>
          {c.name}
        </SelectItem>
      )),
    [colors]
  );

  const getMissingFields = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!vehicleData.classification) errors.classification = "التصنيف مطلوب";
        if (!vehicleData.licenseNumber) errors.licenseNumber = "رقم الرخصة مطلوب";
        if (!vehicleData.plateNumber) errors.plateNumber = "رقم اللوحة مطلوب";
        if (!vehicleData.governorate) errors.governorate = "المحافظة مطلوبة";
        if (!vehicleData.vehicleCode) errors.vehicleCode = "نوع المركبة مطلوب";
        if (!vehicleData.category) errors.category = "الفئة مطلوبة";
        if (!vehicleData.licenseExpiryDate) errors.licenseExpiryDate = "صلاحية الرخصة مطلوبة";
        if (!vehicleData.year) errors.year = "سنة الصنع مطلوبة";
        if (!vehicleData.brand) errors.brand = "الماركة مطلوبة";
        if (!vehicleData.model) errors.model = "الموديل مطلوب";
        if (!vehicleData.chassisNumber || vehicleData.chassisNumber.length < 7) {
          errors.chassisNumber = "رقم الهيكل مطلوب (7 أحرف على الأقل)";
        }
        if (!vehicleData.engineNumber || vehicleData.engineNumber.length < 6) {
          errors.engineNumber = "رقم المحرك مطلوب (6 أحرف على الأقل)";
        }
        break;
      case 2:
        if (!vehicleData.ownerName) errors.ownerName = "اسم المالك مطلوب";
        if (!vehicleData.nationalId) errors.nationalId = "الرقم الوطني مطلوب";
        if (!vehicleData.phoneNumber) errors.phoneNumber = "رقم الهاتف مطلوب";
        if (!vehicleData.governorate) errors.governorate = "المحافظة مطلوبة";
        if (!vehicleData.address) errors.address = "العنوان مطلوب";
        break;
      case 3:
        if (!vehicleData.policyDuration) errors.policyDuration = "مدة التأمين مطلوبة";
        if (!vehicleData.notes || vehicleData.notes.trim().length === 0) {
          errors.notes = "الملاحظات مطلوبة";
        }
        break;
      case 4:
        // الملاحق اختيارية
        break;
    }
    
    return errors;
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      const errors = getMissingFields(currentStep);
      
      if (Object.keys(errors).length > 0) {
        // إظهار الأخطاء
        setFieldErrors(errors);
        // التمرير إلى أول حقل به خطأ
        const firstErrorField = Object.keys(errors)[0];
        setTimeout(() => {
          const element = document.getElementById(firstErrorField);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
          }
        }, 100);
        return;
      }
      
      // لا توجد أخطاء، الانتقال للخطوة التالية
      setFieldErrors({});
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          !!vehicleData.classification &&
          !!vehicleData.licenseNumber &&
          !!vehicleData.plateNumber &&
          !!vehicleData.governorate &&
          !!vehicleData.vehicleCode &&
          !!vehicleData.category &&
          !!vehicleData.licenseExpiryDate &&
          !!vehicleData.year &&
          !!vehicleData.brand &&
          !!vehicleData.model &&
          !!vehicleData.chassisNumber &&
          vehicleData.chassisNumber.length >= 7 &&
          !!vehicleData.engineNumber &&
          vehicleData.engineNumber.length >= 6
        );
      case 2:
        return (
          !!vehicleData.ownerName &&
          !!vehicleData.nationalId &&
          !!vehicleData.phoneNumber &&
          !!vehicleData.governorate &&
          !!vehicleData.address
        );
      case 3:
        return !!vehicleData.policyDuration && !!vehicleData.notes && vehicleData.notes.trim().length > 0;
      case 4:
        return true; // الملاحق اختيارية
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const vehiclePayload = {
        ...vehicleData,
        vehicleType: "syrian" as const,
        year: parseInt(vehicleData.year, 10) || new Date().getFullYear(),
      };

      const { vehicleApi } = await import("../services/api");
      const response = await vehicleApi.create(vehiclePayload);
      

      if (response?.success && response?.data) {
        const vehicleId = response.data._id;
        
        // ✅ حفظ الملاحق إذا كانت موجودة
        if (addendums.length > 0) {
          const token = localStorage.getItem("authToken");
          try {
            const addendumPromises = addendums.map(async (addendum) => {
              const response = await fetch("/api/addendums", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  vehicleId,
                  vehicleType: "syrian",
                  addendumType: addendum.addendumType,
                  description: addendum.description || undefined,
                  notes: addendum.notes || undefined,
                  amount: addendum.amount ? Number(addendum.amount) : undefined,
                  effectiveDate: addendum.effectiveDate || new Date().toISOString(),
                }),
              });

              const data = await response.json();
              if (!response.ok || !data.success) {
                throw new Error(data.message || `فشل حفظ الملحق: ${addendum.addendumType}`);
              }
              return data;
            });

            await Promise.all(addendumPromises);
            console.log(`تم حفظ ${addendums.length} ملحق بنجاح`);
          } catch (addendumErr: any) {
            console.error("Error saving addendums:", addendumErr);
            // نعرض رسالة خطأ للمستخدم لكن نتابع العملية
            setError(`تم حفظ المركبة بنجاح، لكن حدث خطأ في حفظ بعض الملاحق: ${addendumErr.message}`);
          }
        }

        localStorage.setItem(
          "vehicleData",
          JSON.stringify({
            ...vehicleData,
            vehicleId,
            // إرسال البيانات للحساب
            vehicleCode: vehicleData.vehicleCode,
            category: vehicleData.category,
            classification: vehicleData.classification,
            electronicCard: vehicleData.electronicCard,
            rescueService: vehicleData.rescueService,
          })
        );
        navigate("/payment");
      } else {
        setError("حدث خطأ في حفظ البيانات");
      }
    } catch (err: any) {
      console.error("Save vehicle error:", err);
      setError(err?.message || "حدث خطأ في حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const [pickerOpen, setPickerOpen] = useState(false);
const [candidates, setCandidates] = useState<any[]>([]);
const timer = useRef<any>(null);

useEffect(() => {
  clearTimeout(timer.current);

  const hasKey =
    form.chassisNumber || form.engineNumber || form.plateNumber || form.nationalId || form.ownerName;

  if (!hasKey) return;

  timer.current = setTimeout(async () => {
    const data = await fetchAutofill({
      chassisNumber: form.chassisNumber,
      engineNumber: form.engineNumber,
      plateNumber: form.plateNumber,
      plateCountry: form.plateCountry,
      plateRegion: form.plateRegion,
      nationalId: form.nationalId,
      ownerName: form.ownerName,
    });

    if (!data?.success) return;

    if ((data.candidates?.length ?? 0) > 1) {
      setCandidates(data.candidates);
      setPickerOpen(true);
      return;
    }

    if (data.match) {
      // تحديث vehicleData بدلاً من form
      setVehicleData((prev: VehicleData) => {
        const next = { ...prev };
        // تعيين القيم من data.match إلى vehicleData
        if (data.match.chassisNumber && (!next.chassisNumber || next.chassisNumber === "")) {
          next.chassisNumber = data.match.chassisNumber;
        }
        if (data.match.engineNumber && (!next.engineNumber || next.engineNumber === "")) {
          next.engineNumber = data.match.engineNumber;
        }
        if (data.match.plateNumber && (!next.plateNumber || next.plateNumber === "")) {
          next.plateNumber = data.match.plateNumber;
        }
        if (data.match.nationalId && (!next.nationalId || next.nationalId === "")) {
          next.nationalId = data.match.nationalId;
        }
        if (data.match.ownerName && (!next.ownerName || next.ownerName === "")) {
          next.ownerName = data.match.ownerName;
        }
        if (data.match.phoneNumber && (!next.phoneNumber || next.phoneNumber === "")) {
          next.phoneNumber = data.match.phoneNumber;
        }
        if (data.match.address && (!next.address || next.address === "")) {
          next.address = data.match.address;
        }
        if (data.match.color && (!next.color || next.color === "")) {
          next.color = data.match.color;
        }
        if (data.match.year && (!next.year || next.year === "")) {
          next.year = String(data.match.year || data.match.manufactureYear || "");
        }
        if (data.match.brand && (!next.brand || next.brand === "")) {
          next.brand = data.match.brand;
        }
        if (data.match.model && (!next.model || next.model === "")) {
          next.model = data.match.model;
        }
        return next;
      });
    }
  }, 400);

  return () => clearTimeout(timer.current);
}, [
  form.chassisNumber,
  form.engineNumber,
  form.plateNumber,
  form.plateCountry,
  form.plateRegion,
  form.nationalId,
  form.ownerName,
]);


  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white0 shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">منصة التأمين الإلزامي</h1>
                <p className="text-sm text-gray-800">إصدار بوليصة جديدة</p>
                
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/syrian-addendums")} className="text-right cursor-pointer">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق السورية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/foreign-addendums")} className="text-right cursor-pointer">
                    <FileCheck className="w-4 h-4 ml-2" />
                    الملاحق الأجنبية
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

              {/* زر تسجيل الخروج */}
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("username");
                  navigate("/login");
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 h-9"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 max-w-[1600px] mx-auto px-4 py-8">
        {/* Sidebar with Images - Vertical Stack (Right Side in RTL) */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-8 space-y-4">
            {/* Images Stack - Vertical */}
            <div className="space-y-4">
              {images.map((image, index) => (
                <Card key={index} className="shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    <img
                      src={image}
                      alt={`صورة ${index + 1} - بيانات المركبة`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // في حالة عدم وجود الصورة، نعرض placeholder
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3Eصورة ${index + 1}%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                        currentStep >= step.number
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      )}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium mt-2 transition-colors",
                        currentStep >= step.number ? "text-primary" : "text-gray-400"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-1 mx-4 transition-colors",
                        currentStep > step.number ? "bg-primary" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription className="text-right">{error}</AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              {(() => {
                const IconComponent = steps[currentStep - 1].icon;
                return <IconComponent className="w-6 h-6" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1 - بيانات المركبة - بالترتيب المطلوب */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. التصنيف */}
                  <div className="space-y-2">
                    <Label className={fieldErrors.classification ? "text-red-600" : ""}>التصنيف *</Label>
                    <Select
                      value={vehicleData.classification}
                      onValueChange={(value) => handleInputChange("classification", value)}
                    >
                      <SelectTrigger className={`text-right ${fieldErrors.classification ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر التصنيف">
                          {CLASSIFICATIONS.find((c) => c.value === vehicleData.classification)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CLASSIFICATIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.classification && (
                      <p className="text-sm text-red-600">{fieldErrors.classification}</p>
                    )}
                  </div>

                  {/* 2. رقم الرخصة */}
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className={fieldErrors.licenseNumber ? "text-red-600" : ""}>رقم الرخصة *</Label>
                    <Input
                      id="licenseNumber"
                      value={vehicleData.licenseNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ""); // أرقام فقط
                        handleInputChange("licenseNumber", val);
                        if (fieldErrors.licenseNumber) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.licenseNumber;
                            return next;
                          });
                        }
                      }}
                      placeholder="أرقام فقط"
                      className={`text-right ${fieldErrors.licenseNumber ? "border-red-500" : ""}`}
                      required
                      dir="ltr"
                      maxLength={20}
                    />
                    {fieldErrors.licenseNumber && (
                      <p className="text-sm text-red-600">{fieldErrors.licenseNumber}</p>
                    )}
                  </div>

                  {/* 3. رقم اللوحة */}
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber" className={`flex items-center gap-2 ${fieldErrors.plateNumber ? "text-red-600" : ""}`}>
                      <Car className="w-4 h-4" />
                      رقم اللوحة *
                    </Label>
                    <Input
                      id="plateNumber"
                      value={vehicleData.plateNumber}
                      onChange={(e) => {
                        let val = e.target.value;
                        // السماح بـ / للمركبات الحديثة
                        val = val.replace(/[^0-9/]/g, "");
                        // الحد الأقصى 7 أرقام + /
                        if (val.length > 8) val = val.slice(0, 8);
                        handleInputChange("plateNumber", val);
                        if (fieldErrors.plateNumber) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.plateNumber;
                            return next;
                          });
                        }
                      }}
                      placeholder="رقم اللوحة (حد أقصى 7 أرقام + /)"
                      className={`text-right ${fieldErrors.plateNumber ? "border-red-500" : ""}`}
                      required
                      dir="ltr"
                      maxLength={8}
                    />
                    {fieldErrors.plateNumber && (
                      <p className="text-sm text-red-600">{fieldErrors.plateNumber}</p>
                    )}
                  </div>

                  {/* 4. المحافظة */}
                  <div className="space-y-2">
                    <Label htmlFor="governorate" className={fieldErrors.governorate ? "text-red-600" : ""}>المحافظة *</Label>
                    <Select
                      value={vehicleData.governorate}
                      onValueChange={(value) => handleInputChange("governorate", value)}
                      open={governorateOpen}
                      onOpenChange={setGovernorateOpen}
                    >
                      <SelectTrigger className={`text-right ${fieldErrors.governorate ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر المحافظة">
                          {vehicleData.governorate
                            ? vehicleData.governorate === "syrian"
                              ? "سورية"
                              : SYRIAN_GOVERNORATES.find((g) => g.value === vehicleData.governorate)?.label
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {governorateOpen ? (
                          <>
                            {SYRIAN_GOVERNORATES.map((gov) => (
                              <SelectItem key={gov.value} value={gov.value}>
                                {gov.label}
                            </SelectItem>
                            ))}
                            <SelectItem value="syrian">سورية</SelectItem>
                          </>
                        ) : null}
                      </SelectContent>
                    </Select>
                    {fieldErrors.governorate && (
                      <p className="text-sm text-red-600">{fieldErrors.governorate}</p>
                    )}
                  </div>

                  {/* 5. النوع (نوع المركبة - الكود) */}
                  <div className="space-y-2">
                    <Label className={fieldErrors.vehicleCode ? "text-red-600" : ""}>النوع (نوع المركبة) *</Label>
                    <Select
                      value={vehicleData.vehicleCode}
                      onValueChange={(value) => handleInputChange("vehicleCode", value)}
                    >
                      <SelectTrigger className={`text-right ${fieldErrors.vehicleCode ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر نوع المركبة">
                          {internalVehicleOptions.find((v) => v.value === vehicleData.vehicleCode)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {internalVehicleOptions.map((v) => (
                          <SelectItem key={v.value} value={v.value}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.vehicleCode && (
                      <p className="text-sm text-red-600">{fieldErrors.vehicleCode}</p>
                    )}
                  </div>

                  {/* 6. الفئة */}
                  <div className="space-y-2">
                    <Label className={fieldErrors.category ? "text-red-600" : ""}>الفئة *</Label>
                    <Select
                      value={vehicleData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger className={`text-right ${fieldErrors.category ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر الفئة">
                          {INSURANCE_CATEGORIES.find((c) => c.value === vehicleData.category)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {INSURANCE_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.category && (
                      <p className="text-sm text-red-600">{fieldErrors.category}</p>
                    )}
                  </div>

                  {/* 7. الاسم (سيتم في Step 2) */}
                  
                  {/* 8. صلاحية الرخصة */}
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiryDate" className={fieldErrors.licenseExpiryDate ? "text-red-600" : ""}>صلاحية الرخصة (نهاية التأمين) *</Label>
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      value={vehicleData.licenseExpiryDate}
                      onChange={(e) => handleInputChange("licenseExpiryDate", e.target.value)}
                      className={`text-right ${fieldErrors.licenseExpiryDate ? "border-red-500" : ""}`}
                      required
                    />
                    {fieldErrors.licenseExpiryDate && (
                      <p className="text-sm text-red-600">{fieldErrors.licenseExpiryDate}</p>
                    )}
                  </div>

                  {/* 9. سنة الصنع - مع بحث */}
                  <div className="space-y-2">
                    <Label className={fieldErrors.year ? "text-red-600" : ""}>سنة الصنع *</Label>
                    <div className="flex gap-2">
                      <Input
                        value={vehicleData.year}
                        onChange={(e) => handleInputChange("year", e.target.value)}
                        placeholder="اكتب سنة الصنع"
                        className={`text-right flex-1 ${fieldErrors.year ? "border-red-500" : ""}`}
                      dir="ltr"
                        required
                    />
                      <Popover open={yearOpen} onOpenChange={setYearOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              setYearOpen(!yearOpen);
                            }}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="ابحث أو اكتب السنة..."
                              value={yearSearch}
                              onValueChange={setYearSearch}
                              className="text-right"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {yearSearch ? (
                                  <div className="py-2">
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start"
                                      onClick={() => {
                                        handleInputChange("year", yearSearch);
                                        setYearOpen(false);
                                        setYearSearch("");
                                      }}
                                    >
                                      استخدام: {yearSearch}
                                    </Button>
                                  </div>
                                ) : (
                                  "لا توجد نتائج"
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredYears.map((y) => (
                                  <CommandItem
                                    key={y}
                                    value={y}
                                    onSelect={() => {
                                      handleInputChange("year", y);
                                      setYearOpen(false);
                                      setYearSearch("");
                                    }}
                                    className="text-right"
                                  >
                                    <Check
                                      className={cn(
                                        "ml-2 h-4 w-4",
                                        vehicleData.year === y ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {y}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {fieldErrors.year && (
                      <p className="text-sm text-red-600">{fieldErrors.year}</p>
                    )}
                  </div>

                  {/* 10. الصانع */}
                  <div className="space-y-2">
                    <Label htmlFor="brand" className={fieldErrors.brand ? "text-red-600" : ""}>الصانع *</Label>
                    <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={brandOpen}
                          className={`w-full justify-between text-right ${fieldErrors.brand ? "border-red-500" : ""}`}
                          disabled={loadingMeta}
                        >
                          {selectedMakeName || (loadingMeta ? "جارٍ تحميل الصانعين..." : "اختر الصانع")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="ابحث بالحرف الأول..."
                            value={brandSearch}
                            onValueChange={setBrandSearch}
                            className="text-right"
                          />
                          <CommandList>
                            <CommandEmpty>لا توجد صانعين تبدأ بهذا الحرف</CommandEmpty>
                            <CommandGroup>
                              {filteredMakes.map((make) => (
                                <CommandItem
                                  key={make._id}
                                  value={make.make}
                                  onSelect={() => {
                                    onMakeChange(make._id);
                                    setBrandOpen(false);
                                    setBrandSearch("");
                                  }}
                                  className="text-right"
                                >
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      vehicleData.brand === make._id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {make.make}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {fieldErrors.brand && (
                      <p className="text-sm text-red-600">{fieldErrors.brand}</p>
                    )}
                  </div>

                  {/* 11. الطراز */}
                  <div className="space-y-2">
                    <Label htmlFor="model" className={fieldErrors.model ? "text-red-600" : ""}>الطراز *</Label>
                    <Select
                      value={vehicleData.model}
                      onValueChange={(v) => handleInputChange("model", v)}
                      disabled={!vehicleData.brand || loadingModels || models.length === 0}
                      open={modelOpen}
                      onOpenChange={setModelOpen}
                    >
                      <SelectTrigger className={`text-right ${fieldErrors.model ? "border-red-500" : ""}`}>
                        <SelectValue
                          placeholder={
                            !vehicleData.brand
                              ? "اختر الصانع أولاً"
                              : loadingModels
                              ? "جارٍ تحميل الطرازات..."
                              : "اختر الطراز"
                          }
                        >
                          {vehicleData.model ? vehicleData.model : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {modelOpen ? modelItems : null}
                      </SelectContent>
                    </Select>
                    {fieldErrors.model && (
                      <p className="text-sm text-red-600">{fieldErrors.model}</p>
                    )}
                  </div>

                  {/* 12. لون المركبة */}
                  <div className="space-y-2">
                    <Label>لون المركبة</Label>
                    <Popover open={colorOpen} onOpenChange={setColorOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={colorOpen}
                          className="w-full justify-between text-right"
                          disabled={loadingMeta}
                        >
                          {vehicleData.color || (loadingMeta ? "جارٍ تحميل الألوان..." : "اختر لون المركبة")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="ابحث بالحرف الأول..."
                            value={colorSearch}
                            onValueChange={setColorSearch}
                            className="text-right"
                          />
                          <CommandList>
                            <CommandEmpty>لا توجد ألوان تبدأ بهذا الحرف</CommandEmpty>
                            <CommandGroup>
                              {filteredColors.map((color) => (
                                <CommandItem
                                  key={color._id}
                                  value={color.name}
                                  onSelect={() => {
                                    handleInputChange("color", color.name);
                                    setColorOpen(false);
                                    setColorSearch("");
                                  }}
                                  className="text-right"
                                >
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      vehicleData.color === color.name ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {color.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 13. رقم الهيكل */}
                  <div className="space-y-2">
                    <Label htmlFor="chassisNumber" className={fieldErrors.chassisNumber ? "text-red-600" : ""}>رقم الهيكل *</Label>
                    <Input
                      id="chassisNumber"
                      value={vehicleData.chassisNumber}
                      onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
                      placeholder="7 أحرف/أرقام على الأقل"
                      className={`text-right ${fieldErrors.chassisNumber ? "border-red-500" : ""}`}
                      required
                      dir="ltr"
                      minLength={7}
                    />
                    {fieldErrors.chassisNumber && (
                      <p className="text-sm text-red-600">{fieldErrors.chassisNumber}</p>
                    )}
                  </div>

                  {/* 14. رقم المحرك */}
                  <div className="space-y-2">
                    <Label htmlFor="engineNumber" className={fieldErrors.engineNumber ? "text-red-600" : ""}>رقم المحرك *</Label>
                    <Input
                      id="engineNumber"
                      value={vehicleData.engineNumber}
                      onChange={(e) => handleInputChange("engineNumber", e.target.value)}
                      placeholder="6 أحرف/أرقام على الأقل"
                      className={`text-right ${fieldErrors.engineNumber ? "border-red-500" : ""}`}
                      required
                      dir="ltr"
                      minLength={6}
                    />
                    {fieldErrors.engineNumber && (
                      <p className="text-sm text-red-600">{fieldErrors.engineNumber}</p>
                    )}
                  </div>

                  {/* 15. سعة المحرك - معطلة عند elec-car */}
                  <div className="space-y-2">
                    <Label htmlFor="engineCapacity">سعة المحرك</Label>
                    <Select
                      value={vehicleData.engineCapacity}
                      onValueChange={(value) => handleInputChange("engineCapacity", value)}
                      open={engineCapacityOpen}
                      onOpenChange={setEngineCapacityOpen}
                      disabled={isElectricCar}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder={isElectricCar ? "غير متاح للمركبات الكهربائية" : "اختر سعة المحرك"}>
                          {vehicleData.engineCapacity
                            ? ENGINE_CAPACITIES.find((c) => c.value === vehicleData.engineCapacity)?.label
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {engineCapacityOpen ? (
                          ENGINE_CAPACITIES.map((cap) => (
                            <SelectItem key={cap.value} value={cap.value}>
                              {cap.label}
                            </SelectItem>
                          ))
                        ) : null}
                      </SelectContent>
                    </Select>
                    {isElectricCar && (
                      <p className="text-xs text-gray-500">سعة المحرك غير متاحة للمركبات الكهربائية</p>
                    )}
                  </div>

                  {/* 16. عدد الركاب */}
                  <div className="space-y-2">
                    <Label htmlFor="seatsNumber">عدد الركاب</Label>
                    <Input
                      id="seatsNumber"
                      type="number"
                      min="1"
                      max="50"
                      value={vehicleData.seatsNumber}
                      onChange={(e) => handleInputChange("seatsNumber", e.target.value)}
                      placeholder="عدد الركاب"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  {/* نوع الوقود */}
                  <div className="space-y-2">
                    <Label>نوع الوقود</Label>
                    <Select
                      value={vehicleData.fuelType}
                      onValueChange={(value) => handleInputChange("fuelType", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نوع الوقود">
                          {vehicleData.fuelType ? vehicleData.fuelType : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="بنزين">بنزين</SelectItem>
                        <SelectItem value="ديزل">ديزل</SelectItem>
                        <SelectItem value="هجين">هجين</SelectItem>
                        <SelectItem value="كهربائي">كهربائي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 - بيانات المالك */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className={`flex items-center gap-2 ${fieldErrors.ownerName ? "text-red-600" : ""}`}>
                      <User className="w-4 h-4" />
                      اسم المالك الكامل *
                    </Label>
                    <Input
                      id="ownerName"
                      value={vehicleData.ownerName}
                      onChange={(e) => handleInputChange("ownerName", e.target.value)}
                      placeholder="اسم المالك كما هو مدون في الهوية"
                      className={`text-right ${fieldErrors.ownerName ? "border-red-500" : ""}`}
                      required
                    />
                    {fieldErrors.ownerName && (
                      <p className="text-sm text-red-600">{fieldErrors.ownerName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className={`flex items-center gap-2 ${fieldErrors.nationalId ? "text-red-600" : ""}`}>
                      <IdCard className="w-4 h-4" />
                      الرقم الوطني *
                    </Label>
                    <Input
                      id="nationalId"
                      value={vehicleData.nationalId}
                      onChange={(e) => handleInputChange("nationalId", e.target.value)}
                      placeholder="الرقم الوطني (11 رقم)"
                      className={`text-right ${fieldErrors.nationalId ? "border-red-500" : ""}`}
                      maxLength={11}
                      required
                      dir="ltr"
                    />
                    {fieldErrors.nationalId && (
                      <p className="text-sm text-red-600">{fieldErrors.nationalId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className={`flex items-center gap-2 ${fieldErrors.phoneNumber ? "text-red-600" : ""}`}>
                      <Phone className="w-4 h-4" />
                      رقم الهاتف *
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={vehicleData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="رقم الهاتف المحمول"
                      className={`text-right ${fieldErrors.phoneNumber ? "border-red-500" : ""}`}
                      required
                      dir="ltr"
                    />
                    {fieldErrors.phoneNumber && (
                      <p className="text-sm text-red-600">{fieldErrors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="governorate" className={fieldErrors.governorate ? "text-red-600" : ""}>المحافظة *</Label>
                    <Select
                      value={vehicleData.governorate}
                      onValueChange={(value) => handleInputChange("governorate", value)}
                      open={governorateOpen}
                      onOpenChange={setGovernorateOpen}
                    >
                      <SelectTrigger className={`text-right ${fieldErrors.governorate ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر المحافظة">
                          {vehicleData.governorate
                            ? SYRIAN_GOVERNORATES.find((g) => g.value === vehicleData.governorate)?.label
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {governorateOpen ? (
                          SYRIAN_GOVERNORATES.map((gov) => (
                            <SelectItem key={gov.value} value={gov.value}>
                              {gov.label}
                            </SelectItem>
                          ))
                        ) : null}
                      </SelectContent>
                    </Select>
                    {fieldErrors.governorate && (
                      <p className="text-sm text-red-600">{fieldErrors.governorate}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className={`flex items-center gap-2 ${fieldErrors.address ? "text-red-600" : ""}`}>
                      <MapPin className="w-4 h-4" />
                      العنوان التفصيلي *
                    </Label>
                    <Input
                      id="address"
                      value={vehicleData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="المدينة، الحي، الشارع"
                      className={`text-right ${fieldErrors.address ? "border-red-500" : ""}`}
                      required
                    />
                    {fieldErrors.address && (
                      <p className="text-sm text-red-600">{fieldErrors.address}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className={`flex items-center gap-2 ${fieldErrors.policyDuration ? "text-red-600" : ""}`}>
                      <Calendar className="w-4 h-4" />
                      مدة البوليصة *
                    </Label>
                    <Select
                      value={vehicleData.policyDuration}
                      onValueChange={(value) => handleInputChange("policyDuration", value)}
                    >
                      <SelectTrigger className={`text-right ${fieldErrors.policyDuration ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر مدة التأمين">
                          {vehicleData.policyDuration ? vehicleData.policyDuration : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 أشهر</SelectItem>
                        <SelectItem value="6months">6 أشهر</SelectItem>
                        <SelectItem value="12months">سنة كاملة</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.policyDuration && (
                      <p className="text-sm text-red-600">{fieldErrors.policyDuration}</p>
                    )}
                  </div>
                  </div>

                {/* الخدمات الإضافية */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="font-semibold mb-3">الخدمات الإضافية</div>

                  <div className="space-y-3 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={vehicleData.electronicCard}
                        onChange={(e) => handleInputChange("electronicCard", e.target.checked)}
                      />
                      خدمة البطاقة البلاستيكية (+150 ل.س)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={vehicleData.rescueService}
                        onChange={(e) => handleInputChange("rescueService", e.target.checked)}
                      />
                      خدمة الإنقاذ (+30 ل.س)
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={fieldErrors.notes ? "text-red-600" : ""}>ملاحظات *</Label>
                  <Textarea
                    value={vehicleData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="ملاحظات إضافية (إجبارية)..."
                    className={`text-right min-h-[100px] ${fieldErrors.notes ? "border-red-500" : ""}`}
                    rows={4}
                    required
                  />
                  {fieldErrors.notes && (
                    <p className="text-sm text-red-600">{fieldErrors.notes}</p>
                  )}
                </div>

                <Card className="bg-primary-50 border-primary-200">
                  <CardHeader>
                    <CardTitle className="text-primary-800">ملخص البيانات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary-700">المالك: </span>
                        <span>{vehicleData.ownerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">المحافظة: </span>
                        <span>
                          {SYRIAN_GOVERNORATES.find((g) => g.value === vehicleData.governorate)?.label ||
                            "غير محدد"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">رقم اللوحة: </span>
                        <span>{vehicleData.plateNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">المركبة: </span>
                        <span>
                          {selectedMakeName || "غير محدد"} {vehicleData.model} {vehicleData.year}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">رقم الهيكل: </span>
                        <span>{vehicleData.chassisNumber || "غير محدد"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">سعة المحرك: </span>
                        <Badge variant="secondary">
                          {ENGINE_CAPACITIES.find((c) => c.value === vehicleData.engineCapacity)?.label ||
                            "غير محدد"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">عدد المقاعد: </span>
                        <Badge variant="secondary">{vehicleData.seatsNumber || "غير محدد"}</Badge>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">اللون: </span>
                        <Badge variant="secondary">{vehicleData.color || "غير محدد"}</Badge>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">مدة التأمين: </span>
                        <Badge variant="secondary">
                          {vehicleData.policyDuration === "3months"
                            ? "3 أشهر"
                            : vehicleData.policyDuration === "6months"
                            ? "6 أشهر"
                            : vehicleData.policyDuration === "12months"
                            ? "سنة كاملة"
                            : "غير محدد"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4 - الملاحق */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">الملاحق</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddAddendum(true);
                      setNewAddendum({
                        addendumType: "",
                        description: "",
                        notes: "",
                        amount: undefined,
                        effectiveDate: "",
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة ملحق
                  </Button>
                </div>

                {/* قائمة الملاحق المضافة */}
                {addendums.length > 0 && (
                  <div className="space-y-3">
                    {addendums.map((addendum, index) => (
                      <Card key={index} className="border-primary-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {ADDENDUM_TYPES.find((t) => t.value === addendum.addendumType)?.label || addendum.addendumType}
                                </Badge>
                                {addendum.effectiveDate && (
                                  <span className="text-sm text-gray-600">
                                    تاريخ السريان: {new Date(addendum.effectiveDate).toLocaleDateString("ar-SY")}
                                  </span>
                                )}
                              </div>
                              {addendum.description && (
                                <p className="text-sm text-gray-700">{addendum.description}</p>
                              )}
                              {addendum.notes && (
                                <p className="text-xs text-gray-500">ملاحظات: {addendum.notes}</p>
                              )}
                              {addendum.amount && (
                                <p className="text-sm font-semibold text-primary">
                                  المبلغ: {new Intl.NumberFormat("ar-SY").format(addendum.amount)} ل.س
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAddendums(addendums.filter((_, i) => i !== index));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {addendums.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد ملاحق مضافة</p>
                    <p className="text-sm mt-1">يمكنك إضافة ملاحق اختيارية للبوليصة</p>
                  </div>
                )}

                {/* نموذج إضافة ملحق */}
                {showAddAddendum && (
                  <Card className="border-primary-300 bg-primary-50">
                    <CardHeader>
                      <CardTitle className="text-primary-800">إضافة ملحق جديد</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>نوع الملحق *</Label>
                        <Select
                          value={newAddendum.addendumType}
                          onValueChange={(value) => setNewAddendum({ ...newAddendum, addendumType: value })}
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
                          value={newAddendum.description || ""}
                          onChange={(e) => setNewAddendum({ ...newAddendum, description: e.target.value })}
                          placeholder="وصف الملحق..."
                          className="text-right"
                          rows={3}
                        />
                      </div>

                      {newAddendum.addendumType === "financial" && (
                        <div className="space-y-2">
                          <Label>المبلغ (ل.س)</Label>
                          <Input
                            type="number"
                            value={newAddendum.amount || ""}
                            onChange={(e) => setNewAddendum({ ...newAddendum, amount: Number(e.target.value) || undefined })}
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
                          value={newAddendum.effectiveDate || ""}
                          onChange={(e) => setNewAddendum({ ...newAddendum, effectiveDate: e.target.value })}
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>ملاحظات</Label>
                        <Textarea
                          value={newAddendum.notes || ""}
                          onChange={(e) => setNewAddendum({ ...newAddendum, notes: e.target.value })}
                          placeholder="ملاحظات إضافية..."
                          className="text-right"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            if (newAddendum.addendumType) {
                              setAddendums([...addendums, { ...newAddendum }]);
                              setNewAddendum({
                                addendumType: "",
                                description: "",
                                notes: "",
                                amount: undefined,
                                effectiveDate: "",
                              });
                              setShowAddAddendum(false);
                            }
                          }}
                          disabled={!newAddendum.addendumType}
                          className="flex-1"
                        >
                          إضافة
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddAddendum(false);
                            setNewAddendum({
                              addendumType: "",
                              description: "",
                              notes: "",
                              amount: undefined,
                              effectiveDate: "",
                            });
                          }}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <Separator className="my-6" />

            <div className="flex justify-between items-center relative z-10">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrevStep();
                }}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
                type="button"
              >
                السابق
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  الخطوة {currentStep} من {steps.length}
                </span>
              </div>

              {currentStep < 4 ? (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextStep();
                  }}
                  className="flex items-center gap-2"
                  type="button"
                >
                  التالي
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm("هل أنت متأكد من الخروج دون حفظ؟")) {
                        navigate("/");
                      }
                    }}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    خروج دون حفظ
                  </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  disabled={!isStepValid(currentStep) || isLoading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-600"
                  type="button"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                        حفظ العقد
                    </>
                  )}
                </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
        <RegistryPickerDialog
  open={pickerOpen}
  onOpenChange={setPickerOpen}
  candidates={candidates}
  onApply={(patch, mode) => {
    setVehicleData((prev: VehicleData) => {
      if (mode === "override") {
        // Override mode: استبدال جميع القيم
        return {
          ...prev,
          chassisNumber: patch.chassisNumber || prev.chassisNumber,
          engineNumber: patch.engineNumber || prev.engineNumber,
          plateNumber: patch.plateNumber || prev.plateNumber,
          nationalId: patch.nationalId || prev.nationalId,
          ownerName: patch.ownerName || prev.ownerName,
          phoneNumber: patch.phoneNumber || prev.phoneNumber,
          address: patch.address || prev.address,
          color: patch.color || prev.color,
          year: patch.year || patch.manufactureYear || prev.year,
          brand: patch.brand || prev.brand,
          model: patch.model || prev.model,
        };
      }

      // Fill empty mode: ملء الحقول الفارغة فقط
      const next = { ...prev };
      if (patch.chassisNumber && (!next.chassisNumber || next.chassisNumber === "")) {
        next.chassisNumber = patch.chassisNumber;
      }
      if (patch.engineNumber && (!next.engineNumber || next.engineNumber === "")) {
        next.engineNumber = patch.engineNumber;
      }
      if (patch.plateNumber && (!next.plateNumber || next.plateNumber === "")) {
        next.plateNumber = patch.plateNumber;
      }
      if (patch.nationalId && (!next.nationalId || next.nationalId === "")) {
        next.nationalId = patch.nationalId;
      }
      if (patch.ownerName && (!next.ownerName || next.ownerName === "")) {
        next.ownerName = patch.ownerName;
      }
      if (patch.phoneNumber && (!next.phoneNumber || next.phoneNumber === "")) {
        next.phoneNumber = patch.phoneNumber;
      }
      if (patch.address && (!next.address || next.address === "")) {
        next.address = patch.address;
      }
      if (patch.color && (!next.color || next.color === "")) {
        next.color = patch.color;
      }
      if ((patch.year || patch.manufactureYear) && (!next.year || next.year === "")) {
        next.year = String(patch.year || patch.manufactureYear || "");
      }
      if (patch.brand && (!next.brand || next.brand === "")) {
        next.brand = patch.brand;
      }
      if (patch.model && (!next.model || next.model === "")) {
        next.model = patch.model;
      }
      return next;
    });
    setPickerOpen(false);
  }}
/>

      </div>
    </div>
  );
}
