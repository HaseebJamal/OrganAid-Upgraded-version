import React, { createContext, useContext, useMemo } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const densityClasses = {
  compact: {
    head: "h-10 px-3",
    cell: "px-3 py-2.5",
  },
  default: {
    head: "h-12 px-4",
    cell: "px-4 py-3.5",
  },
  comfortable: {
    head: "h-14 px-5",
    cell: "px-5 py-4",
  },
};

const TableContext = createContext({
  density: "default",
  striped: false,
  hoverable: true,
});

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

export const Table = React.forwardRef(
  (
    {
      children,
      className = "",
      wrapperClassName = "",
      density = "default",
      striped = false,
      hoverable = true,
      stickyHeader = false,
      bordered = false,
      minWidth = "720px",
      style,
      ...props
    },
    forwardedRef,
  ) => {
    const contextValue = useMemo(
      () => ({
        density: densityClasses[density] ? density : "default",
        striped,
        hoverable,
      }),
      [density, striped, hoverable],
    );

    return (
      <TableContext.Provider value={contextValue}>
        <div
          className={cn(
            "relative w-full overflow-x-auto",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300",
            "dark:scrollbar-thumb-slate-700",
            bordered &&
              "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
            wrapperClassName,
          )}
        >
          <table
            ref={forwardedRef}
            className={cn(
              "w-full border-collapse text-left text-sm text-slate-700",
              "dark:text-slate-300",
              stickyHeader && "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20",
              className,
            )}
            style={{
              minWidth,
              ...style,
            }}
            {...props}
          >
            {children}
          </table>
        </div>
      </TableContext.Provider>
    );
  },
);

Table.displayName = "Table";

export const TableHeader = React.forwardRef(
  ({ children, className = "", ...props }, forwardedRef) => {
    return (
      <thead
        ref={forwardedRef}
        className={cn(
          "border-b border-slate-200 bg-slate-50/95 text-slate-500 backdrop-blur",
          "dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-400",
          className,
        )}
        {...props}
      >
        {children}
      </thead>
    );
  },
);

TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef(
  ({ children, className = "", ...props }, forwardedRef) => {
    return (
      <tbody
        ref={forwardedRef}
        className={cn(
          "divide-y divide-slate-100 bg-white",
          "dark:divide-slate-800 dark:bg-slate-900",
          className,
        )}
        {...props}
      >
        {children}
      </tbody>
    );
  },
);

TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef(
  ({ children, className = "", ...props }, forwardedRef) => {
    return (
      <tfoot
        ref={forwardedRef}
        className={cn(
          "border-t border-slate-200 bg-slate-50 font-semibold text-slate-700",
          "dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300",
          className,
        )}
        {...props}
      >
        {children}
      </tfoot>
    );
  },
);

TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef(
  (
    {
      children,
      className = "",
      selected = false,
      disabled = false,
      hoverable: rowHoverable,
      onClick,
      tabIndex,
      ...props
    },
    forwardedRef,
  ) => {
    const { striped, hoverable: tableHoverable } = useContext(TableContext);

    const isHoverable = rowHoverable ?? tableHoverable;

    const isInteractive = typeof onClick === "function" && !disabled;

    function handleKeyDown(event) {
      props.onKeyDown?.(event);

      if (event.defaultPrevented || !isInteractive) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(event);
      }
    }

    return (
      <tr
        ref={forwardedRef}
        aria-selected={selected || undefined}
        aria-disabled={disabled || undefined}
        tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "transition-colors duration-150",
          striped && "even:bg-slate-50/60 dark:even:bg-slate-800/30",
          isHoverable &&
            !disabled &&
            "hover:bg-slate-50/80 dark:hover:bg-slate-800/60",
          selected &&
            "bg-red-50/80 hover:bg-red-50 dark:bg-red-950/30 dark:hover:bg-red-950/40",
          disabled && "cursor-not-allowed opacity-60",
          isInteractive &&
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500",
          className,
        )}
        {...props}
      >
        {children}
      </tr>
    );
  },
);

TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef(
  (
    {
      children,
      className = "",
      align = "left",
      sortable = false,
      sortDirection,
      onSort,
      sortLabel,
      ...props
    },
    forwardedRef,
  ) => {
    const { density } = useContext(TableContext);

    const classes = densityClasses[density] || densityClasses.default;

    const normalizedSortDirection =
      sortDirection === "asc" || sortDirection === "desc"
        ? sortDirection
        : undefined;

    const ariaSort =
      normalizedSortDirection === "asc"
        ? "ascending"
        : normalizedSortDirection === "desc"
          ? "descending"
          : sortable
            ? "none"
            : undefined;

    return (
      <th
        ref={forwardedRef}
        scope="col"
        aria-sort={ariaSort}
        className={cn(
          "whitespace-nowrap text-xs font-bold uppercase tracking-[0.08em] text-slate-500",
          "dark:text-slate-400",
          classes.head,
          align === "center" && "text-center",
          align === "right" && "text-right",
          className,
        )}
        {...props}
      >
        {sortable ? (
          <button
            type="button"
            onClick={onSort}
            className={cn(
              "group inline-flex w-full items-center gap-2 rounded-md",
              "transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
              "dark:hover:text-slate-100",
              align === "center" && "justify-center",
              align === "right" && "justify-end",
            )}
            aria-label={
              sortLabel ||
              `Sort by ${typeof children === "string" ? children : "column"}`
            }
          >
            <span>{children}</span>

            <SortIcon direction={normalizedSortDirection} />
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
);

TableHead.displayName = "TableHead";

function SortIcon({ direction }) {
  if (direction === "asc") {
    return (
      <ArrowUp
        className="h-3.5 w-3.5 text-red-600 dark:text-red-400"
        aria-hidden="true"
      />
    );
  }

  if (direction === "desc") {
    return (
      <ArrowDown
        className="h-3.5 w-3.5 text-red-600 dark:text-red-400"
        aria-hidden="true"
      />
    );
  }

  return (
    <ChevronsUpDown
      className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300"
      aria-hidden="true"
    />
  );
}

export const TableCell = React.forwardRef(
  (
    { children, className = "", align = "left", noWrap = false, ...props },
    forwardedRef,
  ) => {
    const { density } = useContext(TableContext);

    const classes = densityClasses[density] || densityClasses.default;

    return (
      <td
        ref={forwardedRef}
        className={cn(
          "align-middle text-sm text-slate-700",
          "dark:text-slate-300",
          classes.cell,
          align === "center" && "text-center",
          align === "right" && "text-right",
          noWrap && "whitespace-nowrap",
          className,
        )}
        {...props}
      >
        {children}
      </td>
    );
  },
);

TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef(
  (
    { children, className = "", position = "bottom", ...props },
    forwardedRef,
  ) => {
    return (
      <caption
        ref={forwardedRef}
        className={cn(
          "px-4 py-3 text-left text-sm text-slate-500",
          "dark:text-slate-400",
          position === "top" ? "caption-top" : "caption-bottom",
          className,
        )}
        {...props}
      >
        {children}
      </caption>
    );
  },
);

TableCaption.displayName = "TableCaption";

export function TableEmpty({
  colSpan = 1,
  title = "No records found",
  description,
  icon: Icon,
  action,
  className = "",
}) {
  return (
    <TableRow hoverable={false}>
      <TableCell
        colSpan={colSpan}
        className={cn("px-6 py-14 text-center", className)}
      >
        {Icon && (
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}

        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </p>

        {description && (
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}

        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </TableCell>
    </TableRow>
  );
}

export function TableSkeleton({ rows = 5, columns = 4, columnWidths = [] }) {
  const safeRows = Math.max(0, Number(rows) || 0);

  const safeColumns = Math.max(0, Number(columns) || 0);

  return Array.from({
    length: safeRows,
  }).map((_, rowIndex) => (
    <TableRow
      key={`skeleton-row-${rowIndex}`}
      hoverable={false}
      className="animate-pulse"
      aria-hidden="true"
    >
      {Array.from({
        length: safeColumns,
      }).map((_, columnIndex) => (
        <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
          <div
            className="h-4 rounded bg-slate-200 dark:bg-slate-700"
            style={{
              width: columnWidths[columnIndex] || "100%",
            }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export const TableCheckboxCell = React.forwardRef(
  (
    {
      checked = false,
      indeterminate = false,
      onChange,
      "aria-label": ariaLabel = "Select row",
      className = "",
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = React.useRef(null);

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <TableCell className={cn("w-12", className)} {...props}>
        <input
          ref={mergeRefs(internalRef, forwardedRef)}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          aria-label={ariaLabel}
          className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </TableCell>
    );
  },
);

TableCheckboxCell.displayName = "TableCheckboxCell";
