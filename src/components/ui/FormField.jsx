import { AlertCircle } from "lucide-react";

import Input from "./Input";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FormField({
  label,
  name,
  required = false,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = "",
  labelClassName = "",
  labelAction,
  disabled = false,
  ...inputProps
}) {
  const inputId = inputProps.id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const describedBy = [errorId, hintId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div
      className={cn(
        "space-y-2",
        disabled && "opacity-75",
        className
      )}
    >
      {(label || labelAction) && (
        <div className="flex items-center justify-between gap-3">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "block text-sm font-semibold text-slate-800",
                disabled && "cursor-not-allowed",
                labelClassName
              )}
            >
              {label}

              {required && (
                <>
                  <span
                    className="ml-1 text-red-600"
                    aria-hidden="true"
                  >
                    *
                  </span>

                  <span className="sr-only">
                    Required
                  </span>
                </>
              )}
            </label>
          )}

          {labelAction && (
            <div className="shrink-0">
              {labelAction}
            </div>
          )}
        </div>
      )}

      <Input
        id={inputId}
        name={name}
        required={required}
        disabled={disabled}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        error={Boolean(error)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />

      {error && (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />

          <span>{error}</span>
        </p>
      )}

      {hint && (
        <p
          id={hintId}
          className={cn(
            "text-xs leading-5",
            error
              ? "text-slate-400"
              : "text-slate-500"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}