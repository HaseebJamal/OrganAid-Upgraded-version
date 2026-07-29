import React, {
  forwardRef,
  useEffect,
  useRef,
} from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const sizeClasses = {
  sm: "min-h-[90px] px-3 py-2 text-sm",
  default: "min-h-[120px] px-4 py-3 text-sm",
  lg: "min-h-[180px] px-4 py-4 text-base",
};

const Textarea = forwardRef(
  (
    {
      className = "",
      wrapperClassName = "",
      size = "default",
      error = false,
      disabled = false,
      autoResize = false,
      maxLength,
      showCounter = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef(null);

    const textareaRef = ref || internalRef;

    useEffect(() => {
      if (!autoResize) return;

      const textarea =
        textareaRef.current ||
        internalRef.current;

      if (!textarea) return;

      textarea.style.height = "auto";
      textarea.style.height =
        textarea.scrollHeight + "px";
    }, [value, autoResize, textareaRef]);

    return (
      <div className={cn("w-full", wrapperClassName)}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={error || undefined}
          className={cn(
            "block w-full resize-y rounded-2xl border bg-slate-50 text-slate-900 shadow-sm transition duration-200",
            "placeholder:text-slate-400",
            "focus:bg-white focus:outline-none focus:ring-4",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70",
            autoResize &&
              "resize-none overflow-hidden",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-red-500 focus:ring-red-100",
            sizeClasses[size] ||
              sizeClasses.default,
            className
          )}
          {...props}
        />

        {(showCounter && maxLength) && (
          <div className="mt-2 flex justify-end">
            <span
              className={cn(
                "text-xs",
                value?.length >= maxLength
                  ? "text-red-600"
                  : "text-slate-500"
              )}
            >
              {(value?.length || 0)} / {maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;