import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

export default function ProtectedRoute({ unauthenticatedElement = null }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();
  useEffect(() => { if (!authChecked && !isLoadingAuth) checkUserAuth(); }, [authChecked, isLoadingAuth, checkUserAuth]);
  if (isLoadingAuth || !authChecked) return <div className="grid min-h-[40vh] place-items-center"><div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (!isAuthenticated) return unauthenticatedElement;
  return <Outlet />;
}
