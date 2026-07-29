import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Info,
  ShieldCheck,
  XCircle,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variantClasses = {
  default:
    "border-slate-200 bg-slate-100 text-slate-700",

  primary:
    "border-red-200 bg-red-50 text-red-700",

  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  warning:
    "border-amber-200 bg-amber-50 text-amber-700",

  destructive:
    "border-red-200 bg-red-50 text-red-700",

  info:
    "border-blue-200 bg-blue-50 text-blue-700",

  violet:
    "border-violet-200 bg-violet-50 text-violet-700",

  outline:
    "border-slate-300 bg-white text-slate-700",

  dark:
    "border-slate-800 bg-slate-900 text-white",
};

const sizeClasses = {
  sm: "min-h-5 px-2 py-0.5 text-[10px]",
  default: "min-h-6 px-2.5 py-1 text-xs",
  lg: "min-h-8 px-3.5 py-1.5 text-sm",
};

const statusConfig = {
  active: {
    label: "Active",
    variant: "success",
    icon: CheckCircle2,
  },

  inactive: {
    label: "Inactive",
    variant: "default",
    icon: Clock3,
  },

  enabled: {
    label: "Enabled",
    variant: "success",
    icon: CheckCircle2,
  },

  disabled: {
    label: "Disabled",
    variant: "default",
    icon: XCircle,
  },

  verified: {
    label: "Verified",
    variant: "success",
    icon: ShieldCheck,
  },

  approved: {
    label: "Approved",
    variant: "success",
    icon: CheckCircle2,
  },

  pending: {
    label: "Pending",
    variant: "warning",
    icon: Clock3,
  },

  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
  },

  cancelled: {
    label: "Cancelled",
    variant: "default",
    icon: XCircle,
  },

  available: {
    label: "Available",
    variant: "success",
    icon: CheckCircle2,
  },

  unavailable: {
    label: "Unavailable",
    variant: "default",
    icon: XCircle,
  },

  matched: {
    label: "Matched",
    variant: "violet",
    icon: ShieldCheck,
  },

  critical: {
    label: "Critical",
    variant: "destructive",
    icon: AlertCircle,
  },

  urgent: {
    label: "Urgent",
    variant: "warning",
    icon: AlertCircle,
  },

  completed: {
    label: "Completed",
    variant: "success",
    icon: CheckCircle2,
  },

  processing: {
    label: "Processing",
    variant: "info",
    icon: Clock3,
  },

  unread: {
    label: "Unread",
    variant: "primary",
    icon: Info,
  },

  read: {
    label: "Read",
    variant: "default",
    icon: CheckCircle2,
  },
};

const Badge = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      size = "default",
      icon: Icon,
      dot = false,
      rounded = "full",
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 border font-semibold leading-none",
          "transition duration-200",
          rounded === "full"
            ? "rounded-full"
            : "rounded-lg",
          variantClasses[variant] ||
            variantClasses.default,
          sizeClasses[size] || sizeClasses.default,
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
            aria-hidden="true"
          />
        )}

        {Icon && (
          <Icon
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
        )}

        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = "Badge";

export function StatusBadge({
  status,
  label,
  icon = true,
  className = "",
  size = "default",
  ...props
}) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const config =
    statusConfig[normalizedStatus] || {
      label: formatLabel(status) || "Unknown",
      variant: "default",
      icon: Info,
    };

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={icon ? config.icon : undefined}
      className={className}
      {...props}
    >
      {label || config.label}
    </Badge>
  );
}

function formatLabel(value) {
  if (!value) return "";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

export default Badge;