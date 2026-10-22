import axios from 'axios';
import { EnvConfig } from '@/common/constants';

const CONTENT_DISPOSITION = 'content-disposition';
const FALLBACK_FILE_NAME = 'download';
const CANCELLED_CODE = 'REQUEST_CANCELLED';
const NETWORK_ERROR_MESSAGE = 'Unable to connect to server. Please try again';
const UNREACHABLE_MESSAGE = 'Failed to connect to server. Please try again later.';

const client = axios.create({
  baseURL: EnvConfig.BASE_URL,
  withCredentials: true, // required so the browser sends and accepts the httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

const isEnvelope = (data) => data && typeof data === 'object' && 'status' in data && 'message' in data;

/**
 * Wires the token getter and the session-expiry callback. Called once by the auth state.
 * A 401 only counts as "session expired" when the request actually carried a token:
 * a failed login or a refresh without a cookie is also a 401, but not an expired session.
 */
export const setup = ({ getToken, onSessionExpired }) => {
  const requestInterceptor = client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const responseInterceptor = client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isCancel(error)) {
        return Promise.reject({ status: 'error', message: 'Request cancelled', data: null, code: CANCELLED_CODE });
      }

      if (error.response) {
        if (error.response.status === 401 && error.config?.headers?.Authorization) {
          onSessionExpired?.();
        }
        // The server responded: its body is already the backend's own envelope. Pass it through untouched.
        if (isEnvelope(error.response.data)) {
          return Promise.reject(error.response.data);
        }
        return Promise.reject({
          status: 'error',
          message: UNREACHABLE_MESSAGE,
          data: null,
          code: 'UNEXPECTED_RESPONSE',
          requestId: null,
        });
      }

      // No response at all: server down, no internet, timeout. Build the same shape ourselves.
      return Promise.reject({
        status: 'error',
        message: error.message === 'Network Error' ? NETWORK_ERROR_MESSAGE : UNREACHABLE_MESSAGE,
        data: null,
        code: 'NETWORK_ERROR',
        requestId: null,
      });
    }
  );

  return {
    eject: () => {
      client.interceptors.request.eject(requestInterceptor);
      client.interceptors.response.eject(responseInterceptor);
    },
  };
};

export const isCancelled = (error) => error?.code === CANCELLED_CODE;

export const get = (url, config = {}) => client.get(url, config).then((res) => res.data);
export const post = (url, data = {}, config = {}) => client.post(url, data, config).then((res) => res.data);
export const put = (url, data = {}, config = {}) => client.put(url, data, config).then((res) => res.data);
export const patch = (url, data = {}, config = {}) => client.patch(url, data, config).then((res) => res.data);
export const del = (url, config = {}) => client.delete(url, config).then((res) => res.data);

/** Multipart upload with progress (0-100) and cancellation through an AbortSignal. */
export const uploadForm = (url, formData, { onProgress, signal } = {}) =>
  client
    .post(url, formData, {
      signal,
      // Let the browser set the multipart boundary itself.
      headers: { 'Content-Type': undefined },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    })
    .then((res) => res.data);

/** Downloads a binary response. Resolves with { blob, fileName }. */
export const downloadFile = (url) =>
  client.get(url, { responseType: 'blob' }).then((res) => {
    const disposition = res.headers[CONTENT_DISPOSITION] || '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    return { blob: res.data, fileName: match ? match[1] : FALLBACK_FILE_NAME };
  });
