import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarPlus, Clock, Bell, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function FarmerLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Book Slot', path: '/book-slot', icon: CalendarPlus },
    { name: 'Queue', path: '/queue-status', icon: Clock },
    { name: 'Alerts', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Top App Bar */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-krishi rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">K</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Krishi<span className="text-krishi">Flow</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto md:max-w-4xl p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 px-1 pb-safe md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={twMerge(
                clsx(
                  "flex flex-col items-center justify-center w-full p-2 text-xs font-medium transition-all duration-200",
                  isActive ? "text-krishi scale-110" : "text-gray-500 hover:text-krishi-dark"
                )
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
