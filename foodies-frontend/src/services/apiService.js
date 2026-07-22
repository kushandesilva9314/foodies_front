import { refreshToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Shared in-flight refresh promise ────────────────────────────────────────
// If multiple requests 401 at the same time, they all await this SAME
// promise instead of each calling refreshToken() independently. Refresh
// tokens are single-use (rotated), so letting two calls race would mean
// only the first succeeds and the rest get "Invalid refresh token" and
// force a logout — even though the user was still validly logged in.
let refreshPromise = null;

const getRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");
  const headers = {
    'Authorization': `Bearer ${token}`,
  };
  // Don't set Content-Type for FormData — the browser sets the correct
  // multipart/form-data boundary automatically.
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const authFetch = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...getAuthHeaders(isFormData),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const data = await response.json();

    if (data.code === 'TOKEN_EXPIRED') {
      try {
        // Share one refresh across any requests that 401 at the same time
        await getRefreshPromise();

        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers: {
            ...getAuthHeaders(isFormData),
            ...options.headers,
          },
        });

        const retryData = await retryResponse.json();

        if (!retryResponse.ok) {
          throw new Error(retryData.message || 'Request failed');
        }

        return retryData;

      } catch (refreshError) {
        window.location.href = '/login';
        throw refreshError;
      }
    }

    throw new Error(data.message || 'Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const authGet = (endpoint) => authFetch(endpoint, { method: 'GET' });
export const authPost = (endpoint, body) => authFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const authPut = (endpoint, body) => authFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const authDelete = (endpoint, body) =>
  authFetch(endpoint, {
    method: 'DELETE',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

// For multipart/form-data requests (e.g. profile photo uploads)
export const authPutFormData = (endpoint, formData) => authFetch(endpoint, { method: 'PUT', body: formData });
export const authPostFormData = (endpoint, formData) => authFetch(endpoint, { method: 'POST', body: formData });