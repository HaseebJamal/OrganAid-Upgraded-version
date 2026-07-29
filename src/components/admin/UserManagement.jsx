import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuth } from "../../context/AuthContext";

import {
  deleteUser,
  getUsers,
  setUserActive,
  updateUserRole,
} from "../../services/adminService";

const roleFilters = [
  { value: "all", label: "All members" },
  { value: "donor", label: "Donors" },
  { value: "recipient", label: "Recipients" },
  { value: "hospital", label: "Hospitals" },
  { value: "admin", label: "Administrators" },
];

const editableRoles = ["donor", "recipient", "hospital", "admin"];

const initialData = {
  users: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  },
};

function normalizeResponse(response) {
  const payload = response?.data || response || {};

  return {
    users: Array.isArray(payload.users)
      ? payload.users
      : Array.isArray(payload.data)
        ? payload.data
        : [],
    pagination: {
      page: Number(
        payload.pagination?.page ??
          payload.page ??
          initialData.pagination.page
      ),
      pages: Number(
        payload.pagination?.pages ??
          payload.totalPages ??
          initialData.pagination.pages
      ),
      total: Number(
        payload.pagination?.total ??
          payload.total ??
          initialData.pagination.total
      ),
      limit: Number(
        payload.pagination?.limit ??
          payload.limit ??
          initialData.pagination.limit
      ),
    },
  };
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState("");
  const [error, setError] = useState("");

  const totalPages = Math.max(
    Number(data.pagination?.pages) || 1,
    1
  );

  const totalUsers = Number(data.pagination?.total) || 0;

  const pageStart = useMemo(() => {
    if (!totalUsers) return 0;

    const limit =
      Number(data.pagination?.limit) ||
      initialData.pagination.limit;

    return (page - 1) * limit + 1;
  }, [data.pagination?.limit, page, totalUsers]);

  const pageEnd = useMemo(() => {
    if (!totalUsers) return 0;

    const limit =
      Number(data.pagination?.limit) ||
      initialData.pagination.limit;

    return Math.min(page * limit, totalUsers);
  }, [data.pagination?.limit, page, totalUsers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getUsers({
        role: selectedRole === "all" ? "" : selectedRole,
        search: debouncedSearch,
        page,
        limit: 12,
      });

      const normalized = normalizeResponse(response);
      setData(normalized);

      if (
        normalized.pagination.pages > 0 &&
        page > normalized.pagination.pages
      ) {
        setPage(normalized.pagination.pages);
      }
    } catch (requestError) {
      console.error("Unable to load users:", requestError);

      const message = getErrorMessage(
        requestError,
        "Unable to load users. Please try again."
      );

      setError(message);
      setData(initialData);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, selectedRole]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function runUserAction(userId, action, successMessage) {
    if (loadingUserId) return;

    try {
      setLoadingUserId(userId);
      await action();
      toast.success(successMessage);
      await loadUsers();
    } catch (actionError) {
      toast.error(
        getErrorMessage(
          actionError,
          "The requested action could not be completed."
        )
      );
    } finally {
      setLoadingUserId("");
    }
  }

  function handleRoleFilter(value) {
    setSelectedRole(value);
    setPage(1);
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function clearSearch() {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  }

  function handleRoleChange(managedUser, nextRole) {
    if (nextRole === managedUser.role) return;

    runUserAction(
      managedUser._id,
      () => updateUserRole(managedUser._id, nextRole),
      `${managedUser.fullName || "User"} is now assigned as ${formatRole(
        nextRole
      )}.`
    );
  }

  function handleStatusChange(managedUser) {
    const nextStatus = !managedUser.isActive;

    runUserAction(
      managedUser._id,
      () => setUserActive(managedUser._id, nextStatus),
      `${managedUser.fullName || "User"} has been ${
        nextStatus ? "enabled" : "disabled"
      }.`
    );
  }

  function handleDelete(managedUser) {
    const confirmed = window.confirm(
      `Delete ${
        managedUser.fullName || managedUser.email || "this user"
      }?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    runUserAction(
      managedUser._id,
      () => deleteUser(managedUser._id),
      `${managedUser.fullName || "User"} has been removed.`
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader totalUsers={totalUsers} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <UserFilters
          selectedRole={selectedRole}
          search={search}
          onRoleChange={handleRoleFilter}
          onSearchChange={handleSearchChange}
          onClearSearch={clearSearch}
        />

        {error && (
          <ErrorState
            message={error}
            onRetry={loadUsers}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-5 py-4">
                  Member
                </th>

                <th scope="col" className="px-5 py-4">
                  Role
                </th>

                <th scope="col" className="px-5 py-4">
                  Status
                </th>

                <th scope="col" className="px-5 py-4">
                  Joined
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <UserTableSkeleton />
              ) : data.users.length ? (
                data.users.map((managedUser) => (
                  <UserRow
                    key={managedUser._id}
                    user={managedUser}
                    currentUser={currentUser}
                    isProcessing={
                      loadingUserId === managedUser._id
                    }
                    onRoleChange={handleRoleChange}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <EmptyUsers
                  hasFilters={
                    selectedRole !== "all" ||
                    Boolean(debouncedSearch)
                  }
                />
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalUsers={totalUsers}
          pageStart={pageStart}
          pageEnd={pageEnd}
          disabled={isLoading}
          onPrevious={() =>
            setPage((current) => Math.max(current - 1, 1))
          }
          onNext={() =>
            setPage((current) =>
              Math.min(current + 1, totalPages)
            )
          }
        />
      </section>
    </div>
  );
}

function PageHeader({ totalUsers }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-red-600">
          Member management
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Users
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Search, review, and manage account roles and access
          across the OrganAid network.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <UsersRound
          className="h-4 w-4 text-red-600"
          aria-hidden="true"
        />

        <span className="text-sm font-semibold text-slate-700">
          {formatNumber(totalUsers)} members
        </span>
      </div>
    </header>
  );
}

function UserFilters({
  selectedRole,
  search,
  onRoleChange,
  onSearchChange,
  onClearSearch,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter users by role"
      >
        {roleFilters.map((filter) => {
          const isSelected = selectedRole === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onRoleChange(filter.value)}
              aria-pressed={isSelected}
              className={[
                "rounded-full px-3.5 py-2 text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
                isSelected
                  ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="relative w-full xl:w-80">
        <Input
          value={search}
          onChange={onSearchChange}
          placeholder="Search by name or email"
          leftIcon={Search}
          className="pr-10"
          aria-label="Search users by name or email"
        />

        {search && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:text-red-600"
            aria-label="Clear user search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  currentUser,
  isProcessing,
  onRoleChange,
  onStatusChange,
  onDelete,
}) {
  const isCurrentUser =
    String(currentUser?._id || currentUser?.id) ===
    String(user._id);

  const canDelete = user.role !== "admin" && !isCurrentUser;
  const canEdit = !isCurrentUser;

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-slate-900">
                {user.fullName || "Unnamed member"}
              </p>

              {isCurrentUser && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  You
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-xs text-slate-500">
              {user.email || "No email address"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <select
          value={user.role}
          onChange={(event) =>
            onRoleChange(user, event.target.value)
          }
          disabled={!canEdit || isProcessing}
          aria-label={`Role for ${user.fullName || user.email}`}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold capitalize text-slate-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
        >
          {editableRoles.map((role) => (
            <option key={role} value={role}>
              {formatRole(role)}
            </option>
          ))}
        </select>
      </td>

      <td className="px-5 py-4">
        <StatusBadge active={user.isActive} />
      </td>

      <td className="px-5 py-4 text-slate-500">
        {formatDate(user.createdAt)}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={isProcessing}
            loadingText="Updating..."
            disabled={!canEdit}
            onClick={() => onStatusChange(user)}
          >
            {user.isActive ? "Disable" : "Enable"}
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isProcessing}
              onClick={() => onDelete(user)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label={`Delete ${
                user.fullName || user.email || "user"
              }`}
              title="Delete user"
            >
              <Trash2
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

function UserAvatar({ user }) {
  const initials =
    user.fullName
      ?.trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OA";

  const imageUrl = user.profileImage || user.avatar;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover"
      />
    );
  }

  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-sm font-bold text-red-700"
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-slate-400",
        ].join(" ")}
        aria-hidden="true"
      />

      {active ? "Active" : "Disabled"}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  totalUsers,
  pageStart,
  pageEnd,
  disabled,
  onPrevious,
  onNext,
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        {totalUsers > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {pageStart}–{pageEnd}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {formatNumber(totalUsers)}
            </span>{" "}
            members
          </>
        ) : (
          "No members to display"
        )}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={ChevronLeft}
          disabled={disabled || page <= 1}
          onClick={onPrevious}
        >
          Previous
        </Button>

        <span className="min-w-24 text-center text-sm font-medium text-slate-500">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          rightIcon={ChevronRight}
          disabled={disabled || page >= totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function EmptyUsers({ hasFilters }) {
  return (
    <tr>
      <td colSpan={5} className="px-5 py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            {hasFilters ? (
              <Search className="h-6 w-6" aria-hidden="true" />
            ) : (
              <UserRound className="h-6 w-6" aria-hidden="true" />
            )}
          </span>

          <p className="mt-4 font-semibold text-slate-900">
            {hasFilters
              ? "No matching members found"
              : "No registered members"}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {hasFilters
              ? "Try changing the selected role or using a different search term."
              : "Registered OrganAid users will appear here."}
          </p>
        </div>
      </td>
    </tr>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      className="flex flex-col justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-4 sm:flex-row sm:items-center"
      role="alert"
    >
      <div>
        <p className="text-sm font-semibold text-red-800">
          Users could not be loaded
        </p>

        <p className="mt-1 text-sm text-red-600">{message}</p>
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

function UserTableSkeleton() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />

          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-44 rounded bg-slate-100" />
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="h-10 w-28 rounded-xl bg-slate-200" />
      </td>

      <td className="px-5 py-4">
        <div className="h-6 w-16 rounded-full bg-slate-200" />
      </td>

      <td className="px-5 py-4">
        <div className="h-4 w-24 rounded bg-slate-200" />
      </td>

      <td className="px-5 py-4">
        <div className="ml-auto h-9 w-28 rounded-xl bg-slate-200" />
      </td>
    </tr>
  ));
}

function formatRole(role) {
  if (!role) return "Unknown";

  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(
    Number(value) || 0
  );
}