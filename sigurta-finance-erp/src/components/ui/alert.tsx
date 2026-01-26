import { cn } from "../../lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

const Alert = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:right-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pr-7",
        {
          "bg-background text-foreground": variant === "default",
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive":
            variant === "destructive",
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
