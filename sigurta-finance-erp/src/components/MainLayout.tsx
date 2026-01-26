import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, LayoutDashboard, LogOut } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "../hooks/useTranslation";
import RibbonBar, { RibbonTab } from "./RibbonBar";
import StatusBar from "./StatusBar";
import DockablePanel from "./DockablePanel";
import { cn } from "../lib/utils";

type MainLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  showDashboard?: boolean;
  showHome?: boolean;
  actions?: ReactNode;
  ribbonTabs?: RibbonTab[];
  statusBarItems?: Array<{
    id: string;
    content: ReactNode;
    align?: "left" | "right";
  }>;
  rightPanels?: Array<{
    id: string;
    title: string;
    content: ReactNode;
  }>;
};

export default function MainLayout({
  children,
  title,
  subtitle,
  icon,
  showDashboard = true,
  showHome = true,
  actions,
  ribbonTabs,
  statusBarItems = [],
  rightPanels = [],
}: MainLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeRibbonTab, setActiveRibbonTab] = useState<string | undefined>(
    ribbonTabs?.[0]?.id
  );
  const [openPanels, setOpenPanels] = useState<Set<string>>(
    new Set(rightPanels.map((p) => p.id))
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const visiblePanels = rightPanels.filter((panel) => openPanels.has(panel.id));

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* Top Bar - App Title & Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm border-b border-purple-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  {icon}
                </div>
              )}
              {title && (
                <div>
                  <h1 className="text-lg font-bold text-white">{title}</h1>
                  {subtitle && (
                    <p className="text-xs text-purple-100">{subtitle}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {actions}
              <LanguageSwitcher />
              {showDashboard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/finance-dashboard")}
                  className="h-8 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <LayoutDashboard className="w-4 h-4 ml-2" />
                  {t("nav.dashboard")}
                </Button>
              )}
              {showHome && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="h-8 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Home className="w-4 h-4 ml-2" />
                  {t("nav.home")}
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="h-8 bg-red-500 hover:bg-red-600 text-white"
              >
                <LogOut className="w-4 h-4 ml-2" />
                {t("action.logout")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ribbon Bar */}
      {ribbonTabs && ribbonTabs.length > 0 && (
        <RibbonBar
          tabs={ribbonTabs}
          activeTab={activeRibbonTab}
          onTabChange={setActiveRibbonTab}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div
          className={cn(
            "flex-1 overflow-auto",
            visiblePanels.length > 0 && "mr-4"
          )}
        >
          <div className="container mx-auto p-6">{children}</div>
        </div>

        {/* Right Side Panels */}
        {visiblePanels.length > 0 && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 space-y-4 overflow-y-auto">
            {visiblePanels.map((panel) => (
              <DockablePanel
                key={panel.id}
                id={panel.id}
                title={panel.title}
                defaultWidth={300}
                defaultHeight={200}
                onClose={() => {
                  setOpenPanels((prev) => {
                    const next = new Set(prev);
                    next.delete(panel.id);
                    return next;
                  });
                }}
              >
                {panel.content}
              </DockablePanel>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar items={statusBarItems}>
        <div className="text-xs text-gray-500">
          {t("dict.ready") || "جاهز"}
        </div>
      </StatusBar>
    </div>
  );
}
