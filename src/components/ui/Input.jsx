import React, {
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import {
  Eye,
  EyeOff,
  Search,
  X,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const sizeClasses = {
  sm: "min-h-9 px-3 py-2 text-xs",
  default: "min-h-11 px-3.5 py-2.5 text-sm",
  lg: "min-h-12 px-4 py-3 text-base",
};

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      ref.current = node;
    });
  };
}

function getValueLength(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  return String(value).length;
}

const Input = React.forwardRef(
  (
    {
      type = "text",
      size = "default",
      className = "",
      wrapperClassName = "",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      error = false,
      showPasswordToggle = false,
      clearable = false,
      onClear,
      disabled = false,
      readOnly = false,
      loading = false,
      value,
      defaultValue = "",
      onChange,
      id,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const internalRef = useRef(null);

    const isControlled = value !== undefined;

    const [uncontrolledValue, setUncontrolledValue] =
      useState(defaultValue);

    const [isPasswordVisible, setIsPasswordVisible] =
      useState(false);

    const isPasswordField = type === "password";

    const resolvedType =
      isPasswordField && showPasswordToggle
        ? isPasswordVisible
          ? "text"
          : "password"
        : type;

    const currentValue = isControlled
      ? value
      : uncontrolledValue;

    const hasValue =
      getValueLength(currentValue) > 0;

    const showClearButton =
      clearable &&
      hasValue &&
      !disabled &&
      !readOnly &&
      !loading;

    const showPasswordButton =
      isPasswordField &&
      showPasswordToggle &&
      !loading;

    const showRightIcon =
      RightIcon &&
      !showPasswordButton &&
      !showClearButton &&
      !loading;

    const hasRightControl =
      showPasswordButton ||
      showClearButton ||
      showRightIcon ||
      loading;

    const handleChange = useCallback(
      (event) => {
        if (!isControlled) {
          setUncontrolledValue(
            event.target.value
          );
        }

        onChange?.(event);
      },
      [isControlled, onChange]
    );

    const handleClear = useCallback(() => {
      if (typeof onClear === "function") {
        onClear();
      } else {
        if (!isControlled) {
          setUncontrolledValue("");
        }

        if (typeof onChange === "function") {
          const input =
            internalRef.current;

          if (input) {
            const nativeValueSetter =
              Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value"
              )?.set;

            nativeValueSetter?.call(
              input,
              ""
            );

            input.dispatchEvent(
              new Event("input", {
                bubbles: true,
              })
            );
          }
        }
      }

      requestAnimationFrame(() => {
        internalRef.current?.focus();
      });
    }, [
      isControlled,
      onChange,
      onClear,
    ]);

    const togglePasswordVisibility =
      useCallback(() => {
        setIsPasswordVisible(
          (current) => !current
        );

        requestAnimationFrame(() => {
          internalRef.current?.focus();
        });
      }, []);

    return (
      <div
        className={cn(
          "relative w-full",
          wrapperClassName
        )}
      >
        {LeftIcon && (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5",
              error
                ? "text-red-500"
                : "text-slate-400 dark:text-slate-500"
            )}
          >
            <LeftIcon
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>
        )}

        <input
          ref={mergeRefs(
            internalRef,
            forwardedRef
          )}
          id={inputId}
          type={resolvedType}
          value={
            isControlled
              ? value
              : uncontrolledValue
          }
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={
            error ? "true" : undefined
          }
          aria-describedby={
            ariaDescribedBy
          }
          aria-busy={
            loading || undefined
          }
          className={cn(
            "flex w-full rounded-xl border bg-slate-50 text-slate-900 shadow-sm outline-none transition duration-200",
            "placeholder:text-slate-400",
            "hover:border-slate-300",
            "focus:bg-white focus:ring-4",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70",
            "read-only:cursor-default read-only:bg-slate-100",
            "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
            "dark:hover:border-slate-600",
            "dark:focus:bg-slate-900",
            "dark:disabled:bg-slate-800 dark:disabled:text-slate-500",
            "dark:read-only:bg-slate-800",
            sizeClasses[size] ||
              sizeClasses.default,
            LeftIcon && "pl-10",
            hasRightControl &&
              "pr-10",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-950/60"
              : "border-slate-200 focus:border-red-500 focus:ring-red-100 dark:border-slate-700 dark:focus:border-red-500 dark:focus:ring-red-950/60",
            className
          )}
          {...props}
        />

        {loading && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-600 dark:border-slate-600 dark:border-t-red-500"
              aria-hidden="true"
            />

            <span className="sr-only">
              Loading
            </span>
          </span>
        )}

        {showRightIcon && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500">
            <RightIcon
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>
        )}

        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute inset-y-0 right-0 flex items-center px-3.5",
              "text-slate-400 transition hover:text-slate-700",
              "focus-visible:outline-none focus-visible:text-red-600",
              "dark:text-slate-500 dark:hover:text-slate-200 dark:focus-visible:text-red-400"
            )}
            aria-label={
              props["aria-label"]
                ? `Clear ${props["aria-label"]}`
                : "Clear input"
            }
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        )}

        {showPasswordButton && (
          <button
            type="button"
            onClick={
              togglePasswordVisibility
            }
            disabled={disabled}
            className={cn(
              "absolute inset-y-0 right-0 flex items-center px-3.5",
              "text-slate-400 transition hover:text-slate-700",
              "focus-visible:outline-none focus-visible:text-red-600",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "dark:text-slate-500 dark:hover:text-slate-200 dark:focus-visible:text-red-400"
            )}
            aria-label={
              isPasswordVisible
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={
              isPasswordVisible
            }
          >
            {isPasswordVisible ? (
              <EyeOff
                className="h-4 w-4"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const SearchInput =
  React.forwardRef(
    (
      {
        className = "",
        onClear,
        ...props
      },
      ref
    ) => {
      return (
        <Input
          ref={ref}
          type="search"
          leftIcon={Search}
          clearable
          onClear={onClear}
          className={cn(
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            className
          )}
          {...props}
        />
      );
    }
  );

SearchInput.displayName =
  "SearchInput";

export default Input;