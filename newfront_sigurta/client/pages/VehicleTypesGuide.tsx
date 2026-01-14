import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Car,
  Home,
  FileText,
  Search,
  ChevronsUpDown,
  Check,
  Loader2,
  Info,
  Globe,
  Bookmark,
  Building2,
  DollarSign,
  ChevronDown,
  Palette,
} from "lucide-react";
import { cn } from "../lib/utils";
import { metaApi } from "../services/api";

type MakeObj = {
  _id: string;
  make: string;
  type?: string;
  legacyId?: number;
};

function normalizeMakes(input: any): MakeObj[] {
  const arr = Array.isArray(input) ? input : [];
  if (!arr.length) return [];

  if (typeof arr[0] === "string") {
    return arr.map((s: string) => ({ _id: s, make: s }));
  }

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

  if (typeof arr[0] === "string") return arr.filter(Boolean);

  return arr
    .map((x: any) => String(x?.name ?? x?.model ?? x?.type ?? x?._id ?? ""))
    .filter((s: string) => !!s);
}

export default function VehicleTypesGuide() {
  const navigate = useNavigate();
  const [makes, setMakes] = useState<MakeObj[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState("");

  const [makeSearch, setMakeSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [makeOpen, setMakeOpen] = useState(false);

  const employeeName = localStorage.getItem("employeeName") || "";
  const centerName = localStorage.getItem("centerName") || "";

  // Load makes on mount
  useEffect(() => {
    const loadMakes = async () => {
      try {
        setLoadingMakes(true);
        setError("");
        const makesRes = await metaApi.getMakes().catch(() => []);
        setMakes(normalizeMakes(makesRes));
      } catch (e: any) {
        console.error("Error loading makes:", e);
        setError(e?.message || "حدث خطأ في تحميل الماركات");
      } finally {
        setLoadingMakes(false);
      }
    };

    loadMakes();
  }, []);

  // Load models when make is selected
  useEffect(() => {
    const loadModels = async () => {
      if (!selectedMake) {
        setModels([]);
        return;
      }

      try {
        setLoadingModels(true);
        const selected = makes.find((m) => m._id === selectedMake) || makes.find((m) => m.make === selectedMake);
        const makeKey = selected?.make || selectedMake;
        const modelsRes = await metaApi.getModels(makeKey).catch(() => []);
        setModels(normalizeModels(modelsRes));
      } catch (e: any) {
        console.error("Error loading models:", e);
        setError(e?.message || "حدث خطأ في تحميل الموديلات");
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, [selectedMake, makes]);

  const selectedMakeObj = useMemo(() => {
    return makes.find((m) => m._id === selectedMake) || makes.find((m) => m.make === selectedMake);
  }, [makes, selectedMake]);

  const filteredMakes = useMemo(() => {
    if (!makeSearch.trim()) return makes;
    const searchLower = makeSearch.trim().toLowerCase();
    return makes.filter((m) => m.make.toLowerCase().startsWith(searchLower));
  }, [makes, makeSearch]);

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim() || !selectedMake) return models;
    const searchLower = modelSearch.trim().toLowerCase();
    return models.filter((m) => m.toLowerCase().includes(searchLower));
  }, [models, modelSearch, selectedMake]);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">دليل النوع والموديل</h1>
                <p className="text-sm text-gray-800">معلومات عن أنواع وموديلات السيارات</p>
              </div>
            </div>

            <div className="text-right text-gray-800">
              <div className="text-sm">المركز: <b>{centerName || "—"}</b></div>
              <div className="text-xs opacity-90">الموظف: {employeeName || "—"}</div>
            </div>

            <div className="flex items-center gap-2">
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
                  <Button variant="outline" className="bg-primary-700 hover:bg-primary-800 text-white border-primary-700 h-9">
                    <Search className="w-4 h-4 ml-2" />
                    الأدلة
                    <ChevronDown className="w-4 h-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>الأدلة المرجعية</DropdownMenuLabel>
                  <DropdownMenuSeparator />
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

        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              البحث عن الماركة والموديل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اختر الماركة</Label>
                <Popover open={makeOpen} onOpenChange={setMakeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={makeOpen}
                      className="w-full justify-between text-right"
                      disabled={loadingMakes}
                    >
                      {selectedMakeObj?.make || (loadingMakes ? "جارٍ تحميل الماركات..." : "اختر ماركة السيارة")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="ابحث بالحرف الأول..."
                        value={makeSearch}
                        onValueChange={setMakeSearch}
                        className="text-right"
                      />
                      <CommandList>
                        <CommandEmpty>لا توجد ماركات تبدأ بهذا الحرف</CommandEmpty>
                        <CommandGroup>
                          {filteredMakes.map((make) => (
                            <CommandItem
                              key={make._id}
                              value={make.make}
                              onSelect={() => {
                                setSelectedMake(make._id);
                                setMakeOpen(false);
                                setMakeSearch("");
                              }}
                              className="text-right"
                            >
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4",
                                  selectedMake === make._id ? "opacity-100" : "opacity-0"
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
              </div>

              <div className="space-y-2">
                <Label>البحث في الموديلات</Label>
                <Input
                  placeholder="ابحث في الموديلات..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="text-right"
                  disabled={!selectedMake}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Makes List */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              الماركات المتاحة ({makes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMakes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="mr-3 text-gray-600">جارٍ تحميل الماركات...</span>
              </div>
            ) : makes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد ماركات متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {makes.map((make) => (
                  <Button
                    key={make._id}
                    variant={selectedMake === make._id ? "default" : "outline"}
                    className={cn(
                      "justify-start text-right h-auto p-3",
                      selectedMake === make._id && "bg-primary-600 text-white hover:bg-primary-700"
                    )}
                    onClick={() => setSelectedMake(make._id)}
                  >
                    <Car className="w-4 h-4 ml-2" />
                    <span className="flex-1 text-right">{make.make}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Models List */}
        {selectedMake && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                موديلات {selectedMakeObj?.make || selectedMake} ({models.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingModels ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                  <span className="mr-3 text-gray-600">جارٍ تحميل الموديلات...</span>
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Info className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد موديلات متاحة لهذه الماركة</p>
                  <p className="text-sm mt-2">يرجى المحاولة مع ماركة أخرى</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(modelSearch && filteredModels.length > 0 ? filteredModels : models).map((model, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="ml-2">
                          {selectedMakeObj?.make || selectedMake}
                        </Badge>
                        <span className="font-medium text-right flex-1">{model}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        {!selectedMake && (
          <Card className="shadow-lg bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Info className="w-5 h-5" />
                معلومات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 text-right">
                اختر ماركة من القائمة أعلاه لعرض جميع الموديلات المتاحة لهذه الماركة.
                يمكنك أيضاً استخدام البحث للعثور على ماركة أو موديل معين بسرعة.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
