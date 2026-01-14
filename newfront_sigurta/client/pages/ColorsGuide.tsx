import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
  Palette,
  Home,
  FileText,
  Search,
  ChevronsUpDown,
  Check,
  Loader2,
  Info,
  Car,
  Globe,
  Bookmark,
  Building2,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";
import { metaApi } from "../services/api";

type DbColor = { _id: string; name: string; ccid?: number };

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

// Color mapping for visualization
const colorMap: Record<string, string> = {
  أبيض: "#FFFFFF",
  أسود: "#000000",
  رمادي: "#808080",
  رصاصي: "#808080",
  فضي: "#C0C0C0",
  فضة: "#C0C0C0",
  أحمر: "#FF0000",
  أزرق: "#0000FF",
  أخضر: "#008000",
  أصفر: "#FFFF00",
  برتقالي: "#FFA500",
  بني: "#A52A2A",
  بنفسجي: "#800080",
  وردي: "#FFC0CB",
  ذهبي: "#FFD700",
  كحلي: "#191970",
  عاجي: "#FFF8DC",
  عسلي: "#D2B48C",
  بحري: "#1E90FF",
  ثلجي: "#FFFAFA",
  جردوني: "#FF6347",
  خرزي: "#FFD700",
  خضر: "#008000",
  كاشف: "#E6E6FA",
  أجري: "#007FFF",
  بحري: "#1E90FF",
};

// Helper function to extract color from compound name
function getColorHex(colorName: string): string {
  if (!colorName) return "#CCCCCC";
  
  const normalized = colorName.trim();
  
  // Try exact match first (case-insensitive)
  const exactMatch = Object.keys(colorMap).find(
    key => key.toLowerCase() === normalized.toLowerCase() || 
           normalized.toLowerCase() === key.toLowerCase()
  );
  if (exactMatch) {
    return colorMap[exactMatch];
  }
  
  // Priority order for colors (most common/vibrant first)
  const colorPriority = [
    'أحمر', 'أزرق', 'أخضر', 'أصفر', 'برتقالي',
    'بنفسجي', 'وردي', 'ذهبي', 'كحلي',
    'أبيض', 'أسود', 'رمادي', 'رصاصي', 'فضي', 'فضة', 'بني',
    'عاجي', 'عسلي', 'بحري', 'ثلجي', 'جردوني', 'خرزي', 'خضر', 'كاشف', 'أجري'
  ];
  
  // Search in the full name first (for compound names)
  for (const keyword of colorPriority) {
    if (normalized.includes(keyword)) {
      const foundColor = colorMap[keyword];
      if (foundColor) {
        return foundColor;
      }
    }
  }
  
  // Split by common separators and search in individual words
  const separators = /[\s\+\-،,]+/;
  const words = normalized.split(separators).map(w => w.trim()).filter(w => w);
  
  for (const word of words) {
    for (const [key, value] of Object.entries(colorMap)) {
      // Check if word contains the color key or vice versa
      if (word.includes(key) || key.includes(word)) {
        return value;
      }
    }
  }
  
  // Default gray color
  return "#CCCCCC";
}

export default function ColorsGuide() {
  const navigate = useNavigate();
  const [colors, setColors] = useState<DbColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [colorOpen, setColorOpen] = useState(false);

  const employeeName = localStorage.getItem("employeeName") || "";
  const centerName = localStorage.getItem("centerName") || "";

  // Load colors on mount
  useEffect(() => {
    const loadColors = async () => {
      try {
        setLoading(true);
        setError("");
        const colorsRes = await metaApi.getColors().catch(() => []);
        setColors(normalizeColors(colorsRes));
      } catch (e: any) {
        console.error("Error loading colors:", e);
        setError(e?.message || "حدث خطأ في تحميل الألوان");
      } finally {
        setLoading(false);
      }
    };

    loadColors();
  }, []);

  const filteredColors = useMemo(() => {
    if (!searchTerm.trim()) return colors;
    const searchLower = searchTerm.trim().toLowerCase();
    return colors.filter((c) => c.name.toLowerCase().includes(searchLower));
  }, [colors, searchTerm]);

  // Group colors by first letter for better organization
  const groupedColors = useMemo(() => {
    const groups: Record<string, DbColor[]> = {};
    filteredColors.forEach((color) => {
      const firstLetter = color.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(color);
    });
    return groups;
  }, [filteredColors]);

  const sortedGroups = useMemo(() => {
    return Object.keys(groupedColors).sort();
  }, [groupedColors]);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">دليل الألوان</h1>
                <p className="text-sm text-gray-800">معلومات عن ألوان السيارات المتاحة</p>
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
                  <DropdownMenuItem onClick={() => navigate("/vehicle-types-guide")} className="text-right cursor-pointer">
                    <Search className="w-4 h-4 ml-2" />
                    دليل النوع والموديل
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

        {/* Search Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              البحث عن اللون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="ابحث عن لون..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right"
              />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>تم العثور على {filteredColors.length} لون من أصل {colors.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              الألوان المتاحة ({colors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="mr-3 text-gray-600">جارٍ تحميل الألوان...</span>
              </div>
            ) : colors.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد ألوان متاحة</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedGroups.map((letter) => (
                  <div key={letter} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                      {letter}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {groupedColors[letter].map((color) => {
                        const colorHex = getColorHex(color.name);
                        return (
                          <div
                            key={color._id}
                            className="relative p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: colorHex }}
                                title={color.name}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-right text-gray-800">
                                  {color.name}
                                </div>
                                {color.ccid && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    ID: {color.ccid}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {colorHex}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 shadow-lg bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="w-5 h-5" />
              معلومات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-right">
              هذا الدليل يحتوي على جميع الألوان المتاحة للسيارات في النظام.
              يمكنك استخدام البحث للعثور على لون معين بسرعة.
              الألوان مرتبة أبجدياً حسب الحرف الأول.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
