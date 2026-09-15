import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { appClient } from '@/api/appClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const me = await appClient.auth.me();
      setUser(me);
      setIsAuthenticated(true);
      return me;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      if (err?.status === 403 && err?.data?.reason === 'user_not_registered') {
        setAuthError({ type: 'user_not_registered', message: err.message });
      }
      return null;
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const settings = await appClient.app.getPublicSettings();
        if (active) setAppPublicSettings(settings || {});
      } catch {
        if (active) setAppPublicSettings({ auth_required: false, app_name: 'TourInsight' });
      } finally {
        if (active) setIsLoadingPublicSettings(false);
      }
      if (active) await checkUserAuth();
    })();
    return () => { active = false; };
  }, [checkUserAuth]);

  const logout = useCallback(async (redirectTo = '/') => appClient.auth.logout(redirectTo), []);
  const navigateToLogin = useCallback((returnTo = window.location.pathname) => appClient.auth.redirectToLogin(returnTo), []);

  const value = useMemo(() => ({
    user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, authChecked,
    appPublicSettings, checkUserAuth, logout, navigateToLogin,
  }), [user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, authChecked, appPublicSettings, checkUserAuth, logout, navigateToLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
