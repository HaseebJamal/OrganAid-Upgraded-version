import api from "./api";

/* ==========================================
   Helpers
========================================== */

const unwrapHospital = (response) =>
  response?.hospital || response;

const unwrapHistory = (response) =>
  response?.history || [];

const unwrapQueue = (response) => ({
  donors: response?.donors || [],
  recipients: response?.recipients || [],
});

/* ==========================================
   Hospital Profile
========================================== */

export const getHospitalProfile = async () => {
  const data = await api.get("/hospital/me");

  return unwrapHospital(data);
};

export const createHospital = async (
  payload
) => {
  const data = await api.post(
    "/hospital",
    payload
  );

  return unwrapHospital(data);
};

export const updateHospital = async (
  payload
) => {
  const data = await api.put(
    "/hospital/me",
    payload
  );

  return unwrapHospital(data);
};

/* ==========================================
   Verification Queue
========================================== */

export const getHospitalQueue = async () => {
  const data = await api.get(
    "/hospital/queue"
  );

  return unwrapQueue(data);
};

export const verifyQueueItem = async (
  kind,
  id,
  decision,
  notes = ""
) => {
  return api.post(
    "/hospital/verify",
    {
      kind,
      id,
      decision,
      notes,
    }
  );
};

/* ==========================================
   Verification History
========================================== */

export const getHospitalHistory =
  async () => {
    const data = await api.get(
      "/hospital/history"
    );

    return unwrapHistory(data);
  };