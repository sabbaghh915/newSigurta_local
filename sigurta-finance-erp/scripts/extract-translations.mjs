// سكريبت لاستخراج الترجمات من ملف Dict_ERP_AllInOne.xml
// يمكن تشغيله باستخدام: node scripts/extract-translations.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmlFilePath = path.join(__dirname, '../../Erp_AllInOne_Secure/Dict_ERP_AllInOne.xml');
const outputPath = path.join(__dirname, '../src/lib/translations-extracted.json');

try {
  console.log('📖 قراءة ملف XML...');
  const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');
  
  // استخراج جميع السجلات باستخدام regex
  const dictMatches = xmlContent.matchAll(/<Tbl_Dict>[\s\S]*?<\/Tbl_Dict>/g);
  
  const translations = {
    ar: {},
    en: {}
  };
  
  let count = 0;
  
  for (const match of dictMatches) {
    const block = match[0];
    
    const keyMatch = block.match(/<Key>(.*?)<\/Key>/);
    const englishMatch = block.match(/<WEnglish>(.*?)<\/WEnglish>/);
    const arabicMatch = block.match(/<WArabic>(.*?)<\/WArabic>/);
    
    if (keyMatch && (englishMatch || arabicMatch)) {
      const key = keyMatch[1].trim();
      const english = englishMatch ? englishMatch[1].trim() : '';
      const arabic = arabicMatch ? arabicMatch[1].trim() : '';
      
      // تحويل المفتاح إلى تنسيق مناسب
      const normalizedKey = key
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, '.')
        .replace(/^\.+|\.+$/g, '')
        .substring(0, 50) || `dict.${count}`;
      
      if (arabic) translations.ar[normalizedKey] = arabic;
      if (english) translations.en[normalizedKey] = english;
      
      count++;
    }
  }
  
  // حفظ النتائج
  fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
  
  console.log(`✅ تم استخراج ${count} ترجمة بنجاح!`);
  console.log(`📁 الملف المحفوظ: ${outputPath}`);
  console.log(`📊 عدد المفاتيح العربية: ${Object.keys(translations.ar).length}`);
  console.log(`📊 عدد المفاتيح الإنجليزية: ${Object.keys(translations.en).length}`);
} catch (error) {
  console.error('❌ خطأ:', error.message);
  console.error(error.stack);
}
