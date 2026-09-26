import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, ListOrdered, PackageCheck, Wallet, Bell, FileText, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function OfficerLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
    { name: 'Farmers', path: '/officer/farmers', icon: Users },
    { name: 'Centres', path: '/officer/centres', icon: Map },
    { name: 'Queue', path: '/officer/queue', icon: ListOrdered },
    { name: 'Procurement', path: '/officer/procurement', icon: PackageCheck },
    { name: 'Payments', path: '/officer/payments', icon: Wallet },
    { name: 'Notifications', path: '/officer/notifications', icon: Bell },
    { name: 'Reports', path: '/officer/reports', icon: FileText },
    { name: 'Settings', path: '/officer/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-[#0a2540] text-white hidden md:flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-krishi rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg leading-none">K</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Krishi<span className="text-krishi">Flow</span></h1>
        </div>
        
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider mb-1">Officer Portal</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <p className="text-sm font-medium">Bailhongal APMC</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={twMerge(
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive ? "bg-krishi/20 text-krishi-light border-l-4 border-krishi" : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#0a2540] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-krishi rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm leading-none">K</span>
            </div>
            <h1 className="text-lg font-bold">KrishiFlow Officer</h1>
          </div>
          <button><LayoutDashboard size={20} /></button>
        </header>

        {/* Top bar (Desktop) */}
        <header className="hidden md:flex items-center justify-between bg-white px-8 py-4 border-b border-gray-200 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
               <Bell className="text-gray-400 hover:text-krishi cursor-pointer transition-colors" size={20} />
               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-gray-700 leading-tight">Arjun Kumar</p>
                <p className="text-xs text-gray-500 font-medium">Duty Officer</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                AK
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
