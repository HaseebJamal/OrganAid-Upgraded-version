import React, {
  createContext,
  useContext,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const TabsContext = createContext(null);

const listVariants = {
  default:
    "rounded-xl bg-slate-100 p-1",

  underline:
    "border-b border-slate-200 bg-transparent p-0",

  pills:
    "flex-wrap gap-2 bg-transparent p-0",
};

const triggerVariants = {
  default: {
    base:
      "rounded-lg px-3.5 py-2 text-sm font-semibold",
    active:
      "bg-white text-slate-950 shadow-sm",
    inactive:
      "text-slate-500 hover:bg-white/70 hover:text-slate-900",
  },

  underline: {
    base:
      "relative rounded-none border-b-2 px-4 py-3 text-sm font-semibold",
    active:
      "border-red-600 text-red-700",
    inactive:
      "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900",
  },

  pills: {
    base:
      "rounded-full border px-4 py-2 text-sm font-semibold",
    active:
      "border-red-200 bg-red-50 text-red-700",
    inactive:
      "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50/50 hover:text-red-700",
  },
};

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className = "",
  orientation = "horizontal",
}) {
  const [internalValue, setInternalValue] =
    useState(defaultValue);

  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  const setActiveValue = useCallback((nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }, [isControlled, onValueChange]);

  const contextValue = useMemo(
    () => ({
      activeValue,
      setActiveValue,
      orientation,
    }),
    [activeValue, orientation, setActiveValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={cn(
          orientation === "vertical"
            ? "flex gap-6"
            : "w-full",
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className = "",
  variant = "default",
  "aria-label": ariaLabel = "Tabs",
  ...props
}) {
  const context = useTabsContext();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={context.orientation}
      className={cn(
        "flex",
        context.orientation === "vertical"
          ? "flex-col"
          : "items-center",
        listVariants[variant] ||
          listVariants.default,
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        return React.cloneElement(child, {
          variant: child.props.variant || variant,
        });
      })}
    </div>
  );
}

export const TabsTrigger = React.forwardRef(
  (
    {
      value,
      children,
      className = "",
      variant = "default",
      disabled = false,
      icon: Icon,
      badge,
      ...props
    },
    ref
  ) => {
    const context = useTabsContext();
    const generatedId = useId();

    const isActive = context.activeValue === value;
    const styles =
      triggerVariants[variant] ||
      triggerVariants.default;

    function handleClick() {
      if (!disabled) {
        context.setActiveValue(value);
      }
    }

    function handleKeyDown(event) {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        handleClick();
      }
    }

    return (
      <button
        ref={ref}
        id={`tab-${generatedId}`}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${generatedId}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap transition duration-200",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
          "disabled:cursor-not-allowed disabled:opacity-50",
          styles.base,
          isActive
            ? styles.active
            : styles.inactive,
          className
        )}
        {...props}
      >
        {Icon && (
          <Icon
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          />
        )}

        <span>{children}</span>

        {badge !== undefined && badge !== null && (
          <span
            className={cn(
              "grid min-h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
              isActive
                ? "bg-red-100 text-red-700"
                : "bg-slate-200 text-slate-600"
            )}
          >
            {badge}
          </span>
        )}
      </button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

export function TabsContent({
  value,
  children,
  className = "",
  forceMount = false,
  ...props
}) {
  const context = useTabsContext();
  const isActive = context.activeValue === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      tabIndex={0}
      className={cn(
        context.orientation === "horizontal"
          ? "mt-5"
          : "min-w-0 flex-1",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error(
      "Tabs components must be used inside <Tabs>."
    );
  }

  return context;
}
