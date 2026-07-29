import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  XCircle,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variants = {
  default: {
    container:
      "border-slate-200 bg-white text-slate-800",
    icon: Info,
    iconColor: "text-slate-500",
  },

  success: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },

  warning: {
    container:
      "border-amber-200 bg-amber-50 text-amber-900",
    icon: TriangleAlert,
    iconColor: "text-amber-600",
  },

  destructive: {
    container:
      "border-red-200 bg-red-50 text-red-900",
    icon: XCircle,
    iconColor: "text-red-600",
  },

  info: {
    container:
      "border-blue-200 bg-blue-50 text-blue-900",
    icon: AlertCircle,
    iconColor: "text-blue-600",
  },
};

export function Alert({
  children,
  variant = "default",
  className = "",
  icon = true,
}) {
  const config = variants[variant] || variants.default;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200",
        config.container,
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            "mt-0.5 shrink-0",
            config.iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}

export function AlertTitle({
  children,
  className = "",
}) {
  return (
    <h4
      className={cn(
        "text-base font-semibold",
        className
      )}
    >
      {children}
    </h4>
  );
}

export function AlertDescription({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "mt-1 text-sm leading-6 opacity-90",
        className
      )}
    >
      {children}
    </div>
  );
}