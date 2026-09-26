import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarPlus, Clock, PackageCheck, Wallet, Bell,
  CheckCircle2, ChevronRight, TrendingUp, MapPin, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../../components/ui';

const QUICK_ACTIONS = [
  {
    title: 'Book Slot',
    subtitle: 'Schedule APMC visit',
    icon: CalendarPlus,
    path: '/book-slot',
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-200',
  },
  {
    title: 'Queue Status',
    subtitle: 'Track active token',
    icon: Clock,
    path: '/queue-status',
    gradient: 'from-orange-500 to-orange-600',
    shadow: 'shadow-orange-200',
  },
  {
    title: 'Procurement',
    subtitle: 'Produce weighment logs',
    icon: PackageCheck,
    path: '/procurement-status',
    gradient: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-200',
  },
  {
    title: 'Payments & DBT',
    subtitle: 'Aadhaar bank credits',
    icon: Wallet,
    path: '/payments',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-200',
  },
  {
    title: 'Alerts & SMS',
    subtitle: 'Calling announcements',
    icon: Bell,
    path: '/notifications',
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-200',
  },
];

const RECENT_ACTIVITY = [
  { label: 'Token #142 called to Counter 1', time: '10:15 AM', type: 'success' as const },
  { label: 'Slot confirmed at Bailhongal APMC Yard', time: 'Yesterday', type: 'info' as const },
  { label: 'DBT Payment of ₹91,000 credited to bank', time: '2 days ago', type: 'success' as const },
];

export default function FarmerHome() {
  const { farmer } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const nextSlot = {
    centre: 'Bailhongal APMC Yard',
    district: 'Belagavi',
    date: '26 Sep 2026',
    time: '10:00 AM',
    tokenNumber: 142,
    status: 'confirmed' as const,
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner Card (Responsive for Mobile, Tablet, Laptop) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 md:p-8 text-white shadow-xl shadow-primary-900/10"
      >
        {/* Background ambient shapes */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-white/15 rounded-full text-[11px] font-bold tracking-wide uppercase text-primary-100 backdrop-blur-sm flex items-center gap-1">
                <Sparkles size={11} /> Smart APMC Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {greeting}, {farmer?.name || 'Ramesh Kumar'}! 👋
            </h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-primary-100 font-medium">
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-300" />
                <span>Verified Farmer</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-primary-200" />
                <span>{farmer?.village || 'Belagavi District, Karnataka'}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-black/15 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="text-center px-3 py-1.5">
              <div className="text-lg sm:text-xl font-black text-white">12</div>
              <div className="text-[10px] font-semibold text-primary-200 uppercase">Bookings</div>
            </div>
            <div className="text-center px-3 py-1.5 border-x border-white/10">
              <div className="text-lg sm:text-xl font-black text-emerald-300">₹91K</div>
              <div className="text-[10px] font-semibold text-primary-200 uppercase">DBT Credited</div>
            </div>
            <div className="text-center px-3 py-1.5">
              <div className="text-lg sm:text-xl font-black text-amber-300">A+</div>
              <div className="text-[10px] font-semibold text-primary-200 uppercase">Crop Grade</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Active Booking & Market Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Active Booking Card (2 cols on large screen) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-2"
        >
          <Card className="p-5 sm:p-6 border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Active Token & Schedule
                  </span>
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl mt-0.5">{nextSlot.centre}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{nextSlot.district} • Gate #2 Entry</span>
                  </div>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold block">Date</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{nextSlot.date}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold block">Time Slot</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{nextSlot.time}</span>
                </div>
                <div className="bg-primary-50 rounded-2xl p-3 text-center border border-primary-200/60">
                  <span className="text-xs text-primary-600 font-bold block">Token No.</span>
                  <span className="text-lg font-black text-primary-700 mt-0.5 block">#{nextSlot.tokenNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link to="/queue-status" className="flex-1">
                <Button size="md" fullWidth className="bg-primary-600 hover:bg-primary-700 text-white font-bold gap-2">
                  <Clock size={16} /> Track Live Queue Position
                </Button>
              </Link>
              <Link to="/book-slot">
                <Button variant="outline" size="md" className="w-full sm:w-auto font-bold text-slate-700">
                  Book Another
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Live Market Price & Advisory Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl">
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Govt MSP Price Rate</h4>
                <p className="text-sm font-black text-white">Belagavi APMC Today</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                <span className="text-slate-300">Wheat (FAQ Sharbati)</span>
                <span className="font-mono font-black text-emerald-400">₹2,275 / Qtl</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                <span className="text-slate-300">Paddy (Common)</span>
                <span className="font-mono font-black text-emerald-400">₹2,300 / Qtl</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-300">Cotton (Medium Staple)</span>
                <span className="font-mono font-black text-emerald-400">₹7,121 / Qtl</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Services Navigation Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3.5">
          Procurement Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.04 }}
              >
                <Link to={action.path} className="block group">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm group-hover:shadow-md group-hover:border-primary-300 transition-all duration-200 text-center h-full flex flex-col items-center justify-center">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-md ${action.shadow} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-800 leading-tight group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">{action.subtitle}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Activity & Logs</h2>
          <Link to="/notifications" className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:underline">
            View all alerts <ArrowRight size={12} />
          </Link>
        </div>
        <Card className="divide-y divide-slate-100 overflow-hidden border-slate-200/80 shadow-sm">
          {RECENT_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 transition-colors">
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  item.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{item.label}</p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
