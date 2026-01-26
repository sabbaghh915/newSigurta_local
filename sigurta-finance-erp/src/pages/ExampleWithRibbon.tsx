import { FileText, Save, Print, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import MainLayout from "../components/MainLayout";
import { useTranslation } from "../hooks/useTranslation";

export default function ExampleWithRibbon() {
  const { t } = useTranslation();

  const ribbonTabs = [
    {
      id: "file",
      label: "ملف",
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
          <Button size="sm" variant="outline">
            <Print className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </div>
      ),
    },
    {
      id: "settings",
      label: "إعدادات",
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">إعدادات النظام</Button>
          <Button size="sm" variant="outline">الصلاحيات</Button>
        </div>
      ),
    },
  ];

  const statusBarItems = [
    {
      id: "user",
      content: <span>المستخدم: Admin</span>,
      align: "right" as const,
    },
    {
      id: "date",
      content: <span>{new Date().toLocaleDateString("ar-SA")}</span>,
      align: "left" as const,
    },
  ];

  const rightPanels = [
    {
      id: "info",
      title: "معلومات",
      content: (
        <div className="text-sm space-y-2">
          <p>لوحة معلومات جانبية</p>
          <p>يمكن إغلاقها أو تصغيرها</p>
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      title={t("app.name")}
      subtitle={t("app.title")}
      ribbonTabs={ribbonTabs}
      statusBarItems={statusBarItems}
      rightPanels={rightPanels}
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">مثال على استخدام Ribbon Layout</h2>
        <p>هذا مثال على استخدام التخطيط الجديد مع:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Ribbon Bar - شريط Ribbon في الأعلى</li>
          <li>Status Bar - شريط الحالة في الأسفل</li>
          <li>Dockable Panels - لوحات قابلة للربط على الجانب</li>
        </ul>
      </div>
    </MainLayout>
  );
}
