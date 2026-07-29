import api from "./api";

/* ==========================================
   Helpers
========================================== */

const unwrapDonor = (response) =>
  response?.donor || response;

const unwrapDonors = (response) =>
  response?.donors || [];

/* ==========================================
   Donor Profile
========================================== */

export const createDonorProfile = async (
  payload
) => {
  const data = await api.post(
    "/donors",
    payload
  );

  return unwrapDonor(data);
};

export const getDonorProfile = async () => {
  const data = await api.get("/donors/me");

  return unwrapDonor(data);
};

export const updateDonorProfile = async (
  payload
) => {
  const data = await api.put(
    "/donors/me",
    payload
  );

  return unwrapDonor(data);
};

export const deleteDonorProfile = () =>
  api.delete("/donors/me");

/* ==========================================
   Donor Lists
========================================== */

export const getAllDonors = async () => {
  const data = await api.get("/donors");

  return unwrapDonors(data);
};

export const getAvailableDonors =
  async () => {
    const data = await api.get(
      "/donors/available"
    );

    return unwrapDonors(data);
  };

/* ==========================================
   Availability
========================================== */

export const toggleAvailability =
  async () => {
    const data = await api.patch(
      "/donors/availability"
    );

    return unwrapDonor(data);
  };