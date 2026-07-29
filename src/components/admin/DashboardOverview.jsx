import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import Button from "../ui/Button";
import { getAdminStats } from "../../services/adminService";

const AUTO_REFRESH_INTERVAL = 60_000;

const metricDefinitions = [
  {
    label: "Registered donors",
    key: "donors",
    changeKey: "donorsChange",
    icon: HeartHandshake,
    iconClass: "bg-red-50 text-red-600",
    description: "Approved donor accounts",
  },
  {
    label: "Recipients",
    key: "recipients",
    changeKey: "recipientsChange",
    icon: UsersRound,
    iconClass: "bg-blue-50 text-blue-600",
    description: "Registered recipient accounts",
  },
  {
    label: "Hospitals",
    key: "hospitals",
    changeKey: "hospitalsChange",
    icon: Building2,
    iconClass: "bg-violet-50 text-violet-600",
    description: "Connected healthcare centers",
  },
  {
    label: "Pending requests",
    key: "pendingRequests",
    changeKey: "pendingRequestsChange",
    icon: Activity,
    iconClass: "bg-amber-50 text-amber-600",
    description: "Requests awaiting administrative review",
  },
  {
    label: "Approved requests",
    key: "approvedRequests",
    changeKey: "approvedRequestsChange",
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-emerald-600",
    description: "Successfully approved organ requests",
  },
];

const emptyStats = {
  donors: 0,
  recipients: 0,
  hospitals: 0,
  pendingRequests: 0,
  approvedRequests: 0,
  rejectedRequests: 0,
  totalRequests: 0,

  donorsChange: null,
  recipientsChange: null,
  hospitalsChange: null,
  pendingRequestsChange: null,
  approvedRequestsChange: null,
};

function toSafeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function toOptionalNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function normalizeStats(response) {
  const data =
    response?.data?.stats ||
    response?.data ||
    response?.stats ||
    response ||
    {};

  const pendingRequests = toSafeNumber(
    data.pendingRequests ??
      data.pending_requests ??
      data.pending
  );

  const approvedRequests = toSafeNumber(
    data.approvedRequests ??
      data.approved_requests ??
      data.approved
  );

  const rejectedRequests = toSafeNumber(
    data.rejectedRequests ??
      data.rejected_requests ??
      data.rejected
  );

  const totalRequests = toSafeNumber(
    data.totalRequests ??
      data.total_requests,
    pendingRequests +
      approvedRequests +
      rejectedRequests
  );

  return {
    donors: toSafeNumber(
      data.donors ??
        data.totalDonors ??
        data.total_donors
    ),

    recipients: toSafeNumber(
      data.recipients ??
        data.totalRecipients ??
        data.total_recipients
    ),

    hospitals: toSafeNumber(
      data.hospitals ??
        data.totalHospitals ??
        data.total_hospitals
    ),

    pendingRequests,
    approvedRequests,
    rejectedRequests,
    totalRequests,

    donorsChange: toOptionalNumber(
      data.donorsChange ??
        data.donors_change
    ),

    recipientsChange: toOptionalNumber(
      data.recipientsChange ??
        data.recipients_change
    ),

    hospitalsChange: toOptionalNumber(
      data.hospitalsChange ??
        data.hospitals_change
    ),

    pendingRequestsChange: toOptionalNumber(
      data.pendingRequestsChange ??
        data.pending_requests_change
    ),

    approvedRequestsChange: toOptionalNumber(
      data.approvedRequestsChange ??
        data.approved_requests_change
    ),
  };
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function DashboardOverview() {
  const [stats, setStats] =
    useState(emptyStats);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  const loadStats = useCallback(
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
          await getAdminStats();

        setStats(
          normalizeStats(response)
        );

        setLastUpdated(
          new Date()
        );
      } catch (requestError) {
        console.error(
          "Unable to load admin statistics:",
          requestError
        );

        if (!silent) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load dashboard statistics. Please try again."
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
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        loadStats({
          silent: true,
        });
      }, AUTO_REFRESH_INTERVAL);

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [loadStats]);

  const derivedStats =
    useMemo(() => {
      const totalParticipants =
        stats.donors +
        stats.recipients;

      const requestCompletionRate =
        stats.totalRequests > 0
          ? Math.round(
              (stats.approvedRequests /
                stats.totalRequests) *
                100
            )
          : 0;

      const pendingRate =
        stats.totalRequests > 0
          ? Math.round(
              (stats.pendingRequests /
                stats.totalRequests) *
                100
            )
          : 0;

      return {
        totalParticipants,
        requestCompletionRate,
        pendingRate,
      };
    }, [stats]);

  const hasAnyData =
    Object.entries(stats).some(
      ([key, value]) =>
        !key.endsWith("Change") &&
        Number(value) > 0
    );

  return (
    <div className="space-y-7">
      <DashboardHeader
        isRefreshing={
          isRefreshing
        }
        lastUpdated={
          lastUpdated
        }
        onRefresh={() =>
          loadStats({
            refresh: true,
          })
        }
      />

      {error && (
        <DashboardError
          message={error}
          onRetry={() =>
            loadStats()
          }
        />
      )}

      <DashboardHero
        stats={stats}
        derivedStats={
          derivedStats
        }
        isLoading={
          isLoading
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        aria-label="OrganAid statistics"
      >
        {isLoading
          ? metricDefinitions.map(
              (metric) => (
                <MetricSkeleton
                  key={metric.key}
                />
              )
            )
          : metricDefinitions.map(
              (metric) => (
                <MetricCard
                  key={metric.key}
                  {...metric}
                  value={
                    stats[
                      metric.key
                    ]
                  }
                  change={
                    stats[
                      metric.changeKey
                    ]
                  }
                />
              )
            )}
      </section>

      {!isLoading &&
        !error &&
        !hasAnyData && (
          <DashboardEmptyState
            onRefresh={() =>
              loadStats({
                refresh: true,
              })
            }
          />
        )}

      {!isLoading &&
        hasAnyData && (
          <section className="grid gap-5 lg:grid-cols-3">
            <RequestSummary
              stats={stats}
              derivedStats={
                derivedStats
              }
            />

            <PlatformSummary
              stats={stats}
              derivedStats={
                derivedStats
              }
            />
          </section>
        )}
    </div>
  );
}

function DashboardHeader({
  isRefreshing,
  lastUpdated,
  onRefresh,
}) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-red-600">
          OrganAid portal
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Dashboard overview
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitor platform participation,
          hospital activity, and organ
          request progress from one central
          workspace.
        </p>

        {lastUpdated && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Clock3
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            <span>
              Last updated{" "}
              {formatTime(lastUpdated)}
            </span>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={RefreshCw}
        loading={
          isRefreshing
        }
        loadingText="Refreshing..."
        onClick={onRefresh}
      >
        Refresh data
      </Button>
    </section>
  );
}

function DashboardHero({
  stats,
  derivedStats,
  isLoading,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-6 text-white shadow-xl shadow-slate-200 sm:p-8">
      <div
        className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute -bottom-28 left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <p className="text-sm font-semibold text-red-200">
          Network command center
        </p>

        <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
          A clearer view of OrganAid
          operations.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Review participation across the
          network and identify pending cases
          requiring administrative
          attention.
        </p>

        <div className="mt-7 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat
            label="Total participants"
            value={
              derivedStats.totalParticipants
            }
            isLoading={
              isLoading
            }
          />

          <HeroStat
            label="Verified hospitals"
            value={
              stats.hospitals
            }
            isLoading={
              isLoading
            }
          />

          <HeroStat
            label="Awaiting review"
            value={
              stats.pendingRequests
            }
            isLoading={
              isLoading
            }
          />

          <HeroStat
            label="Approval rate"
            value={`${derivedStats.requestCompletionRate}%`}
            isLoading={
              isLoading
            }
          />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  label,
  value,
  isLoading,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs font-medium text-slate-300">
        {label}
      </p>

      {isLoading ? (
        <div className="mt-2 h-8 w-20 animate-pulse rounded bg-white/15" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-white">
          {typeof value ===
          "number"
            ? formatNumber(
                value
              )
            : value}
        </p>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  iconClass,
  description,
}) {
  const hasChange =
    Number.isFinite(change);

  const isPositive =
    change > 0;

  const isNegative =
    change < 0;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl ${iconClass}`}
        >
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Live
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        {formatNumber(value)}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>

      {hasChange && (
        <div
          className={[
            "mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            isPositive
              ? "bg-emerald-50 text-emerald-700"
              : isNegative
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          {isPositive && (
            <TrendingUp
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          )}

          {isNegative && (
            <TrendingDown
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          )}

          <span>
            {change > 0
              ? "+"
              : ""}
            {change}% from previous period
          </span>
        </div>
      )}
    </article>
  );
}

function RequestSummary({
  stats,
  derivedStats,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div>
        <p className="text-sm font-semibold text-red-600">
          Request progress
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Organ request status
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Distribution of requests currently
          recorded across the platform.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <ProgressRow
          label="Approved"
          value={
            stats.approvedRequests
          }
          total={
            stats.totalRequests
          }
          percentage={
            derivedStats.requestCompletionRate
          }
          barClass="bg-emerald-500"
        />

        <ProgressRow
          label="Pending review"
          value={
            stats.pendingRequests
          }
          total={
            stats.totalRequests
          }
          percentage={
            derivedStats.pendingRate
          }
          barClass="bg-amber-500"
        />

        <ProgressRow
          label="Rejected"
          value={
            stats.rejectedRequests
          }
          total={
            stats.totalRequests
          }
          percentage={
            stats.totalRequests > 0
              ? Math.round(
                  (stats.rejectedRequests /
                    stats.totalRequests) *
                    100
                )
              : 0
          }
          barClass="bg-red-500"
        />
      </div>
    </article>
  );
}

function ProgressRow({
  label,
  value,
  total,
  percentage,
  barClass,
}) {
  const safePercentage =
    Math.max(
      0,
      Math.min(
        100,
        percentage
      )
    );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {label}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {formatNumber(value)} of{" "}
            {formatNumber(total)} requests
          </p>
        </div>

        <span className="text-sm font-bold text-slate-700">
          {safePercentage}%
        </span>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{
            width: `${safePercentage}%`,
          }}
          role="progressbar"
          aria-label={`${label}: ${safePercentage}%`}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={
            safePercentage
          }
        />
      </div>
    </div>
  );
}

function PlatformSummary({
  stats,
  derivedStats,
}) {
  const summaryItems = [
    {
      label: "Participants",
      value:
        derivedStats.totalParticipants,
      description:
        "Donors and recipients",
    },
    {
      label: "Hospitals",
      value: stats.hospitals,
      description:
        "Connected medical centers",
    },
    {
      label: "Total requests",
      value:
        stats.totalRequests,
      description:
        "All recorded organ requests",
    },
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-red-600">
        Platform summary
      </p>

      <h2 className="mt-1 text-xl font-bold text-slate-950">
        Network totals
      </h2>

      <div className="mt-5 divide-y divide-slate-100">
        {summaryItems.map(
          (item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {item.label}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.description}
                </p>
              </div>

              <p className="text-2xl font-bold text-slate-950">
                {formatNumber(
                  item.value
                )}
              </p>
            </div>
          )
        )}
      </div>
    </article>
  );
}

function DashboardEmptyState({
  onRefresh,
}) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Activity
          className="h-7 w-7"
          aria-hidden="true"
        />
      </span>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        No dashboard data yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Statistics will appear here after
        donors, recipients, hospitals, and
        organ requests are added to the
        platform.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={RefreshCw}
        onClick={onRefresh}
        className="mt-5"
      >
        Check again
      </Button>
    </section>
  );
}

function MetricSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl bg-slate-200" />
        <div className="h-6 w-12 rounded-full bg-slate-100" />
      </div>

      <div className="mt-5 h-4 w-28 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-20 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-full rounded bg-slate-100" />
    </div>
  );
}

function DashboardError({
  message,
  onRetry,
}) {
  return (
    <div
      className="flex flex-col justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
          aria-hidden="true"
        />

        <div>
          <p className="text-sm font-semibold text-red-800">
            Dashboard data could not be
            loaded
          </p>

          <p className="mt-1 text-sm text-red-600">
            {message}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={RefreshCw}
        onClick={onRetry}
        className="border-red-200 text-red-700 hover:bg-red-100"
      >
        Try again
      </Button>
    </div>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(
    Number(value) || 0
  );
}

function formatTime(value) {
  if (!(value instanceof Date)) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }
  ).format(value);
}