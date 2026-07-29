import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const DialogContext = createContext(null);

const sizeClasses = {
  sm: "max-w-sm",
  default: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    });
  };
}

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll(FOCUSABLE_SELECTOR)
  ).filter((element) => {
    const styles = window.getComputedStyle(element);

    return (
      styles.display !== "none" &&
      styles.visibility !== "hidden" &&
      !element.hasAttribute("hidden") &&
      element.getAttribute("aria-hidden") !== "true"
    );
  });
}

export function Dialog({
  open,
  onOpenChange,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  restoreFocus = true,
}) {
  const contentRef = useRef(null);
  const triggerRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const pointerDownTargetRef = useRef(null);

  const titleId = useId();
  const descriptionId = useId();

  const closeDialog = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return undefined;
    }

    const triggerElement = triggerRef.current;

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (!closeOnEscape) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        closeDialog();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const content = contentRef.current;

      if (!content) {
        return;
      }

      const focusableElements =
        getFocusableElements(content);

      if (focusableElements.length === 0) {
        event.preventDefault();
        content.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      const activeElement =
        document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstElement ||
          !content.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (
        !event.shiftKey &&
        activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
      true
    );

    const animationFrame =
      window.requestAnimationFrame(() => {
        const content = contentRef.current;

        if (!content) {
          return;
        }

        const autofocusElement =
          content.querySelector(
            "[data-autofocus]"
          );

        if (
          autofocusElement instanceof
          HTMLElement
        ) {
          autofocusElement.focus();
          return;
        }

        const focusableElements =
          getFocusableElements(content);

        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          content.focus();
        }
      });

    return () => {
      window.cancelAnimationFrame(
        animationFrame
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
        true
      );

      document.body.style.overflow =
        previousOverflow;

      document.body.style.paddingRight =
        previousPaddingRight;

      if (!restoreFocus) {
        return;
      }

      window.requestAnimationFrame(() => {
        const focusTarget =
          triggerElement ||
          previouslyFocusedElementRef.current;

        focusTarget?.focus?.();
      });
    };
  }, [
    open,
    closeOnEscape,
    closeDialog,
    restoreFocus,
  ]);

  const contextValue = useMemo(
    () => ({
      closeDialog,
      triggerRef,
      contentRef,
      titleId,
      descriptionId,
    }),
    [
      closeDialog,
      titleId,
      descriptionId,
    ]
  );

  if (
    !open ||
    typeof document === "undefined"
  ) {
    return null;
  }

  function handleOverlayPointerDown(event) {
    pointerDownTargetRef.current =
      event.target;
  }

  function handleOverlayPointerUp(event) {
    const startedOnOverlay =
      pointerDownTargetRef.current ===
      event.currentTarget;

    const endedOnOverlay =
      event.target === event.currentTarget;

    pointerDownTargetRef.current = null;

    if (
      closeOnOverlayClick &&
      startedOnOverlay &&
      endedOnOverlay
    ) {
      closeDialog();
    }
  }

  return createPortal(
    <DialogContext.Provider
      value={contextValue}
    >
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
        onPointerDown={
          handleOverlayPointerDown
        }
        onPointerUp={
          handleOverlayPointerUp
        }
      >
        <div
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          aria-hidden="true"
        />

        {children}
      </div>
    </DialogContext.Provider>,
    document.body
  );
}

export const DialogTrigger =
  React.forwardRef(
    (
      {
        children,
        onClick,
        asChild = false,
        className = "",
        ...props
      },
      forwardedRef
    ) => {
      const context =
        useContext(DialogContext);

      const triggerRef = mergeRefs(
        context?.triggerRef,
        forwardedRef
      );

      function handleClick(event) {
        if (
          asChild &&
          React.isValidElement(children)
        ) {
          children.props.onClick?.(event);
        }

        if (!event.defaultPrevented) {
          onClick?.(event);
        }
      }

      if (
        asChild &&
        React.isValidElement(children)
      ) {
        return React.cloneElement(
          children,
          {
            ...props,
            ...children.props,
            ref: triggerRef,
            onClick: handleClick,
            className: cn(
              children.props.className,
              className
            ),
          }
        );
      }

      return (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleClick}
          className={className}
          {...props}
        >
          {children}
        </button>
      );
    }
  );

DialogTrigger.displayName =
  "DialogTrigger";

export const DialogContent =
  React.forwardRef(
    (
      {
        children,
        className = "",
        size = "default",
        showCloseButton = true,
        "aria-label": ariaLabel,
        ...props
      },
      forwardedRef
    ) => {
      const context =
        useContext(DialogContext);

      const contentRef = mergeRefs(
        context?.contentRef,
        forwardedRef
      );

      return (
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={
            ariaLabel
              ? undefined
              : context?.titleId
          }
          aria-describedby={
            context?.descriptionId
          }
          aria-label={ariaLabel}
          tabIndex={-1}
          className={cn(
            "relative z-10 max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-3xl border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)] outline-none",
            "border-slate-200 text-slate-900",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
            sizeClasses[size] ||
              sizeClasses.default,
            className
          )}
          {...props}
        >
          {showCloseButton && (
            <DialogClose />
          )}

          {children}
        </div>
      );
    }
  );

DialogContent.displayName =
  "DialogContent";

export function DialogClose({
  children,
  className = "",
  onClick,
  disabled = false,
  ...props
}) {
  const context =
    useContext(DialogContext);

  function handleClick(event) {
    onClick?.(event);

    if (
      !event.defaultPrevented &&
      !disabled
    ) {
      context?.closeDialog();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition",
        "hover:bg-slate-100 hover:text-slate-700",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200",
        "dark:focus-visible:ring-red-950/60",
        className
      )}
      aria-label="Close dialog"
      {...props}
    >
      {children || (
        <X
          className="h-5 w-5"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function DialogHeader({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "border-b border-slate-100 px-6 py-5 pr-16 sm:px-7 sm:py-6",
        "dark:border-slate-800",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className = "",
}) {
  const context =
    useContext(DialogContext);

  return (
    <h2
      id={context?.titleId}
      className={cn(
        "text-xl font-bold tracking-tight text-slate-950 sm:text-2xl",
        "dark:text-white",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className = "",
}) {
  const context =
    useContext(DialogContext);

  return (
    <p
      id={context?.descriptionId}
      className={cn(
        "mt-2 text-sm leading-6 text-slate-500",
        "dark:text-slate-400",
        className
      )}
    >
      {children}
    </p>
  );
}

export function DialogBody({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "px-6 py-5 sm:px-7 sm:py-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogFooter({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4",
        "sm:flex-row sm:items-center sm:justify-end sm:px-7",
        "dark:border-slate-800 dark:bg-slate-950/50",
        className
      )}
    >
      {children}
    </div>
  );
}
