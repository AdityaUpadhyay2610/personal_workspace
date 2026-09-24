/**
 * Central API Client configuration and request wrapper
 * Supports automatic JWT bearer authorization, HttpOnly cookies, and silent token refresh
 */

function getApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').trim();
  
  // Remove trailing slashes
  let url = envUrl.replace(/\/+$/, '');
  
  // If the URL accidentally contains endpoint paths like /api/documents or /documents, strip them back
  url = url.replace(/\/api\/documents\/?$/, '');
  url = url.replace(/\/documents\/?$/, '');
  
  // Ensure the base URL ends with /api
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  
  return url;
}

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Token helpers (Only short-lived access token is stored; refresh token is strictly HttpOnly Cookie)
// Automatically purge any old refreshToken stored from previous test sessions
try {
  localStorage.removeItem('refreshToken');
} catch (error) {
  console.warn('Unable to clear legacy refresh token:', error);
}

export const getAccessToken = () => localStorage.getItem('accessToken');
export const setAccessToken = (accessToken) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  try {
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.warn('Unable to clear legacy refresh token:', error);
  }
};
export const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isGuest');
};

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

async function request(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const token = getAccessToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    credentials: 'include', // Transmits HttpOnly cookie securely
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);

    let data = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    // Handle 401 Token Expiration (try silent refresh via HttpOnly cookie)
    if (res.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            setAccessToken(refreshData.accessToken);
            isRefreshing = false;
            onRefreshed(refreshData.accessToken);
            return request(endpoint, options, true);
          } else {
            isRefreshing = false;
            clearAuthTokens();
            window.dispatchEvent(new CustomEvent('auth:expired'));
          }
        } catch (err) {
          console.warn('Token refresh request failed:', err);
          isRefreshing = false;
          clearAuthTokens();
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      } else {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            const updatedOptions = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            resolve(request(endpoint, updatedOptions, true));
          });
        });
      }
    }

    if (!res.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${res.status}`;
      throw new ApiError(errorMessage, res.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or client-side fetch error
    throw new ApiError(error.message || 'Network request failed', 0, null);
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
