import api from "./api";

/* ==========================================
   Helpers
========================================== */

const unwrapReports = (response) =>
  response?.reports || [];

const unwrapReport = (response) =>
  response?.report || response;

/* ==========================================
   Reports
========================================== */

export const getUserReports =
  async () => {
    const data = await api.get("/reports");

    return unwrapReports(data);
  };

export const uploadReport =
  async (formData) => {
    return await api.post(
      "/reports",
      formData
    );
  };

export const getReport = async (
  reportId
) => {
  const data = await api.get(
    `/reports/${reportId}`
  );

  return unwrapReport(data);
};

export const getReportUrl =
  async (reportId) => {
    const data = await api.get(
      `/reports/${reportId}`
    );

    return (
      data?.reportUrl ||
      data?.url ||
      data?.report?.url ||
      null
    );
  };

export const deleteReport = (
  reportId
) =>
  api.delete(`/reports/${reportId}`);

/* ==========================================
   Export Service
========================================== */

const reportService = {
  getUserReports,
  uploadReport,
  getReport,
  getReportUrl,
  deleteReport,
};

export default reportService;