// server/utils/normalize.ts

export function normKey(v: any) {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[-_]/g, "")
    .toUpperCase();
}

// ✅ الدالة الأساسية
export function normPlate(plateRegion: any, plateNumber: any) {
  const r = String(plateRegion ?? "").trim().toUpperCase();
  const p = String(plateNumber ?? "").trim().toUpperCase();
  return `${r}|${p}`;
}

// ✅ Alias حتى لو السكربت يستعمل اسم مختلف
export const normPlateKey = normPlate;

export function normArabicName(name: any) {
  let s = String(name ?? "").trim();
  s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, ""); // تشكيل + تطويل
  s = s.replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
  s = s.replace(/[^\u0600-\u06FF\w\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
