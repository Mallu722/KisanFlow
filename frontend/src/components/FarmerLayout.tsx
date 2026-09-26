import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, User, Bell, Clock, Wifi, WifiOff, CalendarPlus, PackageCheck, Wallet, Shield } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const mobileNavItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/book-slot', icon: CalendarPlus, label: 'Book' },
  { to: '/queue-status', icon: Clock, label: 'Queue' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const desktopNavItems = [
  { to: '/home', icon: Home, label: 'Dashboard' },
  { to: '/book-slot', icon: CalendarPlus, label: 'Book Slot' },
  { to: '/queue-status', icon: Clock, label: 'Live Queue' },
  { to: '/procurement-status', icon: PackageCheck, label: 'Procurement Status' },
  { to: '/payments', icon: Wallet, label: 'Payments & DBT' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
];

export function FarmerLayout() {
  const isOnline = useOnlineStatus();
  const { farmer } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-primary-500 selection:text-white">
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-2 shadow-md"
          >
            <WifiOff size={14} /> Offline Mode: Viewing cached data
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <NavLink to="/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-primary-600/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">K</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  Krishi<span className="text-primary-600">Flow</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                  Farmer
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none hidden sm:block">
                Smart APMC Procurement & Queue
              </p>
            </div>
          </NavLink>

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {desktopNavItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-slate-600">Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-amber-600">Offline</span>
                </>
              )}
            </div>

            <NavLink
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            </NavLink>

            <NavLink
              to="/profile"
              className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {farmer?.name?.charAt(0) || 'F'}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-slate-700 max-w-[100px] truncate">
                {farmer?.name || 'Farmer'}
              </span>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Footer with Discreet Official APMC Portal Link */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 KrishiFlow • Department of Agricultural Marketing, Govt. of Karnataka</p>
          <div className="flex items-center gap-4">
            <NavLink
              to="/officer/login"
              className="text-slate-500 hover:text-primary-600 font-semibold transition-colors flex items-center gap-1"
            >
              <Shield size={13} className="text-slate-400" />
              <span>APMC Officer Portal</span>
            </NavLink>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40 safe-area-pb shadow-lg">
        <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all min-w-[56px] ${
                  isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-600 scale-105' : ''}`}>
                    <Icon size={19} />
                  </div>
                  <span className="text-[10px] font-bold">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
