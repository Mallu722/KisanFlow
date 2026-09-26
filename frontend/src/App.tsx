import { Routes, Route, Navigate } from 'react-router-dom';
import { FarmerLayout } from './components/FarmerLayout';
import { OfficerLayout } from './components/OfficerLayout';
import FarmerHome from './pages/farmer/Home';
import BookSlot from './pages/farmer/BookSlot';
import QueueStatus from './pages/farmer/QueueStatus';
import OfficerDashboard from './pages/officer/Dashboard';

// Placeholder components
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <h1 className="text-2xl font-semibold text-gray-500">{title}</h1>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Farmer Routes with Layout */}
      <Route element={<FarmerLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<FarmerHome />} />
        <Route path="/book-slot" element={<BookSlot />} />
        <Route path="/queue-status" element={<QueueStatus />} />
        <Route path="/procurement-status" element={<Placeholder title="Procurement Status (Coming Soon)" />} />
        <Route path="/payments" element={<Placeholder title="Payments (Coming Soon)" />} />
        <Route path="/notifications" element={<Placeholder title="Notifications" />} />
        <Route path="/profile" element={<Placeholder title="Farmer Profile" />} />
      </Route>

      {/* Login without Layout */}
      <Route path="/login" element={<Placeholder title="Farmer Login" />} />
      <Route path="/officer/login" element={<Placeholder title="Officer Login" />} />

      {/* Officer Routes with Layout */}
      <Route element={<OfficerLayout />}>
        <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/farmers" element={<Placeholder title="Farmers Management" />} />
        <Route path="/officer/centres" element={<Placeholder title="Centres Management" />} />
        <Route path="/officer/queue" element={<Placeholder title="Queue Management" />} />
        <Route path="/officer/procurement" element={<Placeholder title="Procurement & Quality Check" />} />
        <Route path="/officer/payments" element={<Placeholder title="Payments Dashboard" />} />
        <Route path="/officer/notifications" element={<Placeholder title="Officer Notifications" />} />
        <Route path="/officer/reports" element={<Placeholder title="Analytics & Reports" />} />
        <Route path="/officer/settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  );
}

export default App;
