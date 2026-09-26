import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle2, Info, AlertTriangle, RefreshCw,
  Smartphone, Wallet, Wheat, ArrowRight, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Skeleton, EmptyState, Button, Card, Badge } from '../../components/ui';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'queue' | 'procurement' | 'payment' | 'announcement' | 'alert';
  read: boolean;
  channel?: string;
  createdAt: string;
}

const TYPE_CONFIG = {
  queue: {
    icon: Wheat,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    badge: 'QUEUE CALL',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  procurement: {
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badge: 'PROCUREMENT',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  payment: {
    icon: Wallet,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    badge: 'DBT PAYMENT',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50 border-red-200',
    badge: 'URGENT ALERT',
    badgeColor: 'bg-red-100 text-red-800',
  },
  announcement: {
    icon: Bell,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    badge: 'ANNOUNCEMENT',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
};

export default function FarmerNotifications() {
  const { farmer } = useAuth();
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'queue' | 'payment' | 'procurement' | 'alert'>('all');

  const fetchNotifs = useCallback(async () => {
    try {
      const farmerId = farmer?._id || farmer?.phone || '9876543210';
      const res = await api.get(`/api/farmer/notifications/${farmerId}`);
      if (res.data.data) {
        setNotifs(res.data.data);
      } else {
        setNotifs([]);
      }
    } catch {
      setNotifs([]);
    }
    setIsLoading(false);
  }, [farmer?._id, farmer?.phone]);

  useEffect(() => {
    fetchNotifs();
    // Poll every 2.5 seconds for real-time alerts dispatched by officer
    const interval = setInterval(fetchNotifs, 2500);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifs = notifs.filter(n => (filter === 'all' ? true : n.type === filter));
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-primary-500/20 text-primary-300 font-bold text-[11px] rounded-full border border-primary-500/30 flex items-center gap-1">
                <Sparkles size={11} /> Real-Time Live Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <Bell className="text-primary-400" />
              Alerts & Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Officer notifications, 15-minute advance arrival calls & DBT bank credits sent to your account
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all backdrop-blur-sm border border-white/10"
              >
                Mark all read ({unreadCount})
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifs}
              disabled={isLoading}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Sync
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Alerts', count: notifs.length },
          { id: 'queue', label: 'Queue & Calling', count: notifs.filter(n => n.type === 'queue').length },
          { id: 'payment', label: 'DBT Payments', count: notifs.filter(n => n.type === 'payment').length },
          { id: 'procurement', label: 'Procurement', count: notifs.filter(n => n.type === 'procurement').length },
          { id: 'alert', label: 'Yard Notices', count: notifs.filter(n => n.type === 'alert' || n.type === 'announcement').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                filter === tab.id ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading && notifs.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <Skeleton key={n} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} className="text-slate-400" />}
          title="No Notifications Received Yet"
          description="When an officer sends you a 15-minute advance notice, calling alert, or when your slot is confirmed, it will appear here in real time."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifs.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.announcement;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => markRead(n._id)}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative shadow-xs hover:shadow-md ${
                    !n.read
                      ? 'border-primary-300 ring-2 ring-primary-500/10 bg-gradient-to-r from-emerald-50/20 via-white to-white'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {!n.read && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse ring-4 ring-primary-100" />
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${cfg.color} shadow-xs`}>
                      <Icon size={22} />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${cfg.badgeColor}`}>
                          {cfg.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className={`text-sm sm:text-base font-bold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
