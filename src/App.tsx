import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Home from './pages/Home';
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const RoomDetail = lazy(() => import('./pages/RoomDetail'));
import RoomsPage from './pages/RoomsPage';
import ContactsPage from './pages/ContactsPage';

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
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="loading-screen" role="status">Загрузка…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:roomId" element={<RoomDetail />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
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