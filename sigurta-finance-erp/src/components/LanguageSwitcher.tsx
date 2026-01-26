import { useTranslation } from "../hooks/useTranslation";
import { Button } from "./ui/button";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useTranslation();
  
  const toggleLanguage = () => {
    changeLanguage(language === "ar" ? "en" : "ar");
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Languages className="w-4 h-4" />
      <span>{language === "ar" ? "English" : "العربية"}</span>
    </Button>
  );
}
