import React, { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Loader2, Download, Printer, X, BarChart3, PieChart, Calendar, FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { adminApi } from "../../services/adminApi";

interface ReportViewerProps {
  reportId: string;
  reportTitle: string;
  onClose: () => void;
}

interface PaymentData {
  _id?: string;
  policyNumber?: string;
  receiptNumber?: string;
  amount?: number;
  paymentDate?: string;
  createdAt?: string;
  issuedAt?: string;
  policyStartAt?: string;
  policyEndAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  pricingInput?: any;
  breakdown?: any;
  vehicleId?: any;
  insuranceCompany?: any;
  center?: any;
  processedBy?: any;
}

interface VehicleData {
  _id?: string;
  vehicleType?: "syrian" | "foreign";
  ownerName?: string;
  plateNumber?: string;
  brand?: string;
  model?: string;
  year?: number;
  category?: string;
  classification?: string;
  vehicleCode?: string;
  governorate?: string;
}

const extractArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const formatMoney = (value?: number) => {
  const n = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("ar-SY").format(n) + " ل.س";
};

const formatNumber = (n: number) => Number(n || 0).toLocaleString("ar");

// Helper functions for data aggregation
const groupByMonth = (payments: PaymentData[]) => {
  const groups: Record<string, PaymentData[]> = {};
  payments.forEach((p) => {
    const date = p.createdAt || p.paymentDate || p.issuedAt || "";
    if (date) {
      const month = new Date(date).toLocaleDateString("ar-SY", { year: "numeric", month: "long" });
      if (!groups[month]) groups[month] = [];
      groups[month].push(p);
    }
  });
  return groups;
};

const groupByCategory = (payments: PaymentData[], vehicles: Record<string, VehicleData>) => {
  const groups: Record<string, PaymentData[]> = {
    "01": [],
    "02": [],
    "03": [],
    "04": [],
    unknown: [],
  };
  payments.forEach((p) => {
    const vid = String(p.vehicleId || "");
    const vehicle = vehicles[vid];
    const category = vehicle?.category || p.pricingInput?.category || "unknown";
    const catKey = String(category || "unknown").padStart(2, "0");
    if (groups[catKey]) {
      groups[catKey].push(p);
    } else {
      groups.unknown.push(p);
    }
  });
  return groups;
};

const groupByNationality = (payments: PaymentData[], vehicles: Record<string, VehicleData>) => {
  const groups: { syrian: PaymentData[]; foreign: PaymentData[] } = {
    syrian: [],
    foreign: [],
  };
  payments.forEach((p) => {
    const vid = String(p.vehicleId || "");
    const vehicle = vehicles[vid];
    if (vehicle?.vehicleType === "syrian") {
      groups.syrian.push(p);
    } else {
      groups.foreign.push(p);
    }
  });
  return groups;
};

const groupByClassification = (payments: PaymentData[], vehicles: Record<string, VehicleData>) => {
  const groups: Record<string, PaymentData[]> = {
    "0": [],
    "1": [],
    "2": [],
    "3": [],
    unknown: [],
  };
  payments.forEach((p) => {
    const vid = String(p.vehicleId || "");
    const vehicle = vehicles[vid];
    const classification = vehicle?.classification || p.pricingInput?.classification || "unknown";
    const key = String(classification || "unknown");
    if (groups[key]) {
      groups[key].push(p);
    } else {
      groups.unknown.push(p);
    }
  });
  return groups;
};

const groupByManufacturer = (payments: PaymentData[], vehicles: Record<string, VehicleData>) => {
  const groups: Record<string, PaymentData[]> = {};
  payments.forEach((p) => {
    const vid = String(p.vehicleId || "");
    const vehicle = vehicles[vid];
    const manufacturer = vehicle?.brand || "غير محدد";
    if (!groups[manufacturer]) groups[manufacturer] = [];
    groups[manufacturer].push(p);
  });
  return groups;
};

const groupByCompany = (payments: PaymentData[]) => {
  const groups: Record<string, PaymentData[]> = {};
  payments.forEach((p) => {
    const companyId = String(p.insuranceCompany?._id || p.insuranceCompany || "غير محدد");
    const companyName = p.insuranceCompany?.name || "غير محدد";
    const key = `${companyId}|${companyName}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return groups;
};

const groupByPeriod = (payments: PaymentData[]) => {
  const groups: Record<string, PaymentData[]> = {
    "3": [],
    "6": [],
    "12": [],
    unknown: [],
  };
  payments.forEach((p) => {
    const months = p.pricingInput?.months || p.pricingInput?.period || 12;
    const key = String(months || 12);
    if (groups[key]) {
      groups[key].push(p);
    } else {
      groups.unknown.push(p);
    }
  });
  return groups;
};

const groupByEmployee = (payments: PaymentData[]) => {
  const groups: Record<string, PaymentData[]> = {};
  payments.forEach((p) => {
    const employeeId = String(p.processedBy?._id || p.processedBy || "غير محدد");
    const employeeName = p.processedBy?.fullName || p.processedBy?.name || "غير محدد";
    const key = `${employeeId}|${employeeName}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return groups;
};

export default function ReportViewer({ reportId, reportTitle, onClose }: ReportViewerProps) {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, VehicleData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [from, to]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsRes, syrianRes, foreignRes] = await Promise.all([
        adminApi.getPayments({ from, to, populate: true }),
        adminApi.getSyrianVehicles(),
        adminApi.getForeignVehicles(),
      ]);

      const paymentsList = extractArray(paymentsRes) as PaymentData[];
      const syrianList = extractArray(syrianRes) as VehicleData[];
      const foreignList = extractArray(foreignRes) as VehicleData[];

      const vehiclesMap: Record<string, VehicleData> = {};
      [...syrianList, ...foreignList].forEach((v) => {
        if (v._id) vehiclesMap[String(v._id)] = v;
      });

      setPayments(paymentsList);
      setVehicles(vehiclesMap);
    } catch (err: any) {
      console.error("Error loading report data:", err);
      setError(err?.message || "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const reportData = useMemo(() => {
    if (!payments.length) return null;

    switch (reportId) {
      case "contracts-by-month":
        return groupByMonth(payments);
      case "contracts-by-category":
        return groupByCategory(payments, vehicles);
      case "contracts-by-nationality":
        return groupByNationality(payments, vehicles);
      case "contracts-by-classification":
        return groupByClassification(payments, vehicles);
      case "contracts-by-manufacturer":
        return groupByManufacturer(payments, vehicles);
      case "contracts-by-company":
        return groupByCompany(payments);
      case "contracts-by-period":
        return groupByPeriod(payments);
      case "contracts-by-employee":
        return groupByEmployee(payments);
      default:
        return null;
    }
  }, [reportId, payments, vehicles]);

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportId) {
      case "contracts-by-month":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع عدد العقود على أشهر السنة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">الشهر</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportData as Record<string, PaymentData[]>)
                  .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                  .map(([month, items], idx) => {
                    const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
                    return (
                      <TableRow key={month}>
                        <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                        <TableCell>{month}</TableCell>
                        <TableCell>{formatNumber(items.length)}</TableCell>
                        <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        );

      case "contracts-by-category":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع العقود حسب الفئة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportData as Record<string, PaymentData[]>).map(([cat, items], idx) => {
                  const categoryLabel =
                    cat === "01"
                      ? "خاصة"
                      : cat === "02"
                      ? "عامة"
                      : cat === "03"
                      ? "حكومية"
                      : cat === "04"
                      ? "تأجير"
                      : "غير محدد";
                  const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
                  return (
                    <TableRow key={cat}>
                      <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                      <TableCell>{categoryLabel}</TableCell>
                      <TableCell>{formatNumber(items.length)}</TableCell>
                      <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "contracts-by-nationality":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع العقود حسب جنسية المركبة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">الجنسية</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { key: "syrian", label: "سورية", data: (reportData as any).syrian || [] },
                  { key: "foreign", label: "أجنبية", data: (reportData as any).foreign || [] },
                ].map(({ key, label, data }, idx) => {
                  const total = data.reduce((sum: number, p: PaymentData) => sum + (p.amount || p.breakdown?.total || 0), 0);
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                      <TableCell>{label}</TableCell>
                      <TableCell>{formatNumber(data.length)}</TableCell>
                      <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "contracts-by-classification":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع العقود حسب التصنيف</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportData as Record<string, PaymentData[]>).map(([cls, items], idx) => {
                  const classificationLabel =
                    cls === "0"
                      ? "غير حكومية"
                      : cls === "1"
                      ? "حكومية"
                      : cls === "2"
                      ? "تخفيض طابع"
                      : cls === "3"
                      ? "إعفاء طابع"
                      : "غير محدد";
                  const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
                  return (
                    <TableRow key={cls}>
                      <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                      <TableCell>{classificationLabel}</TableCell>
                      <TableCell>{formatNumber(items.length)}</TableCell>
                      <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "contracts-by-manufacturer":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع العقود حسب الصانع</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">الصانع</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportData as Record<string, PaymentData[]>)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([manufacturer, items], idx) => {
                    const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
                    return (
                      <TableRow key={manufacturer}>
                        <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                        <TableCell>{manufacturer}</TableCell>
                        <TableCell>{formatNumber(items.length)}</TableCell>
                        <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        );

      case "contracts-by-company":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع العقود حسب الشركة المصدرة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">شركة التأمين</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportData as Record<string, PaymentData[]>)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([key, items], idx) => {
                    const companyName = key.split("|")[1] || "غير محدد";
                    const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                        <TableCell>{companyName}</TableCell>
                        <TableCell>{formatNumber(items.length)}</TableCell>
                        <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        );

      case "contracts-by-period":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع العقود حسب الفترة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">الفترة</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { key: "3", label: "3 أشهر" },
                  { key: "6", label: "6 أشهر" },
                  { key: "12", label: "12 شهر" },
                  { key: "unknown", label: "غير محدد" },
                ].map(({ key, label }, idx) => {
                  const items = (reportData as Record<string, PaymentData[]>)[key] || [];
                  const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                      <TableCell>{label}</TableCell>
                      <TableCell>{formatNumber(items.length)}</TableCell>
                      <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "contracts-by-employee":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">توزع العقود حسب الموظف</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">عدد العقود</TableHead>
                  <TableHead className="text-right">إجمالي المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(reportData as Record<string, PaymentData[]>)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([key, items], idx) => {
                    const employeeName = key.split("|")[1] || "غير محدد";
                    const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                        <TableCell>{employeeName}</TableCell>
                        <TableCell>{formatNumber(items.length)}</TableCell>
                        <TableCell className="font-extrabold">{formatMoney(total)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>تقرير "{reportTitle}" قيد التطوير</p>
            <p className="text-sm mt-2">عدد العقود المتاحة: {payments.length}</p>
            <p className="text-sm mt-1">يمكنك استخدام البيانات أدناه لعرض التفاصيل:</p>
            <div className="mt-4 text-left">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-12">#</TableHead>
                    <TableHead className="text-right">رقم الوثيقة</TableHead>
                    <TableHead className="text-right">رقم الإيصال</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">تاريخ الإصدار</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 10).map((p, idx) => (
                    <TableRow key={p._id || idx}>
                      <TableCell className="font-bold text-center text-violet-700">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{p.policyNumber || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{p.receiptNumber || "—"}</TableCell>
                      <TableCell className="font-extrabold">{formatMoney(p.amount || p.breakdown?.total)}</TableCell>
                      <TableCell>{formatDate(p.createdAt || p.paymentDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {payments.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  عرض أول 10 عقود من أصل {payments.length}
                </p>
              )}
            </div>
          </div>
        );
    }
  };

  // Export functions
  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = "";
    let headers: string[] = [];
    let rows: any[] = [];

    // بناء CSV حسب نوع التقرير
    switch (reportId) {
      case "contracts-by-month":
        headers = ["الشهر", "عدد العقود", "إجمالي المبلغ"];
        Object.entries(reportData as Record<string, PaymentData[]>).forEach(([month, items]) => {
          const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
          rows.push([month, items.length, total]);
        });
        break;
      case "contracts-by-category":
        headers = ["الفئة", "عدد العقود", "إجمالي المبلغ"];
        Object.entries(reportData as Record<string, PaymentData[]>).forEach(([cat, items]) => {
          const categoryLabel =
            cat === "01" ? "خاصة" : cat === "02" ? "عامة" : cat === "03" ? "حكومية" : cat === "04" ? "تأجير" : "غير محدد";
          const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
          rows.push([categoryLabel, items.length, total]);
        });
        break;
      default:
        headers = ["الفئة", "عدد العقود", "إجمالي المبلغ"];
        if (typeof reportData === "object" && reportData !== null) {
          Object.entries(reportData as Record<string, PaymentData[]>).forEach(([key, items]) => {
            const total = items.reduce((sum, p) => sum + (p.amount || p.breakdown?.total || 0), 0);
            rows.push([key, items.length, total]);
          });
        }
    }

    // بناء CSV
    csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
    });

    // تحميل الملف
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportId}_${from}_${to}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!tableRef.current) return;

    // استخدام window.print() لطباعة PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("المتصفح منع فتح نافذة جديدة للطباعة");
      return;
    }

    const content = tableRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              direction: rtl;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: right;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .meta {
              text-align: center;
              margin-bottom: 20px;
              color: #666;
            }
            @media print {
              @page {
                margin: 1cm;
              }
            }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <div class="meta">من ${from} إلى ${to} | إجمالي العقود: ${payments.length}</div>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;
    window.print();
  };

  return (
    <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur shadow-xl" ref={tableRef}>
      <div className="h-2 bg-gradient-to-r from-purple-300 via-purple-200 to-purple-300" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-300 to-purple-200 flex items-center justify-center" style={{color: "#5b21b6"}}>
              <BarChart3 className="w-5 h-5 text-white" />
            </span>
            <div>
              <span className="text-lg font-extrabold">{reportTitle}</span>
              <div className="text-sm font-normal text-slate-600">({payments.length} عقد)</div>
            </div>
          </CardTitle>

          {/* أزرار التصدير والطباعة */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!reportData || loading}>
              <FileDown className="w-4 h-4 ml-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!reportData || loading}>
              <FileText className="w-4 h-4 ml-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!reportData || loading}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4 ml-2" />
              إغلاق
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="from" className="text-sm">من:</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="to" className="text-sm">إلى:</Label>
            <Input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 w-auto"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : "تحديث"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-10 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
            <span className="text-slate-700">جاري تحميل البيانات...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && renderReportContent()}
      </CardContent>
    </Card>
  );
}
