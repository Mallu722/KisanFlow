import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, MapPin, Navigation, AlertTriangle, CheckCircle2,
  RefreshCw, ShieldCheck, PhoneCall, Wheat, ArrowRight, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { slotsApi, type Token } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, EmptyState, Skeleton } from '../../components/ui';

const STATUS_STEPS = ['waiting', 'called', 'processing', 'completed'] as const;
const STATUS_LABELS: Record<string, string> = {
  waiting: 'In Queue', called: 'Called to Counter', processing: 'Weighing & Verification', completed: 'Completed'
};

export default function QueueStatus() {
  const { farmer } = useAuth();
  const [token, setToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    try {
      if (farmer?._id) {
        const res = await slotsApi.getActiveToken(farmer._id);
        if (res.data.data) {
          setToken(res.data.data);
          setIsLoading(false);
          return;
        }
      }
      // Demo Token
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
        status: 'called',
        position: 1,
        estimatedWaitMinutes: 5,
        bookedFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch {
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
        status: 'called',
        position: 1,
        estimatedWaitMinutes: 5,
        bookedFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
    setIsLoading(false);
  }, [farmer?._id]);

  useEffect(() => {
    fetchToken();
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  const isCalled = token?.status === 'called';
  const isNearFront = token && token.position <= 3;
  const centre = typeof token?.centreId === 'object' ? token.centreId : null;
  const currentIdx = STATUS_STEPS.indexOf(token?.status as any || 'waiting');

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
      {/* Top Banner Alert when Called */}
      <AnimatePresence>
        {isCalled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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

      {/* Main Token Digital Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8 border-slate-200/80 shadow-md relative overflow-hidden bg-white">
            {/* Background watermark */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-primary-50 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Live Digital Token
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                {STATUS_LABELS[token.status]}
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
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  return (
                    <div key={s} className="text-center">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 mb-2 ${
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
