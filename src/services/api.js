const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const API_PREFIX = "/api";

function buildUrl(endpoint) {
  if (!endpoint) {
    throw new Error("API endpoint is required.");
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const path = normalizedEndpoint.startsWith(API_PREFIX)
    ? normalizedEndpoint
    : `${API_PREFIX}${normalizedEndpoint}`;

  return `${API_BASE}${path}`;
}

function getStoredToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    // Ignore storage errors.
  }
}

function extractErrorMessage(data, response) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return typeof data.error === "string"
      ? data.error
      : data.error.message;
  }

  return (
    response.statusText ||
    `Request failed with status ${response.status}`
  );
}

async function parseResponse(response) {
  if (response.status === 204) {
    return {};
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers || {});

  if (!isFormData && options.body !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(buildUrl(endpoint), {
      ...options,
      headers,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The request was cancelled.", { cause: error });
    }

    throw new Error(
      "Unable to connect to the OrganAid server. Check that the backend is running.",
      { cause: error }
    );
  }

  const data = await parseResponse(response);

  if (response.status === 401) {
    clearStoredAuth();
  }

  if (!response.ok) {
    const error = new Error(
      extractErrorMessage(data, response)
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

function prepareBody(body) {
  if (
    body === undefined ||
    body === null ||
    body instanceof FormData ||
    body instanceof Blob ||
    typeof body === "string"
  ) {
    return body;
  }

  return JSON.stringify(body);
}

function withBody(method) {
  return (url, body, options = {}) =>
    request(url, {
      ...options,
      method,
      body: prepareBody(body),
    });
}

export const api = {
  get(url, options = {}) {
    return request(url, {
      ...options,
      method: "GET",
    });
  },

  post: withBody("POST"),

  put: withBody("PUT"),

  patch: withBody("PATCH"),

  delete(url, options = {}) {
    return request(url, {
      ...options,
      method: "DELETE",
    });
  },

  request,
};

export default api;
