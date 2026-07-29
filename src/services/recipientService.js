import api from "./api";

/* ==========================================
   Helpers
========================================== */

const unwrapRecipient = (response) =>
  response?.recipient || response;

const unwrapRequest = (response) =>
  response?.request || response;

const unwrapRequests = (response) =>
  response?.requests || [];

/* ==========================================
   Recipient Profile
========================================== */

export const createRecipient = async (
  payload
) => {
  const data = await api.post(
    "/recipients",
    payload
  );

  return unwrapRecipient(data);
};

export const getMyRecipientProfile =
  async () => {
    const data = await api.get(
      "/recipients/me"
    );

    return unwrapRecipient(data);
  };

export const updateRecipient = async (
  payload
) => {
  const data = await api.put(
    "/recipients/me",
    payload
  );

  return unwrapRecipient(data);
};

export const deleteRecipient = () =>
  api.delete("/recipients/me");

/* ==========================================
   Organ Requests
========================================== */

export const createOrganRequest =
  async (payload = {}) => {
    const data = await api.post(
      "/recipients/requests",
      payload
    );

    return unwrapRequest(data);
  };

export const getMyRequests =
  async () => {
    const data = await api.get(
      "/recipients/requests"
    );

    return unwrapRequests(data);
  };

export const getRequestById = async (
  requestId
) => {
  const data = await api.get(
    `/recipients/requests/${requestId}`
  );

  return unwrapRequest(data);
};

export const updateOrganRequest =
  async (requestId, payload) => {
    const data = await api.put(
      `/recipients/requests/${requestId}`,
      payload
    );

    return unwrapRequest(data);
  };

export const cancelOrganRequest = (
  requestId
) =>
  api.delete(
    `/recipients/requests/${requestId}`
  );

/* ==========================================
   Export Service Object
========================================== */

const recipientService = {
  createRecipient,
  getMyRecipientProfile,
  updateRecipient,
  deleteRecipient,

  createOrganRequest,
  getMyRequests,
  getRequestById,
  updateOrganRequest,
  cancelOrganRequest,
};

export default recipientService;