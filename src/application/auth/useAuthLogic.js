import { useState, useCallback, useEffect, useRef } from 'react';
import { setup } from '@/adapters/http';
import { useClearCache } from '@/adapters/query';
import { loginRequest, refreshRequest, logoutRequest } from '@/modules/auth';
import { getTokenExpiry } from './getTokenExpiry.js';

const REFRESH_LEAD_MS = 60 * 1000; // refresh a minute before the access token expires
const MIN_REFRESH_DELAY_MS = 5 * 1000;
const RETRY_REFRESH_MS = 30 * 1000;
const UNAUTHORIZED_CODE = 'UNAUTHORIZED';
const FALLBACK_ERROR = 'Could not check your session. Please try again.';

export const AUTH_STATUS = Object.freeze({
  UNKNOWN: 'unknown',
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
});

/**
 * httpOnly-cookie session: the refresh token is invisible to this code, only the short-lived
 * access token is held (in memory). Refresh tokens are single-use, so every refresh goes through
 * one shared in-flight promise: two concurrent refreshes would look like token theft to the backend.
 */
export const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(AUTH_STATUS.UNKNOWN);
  const [autoLoginError, setAutoLoginError] = useState('');
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const clearCache = useClearCache();

  const tokenRef = useRef(null);
  const timerRef = useRef(null);
  const refreshInFlightRef = useRef(null);
  const autoLoginInFlightRef = useRef(null);
  const refreshSessionRef = useRef(null);

  const clearTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const scheduleRefresh = useCallback(
    (token, overrideDelay) => {
      clearTimer();
      const expiry = getTokenExpiry(token);
      const delay =
        overrideDelay ?? Math.max((expiry ?? Date.now()) - Date.now() - REFRESH_LEAD_MS, MIN_REFRESH_DELAY_MS);
      timerRef.current = setTimeout(() => refreshSessionRef.current?.(), delay);
    },
    [clearTimer]
  );

  const applySession = useCallback(
    ({ account, accessToken }) => {
      tokenRef.current = accessToken;
      setUser(account);
      setStatus(AUTH_STATUS.AUTHENTICATED);
      setIsSessionExpired(false);
      scheduleRefresh(accessToken);
    },
    [scheduleRefresh]
  );

  const endSession = useCallback(
    ({ expired }) => {
      clearTimer();
      tokenRef.current = null;
      setUser(null);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      setIsSessionExpired(expired);
      clearCache();
    },
    [clearTimer, clearCache]
  );

  const refreshSession = useCallback(() => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    refreshInFlightRef.current = refreshRequest()
      .then((response) => {
        applySession(response.data);
        return true;
      })
      .catch((error) => {
        if (error?.code === UNAUTHORIZED_CODE) {
          endSession({ expired: true });
        } else if (tokenRef.current) {
          // A network hiccup is not an expired session: try again shortly.
          scheduleRefresh(tokenRef.current, RETRY_REFRESH_MS);
        }
        return false;
      })
      .finally(() => {
        refreshInFlightRef.current = null;
      });

    return refreshInFlightRef.current;
  }, [applySession, endSession, scheduleRefresh]);

  // Timers and the http interceptor call the latest refreshSession through a ref, not a stale closure.
  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  }, [refreshSession]);

  // The http adapter reports a 401 on an authenticated request here. Try one silent refresh before giving up.
  useEffect(() => {
    const { eject } = setup({
      getToken: () => tokenRef.current,
      onSessionExpired: () => refreshSessionRef.current?.(),
    });
    return eject;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const login = useCallback(
    async (credentials) => {
      const response = await loginRequest(credentials);
      applySession(response.data);
      return response.data;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Best effort: clear the client state regardless of whether the server call succeeded.
    }
    endSession({ expired: false });
  }, [endSession]);

  /** Called by ProtectedRoute only. Safe to call twice (React StrictMode): the second call joins the first. */
  const attemptAutoLogin = useCallback(() => {
    if (autoLoginInFlightRef.current) return autoLoginInFlightRef.current;

    setStatus(AUTH_STATUS.CHECKING);
    setAutoLoginError('');
    autoLoginInFlightRef.current = refreshRequest()
      .then((response) => applySession(response.data))
      .catch((error) => {
        if (error?.code === UNAUTHORIZED_CODE) {
          setStatus(AUTH_STATUS.UNAUTHENTICATED);
        } else {
          setStatus(AUTH_STATUS.ERROR);
          setAutoLoginError(error?.message ?? FALLBACK_ERROR);
        }
      })
      .finally(() => {
        autoLoginInFlightRef.current = null;
      });

    return autoLoginInFlightRef.current;
  }, [applySession]);

  return { user, status, autoLoginError, isSessionExpired, login, logout, attemptAutoLogin };
};
