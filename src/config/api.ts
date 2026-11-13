// Base API URL configuration
// In Vite development, requests can use VITE_API_BASE_URL or default to Vite proxy /api
// In production builds, it points directly to your live production HTTPS backend URL.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'https://api.exofo.exofttechnologies.com');

/**
 * Helper to build an absolute or proxied API endpoint URL
 * @param path - e.g. '/api/auth/login'
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL.replace(/\/+$/, '')}${cleanPath}`;
};

