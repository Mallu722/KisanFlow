import { motion } from 'framer-motion';
import { ArrowRight, CalendarPlus, Clock, PackageCheck, Wallet, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FarmerHome() {
  const nextSlot = {
    centre: "Bailhongal APMC",
    date: "26 Sep 2026",
    time: "10:00 AM",
  };

  const actions = [
    { title: "Book Slot", icon: CalendarPlusIcon, path: "/book-slot", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { title: "Queue & Token", icon: ClockIcon, path: "/queue-status", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { title: "Procurement", icon: PackageCheckIcon, path: "/procurement-status", color: "bg-purple-50 text-purple-600 border-purple-100" },
    { title: "Payments", icon: WalletIcon, path: "/payments", color: "bg-green-50 text-green-600 border-green-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-krishi to-krishi-dark rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full border-2 border-white/50 overflow-hidden flex items-center justify-center">
            {/* Placeholder for avatar */}
            <UserIcon size={32} className="text-white" />
          </div>
          <div>
            <p className="text-krishi-light text-sm font-medium">Hello</p>
            <h2 className="text-2xl font-bold">Ramesh</h2>
            <div className="flex items-center gap-1 mt-1 bg-black/20 w-max px-2 py-0.5 rounded-full backdrop-blur-sm">
              <CheckCircle2 size={12} className="text-krishi-light" />
              <span className="text-xs font-medium text-krishi-light">Verified Farmer</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next Slot Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-800 font-semibold text-lg">Next Upcoming Slot</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Confirmed</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Centre</p>
          <p className="text-gray-900 font-semibold mb-3">{nextSlot.centre}</p>
          <div className="flex gap-6">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Date</p>
              <p className="text-gray-900 font-semibold">{nextSlot.date}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Time</p>
              <p className="text-gray-900 font-semibold">{nextSlot.time}</p>
            </div>
          </div>
        </div>
        <Link to="/queue-status" className="mt-4 w-full flex items-center justify-center gap-2 text-krishi-dark font-medium py-2 hover:bg-krishi-light rounded-lg transition-colors">
          View Live Queue <ArrowRightIcon size={16} />
        </Link>
      </motion.div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-gray-800 font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (index * 0.05) }}
              >
                <Link
                  to={action.path}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all active:scale-95 ${action.color}`}
                >
                  <Icon size={28} className="mb-2" />
                  <span className="font-semibold text-sm text-center">{action.title}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UserIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
