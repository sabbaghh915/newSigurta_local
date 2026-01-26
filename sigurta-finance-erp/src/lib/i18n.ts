// نظام الترجمة (i18n) للنظام المالي
// بناءً على ملف frm_translate0 من النظام القديم

type TranslationKey = string;
type Translations = Record<string, Record<string, string>>;

// الترجمات العربية والإنجليزية
const translations: Translations = {
  ar: {
    // عام
    "app.name": "نظام سيجورتا المالي",
    "app.title": "نظام إدارة مالية متكامل",
    
    // القوائم والتنقل
    "nav.dashboard": "لوحة التحكم",
    "nav.home": "الرئيسية",
    "nav.journalEntries": "القيود المحاسبية",
    "nav.chartOfAccounts": "شجرة الحسابات",
    "nav.financialReports": "التقارير المالية",
    "nav.expenses": "المصروفات",
    "nav.ledger": "دفتر اليومية",
    "nav.reports": "التقارير",
    
    // القيود المحاسبية
    "journalEntry.title": "القيود المحاسبية",
    "journalEntry.create": "إنشاء قيد محاسبي",
    "journalEntry.edit": "تعديل قيد محاسبي",
    "journalEntry.delete": "حذف قيد محاسبي",
    "journalEntry.entryNumber": "رقم القيد",
    "journalEntry.date": "التاريخ",
    "journalEntry.description": "الوصف",
    "journalEntry.debit": "مدين",
    "journalEntry.credit": "دائن",
    "journalEntry.balance": "الرصيد",
    "journalEntry.status": "الحالة",
    "journalEntry.approved": "معتمد",
    "journalEntry.pending": "قيد المراجعة",
    "journalEntry.rejected": "مرفوض",
    
    // الحسابات
    "account.title": "شجرة الحسابات",
    "account.create": "إضافة حساب جديد",
    "account.code": "رمز الحساب",
    "account.name": "اسم الحساب",
    "account.nameEn": "الاسم بالإنجليزية",
    "account.type": "نوع الحساب",
    "account.type.asset": "أصل",
    "account.type.liability": "خصم",
    "account.type.equity": "حقوق ملكية",
    "account.type.revenue": "إيراد",
    "account.type.expense": "مصروف",
    "account.parent": "الحساب الأب",
    "account.balance": "الرصيد",
    "account.description": "الوصف",
    
    // التقارير
    "report.title": "التقارير المالية",
    "report.trialBalance": "ميزان المراجعة",
    "report.yearlyTrialBalance": "ميزان المراجعة السنوي",
    "report.generalLedger": "دفتر الأستاذ الكامل",
    "report.generalLedgerByDealer": "دفتر الأستاذ حسب التاجر",
    "report.accountBalances": "أرصدة الحسابات",
    "report.transactionsByDate": "المعاملات حسب التاريخ",
    "report.transactionsByNumber": "المعاملات حسب الرقم",
    "report.transactionsByType": "المعاملات حسب النوع",
    "report.depreciation": "تقرير الإهلاك",
    "report.finalCost": "التكلفة النهائية",
    "report.finalProfit": "الربح النهائي",
    "report.costCenters": "قائمة مراكز التكلفة",
    
    // الإدارة
    "management.users": "إدارة المستخدمين",
    "management.banks": "إدارة البنوك",
    "management.currencies": "إدارة العملات",
    "management.dealers": "إدارة التجار",
    "management.costCenters": "إدارة مراكز التكلفة",
    "management.permissions": "إدارة الصلاحيات",
    
    // الأزرار والإجراءات
    "action.save": "حفظ",
    "action.cancel": "إلغاء",
    "action.edit": "تعديل",
    "action.delete": "حذف",
    "action.search": "بحث",
    "action.filter": "فلترة",
    "action.export": "تصدير",
    "action.print": "طباعة",
    "action.exportCSV": "تصدير CSV",
    "action.reset": "إعادة تعيين",
    "action.add": "إضافة",
    "action.create": "إنشاء",
    "action.update": "تحديث",
    "action.approve": "الموافقة",
    "action.reject": "رفض",
    "action.logout": "خروج",
    "action.login": "تسجيل الدخول",
    
    // الحقول العامة
    "field.id": "الرمز",
    "field.name": "الاسم",
    "field.nameAr": "الاسم بالعربي",
    "field.nameEn": "الاسم بالإنجليزي",
    "field.code": "الرمز",
    "field.description": "الوصف",
    "field.date": "التاريخ",
    "field.fromDate": "من تاريخ",
    "field.toDate": "إلى تاريخ",
    "field.amount": "المبلغ",
    "field.currency": "العملة",
    "field.currencyRate": "سعر الصرف",
    "field.status": "الحالة",
    "field.active": "نشط",
    "field.inactive": "غير نشط",
    "field.createdAt": "تاريخ الإنشاء",
    "field.updatedAt": "تاريخ التحديث",
    "field.createdBy": "أنشأه",
    "field.updatedBy": "حدثه",
    "field.password": "كلمة المرور",
    "field.username": "اسم المستخدم",
    
    // رسائل
    "message.success.create": "تم الإنشاء بنجاح",
    "message.success.update": "تم التحديث بنجاح",
    "message.success.delete": "تم الحذف بنجاح",
    "message.success.approve": "تمت الموافقة بنجاح",
    "message.error.required": "هذا الحقل مطلوب",
    "message.error.invalid": "القيمة غير صحيحة",
    "message.error.load": "حدث خطأ أثناء تحميل البيانات",
    "message.error.save": "حدث خطأ أثناء الحفظ",
    "message.error.delete": "حدث خطأ أثناء الحذف",
    "message.confirm.delete": "هل أنت متأكد من الحذف؟",
    "message.loading": "جاري التحميل...",
    "message.noData": "لا توجد بيانات",
    
    // المستندات
    "document.type": "نوع المستند",
    "document.number": "رقم المستند",
    "document.date": "تاريخ المستند",
    "document.dueDate": "تاريخ الاستحقاق",
    
    // التاجر ومركز التكلفة
    "dealer.title": "التاجر",
    "dealer.select": "اختر التاجر",
    "costCenter.title": "مركز التكلفة",
    "costCenter.select": "اختر مركز التكلفة",
    
    // الفئات
    "category.1": "الفئة 1",
    "category.2": "الفئة 2",
    "category.3": "الفئة 3",
    "category.4": "الفئة 4",
    "category.5": "الفئة 5",
    
    // الملخصات
    "summary.total": "الإجمالي",
    "summary.count": "العدد",
    "summary.totalDebit": "إجمالي المدين",
    "summary.totalCredit": "إجمالي الدائن",
    "summary.balance": "الرصيد",
    "summary.balanced": "متوازن",
    "summary.notBalanced": "غير متوازن",
    
    // من Dict_ERP_AllInOne.xml
    "dict.ready": "جاهز",
    "dict.searching": "البحث عن المستخدم",
    "dict.notes.date": "التاريخ",
    "dict.notes.debit": "مدين",
    "dict.notes.credit": "دائن",
    "dict.notes.result": "النتيجة",
    "dict.notes.person": "المسؤول",
    "dict.project.name.ar": "المشروع بالعربي",
    "dict.project.name.en": "المشروع بالاجنبي",
    "dict.project.id": "رمز المشروع",
    "dict.project.active": "المشروع مفعل",
  },
  en: {
    // General
    "app.name": "Sigurta Finance System",
    "app.title": "Integrated Financial Management System",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.home": "Home",
    "nav.journalEntries": "Journal Entries",
    "nav.chartOfAccounts": "Chart of Accounts",
    "nav.financialReports": "Financial Reports",
    "nav.expenses": "Expenses",
    "nav.ledger": "Ledger",
    "nav.reports": "Reports",
    
    // Journal Entries
    "journalEntry.title": "Journal Entries",
    "journalEntry.create": "Create Journal Entry",
    "journalEntry.edit": "Edit Journal Entry",
    "journalEntry.delete": "Delete Journal Entry",
    "journalEntry.entryNumber": "Entry Number",
    "journalEntry.date": "Date",
    "journalEntry.description": "Description",
    "journalEntry.debit": "Debit",
    "journalEntry.credit": "Credit",
    "journalEntry.balance": "Balance",
    "journalEntry.status": "Status",
    "journalEntry.approved": "Approved",
    "journalEntry.pending": "Pending",
    "journalEntry.rejected": "Rejected",
    
    // Accounts
    "account.title": "Chart of Accounts",
    "account.create": "Add New Account",
    "account.code": "Account Code",
    "account.name": "Account Name",
    "account.nameEn": "Name (English)",
    "account.type": "Account Type",
    "account.type.asset": "Asset",
    "account.type.liability": "Liability",
    "account.type.equity": "Equity",
    "account.type.revenue": "Revenue",
    "account.type.expense": "Expense",
    "account.parent": "Parent Account",
    "account.balance": "Balance",
    "account.description": "Description",
    
    // Reports
    "report.title": "Financial Reports",
    "report.trialBalance": "Trial Balance",
    "report.yearlyTrialBalance": "Yearly Trial Balance",
    "report.generalLedger": "General Ledger Full",
    "report.generalLedgerByDealer": "General Ledger By Dealer",
    "report.accountBalances": "Account Balances",
    "report.transactionsByDate": "Transactions By Date",
    "report.transactionsByNumber": "Transactions By Number",
    "report.transactionsByType": "Transactions By Type",
    "report.depreciation": "Depreciation Report",
    "report.finalCost": "Final Cost",
    "report.finalProfit": "Final Profit",
    "report.costCenters": "Cost Centers List",
    
    // Management
    "management.users": "Users Management",
    "management.banks": "Banks Management",
    "management.currencies": "Currencies Management",
    "management.dealers": "Dealers Management",
    "management.costCenters": "Cost Centers Management",
    "management.permissions": "Permissions Management",
    
    // Actions
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.export": "Export",
    "action.print": "Print",
    "action.exportCSV": "Export CSV",
    "action.reset": "Reset",
    "action.add": "Add",
    "action.create": "Create",
    "action.update": "Update",
    "action.approve": "Approve",
    "action.reject": "Reject",
    "action.logout": "Logout",
    "action.login": "Login",
    
    // General Fields
    "field.id": "ID",
    "field.name": "Name",
    "field.nameAr": "Name (Arabic)",
    "field.nameEn": "Name (English)",
    "field.code": "Code",
    "field.description": "Description",
    "field.date": "Date",
    "field.fromDate": "From Date",
    "field.toDate": "To Date",
    "field.amount": "Amount",
    "field.currency": "Currency",
    "field.currencyRate": "Currency Rate",
    "field.status": "Status",
    "field.active": "Active",
    "field.inactive": "Inactive",
    "field.createdAt": "Created At",
    "field.updatedAt": "Updated At",
    "field.createdBy": "Created By",
    "field.updatedBy": "Updated By",
    "field.password": "Password",
    "field.username": "Username",
    
    // Messages
    "message.success.create": "Created successfully",
    "message.success.update": "Updated successfully",
    "message.success.delete": "Deleted successfully",
    "message.success.approve": "Approved successfully",
    "message.error.required": "This field is required",
    "message.error.invalid": "Invalid value",
    "message.error.load": "Error loading data",
    "message.error.save": "Error saving data",
    "message.error.delete": "Error deleting data",
    "message.confirm.delete": "Are you sure you want to delete?",
    "message.loading": "Loading...",
    "message.noData": "No data available",
    
    // Documents
    "document.type": "Document Type",
    "document.number": "Document Number",
    "document.date": "Document Date",
    "document.dueDate": "Due Date",
    
    // Dealer and Cost Center
    "dealer.title": "Dealer",
    "dealer.select": "Select Dealer",
    "costCenter.title": "Cost Center",
    "costCenter.select": "Select Cost Center",
    
    // Categories
    "category.1": "Category 1",
    "category.2": "Category 2",
    "category.3": "Category 3",
    "category.4": "Category 4",
    "category.5": "Category 5",
    
    // Summaries
    "summary.total": "Total",
    "summary.count": "Count",
    "summary.totalDebit": "Total Debit",
    "summary.totalCredit": "Total Credit",
    "summary.balance": "Balance",
    "summary.balanced": "Balanced",
    "summary.notBalanced": "Not Balanced",
    
    // From Dict_ERP_AllInOne.xml
    "dict.ready": "Ready",
    "dict.searching": "Searching",
    "dict.notes.date": "Date",
    "dict.notes.debit": "Debit",
    "dict.notes.credit": "Credit",
    "dict.notes.result": "Result",
    "dict.notes.person": "Person",
    "dict.project.name.ar": "Project Arabic Name",
    "dict.project.name.en": "Project English Name",
    "dict.project.id": "Project ID",
    "dict.project.active": "Project Is Active",
  },
};

// الحصول على اللغة الحالية من localStorage أو استخدام العربية كافتراضي
export const getCurrentLanguage = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("language") || "ar";
  }
  return "ar";
};

// تعيين اللغة
export const setLanguage = (lang: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang);
  }
};

// الحصول على الترجمة
export const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
  const lang = getCurrentLanguage();
  const translation = translations[lang]?.[key] || translations["ar"]?.[key] || key;
  
  // استبدال المعاملات في النص
  if (params) {
    return Object.entries(params).reduce(
      (text, [paramKey, paramValue]) => text.replace(`{${paramKey}}`, String(paramValue)),
      translation
    );
  }
  
  return translation;
};

// Hook للاستخدام في React Components (يجب استيراده من React في المكونات)
export const useTranslation = () => {
  // هذا سيتم استخدامه في المكونات مع useState من React
  return {
    t: (key: TranslationKey, params?: Record<string, string | number>) => t(key, params),
    language: getCurrentLanguage(),
    changeLanguage: setLanguage,
  };
};

// إعادة التصدير للاستخدام المباشر
export default {
  t,
  setLanguage,
  getCurrentLanguage,
  useTranslation,
};
