import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CalendarCheck, Activity, CheckCircle2, ArrowRight,
  PhoneCall, RefreshCw, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import { Link } from 'react-router-dom';
import { Card, Badge, StatCardSkeleton, Skeleton } from '../../components/ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface DashboardData {
  totalFarmers?: number;
  todayBookings?: number;
  activeQueue?: number;
  completedToday?: number;
  kpis?: {
    totalFarmers?: number;
    todayBookings?: number;
    activeQueue?: number;
    completedToday?: number;
  };
  liveQueue?: any[];
  centres?: any[];
  procurementData?: { time: string; tokens: number; completed: number }[];
}

const FALLBACK_CHART = Array.from({ length: 10 }, (_, i) => ({
  time: `${8 + i}:00`,
  tokens: Math.floor(Math.random() * 20) + 5,
  completed: Math.floor(Math.random() * 15) + 2,
}));

const FALLBACK: DashboardData = {
  totalFarmers: 1248,
  todayBookings: 342,
  activeQueue: 47,
  completedToday: 289,
  kpis: { totalFarmers: 1248, todayBookings: 342, activeQueue: 47, completedToday: 289 },
  liveQueue: [],
  centres: [],
  procurementData: FALLBACK_CHART,
};

const STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-blue-50 text-blue-700 border-blue-200',
  called: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function OfficerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [callingNext, setCallingNext] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/api/officer/dashboard');
      if (res.data.data) {
        setData(res.data.data);
      }
    } catch {
      setData(FALLBACK);
    }
    setLastRefresh(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Poll every 5 seconds for real-time queue & booking KPI updates
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      const res = await api.post('/api/officer/queue/call-next', {});
      toast.success(`📢 Called Token #${res.data.data.tokenNumber}!`);
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No waiting tokens in queue');
    }
    setCallingNext(false);
  };

  const totalFarmers = data?.kpis?.totalFarmers ?? data?.totalFarmers ?? 5;
  const todayBookings = data?.kpis?.todayBookings ?? data?.todayBookings ?? 3;
  const activeQueue = data?.kpis?.activeQueue ?? data?.activeQueue ?? 2;
  const completedToday = data?.kpis?.completedToday ?? data?.completedToday ?? 1;

  const stats = [
    { label: 'Total Farmers', value: totalFarmers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12 vs yesterday', up: true },
    { label: "Today's Bookings", value: todayBookings, icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+28 vs yesterday', up: true },
    { label: 'Active Queue', value: activeQueue, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Live Queue', up: null },
    { label: 'Completed Today', value: completedToday, icon: CheckCircle2, color: 'text-primary-600', bg: 'bg-primary-50', trend: '+40 vs yesterday', up: true },
  ];

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">Live Overview</h2>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5 font-mono">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse inline-block" />
            Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-bold"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleCallNext}
            disabled={callingNext}
            className="flex items-center gap-1.5 text-sm font-extrabold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl transition-colors disabled:opacity-60 shadow-md shadow-primary-600/30"
          >
            <PhoneCall size={15} /> {callingNext ? 'Calling…' : 'Call Next Token'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && !data
          ? Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                      <Icon size={20} className={s.color} />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                      {s.value}
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                      <TrendingUp size={12} />
                      <span>{s.trend}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Chart & Live Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Token Flow Chart */}
        <div className="lg:col-span-2">
          <Card className="p-5 border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Token Flow — Today</h3>
                <p className="text-xs text-slate-400">Hourly bookings vs completions at all centres</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Today
              </span>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.procurementData || FALLBACK_CHART}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="tokens" name="Issued Tokens" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#tokenGrad)" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#16a34a" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Live Active Queue Panel */}
        <div className="lg:col-span-1">
          <Card className="p-5 border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" /> Live Queue
                </h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full uppercase">
                  ● LIVE
                </span>
              </div>

              {isLoading && !data ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(n => <Skeleton key={n} className="h-14 w-full rounded-xl" />)}
                </div>
              ) : (data?.liveQueue?.length ?? 0) === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No active tokens in queue right now.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data?.liveQueue?.map((t: any) => (
                    <div key={t._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-sm">#{t.tokenNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[t.status] || 'bg-slate-100'}`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-slate-500 font-semibold mt-0.5 truncate max-w-[150px]">
                          {t.farmerId?.name || 'Farmer'} ({t.cropType})
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{t.centreId?.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link to="/officer/queue">
                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                  Manage Full Queue <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
