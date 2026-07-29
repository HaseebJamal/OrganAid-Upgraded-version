import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  File,
  FileImage,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../ui/Button";
import reportService from "../../services/reportService";

/* =====================================================
   Constants
===================================================== */

const AUTO_REFRESH_INTERVAL = 60_000;
const REPORTS_PER_PAGE = 8;

const STATUS_FILTERS = [
  {
    value: "all",
    label: "All statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "verified",
    label: "Verified",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
];

const TYPE_FILTERS = [
  {
    value: "all",
    label: "All file types",
  },
  {
    value: "image",
    label: "Images",
  },
  {
    value: "document",
    label: "Documents",
  },
  {
    value: "file",
    label: "Other files",
  },
];

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "name-asc",
    label: "Name A–Z",
  },
  {
    value: "name-desc",
    label: "Name Z–A",
  },
];

/* =====================================================
   Response Helpers
===================================================== */

function normalizeReports(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.reports)) {
    return response.reports;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.reports)) {
    return response.data.reports;
  }

  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

/* =====================================================
   Report Helpers
===================================================== */

function getReportId(report) {
  return (
    report?._id ||
    report?.id ||
    report?.reportId ||
    ""
  );
}

function getReportTitle(report) {
  return (
    report?.title ||
    report?.name ||
    report?.fileName ||
    report?.filename ||
    report?.originalName ||
    "Medical report"
  );
}

function getReportDescription(report) {
  return (
    report?.description ||
    report?.notes ||
    report?.note ||
    ""
  );
}

function getReportDate(report) {
  return (
    report?.createdAt ||
    report?.created_at ||
    report?.uploadedAt ||
    report?.uploaded_at ||
    report?.date ||
    null
  );
}

function getReportStatus(report) {
  return String(
    report?.status ||
      report?.verificationStatus ||
      report?.verification_status ||
      "pending"
  )
    .trim()
    .toLowerCase();
}

function getReportMimeType(report) {
  return String(
    report?.mimeType ||
      report?.mimetype ||
      report?.fileType ||
      report?.file_type ||
      report?.type ||
      ""
  ).toLowerCase();
}

function getReportFileName(report) {
  return (
    report?.fileName ||
    report?.filename ||
    report?.originalName ||
    report?.name ||
    ""
  );
}

function getReportFilePath(report) {
  return (
    report?.filePath ||
    report?.file_path ||
    report?.path ||
    report?.url ||
    report?.fileUrl ||
    report?.file_url ||
    ""
  );
}

function getFileType(report) {
  const value = [
    getReportMimeType(report),
    getReportFileName(report),
    getReportFilePath(report),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    value.includes("image") ||
    /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(value)
  ) {
    return "image";
  }

  if (
    value.includes("pdf") ||
    value.includes("document") ||
    /\.(pdf|docx?|txt|rtf|odt)$/i.test(value)
  ) {
    return "document";
  }

  return "file";
}

function normalizeReport(report) {
  return {
    ...report,
    normalizedId: getReportId(report),
    normalizedTitle: getReportTitle(report),
    normalizedDescription:
      getReportDescription(report),
    normalizedDate: getReportDate(report),
    normalizedStatus: getReportStatus(report),
    normalizedType: getFileType(report),
  };
}

/* =====================================================
   URL Helpers
===================================================== */

function extractReportUrl(response) {
  if (typeof response === "string") {
    return response;
  }

  return (
    response?.url ||
    response?.downloadUrl ||
    response?.download_url ||
    response?.fileUrl ||
    response?.file_url ||
    response?.data?.url ||
    response?.data?.downloadUrl ||
    response?.data?.download_url ||
    response?.data?.fileUrl ||
    response?.data?.file_url ||
    ""
  );
}

function getDirectReportUrl(report) {
  return (
    report?.url ||
    report?.downloadUrl ||
    report?.download_url ||
    report?.fileUrl ||
    report?.file_url ||
    report?.filePath ||
    report?.file_path ||
    ""
  );
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(value);
}

/* =====================================================
   Date and Size Formatting
===================================================== */

function formatDate(value) {
  if (!value) {
    return "Upload date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Upload date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const difference =
    date.getTime() - Date.now();

  const absoluteDifference =
    Math.abs(difference);

  const minute = 60_000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  const formatter =
    new Intl.RelativeTimeFormat("en-US", {
      numeric: "auto",
    });

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

function formatFileSize(value) {
  const bytes = Number(value);

  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const unitIndex = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  const size =
    bytes /
    1024 ** unitIndex;

  return `${size.toFixed(
    size >= 10 ||
      unitIndex === 0
      ? 0
      : 1
  )} ${units[unitIndex]}`;
}

/* =====================================================
   Sorting
===================================================== */

function sortReports(reports, sortBy) {
  const copy = [...reports];

  if (sortBy === "oldest") {
    return copy.sort(
      (first, second) =>
        new Date(
          first.normalizedDate || 0
        ).getTime() -
        new Date(
          second.normalizedDate || 0
        ).getTime()
    );
  }

  if (sortBy === "name-asc") {
    return copy.sort(
      (first, second) =>
        first.normalizedTitle.localeCompare(
          second.normalizedTitle
        )
    );
  }

  if (sortBy === "name-desc") {
    return copy.sort(
      (first, second) =>
        second.normalizedTitle.localeCompare(
          first.normalizedTitle
        )
    );
  }

  return copy.sort(
    (first, second) =>
      new Date(
        second.normalizedDate || 0
      ).getTime() -
      new Date(
        first.normalizedDate || 0
      ).getTime()
  );
}

/* =====================================================
   Main Component
===================================================== */

export default function ReportsList() {
  const [
    reports,
    setReports,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    openingReportId,
    setOpeningReportId,
  ] = useState("");

  const [
    downloadingReportId,
    setDownloadingReportId,
  ] = useState("");

  const [
    deletingReportId,
    setDeletingReportId,
  ] = useState("");

  const [
    previewReport,
    setPreviewReport,
  ] = useState(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");

  const [
    isLoadingPreview,
    setIsLoadingPreview,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("all");

  const [
    sortBy,
    setSortBy,
  ] = useState("newest");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const reportCount =
    reports.length;

  const canDeleteReports =
    typeof reportService.deleteReport ===
      "function";

  const filteredReports =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase();

      const matchingReports =
        reports.filter(
          (report) => {
            const searchText = [
              report.normalizedTitle,
              report.normalizedDescription,
              report.normalizedStatus,
              report.normalizedType,
              getReportFileName(
                report
              ),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            const matchesSearch =
              !normalizedSearch ||
              searchText.includes(
                normalizedSearch
              );

            const matchesStatus =
              statusFilter ===
                "all" ||
              report.normalizedStatus ===
                statusFilter;

            const matchesType =
              typeFilter ===
                "all" ||
              report.normalizedType ===
                typeFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesType
            );
          }
        );

      return sortReports(
        matchingReports,
        sortBy
      );
    }, [
      reports,
      searchQuery,
      statusFilter,
      typeFilter,
      sortBy,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredReports.length /
          REPORTS_PER_PAGE
      )
    );

  const paginatedReports =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        REPORTS_PER_PAGE;

      return filteredReports.slice(
        startIndex,
        startIndex +
          REPORTS_PER_PAGE
      );
    }, [
      filteredReports,
      currentPage,
    ]);

  const hasActiveFilters =
    Boolean(
      searchQuery.trim()
    ) ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    sortBy !== "newest";

  const loadReports =
    useCallback(
      async ({
        refresh = false,
        silent = false,
      } = {}) => {
        try {
          if (!silent) {
            setError("");
          }

          if (
            refresh &&
            !silent
          ) {
            setIsRefreshing(true);
          } else if (!silent) {
            setIsLoading(true);
          }

          const response =
            await reportService.getUserReports();

          const normalized =
            normalizeReports(
              response
            ).map(
              normalizeReport
            );

          setReports(normalized);
        } catch (
          requestError
        ) {
          console.error(
            "Failed to fetch reports:",
            requestError
          );

          if (!silent) {
            setError(
              getErrorMessage(
                requestError,
                "Unable to load medical reports. Please try again."
              )
            );
          }
        } finally {
          if (!silent) {
            setIsLoading(false);
            setIsRefreshing(
              false
            );
          }
        }
      },
      []
    );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    const intervalId =
      window.setInterval(
        () => {
          loadReports({
            silent: true,
          });
        },
        AUTO_REFRESH_INTERVAL
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [loadReports]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    statusFilter,
    typeFilter,
    sortBy,
  ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  useEffect(() => {
    if (!previewReport) {
      return undefined;
    }

    function handleEscape(
      event
    ) {
      if (
        event.key === "Escape"
      ) {
        closePreview();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [previewReport]);

  async function resolveReportUrl(
    report
  ) {
    const directUrl =
      getDirectReportUrl(
        report
      );

    if (
      directUrl &&
      isAbsoluteUrl(
        directUrl
      )
    ) {
      return directUrl;
    }

    const reportId =
      getReportId(report);

    if (
      reportId &&
      typeof reportService.getReportUrl ===
        "function"
    ) {
      const response =
        await reportService.getReportUrl(
          reportId
        );

      const resolvedUrl =
        extractReportUrl(
          response
        );

      if (resolvedUrl) {
        return resolvedUrl;
      }
    }

    if (directUrl) {
      return directUrl;
    }

    throw new Error(
      "No report URL was returned."
    );
  }

  async function handleViewReport(
    report
  ) {
    const reportId =
      getReportId(report);

    if (
      !reportId ||
      openingReportId
    ) {
      return;
    }

    try {
      setOpeningReportId(
        reportId
      );

      const url =
        await resolveReportUrl(
          report
        );

      const reportWindow =
        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

      if (!reportWindow) {
        toast.error(
          "Your browser blocked the report window. Please allow pop-ups and try again."
        );
      }
    } catch (
      requestError
    ) {
      toast.error(
        getErrorMessage(
          requestError,
          "Unable to open this report."
        )
      );
    } finally {
      setOpeningReportId(
        ""
      );
    }
  }

  async function handlePreviewReport(
    report
  ) {
    const reportId =
      getReportId(report);

    if (
      !reportId ||
      isLoadingPreview
    ) {
      return;
    }

    try {
      setPreviewReport(
        report
      );

      setPreviewUrl("");
      setIsLoadingPreview(
        true
      );

      const url =
        await resolveReportUrl(
          report
        );

      setPreviewUrl(url);
    } catch (
      requestError
    ) {
      setPreviewReport(
        null
      );

      toast.error(
        getErrorMessage(
          requestError,
          "Unable to preview this report."
        )
      );
    } finally {
      setIsLoadingPreview(
        false
      );
    }
  }

  async function handleDownloadReport(
    report
  ) {
    const reportId =
      getReportId(report);

    if (
      !reportId ||
      downloadingReportId
    ) {
      return;
    }

    try {
      setDownloadingReportId(
        reportId
      );

      const url =
        await resolveReportUrl(
          report
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;
      anchor.download =
        getReportFileName(
          report
        ) ||
        getReportTitle(
          report
        );

      anchor.target =
        "_blank";

      anchor.rel =
        "noopener noreferrer";

      document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();
    } catch (
      requestError
    ) {
      toast.error(
        getErrorMessage(
          requestError,
          "Unable to download this report."
        )
      );
    } finally {
      setDownloadingReportId(
        ""
      );
    }
  }

  async function handleDeleteReport(
    report
  ) {
    if (!canDeleteReports) {
      return;
    }

    const reportId =
      getReportId(report);

    if (
      !reportId ||
      deletingReportId
    ) {
      return;
    }

    const title =
      getReportTitle(report);

    const confirmed =
      window.confirm(
        `Delete "${title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    const previousReports =
      reports;

    try {
      setDeletingReportId(
        reportId
      );

      setReports(
        (current) =>
          current.filter(
            (item) =>
              getReportId(item) !==
              reportId
          )
      );

      await reportService.deleteReport(
        reportId
      );

      toast.success(
        "Medical report deleted successfully."
      );
    } catch (
      requestError
    ) {
      setReports(
        previousReports
      );

      toast.error(
        getErrorMessage(
          requestError,
          "Unable to delete this report."
        )
      );
    } finally {
      setDeletingReportId(
        ""
      );
    }
  }

  function closePreview() {
    setPreviewReport(null);
    setPreviewUrl("");
    setIsLoadingPreview(
      false
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter(
      "all"
    );
    setTypeFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  }

  if (isLoading) {
    return (
      <ReportsSkeleton />
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ReportsHeader
          reportCount={
            reportCount
          }
          filteredCount={
            filteredReports.length
          }
          isRefreshing={
            isRefreshing
          }
          onRefresh={() =>
            loadReports({
              refresh: true,
            })
          }
        />

        <ReportsControls
          searchQuery={
            searchQuery
          }
          statusFilter={
            statusFilter
          }
          typeFilter={
            typeFilter
          }
          sortBy={sortBy}
          hasActiveFilters={
            hasActiveFilters
          }
          resultCount={
            filteredReports.length
          }
          onSearchChange={
            setSearchQuery
          }
          onStatusChange={
            setStatusFilter
          }
          onTypeChange={
            setTypeFilter
          }
          onSortChange={
            setSortBy
          }
          onClear={
            clearFilters
          }
        />

        {error && (
          <ReportsError
            message={error}
            onRetry={() =>
              loadReports()
            }
          />
        )}

        {!reports.length ? (
          <EmptyReports
            onRefresh={() =>
              loadReports()
            }
          />
        ) : !filteredReports.length ? (
          <NoReportResults
            onClear={
              clearFilters
            }
          />
        ) : (
          <>
            <ul
              className="divide-y divide-slate-100"
              aria-label="Medical reports"
            >
              {paginatedReports.map(
                (report) => {
                  const reportId =
                    getReportId(
                      report
                    );

                  return (
                    <ReportItem
                      key={
                        reportId ||
                        `${getReportTitle(
                          report
                        )}-${getReportDate(
                          report
                        )}`
                      }
                      report={
                        report
                      }
                      isOpening={
                        openingReportId ===
                        reportId
                      }
                      isDownloading={
                        downloadingReportId ===
                        reportId
                      }
                      isDeleting={
                        deletingReportId ===
                        reportId
                      }
                      canDelete={
                        canDeleteReports
                      }
                      onPreview={
                        handlePreviewReport
                      }
                      onView={
                        handleViewReport
                      }
                      onDownload={
                        handleDownloadReport
                      }
                      onDelete={
                        handleDeleteReport
                      }
                    />
                  );
                }
              )}
            </ul>

            <ReportsPagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              totalResults={
                filteredReports.length
              }
              pageSize={
                REPORTS_PER_PAGE
              }
              onPageChange={
                setCurrentPage
              }
            />
          </>
        )}
      </section>

      {previewReport && (
        <ReportPreviewModal
          report={
            previewReport
          }
          url={previewUrl}
          isLoading={
            isLoadingPreview
          }
          onClose={
            closePreview
          }
          onOpen={() =>
            handleViewReport(
              previewReport
            )
          }
          onDownload={() =>
            handleDownloadReport(
              previewReport
            )
          }
          isOpening={
            openingReportId ===
            getReportId(
              previewReport
            )
          }
          isDownloading={
            downloadingReportId ===
            getReportId(
              previewReport
            )
          }
        />
      )}
    </>
  );
}

/* =====================================================
   Header
===================================================== */

function ReportsHeader({
  reportCount,
  filteredCount,
  isRefreshing,
  onRefresh,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
          <FileText
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-950">
              Medical reports
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {reportCount}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {filteredCount ===
            reportCount
              ? reportCount === 1
                ? "1 uploaded report"
                : `${reportCount} uploaded reports`
              : `${filteredCount} of ${reportCount} reports shown`}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        leftIcon={
          RefreshCw
        }
        loading={
          isRefreshing
        }
        loadingText="Refreshing..."
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </div>
  );
}

/* =====================================================
   Search and Filters
===================================================== */

function ReportsControls({
  searchQuery,
  statusFilter,
  typeFilter,
  sortBy,
  hasActiveFilters,
  resultCount,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onClear,
}) {
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
              value={
                searchQuery
              }
              onChange={(
                event
              ) =>
                onSearchChange(
                  event.target
                    .value
                )
              }
              placeholder="Search medical reports..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
              aria-label="Search medical reports"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  onSearchChange(
                    ""
                  )
                }
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                aria-label="Clear report search"
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
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <FilterSelect
            id="report-status-filter"
            label="Status"
            value={
              statusFilter
            }
            options={
              STATUS_FILTERS
            }
            onChange={
              onStatusChange
            }
          />

          <FilterSelect
            id="report-type-filter"
            label="File type"
            value={
              typeFilter
            }
            options={
              TYPE_FILTERS
            }
            onChange={
              onTypeChange
            }
          />

          <FilterSelect
            id="report-sort"
            label="Sort"
            value={sortBy}
            options={
              SORT_OPTIONS
            }
            onChange={
              onSortChange
            }
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label
      htmlFor={id}
      className="relative"
    >
      <span className="sr-only">
        {label}
      </span>

      <Filter
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />

      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
      >
        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          )
        )}
      </select>

      <ChevronDownIcon />
    </label>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* =====================================================
   Report Item
===================================================== */

function ReportItem({
  report,
  isOpening,
  isDownloading,
  isDeleting,
  canDelete,
  onPreview,
  onView,
  onDownload,
  onDelete,
}) {
  const fileType =
    report.normalizedType;

  const title =
    report.normalizedTitle;

  const description =
    report.normalizedDescription;

  const fileSize =
    formatFileSize(
      report.fileSize ||
        report.file_size ||
        report.size
    );

  const date =
    report.normalizedDate;

  return (
    <li className="p-5 transition hover:bg-slate-50/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <ReportIcon
            type={fileType}
          />

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() =>
                onPreview(
                  report
                )
              }
              className="block max-w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
            >
              <h3
                className="truncate text-sm font-semibold text-slate-950 transition hover:text-red-600"
                title={title}
              >
                {title}
              </h3>
            </button>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <time
                dateTime={
                  date ||
                  undefined
                }
                title={formatDate(
                  date
                )}
              >
                Uploaded{" "}
                {formatRelativeDate(
                  date
                )}
              </time>

              {fileSize && (
                <>
                  <Separator />
                  <span>
                    {fileSize}
                  </span>
                </>
              )}

              <Separator />

              <span className="capitalize">
                {fileType}
              </span>

              {report.normalizedStatus && (
                <>
                  <Separator />

                  <ReportStatus
                    status={
                      report.normalizedStatus
                    }
                  />
                </>
              )}
            </div>

            {description && (
              <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Eye}
            onClick={() =>
              onPreview(
                report
              )
            }
          >
            Preview
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={
              ExternalLink
            }
            loading={
              isOpening
            }
            loadingText="Opening..."
            disabled={
              isDownloading ||
              isDeleting
            }
            onClick={() =>
              onView(report)
            }
          >
            Open
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            loading={
              isDownloading
            }
            disabled={
              isOpening ||
              isDeleting
            }
            onClick={() =>
              onDownload(
                report
              )
            }
            aria-label={`Download ${title}`}
            title="Download report"
            className="text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            {!isDownloading && (
              <Download
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}
          </Button>

          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              loading={
                isDeleting
              }
              disabled={
                isOpening ||
                isDownloading
              }
              onClick={() =>
                onDelete(
                  report
                )
              }
              aria-label={`Delete ${title}`}
              title="Delete report"
              className="text-slate-500 hover:bg-red-50 hover:text-red-700"
            >
              {!isDeleting && (
                <Trash2
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function Separator() {
  return (
    <span
      className="text-slate-300"
      aria-hidden="true"
    >
      •
    </span>
  );
}

/* =====================================================
   Report Icon and Status
===================================================== */

function ReportIcon({
  type,
}) {
  const iconClasses = {
    image:
      "bg-violet-50 text-violet-600",
    document:
      "bg-red-50 text-red-600",
    file:
      "bg-slate-100 text-slate-500",
  };

  const Icon =
    type === "image"
      ? FileImage
      : type ===
          "document"
        ? FileText
        : File;

  return (
    <span
      className={[
        "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
        iconClasses[type] ||
          iconClasses.file,
      ].join(" ")}
    >
      <Icon
        className="h-5 w-5"
        aria-hidden="true"
      />
    </span>
  );
}

function ReportStatus({
  status,
}) {
  const normalized =
    String(status)
      .trim()
      .toLowerCase();

  const styles = {
    approved:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",

    verified:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",

    pending:
      "bg-amber-50 text-amber-700 ring-amber-200",

    rejected:
      "bg-red-50 text-red-700 ring-red-200",

    processing:
      "bg-blue-50 text-blue-700 ring-blue-200",
  };

  return (
    <span
      className={[
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
        styles[normalized] ||
          "bg-slate-100 text-slate-600 ring-slate-200",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

/* =====================================================
   Preview Modal
===================================================== */

function ReportPreviewModal({
  report,
  url,
  isLoading,
  isOpening,
  isDownloading,
  onClose,
  onOpen,
  onDownload,
}) {
  const fileType =
    report.normalizedType ||
    getFileType(report);

  const title =
    report.normalizedTitle ||
    getReportTitle(report);

  const description =
    report.normalizedDescription ||
    getReportDescription(
      report
    );

  function handleBackdropClick(
    event
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-preview-title"
      onMouseDown={
        handleBackdropClick
      }
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <ReportIcon
              type={fileType}
            />

            <div className="min-w-0">
              <h2
                id="report-preview-title"
                className="truncate text-lg font-bold text-slate-950"
                title={title}
              >
                {title}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  {formatDate(
                    getReportDate(
                      report
                    )
                  )}
                </span>

                <Separator />

                <ReportStatus
                  status={
                    getReportStatus(
                      report
                    )
                  }
                />
              </div>

              {description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
            aria-label="Close report preview"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4 sm:p-6">
          {isLoading ? (
            <PreviewLoader />
          ) : !url ? (
            <PreviewUnavailable />
          ) : fileType ===
            "image" ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <img
                src={url}
                alt={`Preview of ${title}`}
                className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>
          ) : fileType ===
            "document" ? (
            <iframe
              src={url}
              title={`Preview of ${title}`}
              className="h-[68vh] w-full rounded-2xl border border-slate-200 bg-white"
            />
          ) : (
            <PreviewUnavailable />
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            type="button"
            variant="outline"
            leftIcon={
              Download
            }
            loading={
              isDownloading
            }
            loadingText="Downloading..."
            disabled={
              isOpening
            }
            onClick={
              onDownload
            }
          >
            Download
          </Button>

          <Button
            type="button"
            leftIcon={
              ExternalLink
            }
            loading={
              isOpening
            }
            loadingText="Opening..."
            disabled={
              isDownloading
            }
            onClick={onOpen}
          >
            Open in new tab
          </Button>
        </div>
      </div>
    </div>
  );
}

function PreviewLoader() {
  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"
        aria-hidden="true"
      />

      <p className="mt-4 text-sm font-semibold text-slate-700">
        Loading report preview...
      </p>
    </div>
  );
}

function PreviewUnavailable() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <File
          className="h-7 w-7"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        Preview unavailable
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        This file cannot be displayed inside the browser preview. Open or download it to view the complete report.
      </p>
    </div>
  );
}

/* =====================================================
   Pagination
===================================================== */

function ReportsPagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}) {
  if (
    totalPages <= 1
  ) {
    return null;
  }

  const firstResult =
    (currentPage - 1) *
      pageSize +
    1;

  const lastResult =
    Math.min(
      currentPage *
        pageSize,
      totalResults
    );

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {firstResult}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-700">
          {lastResult}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {totalResults}
        </span>{" "}
        reports
      </p>

      <div
        className="flex items-center gap-2"
        aria-label="Report pagination"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={
            ChevronLeft
          }
          disabled={
            currentPage === 1
          }
          onClick={() =>
            onPageChange(
              currentPage - 1
            )
          }
        >
          Previous
        </Button>

        <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          Page {currentPage} of{" "}
          {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            onPageChange(
              currentPage + 1
            )
          }
        >
          Next
          <ChevronRight
            className="ml-2 h-4 w-4"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}

/* =====================================================
   Empty and Error States
===================================================== */

function EmptyReports({
  onRefresh,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText
          className="h-7 w-7"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        No medical reports uploaded
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Uploaded blood tests, scans, physician notes, and verification documents will appear here.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={
          RefreshCw
        }
        onClick={onRefresh}
        className="mt-5"
      >
        Check again
      </Button>
    </div>
  );
}

function NoReportResults({
  onClear,
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
        No matching reports
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try changing the search term, status, file type, or sorting option.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        className="mt-5"
      >
        Clear filters
      </Button>
    </div>
  );
}

function ReportsError({
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
            Reports could not be loaded
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

function ReportsSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading medical reports"
    >
      <span className="sr-only">
        Loading medical reports.
      </span>

      <div
        className="flex items-center justify-between border-b border-slate-100 p-5"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />

            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="hidden h-9 w-24 animate-pulse rounded-xl bg-slate-200 sm:block" />
      </div>

      <div
        className="border-b border-slate-100 bg-slate-50/60 p-5"
        aria-hidden="true"
      >
        <div className="h-11 w-full max-w-md animate-pulse rounded-xl bg-slate-200" />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({
            length: 3,
          }).map(
            (_, index) => (
              <div
                key={`filter-${index}`}
                className="h-11 animate-pulse rounded-xl bg-slate-200"
              />
            )
          )}
        </div>
      </div>

      <div
        className="divide-y divide-slate-100"
        aria-hidden="true"
      >
        {Array.from({
          length: 4,
        }).map(
          (_, index) => (
            <div
              key={`report-${index}`}
              className="flex items-center gap-4 p-5"
            >
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-200" />

              <div className="flex-1 space-y-3">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />

                <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />

                <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="hidden gap-2 lg:flex">
                <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200" />

                <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}