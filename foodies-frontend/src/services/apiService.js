import { refreshToken } from './authService';

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const authFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', 
    headers: {
      ...getAuthHeaders(),
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
            ...getAuthHeaders(),
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