import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, isLoading } = useAuth();
  if (isLoading) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (profile && profile.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
