# دليل استخدام MainLayout (AmzMainLayout)

تم إنشاء نظام تخطيط رئيسي مستوحى من `AmzMainLayout.xml` من النظام القديم. يتضمن:

## المكونات الرئيسية

### 1. **MainLayout** - التخطيط الرئيسي
مكون شامل يوفر:
- شريط علوي مع العنوان والأزرار
- Ribbon Bar (اختياري)
- منطقة المحتوى الرئيسية
- لوحات جانبية قابلة للربط (Dockable Panels)
- شريط الحالة (Status Bar)

### 2. **RibbonBar** - شريط Ribbon
شريط تبويبات مشابه لـ Microsoft Office يحتوي على:
- تبويبات (Tabs) مع أيقونات
- محتوى لكل تبويب (أزرار، قوائم، إلخ)

### 3. **DockablePanel** - لوحات قابلة للربط
لوحات جانبية يمكن:
- تصغيرها/تكبيرها
- إغلاقها
- نقلها (في المستقبل)

### 4. **StatusBar** - شريط الحالة
شريط في الأسفل يعرض:
- معلومات النظام
- حالة العملية
- معلومات المستخدم

## مثال على الاستخدام

```tsx
import MainLayout from "../components/MainLayout";
import { FileText, Save, Print } from "lucide-react";
import { Button } from "../components/ui/button";

export default function MyPage() {
  const { t } = useTranslation();

  // تعريف تبويبات Ribbon
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
  ];

  // تعريف عناصر شريط الحالة
  const statusBarItems = [
    {
      id: "user",
      content: <span>المستخدم: Admin</span>,
      align: "right",
    },
    {
      id: "date",
      content: <span>{new Date().toLocaleDateString("ar-SA")}</span>,
      align: "left",
    },
  ];

  // تعريف اللوحات الجانبية
  const rightPanels = [
    {
      id: "info",
      title: "معلومات",
      content: <div>محتوى اللوحة</div>,
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
      {/* محتوى الصفحة */}
      <div>محتوى الصفحة هنا</div>
    </MainLayout>
  );
}
```

## الخصائص (Props)

### MainLayout Props

| الخاصية | النوع | الوصف | افتراضي |
|---------|------|-------|---------|
| `children` | `ReactNode` | محتوى الصفحة | مطلوب |
| `title` | `string?` | عنوان الصفحة | - |
| `subtitle` | `string?` | عنوان فرعي | - |
| `icon` | `ReactNode?` | أيقونة | - |
| `showDashboard` | `boolean?` | إظهار زر Dashboard | `true` |
| `showHome` | `boolean?` | إظهار زر Home | `true` |
| `actions` | `ReactNode?` | أزرار إضافية | - |
| `ribbonTabs` | `RibbonTab[]?` | تبويبات Ribbon | - |
| `statusBarItems` | `StatusBarItem[]?` | عناصر شريط الحالة | `[]` |
| `rightPanels` | `Panel[]?` | لوحات جانبية | `[]` |

### RibbonTab Type

```typescript
type RibbonTab = {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};
```

### StatusBarItem Type

```typescript
type StatusBarItem = {
  id: string;
  content: ReactNode;
  align?: "left" | "right";
};
```

### Panel Type

```typescript
type Panel = {
  id: string;
  title: string;
  content: ReactNode;
};
```

## الاستخدام البسيط (بدون Ribbon)

```tsx
<MainLayout title="عنوان الصفحة">
  <div>محتوى بسيط</div>
</MainLayout>
```

## الميزات

✅ **Ribbon Interface** - واجهة مشابهة لـ Office  
✅ **Dockable Panels** - لوحات قابلة للربط  
✅ **Status Bar** - شريط حالة  
✅ **RTL Support** - دعم كامل للغة العربية  
✅ **Responsive** - متجاوب مع جميع الأحجام  
✅ **i18n Ready** - جاهز للترجمة  

## الملفات ذات الصلة

- `src/components/MainLayout.tsx` - التخطيط الرئيسي
- `src/components/RibbonBar.tsx` - شريط Ribbon
- `src/components/DockablePanel.tsx` - لوحات قابلة للربط
- `src/components/StatusBar.tsx` - شريط الحالة
- `src/pages/ExampleWithRibbon.tsx` - مثال كامل

## ملاحظات

- التخطيط يدعم RTL بشكل كامل
- جميع المكونات متجاوبة
- يمكن تخصيص الألوان والأنماط عبر Tailwind CSS
- اللوحات الجانبية قابلة للإغلاق والتصغير
