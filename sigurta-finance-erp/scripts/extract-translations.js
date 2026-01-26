// سكريبت لاستخراج الترجمات من ملف Dict_ERP_AllInOne.xml
// يمكن تشغيله باستخدام: node scripts/extract-translations.js

const fs = require('fs');
const path = require('path');

const xmlFilePath = path.join(__dirname, '../../Erp_AllInOne_Secure/Dict_ERP_AllInOne.xml');
const outputPath = path.join(__dirname, '../src/lib/translations-extracted.json');

try {
  const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');
  
  // استخراج جميع السجلات
  const keyMatches = xmlContent.matchAll(/<Key>(.*?)<\/Key>/g);
  const englishMatches = xmlContent.matchAll(/<WEnglish>(.*?)<\/WEnglish>/g);
  const arabicMatches = xmlContent.matchAll(/<WArabic>(.*?)<\/WArabic>/g);
  
  const keys = Array.from(keyMatches).map(m => m[1].trim());
  const english = Array.from(englishMatches).map(m => m[1].trim());
  const arabic = Array.from(arabicMatches).map(m => m[1].trim());
  
  // دمج الترجمات
  const translations = {
    ar: {},
    en: {}
  };
  
  const minLength = Math.min(keys.length, english.length, arabic.length);
  
  for (let i = 0; i < minLength; i++) {
    const key = keys[i]?.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.') || `key.${i}`;
    if (arabic[i]) translations.ar[key] = arabic[i];
    if (english[i]) translations.en[key] = english[i];
  }
  
  // حفظ النتائج
  fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
  
  console.log(`✅ تم استخراج ${minLength} ترجمة بنجاح!`);
  console.log(`📁 الملف المحفوظ: ${outputPath}`);
} catch (error) {
  console.error('❌ خطأ:', error.message);
}
