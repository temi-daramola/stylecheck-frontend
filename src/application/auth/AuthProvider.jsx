import { createContext, useContext, useMemo } from 'react';
import { useAuthLogic, AUTH_STATUS } from './useAuthLogic.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, status, autoLoginError, isSessionExpired, login, logout, attemptAutoLogin } = useAuthLogic();

  // Memoized so only subscribers of auth re-render when auth changes. Functions are already stable.
  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
      autoLoginError,
      isSessionExpired,
      login,
      logout,
      attemptAutoLogin,
    }),
    [user, status, autoLoginError, isSessionExpired, login, logout, attemptAutoLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
