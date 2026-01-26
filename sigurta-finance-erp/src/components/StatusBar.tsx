import { ReactNode } from "react";
import { cn } from "../lib/utils";

type StatusBarItem = {
  id: string;
  content: ReactNode;
  align?: "left" | "right";
};

type StatusBarProps = {
  items?: StatusBarItem[];
  className?: string;
  children?: ReactNode;
};

export default function StatusBar({ items = [], className, children }: StatusBarProps) {
  const leftItems = items.filter((item) => item.align !== "right");
  const rightItems = items.filter((item) => item.align === "right");

  return (
    <div
      className={cn(
        "bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600",
        className
      )}
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        {leftItems.map((item) => (
          <div key={item.id}>{item.content}</div>
        ))}
        {children}
      </div>
      <div className="flex items-center gap-4">
        {rightItems.map((item) => (
          <div key={item.id}>{item.content}</div>
        ))}
      </div>
    </div>
  );
}
