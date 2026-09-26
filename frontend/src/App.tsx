import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { FarmerLayout } from './components/FarmerLayout';
import { OfficerLayout } from './components/OfficerLayout';
import { Skeleton } from './components/ui';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const FarmerLogin = lazy(() => import('./pages/farmer/Login'));
const FarmerHome = lazy(() => import('./pages/farmer/Home'));
const BookSlot = lazy(() => import('./pages/farmer/BookSlot'));
const QueueStatus = lazy(() => import('./pages/farmer/QueueStatus'));
const ProcurementStatus = lazy(() => import('./pages/farmer/ProcurementStatus'));
const Payments = lazy(() => import('./pages/farmer/Payments'));
const Notifications = lazy(() => import('./pages/farmer/Notifications'));
const Profile = lazy(() => import('./pages/farmer/Profile'));

const OfficerLogin = lazy(() => import('./pages/officer/Login'));
const OfficerDashboard = lazy(() => import('./pages/officer/Dashboard'));
const OfficerFarmers = lazy(() => import('./pages/officer/Farmers'));
const OfficerCentres = lazy(() => import('./pages/officer/Centres'));
const OfficerQueue = lazy(() => import('./pages/officer/Queue'));
const OfficerProcurement = lazy(() => import('./pages/officer/Procurement'));
const OfficerPayments = lazy(() => import('./pages/officer/Payments'));
const OfficerNotifications = lazy(() => import('./pages/officer/Notifications'));
const OfficerReports = lazy(() => import('./pages/officer/Reports'));
const OfficerSettings = lazy(() => import('./pages/officer/Settings'));

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '14px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600 },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Farmer Auth (no layout) */}
          <Route path="/login" element={<FarmerLogin />} />

          {/* Farmer App (with responsive layout) */}
          <Route element={<FarmerLayout />}>
            <Route path="/home" element={<FarmerHome />} />
            <Route path="/book-slot" element={<BookSlot />} />
            <Route path="/queue-status" element={<QueueStatus />} />
            <Route path="/procurement-status" element={<ProcurementStatus />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Officer Gate & Auth */}
          <Route path="/officer/login" element={<OfficerLogin />} />

          {/* Officer Portal (Protected with Layout) */}
          <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />
          <Route element={<OfficerLayout />}>
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/farmers" element={<OfficerFarmers />} />
            <Route path="/officer/centres" element={<OfficerCentres />} />
            <Route path="/officer/queue" element={<OfficerQueue />} />
            <Route path="/officer/procurement" element={<OfficerProcurement />} />
            <Route path="/officer/payments" element={<OfficerPayments />} />
            <Route path="/officer/notifications" element={<OfficerNotifications />} />
            <Route path="/officer/reports" element={<OfficerReports />} />
            <Route path="/officer/settings" element={<OfficerSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
