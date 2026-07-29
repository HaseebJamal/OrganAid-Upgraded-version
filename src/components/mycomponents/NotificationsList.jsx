import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  FileText,
  HeartHandshake,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../ui/Button";
import notificationService from "../../services/notificationService";

/* =====================================================
   Constants
===================================================== */

const AUTO_REFRESH_INTERVAL = 60_000;

const notificationFilters = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "unread",
    label: "Unread",
  },
  {
    value: "read",
    label: "Read",
  },
  {
    value: "medical",
    label: "Medical",
  },
  {
    value: "verification",
    label: "Verification",
  },
  {
    value: "matching",
    label: "Matching",
  },
  {
    value: "system",
    label: "System",
  },
];

/* =====================================================
   Normalization Helpers
===================================================== */

function normalizeNotifications(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
}

function getNotificationId(notification) {
  return notification?._id || notification?.id || "";
}

function getNotificationDate(notification) {
  return (
    notification?.createdAt ||
    notification?.created_at ||
    notification?.date ||
    null
  );
}

function isNotificationRead(notification) {
  return Boolean(
    notification?.isRead ??
      notification?.is_read ??
      notification?.read
  );
}

function normalizeNotification(notification) {
  return {
    ...notification,

    id: getNotificationId(notification),

    isRead: isNotificationRead(notification),

    title:
      notification?.title ||
      notification?.subject ||
      "OrganAid notification",

    message:
      notification?.body ||
      notification?.message ||
      notification?.description ||
      "No additional details were provided.",

    createdAt: getNotificationDate(notification),

    type: getNotificationType(notification),

    priority: getNotificationPriority(notification),
  };
}

function sortNotificationsByDate(notifications) {
  return [...notifications].sort((first, second) => {
    const firstDate = new Date(
      first.createdAt || 0
    ).getTime();

    const secondDate = new Date(
      second.createdAt || 0
    ).getTime();

    return secondDate - firstDate;
  });
}

/* =====================================================
   Notification Classification
===================================================== */

function getNotificationType(notification) {
  const explicitType = String(
    notification?.type ||
      notification?.category ||
      notification?.notificationType ||
      ""
  )
    .trim()
    .toLowerCase();

  const searchableText = [
    notification?.title,
    notification?.subject,
    notification?.message,
    notification?.body,
    notification?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    explicitType.includes("medical") ||
    explicitType.includes("report") ||
    searchableText.includes("medical") ||
    searchableText.includes("report") ||
    searchableText.includes("document")
  ) {
    return "medical";
  }

  if (
    explicitType.includes("verification") ||
    explicitType.includes("verify") ||
    searchableText.includes("verification") ||
    searchableText.includes("verified") ||
    searchableText.includes("approval")
  ) {
    return "verification";
  }

  if (
    explicitType.includes("match") ||
    explicitType.includes("donor") ||
    explicitType.includes("recipient") ||
    searchableText.includes("match") ||
    searchableText.includes("donor found") ||
    searchableText.includes("recipient")
  ) {
    return "matching";
  }

  if (
    explicitType.includes("emergency") ||
    explicitType.includes("urgent") ||
    searchableText.includes("emergency") ||
    searchableText.includes("urgent")
  ) {
    return "emergency";
  }

  if (
    explicitType.includes("success") ||
    searchableText.includes("successfully") ||
    searchableText.includes("completed")
  ) {
    return "success";
  }

  return "system";
}

function getNotificationPriority(notification) {
  const priority = String(
    notification?.priority ||
      notification?.severity ||
      notification?.level ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    priority === "critical" ||
    priority === "urgent"
  ) {
    return "critical";
  }

  if (priority === "high") {
    return "high";
  }

  if (
    priority === "low" ||
    priority === "minor"
  ) {
    return "low";
  }

  return "normal";
}

function getNotificationVisuals(type) {
  const visuals = {
    medical: {
      icon: FileText,
      iconClass:
        "bg-blue-100 text-blue-700",
      badgeClass:
        "bg-blue-50 text-blue-700 ring-blue-200",
      label: "Medical",
    },

    verification: {
      icon: ShieldCheck,
      iconClass:
        "bg-violet-100 text-violet-700",
      badgeClass:
        "bg-violet-50 text-violet-700 ring-violet-200",
      label: "Verification",
    },

    matching: {
      icon: HeartHandshake,
      iconClass:
        "bg-rose-100 text-rose-700",
      badgeClass:
        "bg-rose-50 text-rose-700 ring-rose-200",
      label: "Matching",
    },

    emergency: {
      icon: TriangleAlert,
      iconClass:
        "bg-orange-100 text-orange-700",
      badgeClass:
        "bg-orange-50 text-orange-700 ring-orange-200",
      label: "Emergency",
    },

    success: {
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-100 text-emerald-700",
      badgeClass:
        "bg-emerald-50 text-emerald-700 ring-emerald-200",
      label: "Success",
    },

    system: {
      icon: Bell,
      iconClass:
        "bg-slate-100 text-slate-600",
      badgeClass:
        "bg-slate-50 text-slate-600 ring-slate-200",
      label: "System",
    },
  };

  return visuals[type] || visuals.system;
}

function getPriorityVisuals(priority) {
  const visuals = {
    critical: {
      label: "Critical",
      className:
        "bg-red-100 text-red-700 ring-red-200",
    },

    high: {
      label: "High",
      className:
        "bg-orange-100 text-orange-700 ring-orange-200",
    },

    normal: {
      label: "Normal",
      className:
        "bg-slate-100 text-slate-600 ring-slate-200",
    },

    low: {
      label: "Low",
      className:
        "bg-emerald-100 text-emerald-700 ring-emerald-200",
    },
  };

  return visuals[priority] || visuals.normal;
}

/* =====================================================
   Date Helpers
===================================================== */

function formatFullDate(value) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(value) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const difference =
    date.getTime() - Date.now();

  const absoluteDifference =
    Math.abs(difference);

  const formatter =
    new Intl.RelativeTimeFormat("en-US", {
      numeric: "auto",
    });

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (absoluteDifference < minute) {
    return "Just now";
  }

  if (absoluteDifference < hour) {
    return formatter.format(
      Math.round(difference / minute),
      "minute"
    );
  }

  if (absoluteDifference < day) {
    return formatter.format(
      Math.round(difference / hour),
      "hour"
    );
  }

  if (absoluteDifference < week) {
    return formatter.format(
      Math.round(difference / day),
      "day"
    );
  }

  if (absoluteDifference < month) {
    return formatter.format(
      Math.round(difference / week),
      "week"
    );
  }

  if (absoluteDifference < year) {
    return formatter.format(
      Math.round(difference / month),
      "month"
    );
  }

  return formatter.format(
    Math.round(difference / year),
    "year"
  );
}

/* =====================================================
   Error Helpers
===================================================== */

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

/* =====================================================
   Main Component
===================================================== */

export default function NotificationsList() {
  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isMarkingAll, setIsMarkingAll] =
    useState(false);

  const [processingId, setProcessingId] =
    useState("");

  const [error, setError] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("all");

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;
  }, [notifications]);

  const filteredNotifications =
    useMemo(() => {
      const normalizedSearch =
        searchQuery.trim().toLowerCase();

      return notifications.filter(
        (notification) => {
          const matchesSearch =
            !normalizedSearch ||
            [
              notification.title,
              notification.message,
              notification.type,
              notification.priority,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch);

          const matchesFilter =
            activeFilter === "all" ||
            (activeFilter === "unread" &&
              !notification.isRead) ||
            (activeFilter === "read" &&
              notification.isRead) ||
            notification.type === activeFilter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      notifications,
      searchQuery,
      activeFilter,
    ]);

  const loadNotifications = useCallback(
    async ({
      refresh = false,
      silent = false,
    } = {}) => {
      try {
        if (!silent) {
          setError("");
        }

        if (refresh && !silent) {
          setIsRefreshing(true);
        } else if (!silent) {
          setIsLoading(true);
        }

        const response =
          await notificationService.getUserNotifications();

        const normalized =
          normalizeNotifications(response)
            .map(normalizeNotification);

        setNotifications(
          sortNotificationsByDate(normalized)
        );
      } catch (requestError) {
        console.error(
          "Failed to load notifications:",
          requestError
        );

        if (!silent) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load notifications. Please try again."
            )
          );
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => {
        loadNotifications({
          silent: true,
        });
      },
      AUTO_REFRESH_INTERVAL
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadNotifications]);

  async function markAllAsRead() {
    if (
      unreadCount === 0 ||
      isMarkingAll
    ) {
      return;
    }

    const previousNotifications =
      notifications;

    try {
      setIsMarkingAll(true);

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      await notificationService.markAllAsRead();

      toast.success(
        "All notifications marked as read."
      );
    } catch (requestError) {
      setNotifications(
        previousNotifications
      );

      toast.error(
        getErrorMessage(
          requestError,
          "Unable to mark notifications as read."
        )
      );
    } finally {
      setIsMarkingAll(false);
    }
  }

  async function markOneAsRead(
    notification
  ) {
    const id =
      getNotificationId(notification);

    if (
      !id ||
      notification.isRead ||
      processingId
    ) {
      return;
    }

    const markOneMethod =
      notificationService.markAsRead ||
      notificationService
        .markNotificationAsRead;

    if (
      typeof markOneMethod !== "function"
    ) {
      toast.error(
        "Individual notification updates are not supported by the service."
      );

      return;
    }

    const previousNotifications =
      notifications;

    try {
      setProcessingId(id);

      setNotifications((current) =>
        current.map((item) =>
          getNotificationId(item) === id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      await markOneMethod.call(
        notificationService,
        id
      );

      toast.success(
        "Notification marked as read."
      );
    } catch (requestError) {
      setNotifications(
        previousNotifications
      );

      toast.error(
        getErrorMessage(
          requestError,
          "Unable to update the notification."
        )
      );
    } finally {
      setProcessingId("");
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setActiveFilter("all");
  }

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <NotificationsHeader
        unreadCount={unreadCount}
        totalCount={
          notifications.length
        }
        isRefreshing={isRefreshing}
        isMarkingAll={isMarkingAll}
        onRefresh={() =>
          loadNotifications({
            refresh: true,
          })
        }
        onMarkAllRead={
          markAllAsRead
        }
      />

      <NotificationControls
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        filters={notificationFilters}
        resultCount={
          filteredNotifications.length
        }
        onSearchChange={
          setSearchQuery
        }
        onFilterChange={
          setActiveFilter
        }
        onReset={resetFilters}
      />

      {error && (
        <ErrorState
          message={error}
          onRetry={() =>
            loadNotifications()
          }
        />
      )}

      {!notifications.length ? (
        <EmptyState
          onRefresh={() =>
            loadNotifications()
          }
        />
      ) : !filteredNotifications.length ? (
        <NoResultsState
          onReset={resetFilters}
        />
      ) : (
        <ul
          className="divide-y divide-slate-100"
          aria-label="Notifications"
        >
          {filteredNotifications.map(
            (notification) => (
              <NotificationItem
                key={
                  notification.id ||
                  `${notification.title}-${notification.createdAt}`
                }
                notification={
                  notification
                }
                isProcessing={
                  processingId ===
                  notification.id
                }
                onMarkRead={
                  markOneAsRead
                }
              />
            )
          )}
        </ul>
      )}
    </section>
  );
}

/* =====================================================
   Header
===================================================== */

function NotificationsHeader({
  unreadCount,
  totalCount,
  isRefreshing,
  isMarkingAll,
  onRefresh,
  onMarkAllRead,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
          <BellRing
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-950">
              Notifications
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {totalCount}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount === 1
                    ? ""
                    : "s"
                }`
              : "You are all caught up"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={RefreshCw}
          loading={isRefreshing}
          loadingText="Refreshing..."
          disabled={
            isMarkingAll
          }
          onClick={onRefresh}
        >
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={CheckCircle2}
          loading={isMarkingAll}
          loadingText="Updating..."
          disabled={
            unreadCount === 0 ||
            isRefreshing
          }
          onClick={onMarkAllRead}
        >
          Mark all read
        </Button>
      </div>
    </div>
  );
}

/* =====================================================
   Search and Filters
===================================================== */

function NotificationControls({
  searchQuery,
  activeFilter,
  filters,
  resultCount,
  onSearchChange,
  onFilterChange,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    activeFilter !== "all";

  return (
    <div className="border-b border-slate-100 bg-slate-50/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                onSearchChange(
                  event.target.value
                )
              }
              placeholder="Search notifications..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
              aria-label="Search notifications"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  onSearchChange("")
                }
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100"
                aria-label="Clear notification search"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p
              className="text-sm font-medium text-slate-500"
              aria-live="polite"
            >
              {resultCount} result
              {resultCount === 1
                ? ""
                : "s"}
            </p>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-1 hidden h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200 sm:grid">
            <SlidersHorizontal
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter notifications"
          >
            {filters.map((filter) => {
              const isActive =
                activeFilter ===
                filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    onFilterChange(
                      filter.value
                    )
                  }
                  className={[
                    "rounded-full px-3.5 py-2 text-xs font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
                    isActive
                      ? "bg-red-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700",
                  ].join(" ")}
                  aria-pressed={isActive}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   Notification Item
===================================================== */

function NotificationItem({
  notification,
  isProcessing,
  onMarkRead,
}) {
  const isUnread =
    !notification.isRead;

  const canMarkIndividually =
    typeof notificationService
      .markAsRead === "function" ||
    typeof notificationService
      .markNotificationAsRead ===
      "function";

  const typeVisuals =
    getNotificationVisuals(
      notification.type
    );

  const priorityVisuals =
    getPriorityVisuals(
      notification.priority
    );

  const Icon = typeVisuals.icon;

  return (
    <li
      className={[
        "relative p-5 transition",
        isUnread
          ? "bg-red-50/40 hover:bg-red-50/70"
          : "bg-white hover:bg-slate-50/70",
      ].join(" ")}
    >
      {isUnread && (
        <span
          className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-red-600"
          aria-hidden="true"
        />
      )}

      <div className="flex items-start gap-4">
        <span
          className={[
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
            typeVisuals.iconClass,
          ].join(" ")}
        >
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-950">
                  {notification.title}
                </h3>

                {isUnread && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                    New
                  </span>
                )}

                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
                    typeVisuals.badgeClass,
                  ].join(" ")}
                >
                  {typeVisuals.label}
                </span>

                {notification.priority !==
                  "normal" && (
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
                      priorityVisuals.className,
                    ].join(" ")}
                  >
                    {
                      priorityVisuals.label
                    }
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {notification.message}
              </p>
            </div>

            <time
              dateTime={
                notification.createdAt ||
                undefined
              }
              title={formatFullDate(
                notification.createdAt
              )}
              className="shrink-0 text-xs font-medium text-slate-400"
            >
              {formatRelativeTime(
                notification.createdAt
              )}
            </time>
          </div>

          {isUnread &&
            canMarkIndividually && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Check}
                  loading={isProcessing}
                  loadingText="Updating..."
                  disabled={isProcessing}
                  onClick={() =>
                    onMarkRead(
                      notification
                    )
                  }
                  className="text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                  Mark as read
                </Button>
              </div>
            )}
        </div>
      </div>
    </li>
  );
}

/* =====================================================
   Empty and Error States
===================================================== */

function EmptyState({
  onRefresh,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Bell
          className="h-7 w-7"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        No notifications yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Updates about profile verification,
        medical reports, matching activity,
        and hospital coordination will appear
        here.
      </p>

      <Button
        variant="outline"
        size="sm"
        leftIcon={RefreshCw}
        onClick={onRefresh}
        className="mt-5"
      >
        Check again
      </Button>
    </div>
  );
}

function NoResultsState({
  onReset,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Search
          className="h-7 w-7"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        No matching notifications
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try changing your search term or
        selecting a different notification
        filter.
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="mt-5"
      >
        Clear filters
      </Button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div
      className="flex flex-col justify-between gap-4 border-b border-red-100 bg-red-50 px-5 py-4 sm:flex-row sm:items-center"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
          aria-hidden="true"
        />

        <div>
          <p className="text-sm font-semibold text-red-800">
            Notifications could not be
            loaded
          </p>

          <p className="mt-1 text-sm text-red-600">
            {message}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="border-red-200 text-red-700 hover:bg-red-100"
      >
        Try again
      </Button>
    </div>
  );
}

/* =====================================================
   Loading Skeleton
===================================================== */

function NotificationsSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading notifications"
    >
      <span className="sr-only">
        Loading notifications.
      </span>

      <div
        className="flex items-center justify-between border-b border-slate-100 p-5"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="hidden gap-2 sm:flex">
          <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>

      <div
        className="border-b border-slate-100 bg-slate-50/60 p-5"
        aria-hidden="true"
      >
        <div className="h-11 w-full max-w-md animate-pulse rounded-xl bg-slate-200" />

        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={`filter-skeleton-${index}`}
              className="h-8 w-20 animate-pulse rounded-full bg-slate-200"
            />
          ))}
        </div>
      </div>

      <div
        className="divide-y divide-slate-100"
        aria-hidden="true"
      >
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={`notification-skeleton-${index}`}
            className="flex gap-4 p-5"
          >
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>

              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
