const DEFAULT_BACKEND_ORIGIN = 'http://localhost:5000';

const normalizeUrl = (value) => (value || '').trim().replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const envApiUrl = normalizeUrl(process.env.REACT_APP_API_URL);
  return envApiUrl || `${DEFAULT_BACKEND_ORIGIN}/api`;
};

export const getBackendOrigin = () => {
  const envApiUrl = normalizeUrl(process.env.REACT_APP_API_URL);
  if (envApiUrl) {
    return envApiUrl.endsWith('/api') ? envApiUrl.slice(0, -4) : envApiUrl;
  }

  return DEFAULT_BACKEND_ORIGIN;
};

export const getSocketUrl = () => {
  const envSocketUrl = normalizeUrl(process.env.REACT_APP_SOCKET_URL);
  return envSocketUrl || getBackendOrigin();
};
