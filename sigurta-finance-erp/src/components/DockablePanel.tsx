import { ReactNode, useState } from "react";
import { X, Maximize2, Minimize2, GripVertical } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

type DockablePanelProps = {
  id: string;
  title: string;
  children: ReactNode;
  defaultDock?: "left" | "right" | "top" | "bottom";
  defaultWidth?: number;
  defaultHeight?: number;
  resizable?: boolean;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
};

export default function DockablePanel({
  id,
  title,
  children,
  defaultDock = "right",
  defaultWidth = 300,
  defaultHeight = 400,
  resizable = true,
  closable = true,
  onClose,
  className,
}: DockablePanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFloating, setIsFloating] = useState(false);

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col",
        isMinimized && "h-auto",
        className
      )}
      style={{
        width: isMinimized ? "auto" : defaultWidth,
        height: isMinimized ? "auto" : defaultHeight,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="w-3 h-3" />
            ) : (
              <Minimize2 className="w-3 h-3" />
            )}
          </Button>
          {closable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto p-3">{children}</div>
      )}
    </div>
  );
}
