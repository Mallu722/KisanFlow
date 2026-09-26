import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Map, ListOrdered, PackageCheck,
  Wallet, Bell, FileText, Settings, LogOut, Menu, X, ChevronLeft, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const NAV = [
  { name: 'Dashboard',    path: '/officer/dashboard',     icon: LayoutDashboard },
  { name: 'Farmers',      path: '/officer/farmers',       icon: Users },
  { name: 'Centres',      path: '/officer/centres',       icon: Map },
  { name: 'Queue',        path: '/officer/queue',         icon: ListOrdered },
  { name: 'Procurement',  path: '/officer/procurement',   icon: PackageCheck },
  { name: 'Payments',     path: '/officer/payments',      icon: Wallet },
  { name: 'Notifications',path: '/officer/notifications', icon: Bell },
  { name: 'Reports',      path: '/officer/reports',       icon: FileText },
  { name: 'Settings',     path: '/officer/settings',      icon: Settings },
];

function SidebarContent({
  collapsed,
  onClose,
  onLogout
}: {
  collapsed?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  const location  = useLocation();

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white select-none">
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-slate-800 ${collapsed ? 'p-3 justify-center' : 'p-4'}`}>
        <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/40 flex-shrink-0">
          <span className="text-white font-black text-lg leading-none">K</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-white text-base leading-none">Krishi<span className="text-primary-400">Flow</span></h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Officer Portal</p>
            </div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Centre Location Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-white font-bold block truncate">Bailhongal APMC Yard</span>
              <span className="text-[10px] text-slate-400 block truncate">Belagavi Division</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? 'px-2' : 'px-3'} space-y-1`}>
        {NAV.map(({ name, path, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <NavLink
              key={name}
              to={path}
              onClick={onClose}
              title={collapsed ? name : undefined}
              className={`flex items-center rounded-xl transition-all duration-150 group text-xs font-bold
                ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                ${isActive
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon size={17} className={`flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-white'}`} />
              {!collapsed && <span>{name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Officer Sign Out */}
      <div className={`p-3 border-t border-slate-800 bg-slate-950/40 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">Dr. Anand Patil</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">AGRI-OFF-KA-4819</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut size={13} />
              <span>Lock / Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Lock Portal"
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function OfficerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  // Authentication Guard: Check if officer session exists
  const officerSessionRaw = localStorage.getItem('krishiflow_officer_session');
  if (!officerSessionRaw) {
    return <Navigate to="/officer/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('krishiflow_officer_session');
    toast.success('Officer session locked successfully');
    navigate('/officer/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-200 z-30 shadow-xl ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent collapsed={collapsed} onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden shadow-2xl"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft size={18} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800">KrishiFlow APMC Management System</span>
              <span className="text-[10px] text-slate-400 font-semibold block">Govt. Procurement Gateway • v2.4</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Lock Portal</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
