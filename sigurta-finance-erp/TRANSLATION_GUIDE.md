# دليل استخدام نظام الترجمة (i18n)

## نظرة عامة

تم إنشاء نظام ترجمة متكامل يدعم العربية والإنجليزية، ويمكن دمجه بسهولة في جميع صفحات التطبيق.

## الملفات الرئيسية

- `src/lib/i18n.ts` - ملف الترجمة الأساسي يحتوي على جميع النصوص
- `src/hooks/useTranslation.ts` - Hook للاستخدام في React Components
- `src/components/LanguageSwitcher.tsx` - مكون تبديل اللغة
- `src/components/PageHeader.tsx` - مكون Header مشترك مع دعم الترجمة

## كيفية الاستخدام

### 1. في المكونات React

```typescript
import { useTranslation } from "../hooks/useTranslation";

function MyComponent() {
  const { t, language, changeLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t("app.name")}</h1>
      <button onClick={() => changeLanguage("en")}>
        {t("action.save")}
      </button>
    </div>
  );
}
```

### 2. استخدام PageHeader المشترك

```typescript
import PageHeader from "../components/PageHeader";
import { FileText } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

function MyPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <PageHeader
        title={t("journalEntry.title")}
        subtitle={t("journalEntry.create")}
        icon={<FileText className="w-6 h-6 text-white" />}
        actions={<Button>{t("action.add")}</Button>}
      />
      {/* باقي المحتوى */}
    </div>
  );
}
```

### 3. استخدام LanguageSwitcher

```typescript
import LanguageSwitcher from "../components/LanguageSwitcher";

function Header() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  );
}
```

## إضافة ترجمات جديدة

لإضافة ترجمة جديدة، قم بتحديث ملف `src/lib/i18n.ts`:

```typescript
const translations: Translations = {
  ar: {
    // ... الترجمات الموجودة
    "my.new.key": "النص بالعربي",
  },
  en: {
    // ... الترجمات الموجودة
    "my.new.key": "English Text",
  },
};
```

## المفاتيح المتوفرة

### عام
- `app.name` - اسم التطبيق
- `app.title` - عنوان التطبيق

### التنقل
- `nav.dashboard` - لوحة التحكم
- `nav.home` - الرئيسية
- `nav.journalEntries` - القيود المحاسبية
- `nav.chartOfAccounts` - شجرة الحسابات
- `nav.financialReports` - التقارير المالية

### القيود المحاسبية
- `journalEntry.title` - القيود المحاسبية
- `journalEntry.create` - إنشاء قيد محاسبي
- `journalEntry.edit` - تعديل قيد محاسبي
- `journalEntry.entryNumber` - رقم القيد
- `journalEntry.date` - التاريخ
- `journalEntry.description` - الوصف
- `journalEntry.debit` - مدين
- `journalEntry.credit` - دائن
- `journalEntry.status` - الحالة
- `journalEntry.approved` - معتمد
- `journalEntry.pending` - قيد المراجعة
- `journalEntry.rejected` - مرفوض

### الحسابات
- `account.title` - شجرة الحسابات
- `account.create` - إضافة حساب جديد
- `account.code` - رمز الحساب
- `account.name` - اسم الحساب
- `account.type` - نوع الحساب
- `account.type.asset` - أصل
- `account.type.liability` - خصم
- `account.type.equity` - حقوق ملكية
- `account.type.revenue` - إيراد
- `account.type.expense` - مصروف

### الأزرار والإجراءات
- `action.save` - حفظ
- `action.cancel` - إلغاء
- `action.edit` - تعديل
- `action.delete` - حذف
- `action.search` - بحث
- `action.export` - تصدير
- `action.print` - طباعة
- `action.add` - إضافة
- `action.create` - إنشاء
- `action.update` - تحديث
- `action.logout` - خروج

### الحقول العامة
- `field.id` - الرمز
- `field.name` - الاسم
- `field.date` - التاريخ
- `field.amount` - المبلغ
- `field.status` - الحالة

### الرسائل
- `message.success.create` - تم الإنشاء بنجاح
- `message.success.update` - تم التحديث بنجاح
- `message.success.delete` - تم الحذف بنجاح
- `message.error.required` - هذا الحقل مطلوب
- `message.error.load` - حدث خطأ أثناء تحميل البيانات
- `message.loading` - جاري التحميل...
- `message.noData` - لا توجد بيانات

## استخدام المعاملات في الترجمات

يمكن استخدام معاملات في النصوص:

```typescript
// في i18n.ts
"message.welcome": "مرحباً {name}، لديك {count} رسالة"

// في المكون
const { t } = useTranslation();
t("message.welcome", { name: "أحمد", count: 5 })
// النتيجة: "مرحباً أحمد، لديك 5 رسالة"
```

## حفظ اللغة

اللغة يتم حفظها تلقائياً في `localStorage` وتُستعاد عند إعادة تحميل الصفحة.

## الصفحات المحدثة

تم تحديث الصفحات التالية لاستخدام نظام الترجمة:
- ✅ `JournalEntries.tsx` - القيود المحاسبية
- ✅ `ChartOfAccounts.tsx` - شجرة الحسابات

يمكن تحديث باقي الصفحات بنفس الطريقة.
