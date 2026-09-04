import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { AppLayout } from './components/layout/AppLayout';

// Code Splitting sob demanda (React.lazy)
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Transactions = lazy(() => import('./pages/Transactions').then((m) => ({ default: m.Transactions })));
const Accounts = lazy(() => import('./pages/Accounts').then((m) => ({ default: m.Accounts })));
const Categories = lazy(() => import('./pages/Categories').then((m) => ({ default: m.Categories })));
const Goals = lazy(() => import('./pages/Goals').then((m) => ({ default: m.Goals })));
const Bills = lazy(() => import('./pages/Bills').then((m) => ({ default: m.Bills })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const Simulator = lazy(() => import('./pages/Simulator').then((m) => ({ default: m.Simulator })));
const AdminWhatsApp = lazy(() => import('./pages/AdminWhatsApp').then((m) => ({ default: m.AdminWhatsApp })));
const AccessDenied = lazy(() => import('./pages/AccessDenied').then((m) => ({ default: m.AccessDenied })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-3 border-slate-700/40 border-t-emerald-500 animate-spin" />
    </div>
  );
}

function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
  const { googleClientId } = useAuth();
  return (
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      {children}
    </GoogleOAuthProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-700/40 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-700/40 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-700/40 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GoogleOAuthWrapper>
          <PrivacyProvider>
            <ToastProvider>
              <ConfirmProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route
                      path="/login"
                      element={
                        <PublicOnlyRoute>
                          <Login />
                        </PublicOnlyRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <PublicOnlyRoute>
                          <Register />
                        </PublicOnlyRoute>
                      }
                    />

                    {/* Protected Application Layout */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="transactions" element={<Transactions />} />
                      <Route path="bills" element={<Bills />} />
                      <Route path="accounts" element={<Accounts />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="goals" element={<Goals />} />
                      <Route path="simulator" element={<Simulator />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="access-denied" element={<AccessDenied />} />
                      <Route
                        path="admin/whatsapp"
                        element={
                          <AdminRoute>
                            <AdminWhatsApp />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="admin"
                        element={<Navigate to="/admin/whatsapp" replace />}
                      />
                    </Route>

                    <Route path="/access-denied" element={<AccessDenied />} />

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </PrivacyProvider>
      </GoogleOAuthWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

