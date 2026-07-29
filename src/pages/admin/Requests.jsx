import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Droplets,
  HeartHandshake,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

import { getApprovals } from "../../services/adminService";

const initialData = {
  donors: [],
  requests: [],
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function normalizeApprovals(response) {
  const data =
    response?.data ||
    response?.approvals ||
    response ||
    {};

  return {
    donors: Array.isArray(data.donors)
      ? data.donors
      : [],
    requests: Array.isArray(data.requests)
      ? data.requests
      : [],
  };
}

function formatLabel(value, fallback = "Not specified") {
  if (!value) return fallback;

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getQueueRows(data) {
  const donorRows = (data.donors || []).map((item) => ({
    id: item._id || item.id,
    category: "donor",
    type: "Donor profile",
    name:
      item.user?.fullName ||
      item.fullName ||
      "Unassigned donor",
    email:
      item.user?.email ||
      item.email ||
      "",
    organType: item.organType,
    bloodGroup: item.bloodGroup,
    urgencyLevel: "",
    submittedAt:
      item.createdAt ||
      item.submittedAt ||
      item.updatedAt,
    status: item.status || "pending",
    raw: item,
  }));

  const requestRows = (data.requests || []).map((item) => ({
    id: item._id || item.id,
    category: "request",
    type: "Organ request",
    name:
      item.recipient?.user?.fullName ||
      item.recipient?.fullName ||
      item.user?.fullName ||
      "Unassigned recipient",
    email:
      item.recipient?.user?.email ||
      item.recipient?.email ||
      item.user?.email ||
      "",
    organType: item.organType,
    bloodGroup:
      item.bloodGroup ||
      item.recipient?.bloodGroup,
    urgencyLevel: item.urgencyLevel,
    submittedAt:
      item.createdAt ||
      item.submittedAt ||
      item.updatedAt,
    status: item.status || "pending",
    raw: item,
  }));

  return [...donorRows, ...requestRows].sort((a, b) => {
    const aTime = new Date(a.submittedAt || 0).getTime();
    const bTime = new Date(b.submittedAt || 0).getTime();

    return bTime - aTime;
  });
}

export default function Requests() {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const rows = useMemo(
    () => getQueueRows(data),
    [data]
  );

  const donorCount = useMemo(
    () =>
      rows.filter((row) => row.category === "donor").length,
    [rows]
  );

  const requestCount = useMemo(
    () =>
      rows.filter((row) => row.category === "request").length,
    [rows]
  );

  const loadApprovals = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError("");

        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await getApprovals();
        setData(normalizeApprovals(response));
      } catch (requestError) {
        console.error(
          "Unable to load review queue:",
          requestError
        );

        const message = getErrorMessage(
          requestError,
          "The review queue could not be loaded."
        );

        setError(message);

        if (refresh) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  return (
    <div className="space-y-6">
      <PageHeader
        total={rows.length}
        isRefreshing={isRefreshing}
        onRefresh={() =>
          loadApprovals({ refresh: true })
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>
            Review queue could not be loaded
          </AlertTitle>

          <AlertDescription>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => loadApprovals()}
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <QueueSummary
        donorCount={donorCount}
        requestCount={requestCount}
      />

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
              <ClipboardCheck
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <CardTitle>Pending reviews</CardTitle>

              <CardDescription>
                Donor profiles and recipient requests that still
                require administrative or clinical verification.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <QueueSkeleton />
          ) : rows.length ? (
            <div className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <QueueItem
                  key={
                    row.id ||
                    `${row.category}-${row.name}-${index}`
                  }
                  row={row}
                />
              ))}
            </div>
          ) : (
            <EmptyQueue />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader({
  total,
  isRefreshing,
  onRefresh,
}) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-red-600">
          Clinical review
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Review queue
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review pending donor profiles and organ requests before
          they move into the verification and matching workflow.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
          {total} pending item{total === 1 ? "" : "s"}
        </span>

        <Button
          variant="outline"
          size="sm"
          leftIcon={RefreshCw}
          loading={isRefreshing}
          loadingText="Refreshing..."
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>
    </header>
  );
}

function QueueSummary({
  donorCount,
  requestCount,
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <SummaryCard
        icon={HeartHandshake}
        label="Donor profiles"
        value={donorCount}
        description="Profiles waiting for eligibility review."
        iconClass="bg-red-50 text-red-600"
      />

      <SummaryCard
        icon={UserRound}
        label="Organ requests"
        value={requestCount}
        description="Recipient requests waiting for verification."
        iconClass="bg-blue-50 text-blue-600"
      />
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconClass}`}
        >
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="text-sm font-semibold text-slate-600">
            {label}
          </p>

          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function QueueItem({ row }) {
  const isDonor = row.category === "donor";

  return (
    <article className="p-5 transition hover:bg-slate-50/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={[
              "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
              isDonor
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600",
            ].join(" ")}
          >
            {isDonor ? (
              <HeartHandshake
                className="h-5 w-5"
                aria-hidden="true"
              />
            ) : (
              <ClipboardCheck
                className="h-5 w-5"
                aria-hidden="true"
              />
            )}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-semibold text-slate-950">
                {row.name}
              </h2>

              <StatusBadge
                status={row.status}
                label="Pending"
                size="sm"
              />
            </div>

            {row.email && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {row.email}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <DetailPill
                icon={ClipboardCheck}
                text={row.type}
              />

              <DetailPill
                icon={HeartHandshake}
                text={formatLabel(
                  row.organType,
                  "Organ not specified"
                )}
              />

              {row.bloodGroup && (
                <DetailPill
                  icon={Droplets}
                  text={row.bloodGroup}
                />
              )}

              {row.urgencyLevel && (
                <StatusBadge
                  status={row.urgencyLevel}
                  label={formatLabel(row.urgencyLevel)}
                  size="sm"
                />
              )}
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Submitted {formatDate(row.submittedAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info(
                "Detailed review actions will be connected in the next upgrade."
              );
            }}
          >
            Review details
          </Button>
        </div>
      </div>
    </article>
  );
}

function DetailPill({
  icon: Icon,
  text,
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      <Icon
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />

      {text}
    </span>
  );
}

function EmptyQueue() {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <ClipboardCheck
          className="h-7 w-7"
          aria-hidden="true"
        />
      </span>

      <h2 className="mt-5 text-lg font-bold text-slate-950">
        The review queue is clear
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are currently no donor profiles or organ requests
        awaiting review.
      </p>
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div
      className="divide-y divide-slate-100"
      role="status"
      aria-label="Loading review queue"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-5"
        >
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-200" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-72 animate-pulse rounded-full bg-slate-100" />
          </div>

          <div className="hidden h-9 w-28 animate-pulse rounded-xl bg-slate-200 sm:block" />
        </div>
      ))}
    </div>
  );
}
