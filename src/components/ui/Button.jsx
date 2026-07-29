import React from "react";
import { LoaderCircle } from "lucide-react";

export const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

const variantClasses = {
  default:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-100",

  destructive:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-100",

  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-100",

  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-200",

  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-200",

  link:
    "h-auto rounded-none bg-transparent p-0 text-red-600 underline-offset-4 hover:text-red-700 hover:underline focus-visible:ring-red-100",

  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-100",

  warning:
    "bg-amber-500 text-white shadow-sm hover:bg-amber-600 focus-visible:ring-amber-100",
};

const sizeClasses = {
  default: "min-h-10 px-4 py-2.5 text-sm",
  sm: "min-h-9 px-3.5 py-2 text-xs",
  lg: "min-h-12 px-6 py-3 text-base",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-9 w-9 p-0",
  "icon-lg": "h-12 w-12 p-0",
};

const Button = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      size = "default",
      disabled = false,
      loading = false,
      loadingText = "Please wait...",
      fullWidth = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold",
          "transition duration-200",
          "focus-visible:outline-none focus-visible:ring-4",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "active:scale-[0.98]",
          variantClasses[variant] || variantClasses.default,
          sizeClasses[size] || sizeClasses.default,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <LoaderCircle
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {LeftIcon && (
              <LeftIcon
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
            )}

            {children}

            {RightIcon && (
              <RightIcon
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;