import { refreshToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        await refreshToken();

        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          credentials: 'include', // ← add this
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
export const authDelete = (endpoint) => authFetch(endpoint, { method: 'DELETE' });

// For multipart/form-data requests (e.g. profile photo uploads)
export const authPutFormData = (endpoint, formData) => authFetch(endpoint, { method: 'PUT', body: formData });