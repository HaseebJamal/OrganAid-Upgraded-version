import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const AvatarContext = createContext(null);

const sizeClasses = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  default: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-20 w-20 text-xl",
};

const statusClasses = {
  online: "bg-emerald-500",
  offline: "bg-slate-400",
  busy: "bg-red-500",
  away: "bg-amber-500",
};

const Avatar = React.forwardRef(
  (
    {
      children,
      className = "",
      size = "default",
      status,
      statusLabel,
      ...props
    },
    ref
  ) => {
    const [hasImage, setHasImage] = useState(false);

    return (
      <AvatarContext.Provider
        value={{
          hasImage,
          setHasImage,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative inline-flex shrink-0",
            sizeClasses[size] || sizeClasses.default,
            className
          )}
          {...props}
        >
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            {children}
          </div>

          {status && (
            <span
              className={cn(
                "absolute bottom-0 right-0 block h-[26%] w-[26%] rounded-full border-2 border-white",
                statusClasses[status] || statusClasses.offline
              )}
              aria-label={
                statusLabel || `${status} status`
              }
              role="status"
            />
          )}
        </div>
      </AvatarContext.Provider>
    );
  }
);

Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(
  (
    {
      src,
      alt,
      className = "",
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const context = useContext(AvatarContext);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      setIsVisible(false);
      context?.setHasImage(false);
    }, [context, src]);

    if (!src) return null;

    function handleLoad(event) {
      setIsVisible(true);
      context?.setHasImage(true);
      onLoad?.(event);
    }

    function handleError(event) {
      setIsVisible(false);
      context?.setHasImage(false);
      onError?.(event);
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || "User profile"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(
  (
    {
      children,
      className = "",
      initials,
      name,
      ...props
    },
    ref
  ) => {
    const context = useContext(AvatarContext);

    const fallbackText =
      initials || getInitials(name) || children || "OA";

    if (context?.hasImage) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-red-50 to-red-100 font-bold uppercase text-red-700",
          className
        )}
        aria-hidden="true"
        {...props}
      >
        {fallbackText}
      </div>
    );
  }
);

AvatarFallback.displayName = "AvatarFallback";

function getInitials(name) {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
};
