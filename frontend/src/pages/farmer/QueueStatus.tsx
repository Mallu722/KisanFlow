import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, RefreshCw, PhoneCall, Wheat, ArrowRight, Wifi, WifiOff, Zap
} from 'lucide-react';

import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { slotsApi, type Token } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, EmptyState, Skeleton } from '../../components/ui';

const STATUS_STEPS = ['waiting', 'called', 'processing', 'completed'] as const;
const STATUS_LABELS: Record<string, string> = {
  waiting:    'In Queue',
  called:     'Called to Counter',
  processing: 'Weighing & Verification',
  completed:  'Completed',
};

const STATUS_TOAST: Record<string, string> = {
  called:     '📢 Your token is called! Head to Counter 1 now.',
  processing: '⚖️ Weighing & verification has started for your produce.',
  completed:  '✅ Procurement complete! Payment will be credited via DBT.',
  cancelled:  '❌ Your token was cancelled by the officer.',
};

export default function QueueStatus() {
  const { farmer } = useAuth();
  const [token, setToken]             = useState<Token | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sseStatus, setSseStatus]     = useState<'connecting' | 'live' | 'offline'>('connecting');
  const [justUpdated, setJustUpdated] = useState(false); // triggers flash animation

  const tokenRef = useRef<Token | null>(null);
  tokenRef.current = token;

  // ─── Fetch current token from API ──────────────────────────────────────────
  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    try {
      if (farmer?._id) {
        const res = await slotsApi.getActiveToken(farmer._id);
        if (res.data.data) {
          setToken(res.data.data);
          setLastUpdated(new Date());
          setIsLoading(false);
          return;
        }
      }
      // Demo Token fallback
      setToken({
        _id: 'demo-token',
        tokenNumber: 142,
        farmerId: 'demo',
        centreId: {
          _id: '1',
          name: 'Bailhongal APMC Yard',
          district: 'Belagavi',
          location: { lat: 15.8497, lng: 74.4977 },
          currentLoad: 45,
          totalCapacity: 100,
          avgProcessingTimeMinutes: 15,
          isActive: true
        } as any,
        cropType: 'Wheat (FAQ Sharbati)',
        quantity: 50,
        status: 'waiting',
        position: 3,
        estimatedWaitMinutes: 18,
        bookedFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch {
      // same demo token on error
      setToken({
        _id: 'demo-token',
        tokenNumber: 142,
        farmerId: 'demo',
        centreId: {
          _id: '1',
          name: 'Bailhongal APMC Yard',
          district: 'Belagavi',
          location: { lat: 15.8497, lng: 74.4977 },
          currentLoad: 45,
          totalCapacity: 100,
          avgProcessingTimeMinutes: 15,
          isActive: true
        } as any,
        cropType: 'Wheat',
        quantity: 50,
        status: 'waiting',
        position: 3,
        estimatedWaitMinutes: 18,
        bookedFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
    setIsLoading(false);
  }, [farmer?._id]);

  // ─── SSE: Subscribe to live queue events from officer actions ─────────────
  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const url  = `${BASE}/api/queue/events`;

    let es: EventSource;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      setSseStatus('connecting');
      es = new EventSource(url);

      es.onopen = () => {
        setSseStatus('live');
        console.log('📡 [SSE] Connected to real-time queue events');
      };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type: string;
            token: { _id: string; tokenNumber: number; status: string; farmerId: string };
            message: string;
          };

          if (payload.type === 'connected') return; // welcome ping

          const current = tokenRef.current;
          if (!current) return;

          // Only update if this event is for the farmer's own token or
          // it affects queue position (any token change re-fetches)
          const isMyToken = current._id === payload.token?._id ||
            (typeof current.farmerId === 'string'
              ? current.farmerId === payload.token?.farmerId
              : (current.farmerId as any)?._id === payload.token?.farmerId);

          if (isMyToken) {
            // Direct update: change this farmer's own token status immediately
            setToken((prev) => prev ? { ...prev, status: payload.token.status as any } : prev);
            setLastUpdated(new Date());

            // Flash animation
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 1800);

            // Toast notification
            const toastMsg = STATUS_TOAST[payload.token.status];
            if (toastMsg) {
              if (payload.token.status === 'called') {
                toast(toastMsg, { icon: '🔔', duration: 6000, style: { fontWeight: 700 } });
              } else if (payload.token.status === 'completed') {
                toast.success(toastMsg, { duration: 5000 });
              } else if (payload.token.status === 'cancelled') {
                toast.error(toastMsg, { duration: 5000 });
              } else {
                toast(toastMsg, { duration: 4000 });
              }
            }
          } else {
            // Someone else's token changed → re-fetch to update queue position
            fetchToken();
          }
        } catch (e) {
          console.error('[SSE] Parse error:', e);
        }
      };

      es.onerror = () => {
        setSseStatus('offline');
        es.close();
        // Auto-reconnect after 5 seconds
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      es?.close();
      clearTimeout(reconnectTimer);
    };
  }, [fetchToken]);

  // ─── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const isCalled    = token?.status === 'called';
  const centre      = typeof token?.centreId === 'object' ? token.centreId : null;
  const currentIdx  = STATUS_STEPS.indexOf(token?.status as any || 'waiting');

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-xl mx-auto pt-8">
        <EmptyState
          icon={<Clock size={32} />}
          title="No Active Queue Token"
          description="You don't have an active slot booked at any APMC Yard right now."
          action={
            <Link to="/book-slot">
              <Button size="lg" className="bg-primary-600 text-white font-bold">
                Book an APMC Slot Now
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ─── SSE Connection Status Bar ─────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
        sseStatus === 'live'        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
        sseStatus === 'connecting'  ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      'bg-red-50 text-red-700 border border-red-200'
      }`}>
        {sseStatus === 'live' ? (
          <><Wifi size={13} className="animate-pulse" /> Live — Updates automatically when officer makes changes</>
        ) : sseStatus === 'connecting' ? (
          <><RefreshCw size={13} className="animate-spin" /> Connecting to real-time queue...</>
        ) : (
          <><WifiOff size={13} /> Offline — Reconnecting in 5s... <button onClick={fetchToken} className="underline ml-1">Refresh now</button></>
        )}
        <span className="ml-auto text-[10px] opacity-60">
          Updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* ─── Top Banner Alert when Called ──────────────────────────────────── */}
      <AnimatePresence>
        {isCalled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm animate-bounce">
                <PhoneCall size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">Your Token is Called to Counter 1!</h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  Please bring your produce vehicle to Weighbridge Entry Gate immediately.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-white text-orange-900 font-extrabold text-xs rounded-xl shadow-xs">
              ACTIVE NOW
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Token Digital Card ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Flash ring animation on update */}
          <motion.div
            animate={justUpdated ? { scale: [1, 1.015, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Card className={`p-6 sm:p-8 border-slate-200/80 shadow-md relative overflow-hidden bg-white transition-all duration-500 ${
              justUpdated ? 'ring-2 ring-emerald-400 shadow-emerald-100' : ''
            }`}>
              {/* Background watermark */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-primary-50 rounded-full blur-2xl pointer-events-none" />

              {/* Live update flash overlay */}
              <AnimatePresence>
                {justUpdated && (
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-emerald-400/10 pointer-events-none rounded-inherit z-10"
                  />
                )}
              </AnimatePresence>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Live Digital Token
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {justUpdated && (
                      <motion.span
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 0, x: 10 }}
                        transition={{ duration: 1.5 }}
                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                      >
                        <Zap size={9} /> Updated!
                      </motion.span>
                    )}
                  </div>
                  <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mt-1 font-mono">
                    #{token.tokenNumber}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
                    <Wheat size={14} className="text-primary-600" />
                    <span>{token.cropType} • {token.quantity} Quintals</span>
                  </div>
                </div>

                <Badge variant={token.status === 'called' ? 'warning' : token.status === 'processing' ? 'default' : 'success'}>
                  {STATUS_LABELS[token.status] || token.status}
                </Badge>
              </div>

              {/* Position & Time Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Ahead of You</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">
                    {token.position <= 1 ? 'Next!' : `${token.position - 1} Farmers`}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Est. Wait Time</span>
                  <span className="text-2xl sm:text-3xl font-black text-primary-700 block mt-1 font-mono">
                    {token.estimatedWaitMinutes} <span className="text-xs font-bold text-slate-500">Mins</span>
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Counter Gate</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">
                    Counter 1
                  </span>
                </div>
              </div>

              {/* Step Progress Tracker */}
              <div className="border-t border-slate-100 pt-6">
                <div className="grid grid-cols-4 gap-2">
                  {STATUS_STEPS.map((s, i) => {
                    const done   = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={s} className="text-center">
                        <motion.div
                          animate={active && justUpdated ? { scaleX: [0.95, 1.05, 1] } : {}}
                          transition={{ duration: 0.4 }}
                          className={`h-2 rounded-full transition-all duration-700 mb-2 ${
                            done ? 'bg-primary-600' : 'bg-slate-200'
                          } ${active ? 'ring-2 ring-primary-300' : ''}`}
                        />
                        <span className={`text-[10px] sm:text-xs font-bold block ${done ? 'text-primary-700' : 'text-slate-400'}`}>
                          {STATUS_LABELS[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Info: Centre Details & Action */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Procurement Centre Details
            </h3>

            <div>
              <h4 className="text-base font-black text-slate-900">{centre?.name || 'Bailhongal APMC Yard'}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{centre?.district || 'Belagavi'}, Karnataka</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Operational Hours:</span>
                <span className="font-bold text-slate-800">8:00 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weighbridge Status:</span>
                <span className="font-bold text-emerald-600">Active (Sensor Calibrated)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Yard Load:</span>
                <span className="font-bold text-slate-800">{centre?.currentLoad || 45}% Capacity</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                fullWidth
                onClick={fetchToken}
                className="gap-2 text-xs font-bold text-slate-700"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Queue Status
              </Button>

              <Link to="/notifications" className="block">
                <Button fullWidth className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5">
                  View Calling Alerts <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

