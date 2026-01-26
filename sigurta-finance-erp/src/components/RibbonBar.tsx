import { ReactNode } from "react";
import { cn } from "../lib/utils";

export type RibbonTab = {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};

type RibbonBarProps = {
  tabs: RibbonTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
};

export default function RibbonBar({
  tabs,
  activeTab,
  onTabChange,
  className,
}: RibbonBarProps) {
  const currentTab = activeTab || tabs[0]?.id;
  const activeTabContent = tabs.find((tab) => tab.id === currentTab);

  return (
    <div className={cn("bg-white border-b border-gray-200 shadow-sm", className)}>
      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 bg-gray-50 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              "hover:bg-gray-100 rounded-t-lg",
              currentTab === tab.id
                ? "bg-white text-primary-600 border-t border-l border-r border-gray-200"
                : "text-gray-600"
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTabContent && (
        <div className="px-4 py-3 bg-white min-h-[80px]">
          {activeTabContent.content}
        </div>
      )}
    </div>
  );
}
