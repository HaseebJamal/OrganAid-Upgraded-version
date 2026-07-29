import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variants = {
  default:
    "border-slate-200 bg-white",

  elevated:
    "border-slate-200 bg-white shadow-lg shadow-slate-200/60",

  outlined:
    "border-2 border-slate-200 bg-white",

  danger:
    "border-red-200 bg-red-50",

  success:
    "border-emerald-200 bg-emerald-50",

  warning:
    "border-amber-200 bg-amber-50",
};

const padding = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      padding: cardPadding = "none",
      hover = false,
      clickable = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border transition-all duration-300",

          variants[variant] || variants.default,

          padding[cardPadding],

          hover &&
            "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70",

          clickable &&
            "cursor-pointer active:scale-[0.99]",

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-slate-100 p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}) {
  return (
    <h3
      className={cn(
        "text-xl font-bold tracking-tight text-slate-900",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}) {
  return (
    <p
      className={cn(
        "text-sm leading-6 text-slate-500",
        className
      )}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-slate-100 p-6",
        className
      )}
    >
      {children}
    </div>
  );
}