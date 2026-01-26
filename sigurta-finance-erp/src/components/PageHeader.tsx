import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, LayoutDashboard } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "../hooks/useTranslation";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  showDashboard?: boolean;
  showHome?: boolean;
  actions?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  icon,
  showDashboard = true,
  showHome = true,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border-b border-purple-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-purple-100">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <LanguageSwitcher />
            {showDashboard && (
              <Button
                variant="outline"
                onClick={() => navigate("/finance-dashboard")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
              >
                <LayoutDashboard className="w-4 h-4 ml-2" />
                {t("nav.dashboard")}
              </Button>
            )}
            {showHome && (
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 font-medium"
              >
                <Home className="w-4 h-4 ml-2" />
                {t("nav.home")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
