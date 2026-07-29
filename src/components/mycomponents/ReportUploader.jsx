import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  FileImage,
  FileText,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuth } from "../../context/AuthContext";
import reportService from "../../services/reportService";

/* =====================================================
   Constants
===================================================== */

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 160;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_FILE_TYPES =
  ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

/* =====================================================
   Helpers
===================================================== */

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(
    value >= 10 || unitIndex === 0 ? 0 : 1
  )} ${units[unitIndex]}`;
}

function getFileExtension(fileName = "") {
  const segments = fileName.split(".");

  if (segments.length < 2) {
    return "";
  }

  return segments.at(-1)?.toLowerCase() || "";
}

function isAllowedFile(file) {
  if (!file) {
    return false;
  }

  if (ALLOWED_MIME_TYPES.includes(file.type)) {
    return true;
  }

  const extension = getFileExtension(file.name);

  return [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "webp",
  ].includes(extension);
}

function getFileKind(file) {
  if (!file) {
    return "";
  }

  if (
    file.type?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp"].includes(
      getFileExtension(file.name)
    )
  ) {
    return "image";
  }

  return "document";
}

function getFileSignature(file) {
  if (!file) {
    return "";
  }

  return [
    file.name,
    file.size,
    file.lastModified,
  ].join("-");
}

/* =====================================================
   Main Component
===================================================== */

export default function ReportsUploader({
  onDone,
}) {
  const { user } = useAuth();

  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const [
    lastUploadedSignature,
    setLastUploadedSignature,
  ] = useState("");

  const [file, setFile] =
    useState(null);

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);

  const [
    validationError,
    setValidationError,
  ] = useState("");

  const userId =
    user?._id || user?.id;

  const fileKind = useMemo(
    () => getFileKind(file),
    [file]
  );

  const selectedFileSignature =
    useMemo(
      () => getFileSignature(file),
      [file]
    );

  const isDuplicateFile =
    Boolean(
      selectedFileSignature &&
        selectedFileSignature ===
          lastUploadedSignature
    );

  /* ===================================================
     Image Preview
  =================================================== */

  useEffect(() => {
    if (
      !file ||
      fileKind !== "image"
    ) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [file, fileKind]);

  /* ===================================================
     Validation
  =================================================== */

  function validateFile(
    selectedFile
  ) {
    if (!selectedFile) {
      return "Please select a report file.";
    }

    if (!isAllowedFile(selectedFile)) {
      return "Only PDF, JPG, JPEG, PNG, and WebP files are supported.";
    }

    if (selectedFile.size <= 0) {
      return "The selected file appears to be empty.";
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      return "The selected file must be 10 MB or smaller.";
    }

    if (
      getFileSignature(selectedFile) ===
      lastUploadedSignature
    ) {
      return "This file was already uploaded during the current session.";
    }

    return "";
  }

  function selectFile(
    selectedFile
  ) {
    const error =
      validateFile(selectedFile);

    if (error) {
      setFile(null);
      setValidationError(error);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    setFile(selectedFile);
    setValidationError("");
    setUploadProgress(0);
  }

  /* ===================================================
     Input and Drag Events
  =================================================== */

  function handleFileChange(
    event
  ) {
    selectFile(
      event.target.files?.[0] ||
        null
    );
  }

  function handleDragEnter(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current += 1;

    setIsDragging(true);
  }

  function handleDragOver(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.dataTransfer
    ) {
      event.dataTransfer.dropEffect =
        "copy";
    }
  }

  function handleDragLeave(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current -= 1;

    if (
      dragCounterRef.current <= 0
    ) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current = 0;
    setIsDragging(false);

    const droppedFiles =
      event.dataTransfer
        ?.files;

    if (
      !droppedFiles?.length
    ) {
      return;
    }

    if (
      droppedFiles.length > 1
    ) {
      toast.error(
        "Please upload one report at a time."
      );
    }

    selectFile(
      droppedFiles[0]
    );
  }

  function removeFile() {
    if (isUploading) {
      return;
    }

    setFile(null);
    setValidationError("");
    setUploadProgress(0);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function clearForm() {
    setFile(null);
    setDescription("");
    setValidationError("");
    setUploadProgress(0);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /* ===================================================
     Upload
  =================================================== */

  async function handleUpload(
    event
  ) {
    event.preventDefault();

    if (isUploading) {
      return;
    }

    if (!userId) {
      toast.error(
        "Your account information could not be found."
      );

      return;
    }

    const error =
      validateFile(file);

    if (error) {
      setValidationError(error);
      return;
    }

    const trimmedDescription =
      description.trim();

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setValidationError("");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "userId",
        userId
      );

      if (
        trimmedDescription
      ) {
        formData.append(
          "description",
          trimmedDescription
        );
      }

      const uploadOptions = {
        onUploadProgress:
          (progressEvent) => {
            const total =
              progressEvent?.total;

            const loaded =
              progressEvent?.loaded;

            if (
              !total ||
              !loaded
            ) {
              return;
            }

            const percentage =
              Math.min(
                100,
                Math.round(
                  (loaded / total) *
                    100
                )
              );

            setUploadProgress(
              percentage
            );
          },
      };

      await reportService.uploadReport(
        formData,
        uploadOptions
      );

      setLastUploadedSignature(
        selectedFileSignature
      );

      setUploadProgress(100);

      toast.success(
        "Medical report uploaded successfully."
      );

      clearForm();

      if (
        typeof onDone ===
        "function"
      ) {
        await onDone();
      }
    } catch (requestError) {
      console.error(
        "Report upload failed:",
        requestError
      );

      setUploadProgress(0);

      toast.error(
        getErrorMessage(
          requestError,
          "The medical report could not be uploaded."
        )
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <UploaderHeader />

      <form
        onSubmit={handleUpload}
        className="space-y-5 p-5"
        noValidate
      >
        <div>
          <label
            htmlFor="medical-report-file"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Report file
            <span
              className="ml-1 text-red-600"
              aria-hidden="true"
            >
              *
            </span>

            <span className="sr-only">
              Required
            </span>
          </label>

          {!file ? (
            <UploadDropzone
              fileInputRef={
                fileInputRef
              }
              isDragging={
                isDragging
              }
              isUploading={
                isUploading
              }
              onChange={
                handleFileChange
              }
              onDragEnter={
                handleDragEnter
              }
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={
                handleDrop
              }
            />
          ) : (
            <SelectedFile
              file={file}
              fileKind={fileKind}
              previewUrl={
                previewUrl
              }
              disabled={
                isUploading
              }
              isDuplicate={
                isDuplicateFile
              }
              onRemove={
                removeFile
              }
            />
          )}

          {validationError && (
            <ValidationMessage
              message={
                validationError
              }
            />
          )}
        </div>

        <DescriptionField
          value={description}
          disabled={
            isUploading
          }
          onChange={
            setDescription
          }
        />

        {isUploading && (
          <UploadProgress
            progress={
              uploadProgress
            }
          />
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          {file && (
            <Button
              type="button"
              variant="ghost"
              disabled={
                isUploading
              }
              onClick={
                removeFile
              }
              leftIcon={
                Trash2
              }
              className="text-slate-600"
            >
              Remove file
            </Button>
          )}

          <Button
            type="submit"
            loading={
              isUploading
            }
            loadingText={
              uploadProgress > 0
                ? `Uploading ${uploadProgress}%`
                : "Uploading report..."
            }
            disabled={
              !file ||
              !userId ||
              isDuplicateFile
            }
            leftIcon={
              UploadCloud
            }
          >
            Upload report
          </Button>
        </div>
      </form>
    </section>
  );
}

/* =====================================================
   Header
===================================================== */

function UploaderHeader() {
  return (
    <div className="border-b border-slate-100 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
          <UploadCloud
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Upload medical
            report
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Upload medical
            documents for
            hospital review and
            profile verification.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   Upload Dropzone
===================================================== */

function UploadDropzone({
  fileInputRef,
  isDragging,
  isUploading,
  onChange,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  return (
    <label
      htmlFor="medical-report-file"
      onDragEnter={
        onDragEnter
      }
      onDragOver={
        onDragOver
      }
      onDragLeave={
        onDragLeave
      }
      onDrop={onDrop}
      className={[
        "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
        "focus-within:outline-none focus-within:ring-4 focus-within:ring-red-100",
        isDragging
          ? "border-red-500 bg-red-50 shadow-sm"
          : "border-slate-300 bg-slate-50 hover:border-red-300 hover:bg-red-50/40",
        isUploading
          ? "pointer-events-none cursor-not-allowed opacity-60"
          : "",
      ].join(" ")}
      aria-label="Upload medical report file"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-red-600 shadow-sm ring-1 ring-slate-200">
        <UploadCloud
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <p className="mt-4 text-sm font-semibold text-slate-900">
        {isDragging
          ? "Drop the report here"
          : "Drop a report here or browse files"}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        PDF, JPG, JPEG,
        PNG, or WebP.
        Maximum size: 10 MB.
      </p>

      <input
        ref={fileInputRef}
        id="medical-report-file"
        type="file"
        accept={
          ACCEPTED_FILE_TYPES
        }
        onChange={onChange}
        disabled={
          isUploading
        }
        className="sr-only"
      />
    </label>
  );
}

/* =====================================================
   Selected File
===================================================== */

function SelectedFile({
  file,
  fileKind,
  previewUrl,
  disabled,
  isDuplicate,
  onRemove,
}) {
  const Icon =
    fileKind === "image"
      ? FileImage
      : FileText;

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border",
        isDuplicate
          ? "border-amber-200 bg-amber-50/70"
          : "border-emerald-200 bg-emerald-50/60",
      ].join(" ")}
    >
      {fileKind ===
        "image" &&
        previewUrl && (
          <div className="relative border-b border-emerald-100 bg-slate-100">
            <img
              src={previewUrl}
              alt={`Preview of ${file.name}`}
              className="h-52 w-full object-contain"
            />

            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              <ImageIcon
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Image preview
            </span>

            <button
              type="button"
              disabled={disabled}
              onClick={onRemove}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remove ${file.name}`}
              title="Remove selected file"
            >
              <X
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        )}

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <span
          className={[
            "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1",
            isDuplicate
              ? "text-amber-700 ring-amber-100"
              : "text-emerald-700 ring-emerald-100",
          ].join(" ")}
        >
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold text-slate-900"
            title={file.name}
          >
            {file.name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatFileSize(
              file.size
            )}

            {file.type
              ? ` • ${file.type}`
              : ""}
          </p>

          {isDuplicate && (
            <p
              className="mt-2 text-xs font-semibold text-amber-700"
              role="alert"
            >
              This file was
              already uploaded
              during the current
              session.
            </p>
          )}
        </div>

        {fileKind !==
          "image" && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
            title="Remove selected file"
            className="shrink-0 text-red-600 hover:bg-red-100 hover:text-red-700"
          >
            <Trash2
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Button>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   Description
===================================================== */

function DescriptionField({
  value,
  disabled,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor="report-description"
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        Description

        <span className="ml-1 font-normal text-slate-400">
          Optional
        </span>
      </label>

      <Input
        id="report-description"
        type="text"
        value={value}
        maxLength={
          MAX_DESCRIPTION_LENGTH
        }
        disabled={disabled}
        placeholder="For example: Blood test, MRI scan, or X-ray"
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />

      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500">
          Add a clear
          description so
          hospital staff can
          identify the report
          quickly.
        </p>

        <span
          className={[
            "shrink-0 text-xs",
            value.length >=
            MAX_DESCRIPTION_LENGTH
              ? "font-semibold text-red-600"
              : "text-slate-400",
          ].join(" ")}
          aria-live="polite"
        >
          {value.length}/
          {
            MAX_DESCRIPTION_LENGTH
          }
        </span>
      </div>
    </div>
  );
}

/* =====================================================
   Progress
===================================================== */

function UploadProgress({
  progress,
}) {
  const hasKnownProgress =
    progress > 0;

  return (
    <div
      className="rounded-xl border border-blue-100 bg-blue-50 p-4"
      role="status"
      aria-live="polite"
      aria-label="Uploading report"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-blue-900">
          Uploading medical
          report
        </p>

        <span className="text-sm font-bold text-blue-700">
          {hasKnownProgress
            ? `${progress}%`
            : "Please wait"}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
        <div
          className={[
            "h-full rounded-full bg-blue-600 transition-all duration-300",
            !hasKnownProgress
              ? "w-1/3 animate-pulse"
              : "",
          ].join(" ")}
          style={
            hasKnownProgress
              ? {
                  width: `${progress}%`,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}

/* =====================================================
   Validation Message
===================================================== */

function ValidationMessage({
  message,
}) {
  return (
    <div
      className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5"
      role="alert"
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
        aria-hidden="true"
      />

      <p className="text-sm font-medium text-red-700">
        {message}
      </p>
    </div>
  );
}
