import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition border-2",
          variant === "default" &&
            "text-white hover:opacity-90 border-violet-700",
          variant === "outline" &&
            "border-violet-600 bg-white hover:bg-gray-100 text-slate-900",
          variant === "destructive" &&
            "bg-red-600 text-white hover:bg-red-700 border-red-700",
          className
        )}
        style={
          variant === "default"
            ? { background: "linear-gradient(135deg, #d8b4f3 0%, #e9d5ff 100%)", color: "#5b21b6", ...props.style }
            : props.style
        }
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
